"use client";

import React, { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { QuestionPaper } from "@/components/assignments/paper";
import { Button } from "@/components/ui/button";
import { apiUrl } from "@/lib/api";
import { getAssignment } from "@/lib/assignment-api";
import { useAssignmentStore } from "@/store/assignment.store";

export default function OutputPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [assignment, setAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { addOrUpdateAssignment } = useAssignmentStore();

  useEffect(() => {
    (async () => {
      try {
        const { id } = await params;
        const data = await getAssignment(id);
        setAssignment(data);
        setLoading(false);
        // Add the newly generated assignment to the store so it appears in home page
        addOrUpdateAssignment(data);
      } catch (err) {
        console.error("Failed to load assignment:", err);
        setLoading(false);
      }
    })();
  }, [params, addOrUpdateAssignment]);

  if (loading) {
    return (
      <PageWrapper label="Create New" showFab={false}>
        <section className="px-3 py-4 lg:px-0">
          <div className="mx-auto max-w-5xl rounded-3xl bg-white p-8 text-center shadow-sm">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-800" />
            <p className="mt-4 text-sm text-gray-600">Loading assignment...</p>
          </div>
        </section>
      </PageWrapper>
    );
  }

  if (!assignment) {
    return (
      <PageWrapper label="Create New" showFab={false}>
        <section className="px-3 py-4 lg:px-0">
          <div className="mx-auto max-w-5xl rounded-3xl bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-red-600">Failed to load assignment</p>
          </div>
        </section>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper label="Create New" showFab={false}>
      <section className="px-3 py-4 lg:px-0">
        <div className="no-print mx-auto mb-3 max-w-5xl rounded-3xl bg-[#222] p-5 text-white shadow-sm">
          <p className="max-w-[720px] text-sm font-bold">
            Certainly, Lakshya! Here are customized Question Paper for your CBSE
            Grade 8 Science classes on the NCERT chapters:
          </p>
          <a href={`${apiUrl}/assignments/${assignment.id}/pdf`}>
            <Button variant="light" className="mt-4 h-9 px-4 text-xs">
              <Download className="size-4" />
              Download as PDF
            </Button>
          </a>
        </div>
        <QuestionPaper assignment={assignment} />
      </section>
    </PageWrapper>
  );
}
