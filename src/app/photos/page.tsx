import { BackLink } from "@/components/ui/back-link";
import { PhotoSlot } from "@/components/photos/photo-slot";
import { PHOTO_VIEW_TYPES } from "@/lib/photos/types";
import { getPhotosForDate } from "@/lib/photos/queries";
import { formatDateHeading, getLocalDateString } from "@/lib/date";
import { requireOnboardedUser } from "@/lib/supabase/auth";

export default async function PhotosPage() {
  await requireOnboardedUser();
  const today = getLocalDateString();
  const photos = await getPhotosForDate(today);
  const photoByView = new Map(photos.map((photo) => [photo.view_type, photo]));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <BackLink href="/" />
        <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">
          Progress Photos
        </h1>
        <p className="text-sm text-muted-foreground">{formatDateHeading()}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {PHOTO_VIEW_TYPES.map((viewType) => (
          <PhotoSlot
            key={viewType}
            viewType={viewType}
            capturedOn={today}
            photo={photoByView.get(viewType) ?? null}
          />
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Photos are private and visible only to you. They&rsquo;re never sent to AI
        automatically.
      </p>
    </div>
  );
}
