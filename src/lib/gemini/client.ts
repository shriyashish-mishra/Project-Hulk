const CHAT_COMPLETIONS_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

/**
 * Free tier. The full `gemini-3.5-flash` produced richer output in testing,
 * but its free-tier latency ran ~30-35s regardless of how much it was asked
 * to generate — cutting the unused markdown report (see includeMarkdownReport
 * in prompt.ts) didn't move that number, so output length wasn't the
 * bottleneck. `-lite` came back in ~5s on the same real data with matching
 * quality (same evidence-based strengths/improvements, same correct
 * rest-day/recovery reasoning, calorie deficit still landing in the
 * established band) — a ~6-7x latency win with no quality tradeoff found.
 */
const MODEL = "gemini-3.5-flash-lite";

async function chatCompletion(promptMarkdown: string, maxTokens: number, temperature: number): Promise<string> {
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
      messages: [{ role: "user", content: promptMarkdown }],
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

/** Generates the nightly coach report from the same prompt the manual copy-into-Claude flow uses — see `buildNightlyReportPrompt`. */
export async function generateNightlyReportText(promptMarkdown: string): Promise<string> {
  return chatCompletion(promptMarkdown, 10000, 0.4);
}

/**
 * Classifies one exercise's MET (Metabolic Equivalent of Task) value —
 * see `ensureExerciseMetValue` (exercise-library/met.ts) for why this is a
 * single cached-forever call per exercise rather than a per-set estimate.
 * Low temperature and a tiny token budget: this is a single number with a
 * well-established reference answer (the Compendium of Physical
 * Activities), not open-ended generation, so consistency matters more
 * than creativity and there's nothing to spend extra tokens on.
 */
export async function classifyExerciseMetValue(name: string, category: "strength" | "cardio"): Promise<string> {
  const prompt = `You are classifying the metabolic intensity of a single exercise for a calorie-estimate formula.

Exercise: "${name}"
Type: ${category} (strength = resistance/weight training, cardio = continuous aerobic activity)

Return ONLY a single number: the exercise's MET (Metabolic Equivalent of Task) value, per the Compendium of Physical Activities, for a typical person performing this exercise at a normal training effort. No words, no units, no explanation — just the number (e.g. "5.0").`;
  return chatCompletion(prompt, 10, 0.2);
}
