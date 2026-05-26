import { buildPrompt } from "../prompts/buildPrompt.js";
import {
  QuestionPaperSchema,
  type QuestionPaper,
} from "../validators/question-paper.schema.js";
import { sampleQuestionPaper } from "./sample.js";

const logger = {
  warn: (...args: unknown[]) => {
    if (process.env.NODE_ENV !== "production") console.warn(...args);
  },
};

type GenerateInput = {
  subject: string;
  className: string;
  totalQuestions: number;
  totalMarks: number;
  instructions?: string;
};

export async function generateQuestionPaper(
  input: GenerateInput,
): Promise<QuestionPaper> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return sampleQuestionPaper;
  }

  const prompt = buildPrompt(input);
  let lastError: unknown;

  // limit attempts to avoid infinite retries
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const model = process.env.GEMINI_MODEL || "gemini-flash-latest";
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Gemini API failed with status ${response.status}`);
      }

      const payload = (await response.json()) as {
        candidates?: {
          content?: {
            parts?: { text?: string }[];
          };
        }[];
      };
      const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        lastError = new Error("Gemini returned an empty response");
        continue;
      }

      const raw = stripJsonFence(text);
      let jsonParseError: unknown | null = null;

      // Try parsing raw
      try {
        const json = JSON.parse(raw);
        const parsed = QuestionPaperSchema.safeParse(json);
        if (parsed.success) return parsed.data;
        jsonParseError = parsed.error;
      } catch (err) {
        jsonParseError = err;
      }

      // Try to clean common issues and parse again
      try {
        const cleaned = cleanJsonString(raw);
        const json = JSON.parse(cleaned);
        const parsed = QuestionPaperSchema.safeParse(json);
        if (parsed.success) return parsed.data;
        lastError = parsed.error;
      } catch (err) {
        lastError = jsonParseError || err;
      }
    } catch (error) {
      lastError = error;
    }
  }

  // Graceful fallback: return sample paper instead of throwing to avoid crashing workers
  logger.warn("Gemini generation failed after attempts:", String(lastError));
  return sampleQuestionPaper;
}

function stripJsonFence(value: string) {
  return value
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "");
}

function cleanJsonString(value: string) {
  // remove any leading/trailing non-json text by extracting braces
  const firstBrace = value.indexOf("{");
  const lastBrace = value.lastIndexOf("}");
  let candidate = value;
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    candidate = value.slice(firstBrace, lastBrace + 1);
  }

  // remove trailing commas before object/array closures
  candidate = candidate.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]");

  // sometimes LLM emits windows newlines or weird whitespace, normalize
  candidate = candidate.replace(/\r\n/g, "\n").trim();

  return candidate;
}
