"use client";

import { useRef, useState, useTransition, type ChangeEvent } from "react";
import { Camera, Trash2, X } from "lucide-react";
import { compressImage } from "@/lib/photos/compress";
import { deleteProgressPhoto, uploadProgressPhoto } from "@/lib/photos/actions";
import { PHOTO_VIEW_LABEL, type PhotoViewType, type ProgressPhoto } from "@/lib/photos/types";
import { cn } from "@/lib/utils";

interface PhotoSlotProps {
  viewType: PhotoViewType;
  capturedOn: string;
  photo: ProgressPhoto | null;
}

export function PhotoSlot({ viewType, capturedOn, photo }: PhotoSlotProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [current, setCurrent] = useState(photo);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingBlob, setPendingBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError(null);
    try {
      const compressed = await compressImage(file);
      setPendingBlob(compressed);
      setPreviewUrl(URL.createObjectURL(compressed));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not process the photo.");
    }
  }

  function handleConfirm() {
    if (!pendingBlob) return;
    const localPreviewUrl = previewUrl;
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("file", pendingBlob, "photo.jpg");
        formData.set("viewType", viewType);
        formData.set("capturedOn", capturedOn);
        const saved = await uploadProgressPhoto(formData);
        setCurrent({ ...saved, view_type: viewType, signedUrl: localPreviewUrl });
        setPendingBlob(null);
        setPreviewUrl(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed.");
      }
    });
  }

  function handleCancelPreview() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPendingBlob(null);
    setPreviewUrl(null);
    setError(null);
  }

  function handleDelete() {
    if (!current) return;
    startTransition(async () => {
      try {
        await deleteProgressPhoto(current.id);
        setCurrent(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not delete.");
      }
    });
  }

  const displayUrl = previewUrl ?? current?.signedUrl ?? null;

  return (
    <div className="flex flex-col gap-2">
      <div
        className={cn(
          "relative aspect-[3/4] w-full overflow-hidden rounded-2xl border",
          displayUrl ? "border-transparent" : "border-dashed border-border",
        )}
      >
        {displayUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- signed URLs are short-lived and generated at request time, not build time
          <img
            src={displayUrl}
            alt={`${PHOTO_VIEW_LABEL[viewType]} progress photo`}
            className="size-full object-cover"
          />
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground active:opacity-60"
          >
            <Camera className="size-5" />
            <span className="text-xs">Add</span>
          </button>
        )}

        {previewUrl && (
          <div className="absolute inset-x-0 bottom-0 flex gap-2 bg-black/60 p-2 backdrop-blur-sm">
            <button
              type="button"
              onClick={handleCancelPreview}
              disabled={isPending}
              className="flex flex-1 items-center justify-center gap-1 rounded-full bg-muted py-1.5 text-xs font-medium text-foreground"
            >
              <X className="size-3.5" /> Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isPending}
              className="flex-1 rounded-full bg-primary py-1.5 text-xs font-semibold text-primary-foreground"
            >
              Save
            </button>
          </div>
        )}

        {current && !previewUrl && (
          <div className="absolute top-1.5 right-1.5 flex gap-1.5">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              aria-label="Replace photo"
              disabled={isPending}
              className="flex size-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm active:scale-90"
            >
              <Camera className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              aria-label="Delete photo"
              disabled={isPending}
              className="flex size-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm active:scale-90"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      <span className="text-center text-xs text-muted-foreground">
        {PHOTO_VIEW_LABEL[viewType]}
      </span>
      {error && <p className="text-center text-xs text-destructive">{error}</p>}
    </div>
  );
}
