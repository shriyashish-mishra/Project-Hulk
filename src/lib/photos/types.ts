import type { Database } from "@/lib/supabase/database.types";

export type ProgressPhotoRow = Database["public"]["Tables"]["progress_photos"]["Row"];

export type PhotoViewType = "front" | "side" | "back";

export const PHOTO_VIEW_TYPES: PhotoViewType[] = ["front", "side", "back"];

export const PHOTO_VIEW_LABEL: Record<PhotoViewType, string> = {
  front: "Front",
  side: "Side",
  back: "Back",
};

/** A stored photo row plus a short-lived signed URL, ready to render. */
export interface ProgressPhoto extends ProgressPhotoRow {
  view_type: PhotoViewType;
  signedUrl: string | null;
}
