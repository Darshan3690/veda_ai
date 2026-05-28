type PromptInput = {
  subject: string;
  className: string;
  totalQuestions: number;
  totalMarks: number;
  instructions?: string;
  sourceText?: string;
  questionTypes?: Array<{ type: string; count: number; marks: number }>;
};

export function buildPrompt(input: PromptInput) {
  const questionTypeRules = input.questionTypes && input.questionTypes.length > 0
    ? `\nQUESTION TYPE BREAKDOWN (MUST FOLLOW EXACTLY):\n${input.questionTypes.map(qt => {
      const mappedType = mapQuestionTypeName(qt.type);
      return `- ${qt.type}: Generate EXACTLY ${qt.count} question(s), ${qt.marks} mark(s) each, type="${mappedType}"`;
    }).join("\n")}\n\nIMPORTANT: Generate ONLY the question types above in the exact quantities specified. Do NOT generate any other question types.`
    : "";

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
- Sum of all question "marks" must equal ${input.totalMarks}.${questionTypeRules}
- If chapter content is provided, base questions on it and avoid unrelated topics.
- Teacher instructions: ${input.instructions || "Use NCERT-aligned language"}
${input.sourceText ? "\nChapter content:\n" + input.sourceText : ""}
`;
}

function mapQuestionTypeName(frontendType: string): string {
  const mapping: Record<string, string> = {
    "Multiple Choice Questions": "mcq",
    "Short Questions": "short",
    "Long Answer Questions": "long",
    "Numerical Problems": "numerical",
    "Diagram/Graph-Based Questions": "diagram",
  };
  return mapping[frontendType] || "short";
}
