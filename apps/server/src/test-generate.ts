import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { generateQuestionPaper } from "./generate-paper.js";

// Load env from apps/web/.env to pick up GEMINI_API_KEY if present
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webEnvPath = path.resolve(__dirname, "..", "..", "web", ".env");
try {
  const raw = await import("fs/promises").then((m) => m.readFile(webEnvPath, "utf8"));
  raw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const idx = trimmed.indexOf("=");
    if (idx === -1) return;
    const key = trimmed.slice(0, idx);
    const val = trimmed.slice(idx + 1);
    // only set if not already set
    if (!process.env[key]) process.env[key] = val;
  });
} catch {
  // ignore if file missing
}

async function run() {
  try {
    console.log("GEMINI_API_KEY present:", !!process.env.GEMINI_API_KEY);
    console.log("GEMINI_MODEL:", process.env.GEMINI_MODEL);
    const paper = await generateQuestionPaper({
      subject: "Science",
      className: "8",
      totalQuestions: 5,
      totalMarks: 10,
      instructions: "Use NCERT-aligned language",
    });

    console.log(JSON.stringify(paper, null, 2));
  } catch (err) {
    console.error("Generation failed:", err);
    process.exit(1);
  }
}

run();
