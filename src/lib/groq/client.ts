const CHAT_COMPLETIONS_URL = "https://api.groq.com/openai/v1/chat/completions";

/** Fast, generous free tier, strong instruction-following for structured JSON-in-markdown output — see the nightly-report prompt contract in `nightly-report/prompt.ts`. */
const TEXT_MODEL = "llama-3.3-70b-versatile";

/** Groq's multimodal model — the only one on their free tier that accepts image input as of writing. */
const VISION_MODEL = "qwen/qwen3.6-27b";

export type GroqContentBlock =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

interface ChatCompletionParams {
  model: string;
  content: string | GroqContentBlock[];
  maxTokens: number;
  temperature: number;
}

async function chatCompletion({ model, content, maxTokens, temperature }: ChatCompletionParams): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set.");

  const response = await fetch(CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content }],
      max_tokens: maxTokens,
      temperature,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Groq request failed (${response.status}): ${detail.slice(0, 500)}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content;
  if (typeof text !== "string" || !text.trim()) {
    throw new Error("Groq returned an empty response.");
  }
  return text;
}

/** Generates the nightly coach report from the same prompt the manual copy-into-Claude flow uses — see `buildNightlyReportPrompt`. */
export async function generateNightlyReportText(promptMarkdown: string): Promise<string> {
  return chatCompletion({ model: TEXT_MODEL, content: promptMarkdown, maxTokens: 4096, temperature: 0.4 });
}

/** Vision comparison of paired before/after progress photos — same prompt shape the prior Claude vision call used, now via Groq's multimodal model. */
export async function compareProgressPhotos(content: GroqContentBlock[]): Promise<string> {
  return chatCompletion({ model: VISION_MODEL, content, maxTokens: 1024, temperature: 0.3 });
}
