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

/** View types captured on `capturedOn`, with no signed URLs — for contexts (like the nightly report prompt) that must never touch photo bytes. `ctx` lets callers outside a browser request (MCP, quick-log) inject an already-authenticated context instead of `requireUser()`. */
export async function getPhotoViewsForDate(
  capturedOn: string,
  ctx?: Awaited<ReturnType<typeof requireUser>>,
): Promise<PhotoViewType[]> {
  const { supabase, user } = ctx ?? (await requireUser());
  const { data, error } = await supabase
    .from("progress_photos")
    .select("view_type")
    .eq("user_id", user.id)
    .eq("captured_on", capturedOn)
    .order("view_type");

  if (error) throw new Error(error.message);
  return data.map((row) => row.view_type as PhotoViewType);
}

/** Most recent photo of `viewType` captured strictly before `beforeDate`, or null — the "since last time" baseline for photo comparison. No signed URL: callers read bytes directly via `storage_path`. */
export async function getPreviousPhoto(
  viewType: PhotoViewType,
  beforeDate: string,
): Promise<ProgressPhotoRow | null> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("progress_photos")
    .select("*")
    .eq("user_id", user.id)
    .eq("view_type", viewType)
    .lt("captured_on", beforeDate)
    .order("captured_on", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
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
