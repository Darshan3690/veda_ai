import { z } from "zod";

export const QuestionPaperSchema = z.object({
  title: z.string().min(1),
  subject: z.string().min(1),
  duration: z.string().min(1),
  totalMarks: z.number().positive(),
  sections: z.array(
    z.object({
      title: z.string().min(1),
      instruction: z.string().min(1),
      questions: z.array(
        z.object({
          question: z.string().min(1),
          difficulty: z.enum(["easy", "medium", "hard"]),
          marks: z.number().positive(),
          answer: z.string().min(1),
        }),
      ),
    }),
  ),
});

export type QuestionPaper = z.infer<typeof QuestionPaperSchema>;

