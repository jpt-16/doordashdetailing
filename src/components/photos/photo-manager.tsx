"use client";

import { useRef, useState, useTransition } from "react";
import { deletePhoto, uploadPhoto } from "@/app/actions/photos";
import { Icon } from "@/components/ui/icons";
import { MAX_PHOTOS, MAX_PHOTO_BYTES, PHOTO_TYPES } from "@/lib/photos";

export function PhotoManager({ photos }: { photos: { id: string; url: string }[] }) {
  const input = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);

  const onPick = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    setError(null);
    if (photos.length + list.length > MAX_PHOTOS) {
      setError(`You can add up to ${MAX_PHOTOS} photos. You have ${photos.length}.`);
      return;
    }
    const bad = list.find((f) => !(PHOTO_TYPES as readonly string[]).includes(f.type) || f.size > MAX_PHOTO_BYTES);
    if (bad) {
      setError(`${bad.name} must be a JPEG, PNG or WebP under 5 MB.`);
      return;
    }
    start(async () => {
      for (let i = 0; i < list.length; i++) {
        setProgress(`Uploading ${i + 1} of ${list.length}`);
        const fd = new FormData();
        fd.set("photo", list[i]);
        const res = await uploadPhoto(fd);
        if (!res.ok) {
          setError(res.error);
          break;
        }
      }
      setProgress(null);
      if (input.current) input.current.value = "";
    });
  };

  return (
    <div>
      <p className="text-sm text-muted">
        Add photos of your work. Show the finished car, not people or license plates. {photos.length} of {MAX_PHOTOS} added.
      </p>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((p, i) => (
          <li key={p.id} className="relative aspect-[4/3] overflow-hidden rounded-card bg-band">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt={`Your photo ${i + 1}`} className="h-full w-full object-cover" />
            {i === 0 && <span className="absolute left-2 top-2 rounded-btn bg-white px-2 py-1 text-xs font-semibold shadow-pill">Cover</span>}
            <form action={deletePhoto} className="absolute right-2 top-2">
              <input type="hidden" name="id" value={p.id} />
              <button
                type="submit"
                aria-label={`Delete photo ${i + 1}`}
                className="press grid h-9 w-9 place-items-center rounded-full bg-white shadow-pill transition-transform duration-150 ease-out active:scale-[0.97]"
              >
                <Icon name="x" size={16} />
              </button>
            </form>
          </li>
        ))}
        {photos.length < MAX_PHOTOS && (
          <li>
            <button
              type="button"
              disabled={pending}
              onClick={() => input.current?.click()}
              className="press grid aspect-[4/3] w-full place-items-center rounded-card border border-dashed border-field text-sm font-semibold transition-[transform,background-color] duration-150 ease-out hover:bg-band active:scale-[0.97] disabled:opacity-60"
            >
              <span className="flex flex-col items-center gap-1">
                <Icon name="sparkle" size={22} />
                {pending ? (progress ?? "Uploading…") : "Add photos"}
              </span>
            </button>
          </li>
        )}
      </ul>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" tabIndex={-1} aria-label="Choose photos" onChange={(e) => onPick(e.target.files)} />
      {error && (
        <p role="alert" className="mt-3 rounded-btn bg-red-50 p-3 text-sm text-red-800">
          {error}
        </p>
      )}
    </div>
  );
}
