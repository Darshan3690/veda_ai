type PromptInput = {
  subject: string;
  className: string;
  totalQuestions: number;
  totalMarks: number;
  instructions?: string;
};

export function buildPrompt(input: PromptInput) {
  return `
Generate an assessment paper for ${input.subject}, Class ${input.className}.

Return ONLY valid JSON.

Expected format:
{
  "title": "",
  "subject": "",
  "duration": "",
  "totalMarks": 0,
  "sections": [
    {
      "title": "",
      "instruction": "",
      "questions": [
        {
          "question": "",
          "difficulty": "easy | medium | hard",
          "marks": 0,
          "answer": ""
        }
      ]
    }
  ]
}

Rules:
- No markdown
- No explanations
- No extra text
- Strict JSON only
- Create exactly ${input.totalQuestions} questions
- Total marks must equal ${input.totalMarks}
- Teacher instructions: ${input.instructions || "Use NCERT-aligned language"}
`;
}

