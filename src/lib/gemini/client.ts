const CHAT_COMPLETIONS_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

/** Free tier, natively multimodal — the same model handles both the nightly report text and progress-photo vision, unlike Groq's free tier which needed two separate models. */
const MODEL = "gemini-3.5-flash";

export type GeminiContentBlock =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

interface ChatCompletionParams {
  content: string | GeminiContentBlock[];
  maxTokens: number;
  temperature: number;
}

async function chatCompletion({ content, maxTokens, temperature }: ChatCompletionParams): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set.");

  const response = await fetch(CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content }],
      max_tokens: maxTokens,
      temperature,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Gemini request failed (${response.status}): ${detail.slice(0, 500)}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content;
  if (typeof text !== "string" || !text.trim()) {
    throw new Error("Gemini returned an empty response.");
  }
  return text;
}

/**
 * Generates the nightly coach report from the same prompt the manual
 * copy-into-Claude flow uses — see `buildNightlyReportPrompt`. The report
 * (markdown + JSON block) tends to run long, so this gives it a generous
 * budget rather than risk a truncated JSON block at the tail end.
 */
export async function generateNightlyReportText(promptMarkdown: string): Promise<string> {
  return chatCompletion({ content: promptMarkdown, maxTokens: 10000, temperature: 0.4 });
}

/** Vision comparison of paired before/after progress photos — same prompt shape the prior Claude/Groq vision calls used, now via Gemini's natively multimodal model. */
export async function compareProgressPhotos(content: GeminiContentBlock[]): Promise<string> {
  return chatCompletion({ content, maxTokens: 1024, temperature: 0.3 });
}
