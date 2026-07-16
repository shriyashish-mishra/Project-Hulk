import { requireUser } from "@/lib/supabase/auth";
import type { PhotoViewType, ProgressPhoto, ProgressPhotoRow } from "./types";

const SIGNED_URL_TTL_SECONDS = 300;

async function attachSignedUrls(
  supabase: Awaited<ReturnType<typeof requireUser>>["supabase"],
  rows: ProgressPhotoRow[],
): Promise<ProgressPhoto[]> {
  if (rows.length === 0) return [];

  // One batched Storage call instead of one round-trip per photo — matters
  // most on the Monthly timeline, which can render dozens of photos.
  const { data: signed } = await supabase.storage
    .from("progress-photos")
    .createSignedUrls(
      rows.map((row) => row.storage_path),
      SIGNED_URL_TTL_SECONDS,
    );

  const signedUrlByPath = new Map(
    (signed ?? []).map((entry) => [entry.path, entry.signedUrl]),
  );

  return rows.map((row) => ({
    ...row,
    view_type: row.view_type as PhotoViewType,
    signedUrl: signedUrlByPath.get(row.storage_path) ?? null,
  }));
}

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
  return attachSignedUrls(supabase, data);
}

/** View types captured on `capturedOn`, with no signed URLs — for contexts (like the nightly report prompt) that must never touch photo bytes. */
export async function getPhotoViewsForDate(capturedOn: string): Promise<PhotoViewType[]> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("progress_photos")
    .select("view_type")
    .eq("user_id", user.id)
    .eq("captured_on", capturedOn)
    .order("view_type");

  if (error) throw new Error(error.message);
  return data.map((row) => row.view_type as PhotoViewType);
}

/** Every photo captured within the range, oldest first — powers the Monthly visual timeline. */
export async function getPhotosInRange(
  startDate: string,
  endDate: string,
): Promise<ProgressPhoto[]> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("progress_photos")
    .select("*")
    .eq("user_id", user.id)
    .gte("captured_on", startDate)
    .lte("captured_on", endDate)
    .order("captured_on", { ascending: true });

  if (error) throw new Error(error.message);
  return attachSignedUrls(supabase, data);
}
