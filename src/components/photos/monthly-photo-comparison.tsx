import { PHOTO_VIEW_LABEL, PHOTO_VIEW_TYPES, type ProgressPhoto } from "@/lib/photos/types";

function PhotoTile({ label, photo }: { label: string; photo: ProgressPhoto }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="aspect-[3/4] w-full overflow-hidden rounded-2xl bg-muted">
        {photo.signedUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- signed URLs are generated at request time, not build time
          <img src={photo.signedUrl} alt="" className="size-full object-cover" />
        )}
      </div>
      <span className="text-center text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

interface MonthlyPhotoComparisonProps {
  photos: ProgressPhoto[];
}

/** Earliest vs latest shot per view this month — the emotionally meaningful comparison, kept simple and private. */
export function MonthlyPhotoComparison({ photos }: MonthlyPhotoComparisonProps) {
  if (photos.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No progress photos captured this month.
      </p>
    );
  }

  const byView = new Map<string, ProgressPhoto[]>();
  for (const photo of photos) {
    const list = byView.get(photo.view_type) ?? [];
    list.push(photo);
    byView.set(photo.view_type, list);
  }

  const viewsWithPhotos = PHOTO_VIEW_TYPES.filter((view) => byView.has(view));

  return (
    <div className="flex flex-col gap-5">
      {viewsWithPhotos.map((viewType) => {
        const shots = byView.get(viewType)!;
        const first = shots[0];
        const last = shots[shots.length - 1];
        return (
          <div key={viewType} className="flex flex-col gap-2">
            <span className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
              {PHOTO_VIEW_LABEL[viewType]}
            </span>
            <div className="grid grid-cols-2 gap-3">
              <PhotoTile label="Earliest" photo={first} />
              <PhotoTile label={first === last ? "Only shot" : "Latest"} photo={last} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
