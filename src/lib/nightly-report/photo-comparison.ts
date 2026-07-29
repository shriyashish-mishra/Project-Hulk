import Anthropic from "@anthropic-ai/sdk";
import { requireUser } from "@/lib/supabase/auth";
import { formatShortDateWithWeekday } from "@/lib/date";
import { getPhotosForDate, getPreviousPhoto } from "@/lib/photos/queries";
import { PHOTO_VIEW_LABEL, type PhotoViewType } from "@/lib/photos/types";

const VISION_MODEL = "claude-sonnet-5";

interface ComparisonPair {
  viewType: PhotoViewType;
  currentPath: string;
  currentDate: string;
  previousPath: string;
  previousDate: string;
}

async function downloadAsBase64(
  supabase: Awaited<ReturnType<typeof requireUser>>["supabase"],
  storagePath: string,
): Promise<string> {
  const { data, error } = await supabase.storage.from("progress-photos").download(storagePath);
  if (error || !data) throw new Error(error?.message ?? "Could not download photo.");
  const buffer = Buffer.from(await data.arrayBuffer());
  return buffer.toString("base64");
}

function dateLabel(dateStr: string): string {
  return formatShortDateWithWeekday(new Date(`${dateStr}T00:00:00`));
}

/**
 * Compares today's progress photo(s) against the most recent prior photo of the
 * same view via a live vision call — the only place actual photo bytes leave
 * this app, and only for this one server-side request. Returns null when
 * there's nothing captured today or no baseline to compare against yet, so
 * most days trigger no API call at all.
 */
export async function getPhotoComparisonNote(capturedOn: string): Promise<string | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;

  const { supabase } = await requireUser();
  const todaysPhotos = await getPhotosForDate(capturedOn);
  if (todaysPhotos.length === 0) return null;

  const pairs: ComparisonPair[] = [];
  for (const photo of todaysPhotos) {
    const previous = await getPreviousPhoto(photo.view_type, capturedOn);
    if (!previous) continue;
    pairs.push({
      viewType: photo.view_type,
      currentPath: photo.storage_path,
      currentDate: capturedOn,
      previousPath: previous.storage_path,
      previousDate: previous.captured_on,
    });
  }
  if (pairs.length === 0) return null;

  const content: Anthropic.ContentBlockParam[] = [
    {
      type: "text",
      text: "These are paired before/after progress photos for physique tracking, one pair per view below. For each view, write one or two factual sentences on visible changes in body composition, posture, or muscle definition — no encouragement or filler. If nothing is visibly different, say so plainly. Prefix each note with the view name.",
    },
  ];

  for (const pair of pairs) {
    const [previousB64, currentB64] = await Promise.all([
      downloadAsBase64(supabase, pair.previousPath),
      downloadAsBase64(supabase, pair.currentPath),
    ]);
    content.push(
      {
        type: "text",
        text: `${PHOTO_VIEW_LABEL[pair.viewType]} view — before (${dateLabel(pair.previousDate)}) then after (${dateLabel(pair.currentDate)}):`,
      },
      { type: "image", source: { type: "base64", media_type: "image/jpeg", data: previousB64 } },
      { type: "image", source: { type: "base64", media_type: "image/jpeg", data: currentB64 } },
    );
  }

  const client = new Anthropic();
  const message = await client.messages.create({
    model: VISION_MODEL,
    max_tokens: 1024,
    thinking: { type: "adaptive" },
    output_config: { effort: "low" },
    messages: [{ role: "user", content }],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  return textBlock && "text" in textBlock ? textBlock.text.trim() || null : null;
}
