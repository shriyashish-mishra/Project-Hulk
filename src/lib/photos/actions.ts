"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/auth";
import { PHOTO_VIEW_TYPES, type PhotoViewType, type ProgressPhotoRow } from "./types";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MAX_FILE_BYTES = 8 * 1024 * 1024;

function assertValidViewType(value: string): asserts value is PhotoViewType {
  if (!PHOTO_VIEW_TYPES.includes(value as PhotoViewType)) {
    throw new Error("Invalid photo view.");
  }
}

/** Uploads a photo for a view/date, replacing any existing photo for that same view/date. */
export async function uploadProgressPhoto(formData: FormData): Promise<ProgressPhotoRow> {
  const file = formData.get("file");
  const viewType = formData.get("viewType");
  const capturedOn = formData.get("capturedOn");

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Choose a photo first.");
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error("Photo is too large.");
  }
  if (typeof viewType !== "string") {
    throw new Error("Invalid photo view.");
  }
  assertValidViewType(viewType);
  if (typeof capturedOn !== "string" || !DATE_PATTERN.test(capturedOn)) {
    throw new Error("Invalid date.");
  }

  const { supabase, user } = await requireUser();

  const { data: existing } = await supabase
    .from("progress_photos")
    .select("id, storage_path")
    .eq("user_id", user.id)
    .eq("captured_on", capturedOn)
    .eq("view_type", viewType)
    .maybeSingle();

  if (existing) {
    await supabase.storage.from("progress-photos").remove([existing.storage_path]);
    await supabase.from("progress_photos").delete().eq("id", existing.id);
  }

  const storagePath = `${user.id}/${capturedOn}_${viewType}_${crypto.randomUUID()}.jpg`;
  const { error: uploadError } = await supabase.storage
    .from("progress-photos")
    .upload(storagePath, file, { contentType: "image/jpeg", upsert: false });
  if (uploadError) throw new Error(uploadError.message);

  const { data, error } = await supabase
    .from("progress_photos")
    .insert({
      user_id: user.id,
      captured_on: capturedOn,
      view_type: viewType,
      storage_path: storagePath,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/photos");
  return data;
}

export async function deleteProgressPhoto(photoId: string): Promise<void> {
  const { supabase, user } = await requireUser();

  const { data: existing, error: fetchError } = await supabase
    .from("progress_photos")
    .select("storage_path")
    .eq("id", photoId)
    .eq("user_id", user.id)
    .single();
  if (fetchError) throw new Error(fetchError.message);

  const { error: storageError } = await supabase.storage
    .from("progress-photos")
    .remove([existing.storage_path]);
  if (storageError) throw new Error(storageError.message);

  const { error } = await supabase
    .from("progress_photos")
    .delete()
    .eq("id", photoId)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/photos");
}
