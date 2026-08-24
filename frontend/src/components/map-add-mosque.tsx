'use client';

import { useState } from 'react';

import { AddMosqueForm } from '@/components/add-mosque-form';
import { Button } from '@/components/button-link';
import { useGeolocation } from '@/lib/use-geolocation';

// Smaller prayer spaces are routinely missing from public map data, so the moment someone
// notices a gap is while looking at the map -- not after navigating to their profile.
export function MapAddMosque() {
  const [open, setOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const { coords } = useGeolocation();

  if (added) {
    return (
      <div className="rounded-md border border-basirah-teal/20 bg-white px-4 py-3">
        <p className="text-base text-basirah-teal">
          Added. It is on your map now, and joins the public directory once someone has confirmed
          the details.
        </p>
        <Button size="sm" variant="ghost" className="mt-2.5" onClick={() => setAdded(false)}>
          Add another
        </Button>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-basirah-teal/20 bg-white px-4 py-3">
        <p className="text-base text-basirah-teal">Don&apos;t see a mosque that should be here?</p>
        <Button
          size="sm"
          variant="ghost"
          className="w-full sm:w-auto"
          onClick={() => setOpen(true)}
        >
          Add a mosque
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-basirah-teal/20 bg-white p-5">
      <h2 className="font-display text-lg font-semibold tracking-[-0.015em] text-basirah-teal">
        Add a mosque
      </h2>
      <p className="mt-1 mb-5 text-base text-basirah-teal/75">
        Only the name is required. Tap the map in the form to place its pin.
      </p>
      <AddMosqueForm
        nearby={coords}
        onCreated={() => {
          setOpen(false);
          setAdded(true);
        }}
        onCancel={() => setOpen(false)}
      />
    </div>
  );
}
