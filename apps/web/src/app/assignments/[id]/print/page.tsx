import { QuestionPaper } from "@/components/assignments/paper";
import { getAssignment } from "@/lib/assignment-api";

export const metadata = {
  title: "Question Paper",
  robots: "noindex,nofollow",
};

export default async function PrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const assignment = await getAssignment(id);

  return (
    <>
      {/* Print-only page: No navbar, no sidebar, only content */}
      <main className="min-h-screen bg-white px-5 py-6 text-[#242424] print:p-0">
        <QuestionPaper assignment={assignment} variant="print" />
      </main>
    </>
  );
}
