'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const CYAN = 0xd0fafb;
const RUST = 0x942106;
const CREAM = 0xece8d9;

function starRing(outerR: number, innerR: number, points = 8): THREE.Vector3[] {
  const verts: THREE.Vector3[] = [];
  const total = points * 2;
  for (let i = 0; i < total; i++) {
    const angle = (i / total) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    verts.push(new THREE.Vector3(Math.cos(angle) * r, Math.sin(angle) * r, 0));
  }
  verts.push(verts[0].clone());
  return verts;
}

function octagonRing(radius: number): THREE.Vector3[] {
  const verts: THREE.Vector3[] = [];
  for (let i = 0; i <= 8; i++) {
    const angle = (i / 8) * Math.PI * 2 - Math.PI / 8;
    verts.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0));
  }
  return verts;
}

function lineFromPoints(points: THREE.Vector3[], color: number, opacity: number) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
  });
  return { line: new THREE.Line(geometry, material), geometry, material };
}

function vertexDots(points: THREE.Vector3[], color: number, size: number, opacity: number) {
  const filtered = points.filter((_, index) => index < points.length - 1);
  const geometry = new THREE.BufferGeometry().setFromPoints(filtered);
  const material = new THREE.PointsMaterial({
    color,
    size,
    transparent: true,
    opacity,
    depthWrite: false,
    sizeAttenuation: true,
  });
  return { points: new THREE.Points(geometry, material), geometry, material };
}

function buildRosette(scale: number, tint: number, lineOpacity: number) {
  const group = new THREE.Group();
  group.scale.setScalar(scale);

  const outer = lineFromPoints(starRing(2.15, 0.82), tint, lineOpacity);
  const inner = lineFromPoints(starRing(1.35, 0.52), CREAM, lineOpacity * 0.65);
  const frame = lineFromPoints(octagonRing(2.55), tint, lineOpacity * 0.45);

  group.add(outer.line, inner.line, frame.line);

  const dots = vertexDots(starRing(2.15, 0.82), RUST, 0.09 * scale, 0.85);
  group.add(dots.points);

  return {
    group,
    disposables: [outer, inner, frame, dots],
  };
}

export function HeroCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(max-width: 767px)').matches;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x043334, isMobile ? 0.14 : 0.09);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = isMobile ? 11 : 9.5;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isMobile,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const root = new THREE.Group();
    scene.add(root);

    const disposables: Array<{
      geometry: THREE.BufferGeometry;
      material: THREE.Material;
    }> = [];

    const center = buildRosette(1, CYAN, isMobile ? 0.42 : 0.55);
    root.add(center.group);
    disposables.push(...center.disposables);

    if (!isMobile) {
      const offsets = [
        { x: -5.2, y: 2.8, scale: 0.55, speed: -0.00035 },
        { x: 5.4, y: 2.4, scale: 0.5, speed: 0.0003 },
        { x: -4.8, y: -2.6, scale: 0.48, speed: 0.00028 },
        { x: 5.1, y: -2.9, scale: 0.52, speed: -0.00032 },
      ];

      for (const offset of offsets) {
        const rosette = buildRosette(offset.scale, CYAN, 0.22);
        rosette.group.position.set(offset.x, offset.y, -1.2);
        rosette.group.userData.spin = offset.speed;
        root.add(rosette.group);
        disposables.push(...rosette.disposables);
      }

      const interlace: number[] = [];
      const nodes = [
        new THREE.Vector3(-5.2, 2.8, -1.2),
        new THREE.Vector3(5.4, 2.4, -1.2),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(-4.8, -2.6, -1.2),
        new THREE.Vector3(5.1, -2.9, -1.2),
      ];
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          interlace.push(nodes[i].x, nodes[i].y, nodes[i].z, nodes[j].x, nodes[j].y, nodes[j].z);
        }
      }
      const linkGeometry = new THREE.BufferGeometry();
      linkGeometry.setAttribute('position', new THREE.Float32BufferAttribute(interlace, 3));
      const linkMaterial = new THREE.LineBasicMaterial({
        color: CREAM,
        transparent: true,
        opacity: 0.07,
        depthWrite: false,
      });
      const links = new THREE.LineSegments(linkGeometry, linkMaterial);
      root.add(links);
      disposables.push({ geometry: linkGeometry, material: linkMaterial });
    }

    const pointer = { x: 0, y: 0 };
    const onPointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    if (!isMobile && !prefersReducedMotion) {
      window.addEventListener('pointermove', onPointerMove);
    }

    let animationFrame = 0;
    const animate = () => {
      if (!prefersReducedMotion) {
        root.rotation.z += isMobile ? 0.00015 : 0.00025;
        center.group.rotation.z -= isMobile ? 0.0001 : 0.00018;

        root.children.forEach((child) => {
          const spin = child.userData.spin as number | undefined;
          if (spin) child.rotation.z += spin;
        });

        if (!isMobile) {
          root.rotation.x = pointer.y * 0.04;
          root.rotation.y = pointer.x * 0.05;
        }
      }

      renderer.render(scene, camera);
      animationFrame = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      const { clientWidth, clientHeight } = container;
      if (clientWidth === 0 || clientHeight === 0) return;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', onPointerMove);
      disposables.forEach(({ geometry, material }) => {
        geometry.dispose();
        material.dispose();
      });
      // dispose() frees GPU resources but keeps the WebGL context alive. Browsers cap
      // how many contexts exist at once, so without forceContextLoss this leaks one per
      // mount and MapLibre later fails to acquire one -- the map renders blank.
      renderer.dispose();
      renderer.forceContextLoss();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-90"
    />
  );
}
