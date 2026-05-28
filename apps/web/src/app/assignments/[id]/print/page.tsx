import { QuestionPaper } from "@/components/assignments/paper";
import { getAssignment } from "@/lib/assignment-api";

export const metadata = {
  title: "Question Paper",
};

export default async function PrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const assignment = await getAssignment(id);

  return (
    <main className="min-h-screen bg-white px-5 py-6 text-[#242424] print:p-0">
      <QuestionPaper assignment={assignment} variant="print" />
    </main>
  );
}
