type PromptInput = {
  subject: string;
  className: string;
  totalQuestions: number;
  totalMarks: number;
  instructions?: string;
  sourceText?: string;
};

export function buildPrompt(input: PromptInput) {
  return `
Generate an assessment paper for ${input.subject}, Class ${input.className}.

Return ONLY valid JSON. Do not include any markdown, explanation, or extra text.

Schema summary (return this exact structure as JSON):
- Root object: "title", "subject", "className", "duration", "totalMarks", "sections" (array).
- Each section: "title", "instruction", "questions" (array).
- Each question object MUST include: "type" (one of mcq, short, long, numerical, diagram), "question" (string), "difficulty" (easy|medium|hard), "marks" (positive number).
- If "type" is "mcq": include "options" (array of exactly 4 strings) and "answer" (string equal to one of the options).
- For non-mcq types include "answer" (string). For "diagram" you may include a "diagramRef".

Rules (strict):
- Return only JSON that exactly follows the schema summary above.
- Do NOT add any surrounding text, explanation, or markdown.
- "className" must be "${input.className}".
- Create exactly ${input.totalQuestions} questions across sections.
- Sum of all question "marks" must equal ${input.totalMarks}.
- If chapter content is provided, base questions on it and avoid unrelated topics.
- Teacher instructions: ${input.instructions || "Use NCERT-aligned language"}
${input.sourceText ? "\nChapter content:\n" + input.sourceText : ""}
`;
}
