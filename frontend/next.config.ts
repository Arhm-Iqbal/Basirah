import type { NextConfig } from 'next';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  transpilePackages: ['@basirah/backend', '@basirah/shared'],
  outputFileTracingRoot: path.join(root, '..'),
  serverExternalPackages: ['gsap', 'three', 'maplibre-gl'],
  async redirects() {
    return [
      { source: '/about', destination: '/', permanent: true },
      { source: '/contact', destination: '/', permanent: true },
    ];
  },
};

export default nextConfig;
