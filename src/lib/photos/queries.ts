import { requireUser } from "@/lib/supabase/auth";
import type { PhotoViewType, ProgressPhoto } from "./types";

const SIGNED_URL_TTL_SECONDS = 300;

/** All photos captured on `capturedOn` (up to one per view), each with a ready-to-render signed URL. */
export async function getPhotosForDate(capturedOn: string): Promise<ProgressPhoto[]> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("progress_photos")
    .select("*")
    .eq("user_id", user.id)
    .eq("captured_on", capturedOn)
    .order("view_type");

  if (error) throw new Error(error.message);

  return Promise.all(
    data.map(async (row) => {
      const { data: signed } = await supabase.storage
        .from("progress-photos")
        .createSignedUrl(row.storage_path, SIGNED_URL_TTL_SECONDS);
      return {
        ...row,
        view_type: row.view_type as PhotoViewType,
        signedUrl: signed?.signedUrl ?? null,
      };
    }),
  );
}
