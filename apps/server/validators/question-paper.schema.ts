import { z } from "zod";

const BaseQuestion = z.object({
  question: z.string().min(1),
  difficulty: z.enum(["easy", "medium", "hard"]),
  marks: z.number().positive(),
});

const McqQuestion = BaseQuestion.extend({
  type: z.literal("mcq"),
  options: z.array(z.string()).length(4),
  answer: z.string().min(1),
}).superRefine((val, ctx) => {
  if (!val.options.includes(val.answer)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "For mcq type the `answer` must exactly match one of the `options`",
    });
  }
});

const ShortQuestion = BaseQuestion.extend({
  type: z.literal("short"),
  answer: z.string().min(1),
});

const LongQuestion = BaseQuestion.extend({
  type: z.literal("long"),
  answer: z.string().min(1),
});

const NumericalQuestion = BaseQuestion.extend({
  type: z.literal("numerical"),
  answer: z.string().min(1),
});

const DiagramQuestion = BaseQuestion.extend({
  type: z.literal("diagram"),
  answer: z.string().min(1).optional(),
});

const Question = z.discriminatedUnion("type", [
  McqQuestion,
  ShortQuestion,
  LongQuestion,
  NumericalQuestion,
  DiagramQuestion,
]);

export const QuestionPaperSchema = z.object({
  title: z.string().min(1),
  subject: z.string().min(1),
  className: z.string().min(1).optional(),
  duration: z.string().min(1),
  totalMarks: z.number().positive(),
  sections: z.array(
    z.object({
      title: z.string().min(1),
      instruction: z.string().min(1),
      questions: z.array(Question),
    }),
  ),
});

export type QuestionPaper = z.infer<typeof QuestionPaperSchema>;
