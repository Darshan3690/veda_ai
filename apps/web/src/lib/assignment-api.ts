import { assignments, type Assignment } from "@/lib/assignment-data";
import { apiUrl } from "@/lib/api";

type ApiPaper = {
  title: string;
  subject: string;
  className?: string;
  duration: string;
  totalMarks: number;
  sections: {
    title: string;
    instruction: string;
    questions: {
      question: string;
      difficulty: "easy" | "medium" | "hard";
      marks: number;
      answer: string;
    }[];
  }[];
};

export async function getAssignment(id: string): Promise<Assignment> {
  try {
    const response = await fetch(`${apiUrl}/assignments/${id}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      return assignments[0];
    }
    const paper = (await response.json()) as ApiPaper;
    return {
      id,
      title: paper.title,
      subject: paper.subject,
      className: paper.className || "8",
      assignedOn: "20-06-2025",
      dueDate: "21-06-2025",
      duration: paper.duration,
      maxMarks: paper.totalMarks,
      sections: paper.sections.map((section) => ({
        title: section.title,
        instruction: section.instruction,
        questions: section.questions.map((q: any) => ({
          question: q.question,
          difficulty: toDifficultyLabel(q.difficulty),
          marks: q.marks,
          answer: q.answer,
          type: q.type || "short",
          options: q.options || undefined,
        })),
      })),
      questions: paper.sections.flatMap((section) =>
        section.questions.map((q: any) => ({
          question: q.question,
          difficulty: toDifficultyLabel(q.difficulty),
          marks: q.marks,
          answer: q.answer,
          type: q.type || "short",
          options: q.options || undefined,
        })),
      ),
    };
  } catch {
    return assignments[0];
  }
}

function toDifficultyLabel(difficulty: "easy" | "medium" | "hard") {
  if (difficulty === "easy") return "Easy";
  if (difficulty === "medium") return "Moderate";
  return "Challenging";
}
