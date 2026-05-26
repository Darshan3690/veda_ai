import type { QuestionPaper } from "../validators/question-paper.schema.js";

export const sampleQuestionPaper: QuestionPaper = {
  title: "Quiz on Electricity",
  subject: "English",
  duration: "45 minutes",
  totalMarks: 20,
  sections: [
    {
      title: "Section A",
      instruction: "Attempt all questions. Each question carries 2 marks",
      questions: [
        {
          difficulty: "easy",
          marks: 2,
          question: "Define electroplating. Explain its purpose.",
          answer:
            "Electroplating deposits a thin metal layer on another metal using electric current. It prevents corrosion and improves appearance.",
        },
        {
          difficulty: "medium",
          marks: 2,
          question: "What is the role of a conductor in electrolysis?",
          answer:
            "A conductor permits electric current to pass and supports ion movement in the electrolyte.",
        },
      ],
    },
  ],
};
