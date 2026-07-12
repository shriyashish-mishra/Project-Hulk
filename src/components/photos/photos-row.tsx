import Link from "next/link";
import { getPhotosForDate } from "@/lib/photos/queries";

interface PhotosRowProps {
  loggedOn: string;
}

export async function PhotosRow({ loggedOn }: PhotosRowProps) {
  const photos = await getPhotosForDate(loggedOn);

  return (
    <Link
      href={`/photos?date=${loggedOn}`}
      className="flex w-full items-center justify-between gap-3 py-4 active:opacity-60"
    >
      <span className="text-base font-semibold text-foreground">Photos</span>
      <span className="text-sm text-muted-foreground">
        {photos.length > 0 ? `${photos.length} added` : "Not logged"}
      </span>
    </Link>
  );
}
