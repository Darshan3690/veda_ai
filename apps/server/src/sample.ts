import type { QuestionPaper } from "../validators/question-paper.schema.js";

export const sampleQuestionPaper: QuestionPaper = {
  title: "Quiz on Electricity",
  subject: "English",
  className: "5",
  duration: "45 minutes",
  totalMarks: 20,
  sections: [
    {
      title: "Section A",
      instruction: "Attempt all questions. Each question carries 2 marks",
      questions: [
        {
          type: "short",
          difficulty: "easy",
          marks: 2,
          question: "Define electroplating. Explain its purpose.",
          answer:
            "Electroplating deposits a thin metal layer on another metal using electric current. It prevents corrosion and improves appearance.",
        },
        {
          type: "mcq",
          difficulty: "medium",
          marks: 2,
          question: "Which of the following metals is commonly used for electroplating to prevent corrosion?",
          options: ["Copper", "Zinc", "Gold", "Aluminium"],
          answer: "Zinc",
        },
      ],
    },
  ],
};
