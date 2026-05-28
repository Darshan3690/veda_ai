import { Assignment } from "@/lib/assignment-data";
import { cn } from "@/lib/utils";

export function QuestionPaper({
  assignment,
  variant = "screen",
}: {
  assignment: Assignment;
  variant?: "screen" | "print";
}) {
  const sections =
    assignment.sections && assignment.sections.length > 0
      ? assignment.sections
      : [
          {
            title: "Section A",
            instruction: "Attempt all questions.",
            questions: assignment.questions,
          },
        ];

  return (
    <article
      className={cn(
        "question-paper mx-auto bg-white text-[14px] leading-[1.7]",
        variant === "screen" &&
          "max-w-5xl rounded-2xl px-7 py-8 shadow-sm lg:px-10 lg:py-10",
        variant === "print" && "max-w-[760px] px-0 py-0 shadow-none",
      )}
    >
      <header className="section-block text-center">
        <h1 className="text-2xl font-extrabold text-[#303030]">
          Delhi Public School, Sector-4, Bokaro
        </h1>
        <p className="mt-1 text-base font-bold">Subject: {assignment.subject}</p>
        <p className="font-bold">Class: {assignment.className}</p>
      </header>

      <div className="section-block mt-8 flex justify-between gap-4 text-sm font-bold">
        <p>Time Allowed: {assignment.duration}</p>
        <p>Maximum Marks: {assignment.maxMarks}</p>
      </div>

      <p className="mt-6 font-bold">All questions are compulsory unless stated otherwise.</p>

      <div className="section-block mt-6 space-y-1 font-semibold">
        <p>Name: __________________________</p>
        <p>Roll Number: ___________________</p>
        <p>Class: {assignment.className} Section: ____________</p>
      </div>

      {sections.map((section, sectionIndex) => (
        <SectionBlock
          key={`${section.title}-${sectionIndex}`}
          section={section}
          startAt={
            sections
              .slice(0, sectionIndex)
              .reduce((total, item) => total + item.questions.length, 0) + 1
          }
          variant={variant}
        />
      ))}
      <p className="mt-5 font-extrabold">End of Question Paper</p>

      <section className="page-break mt-10 border-t border-zinc-200 pt-8">
        <h2 className="font-extrabold">Answer Key:</h2>
        <ol className="mt-5 space-y-4">
          {assignment.questions.map((question, index) => (
            <li
              key={`${question.answer}-${index}`}
              className="question-block flex break-inside-avoid gap-2"
            >
              <span>{index + 1}.</span>
              <p>{question.answer}</p>
            </li>
          ))}
        </ol>
      </section>
    </article>
  );
}

function SectionBlock({
  section,
  startAt,
  variant,
}: {
  section: NonNullable<Assignment["sections"]>[number];
  startAt: number;
  variant: "screen" | "print";
}) {
  return (
    <section className="mt-8">
      <div className="section-block">
        <h2 className="text-center text-xl font-extrabold">{section.title}</h2>
        <p className="mt-6 text-sm text-zinc-600">{section.instruction}</p>
      </div>
      <ol className="mt-7 space-y-4">
        {section.questions.map((question, index) => (
          <li
            key={`${question.question}-${index}`}
            className="question-block flex break-inside-avoid gap-2"
          >
            <span className="w-6 text-right">{startAt + index}.</span>
            <div className="flex-1">
              <p>
                <DifficultyBadge difficulty={question.difficulty} />{" "}
                {question.question}{" "}
                <span className="font-semibold">[{question.marks} Marks]</span>
              </p>
              {question.type === "mcq" && question.options ? (
                <ul className="mt-2 list-inside space-y-1 pl-2">
                  {question.options.map((option, optIndex) => (
                    <li key={optIndex} className="text-sm">
                      {String.fromCharCode(65 + optIndex)}. {option}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function DifficultyBadge({
  difficulty,
}: {
  difficulty: Assignment["questions"][number]["difficulty"];
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold ring-1",
        difficulty === "Easy" && "bg-green-50 text-green-700 ring-green-200",
        difficulty === "Moderate" && "bg-amber-50 text-amber-700 ring-amber-200",
        difficulty === "Challenging" && "bg-red-50 text-red-700 ring-red-200",
      )}
    >
      <span className="h-2 w-2 rounded-full" aria-hidden />
      {difficulty}
    </span>
  );
}
