"use client";

import { useMemo, useRef, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Mic,
  Minus,
  Plus,
  UploadCloud,
  X,
} from "lucide-react";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Button } from "@/components/ui/button";
import { Stepper } from "@/components/ui/stepper";
import { questionTypes } from "@/lib/assignment-data";
import { apiUrl } from "@/lib/api";

const MAX_TOTAL_MARKS = 100;
const MAX_TOTAL_QUESTIONS = 40;
const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "text/plain",
];
const ALLOWED_FILE_EXTENSIONS = [".pdf", ".txt"];

type FormValues = {
  subject: string;
  className: string;
  dueDate: string;
  instructions: string;
  questions: {
    type: string;
    count: number;
    marks: number;
  }[];
};

export default function CreateAssignmentPage() {
  const [step, setStep] = useState(1);
  const [toast, setToast] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { register, control, handleSubmit, setValue } = useForm<FormValues>({
    defaultValues: {
      subject: "Science",
      className: "8",
      dueDate: "",
      instructions: "",
      questions: [
        { type: "Multiple Choice Questions", count: 4, marks: 1 },
        { type: "Short Questions", count: 3, marks: 2 },
        { type: "Diagram/Graph-Based Questions", count: 5, marks: 5 },
        { type: "Numerical Problems", count: 5, marks: 5 },
      ],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions",
  });
  const values = useWatch({ control });
  const totals = useMemo(
    () =>
      (values.questions || []).reduce<{ questions: number; marks: number }>(
        (total, row) => ({
          questions: total.questions + Number(row.count || 0),
          marks: total.marks + Number(row.count || 0) * Number(row.marks || 0),
        }),
        { questions: 0, marks: 0 },
      ),
    [values.questions],
  );

  function clamp(index: number, field: "count" | "marks", nextValue: number) {
    setValue(`questions.${index}.${field}`, Math.max(1, Number(nextValue) || 1));
  }

  function validateTotals() {
    if (totals.marks > MAX_TOTAL_MARKS) {
      setToast(`Total marks cannot exceed ${MAX_TOTAL_MARKS}`);
      return false;
    }
    if (totals.questions > MAX_TOTAL_QUESTIONS) {
      setToast(`Total questions cannot exceed ${MAX_TOTAL_QUESTIONS}`);
      return false;
    }
    return true;
  }

  function getFileValidationError(file?: File) {
    if (!file) return "";

    const currentFileName = file.name.toLowerCase();
    const hasAllowedType = ALLOWED_FILE_TYPES.includes(file.type);
    const hasAllowedExtension = ALLOWED_FILE_EXTENSIONS.some((extension) =>
      currentFileName.endsWith(extension),
    );

    if (!hasAllowedType || !hasAllowedExtension) {
      return "Invalid file type";
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      return "File must be 10MB or smaller";
    }

    return "";
  }

  function validateSelectedFile() {
    const error = getFileValidationError(fileInputRef.current?.files?.[0]);
    setFileError(error);
    return !error;
  }

  function handleFileChange(file?: File) {
    setFileError("");
    setFileName("");
    setSelectedFile(null);
    if (!file) return;

    const error = getFileValidationError(file);
    if (error) {
      setFileError(error);
      return;
    }

    setFileName(file.name);
    setSelectedFile(file);
  }

  async function submit() {
    if (!validateTotals() || !validateSelectedFile()) return;

    const formData = new FormData();
    formData.append("subject", values.subject || "Science");
    formData.append("className", values.className || "8");
    formData.append("totalQuestions", String(totals.questions));
    formData.append("totalMarks", String(totals.marks));
    formData.append("instructions", values.instructions || "");
    formData.append("questionTypes", JSON.stringify(values.questions || []));
    if (selectedFile) {
      formData.append("file", selectedFile);
    }

    const response = await fetch(`${apiUrl}/assignments`, {
      method: "POST",
      body: formData,
      headers: {
        "X-Due-Date": values.dueDate || "",
      },
    });
    if (!response.ok) {
      const error = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      setToast(error?.message || "Unable to create assignment");
      return;
    }
    setToast("Assignment Created");
    const data = (await response.json()) as { assignmentId: string };
    // Store newly created assignment ID in localStorage for tracking
    const recentAssignments = JSON.parse(localStorage.getItem("recentAssignments") || "[]") as string[];
    if (!recentAssignments.includes(data.assignmentId)) {
      recentAssignments.unshift(data.assignmentId);
      localStorage.setItem("recentAssignments", JSON.stringify(recentAssignments.slice(0, 10)));
    }
    router.push(`/assignments/${data.assignmentId}/generating`);
  }

  return (
    <PageWrapper label="Assignment" showFab={false}>
      <section className="px-4 pt-4 lg:px-0">
        <div className="flex items-center justify-center gap-4 lg:mt-5 lg:justify-start">
          <Button variant="ghost" className="size-11 px-0 lg:hidden">
            <ArrowLeft className="size-5" />
          </Button>
          <div className="text-center lg:text-left">
            <h1 className="text-base font-extrabold lg:text-xl">Create Assignment</h1>
            <p className="hidden text-sm text-zinc-500 lg:block">
              Set up a new assignment for your students
            </p>
          </div>
          <span className="size-11 lg:hidden" />
        </div>

        <Stepper current={step} steps={["Details", "Review"]} />

        <form
          onSubmit={handleSubmit(submit)}
          className="mx-auto max-w-[760px] rounded-3xl bg-[#eeeeee] p-5 shadow-sm lg:p-8"
        >
          {step === 1 ? (
            <>
              <h2 className="text-xl font-extrabold">Assignment Details</h2>
              <p className="text-sm text-zinc-500">Basic information about your assignment</p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-extrabold">Subject</span>
                  <span className="mt-2 flex h-11 items-center rounded-full bg-white px-4">
                    <input
                      {...register("subject", { required: true })}
                      placeholder="Science"
                      className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
                    />
                  </span>
                </label>
                <label className="block">
                  <span className="text-sm font-extrabold">Class/Grade</span>
                  <span className="mt-2 flex h-11 items-center rounded-full bg-white px-4">
                    <input
                      {...register("className", { required: true })}
                      placeholder="8"
                      className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
                    />
                  </span>
                </label>
              </div>

              <label className="mt-7 block rounded-2xl border-2 border-dashed border-zinc-300 bg-white px-5 py-10 text-center transition hover:border-zinc-500">
                <UploadCloud className="mx-auto size-8 text-[#202020]" />
                <p className="mt-4 font-bold">Choose a file or drag & drop it here</p>
                <p className="mt-1 text-xs text-zinc-400">PDF or TXT up to 10MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,application/pdf,text/plain"
                  className="sr-only"
                  onChangeCapture={(event) =>
                    handleFileChange(event.currentTarget.files?.[0])
                  }
                  onChange={(event) => handleFileChange(event.target.files?.[0])}
                  onInput={(event) =>
                    handleFileChange(event.currentTarget.files?.[0])
                  }
                />
                <span className="mt-5 inline-flex h-9 items-center rounded-full bg-[#f2f2f2] px-5 text-xs font-bold text-[#242424]">
                  Browse Files
                </span>
                {fileName ? (
                  <p className="mt-3 text-xs font-semibold text-emerald-700">{fileName}</p>
                ) : null}
                {fileError ? (
                  <p className="mt-3 text-xs font-semibold text-red-600">{fileError}</p>
                ) : null}
              </label>
              <p className="mt-3 text-center text-sm text-zinc-500">
                Upload images of your preferred document/image
              </p>

              <label className="mt-5 block">
                <span className="text-sm font-extrabold">Due Date</span>
                <span className="mt-2 flex h-11 items-center rounded-full bg-white px-4">
                  <input
                    {...register("dueDate", { required: true })}
                    placeholder="DD-MM-YYYY"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
                  />
                  <Calendar className="size-4 text-zinc-600" />
                </span>
              </label>

              <div className="mt-5">
                <div className="mb-2 hidden grid-cols-[1fr_120px_120px] gap-5 px-3 text-sm font-extrabold lg:grid">
                  <span>Question Type</span>
                  <span>No. of Questions</span>
                  <span>Marks</span>
                </div>
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid gap-3 rounded-2xl bg-white p-3 lg:grid-cols-[1fr_32px_110px_110px]"
                    >
                      <select
                        {...register(`questions.${index}.type`)}
                        className="h-11 rounded-full bg-white px-3 text-sm font-medium outline-none"
                      >
                        {questionTypes.map((type) => (
                          <option key={type}>{type}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => fields.length > 1 && remove(index)}
                        className="hidden place-items-center text-zinc-500 lg:grid"
                      >
                        <X className="size-4" />
                      </button>
                      <Counter
                        label="No. of Questions"
                        value={Number(values.questions?.[index]?.count || 1)}
                        onChange={(next) => clamp(index, "count", next)}
                      />
                      <Counter
                        label="Marks"
                        value={Number(values.questions?.[index]?.marks || 1)}
                        onChange={(next) => clamp(index, "marks", next)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex flex-col items-stretch gap-4 sm:flex-row sm:items-start sm:justify-between">
                <button
                  type="button"
                  onClick={() =>
                    append({ type: "Long Answer Questions", count: 1, marks: 1 })
                  }
                  className="inline-flex items-center gap-2 text-sm font-extrabold"
                >
                  <span className="grid size-8 place-items-center rounded-full bg-[#242424] text-white">
                    <Plus className="size-4" />
                  </span>
                  Add Question Type
                </button>
                <div className="rounded-2xl bg-white px-4 py-3 text-sm font-bold sm:bg-transparent sm:p-0 sm:text-right">
                  <p>Total Questions : {totals.questions}</p>
                  <p>Total Marks : {totals.marks}</p>
                  {totals.questions > MAX_TOTAL_QUESTIONS ||
                  totals.marks > MAX_TOTAL_MARKS ? (
                    <p className="mt-1 text-xs text-red-600">
                      Max {MAX_TOTAL_QUESTIONS} questions and {MAX_TOTAL_MARKS} marks
                    </p>
                  ) : null}
                </div>
              </div>

              <label className="mt-6 hidden lg:block">
                <span className="text-sm font-extrabold">
                  Additional Information (For better output)
                </span>
                <span className="mt-2 flex min-h-24 rounded-2xl bg-white p-4">
                  <textarea
                    {...register("instructions")}
                    placeholder="e.g Generate a question paper for 3 hour exam duration..."
                    className="min-h-20 w-full resize-none bg-transparent text-sm outline-none placeholder:text-zinc-400"
                  />
                  <Mic className="mt-auto size-4 text-zinc-500" />
                </span>
              </label>
            </>
          ) : (
            <Review values={values as FormValues} totals={totals} />
          )}
        </form>

        <div className="mx-auto mt-6 flex max-w-[760px] justify-between pb-24 lg:pb-0">
          <Button
            variant="light"
            onClick={() => (step === 1 ? router.push("/assignments") : setStep(1))}
          >
            <ArrowLeft className="size-4" />
            Previous
          </Button>
          {step === 1 ? (
            <Button onClick={() => validateTotals() && validateSelectedFile() && setStep(2)}>
              Next
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit(submit)}>Generate Assignment</Button>
          )}
        </div>
      </section>
      {toast ? (
        <div className="fixed right-5 top-5 z-50 rounded-full bg-[#111] px-5 py-3 text-sm font-semibold text-white shadow-xl">
          {toast}
        </div>
      ) : null}
    </PageWrapper>
  );
}

function Counter({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <p className="mb-1 text-center text-xs font-bold text-zinc-500 lg:hidden">
        {label}
      </p>
      <div className="grid h-10 grid-cols-3 items-center rounded-full bg-zinc-50">
        <button type="button" onClick={() => onChange(value - 1)}>
          <Minus className="mx-auto size-4" />
        </button>
        <span className="text-center text-sm font-extrabold">{value}</span>
        <button type="button" onClick={() => onChange(value + 1)}>
          <Plus className="mx-auto size-4" />
        </button>
      </div>
    </div>
  );
}

function Review({
  values,
  totals,
}: {
  values: FormValues;
  totals: { questions: number; marks: number };
}) {
  return (
    <section>
      <h2 className="text-xl font-extrabold">Review & Generate</h2>
      <p className="text-sm text-zinc-500">Confirm the assignment before AI generation</p>
      <div className="mt-7 rounded-2xl bg-white p-5">
        <p className="text-sm font-extrabold">Uploaded file</p>
        <p className="mt-1 text-sm text-zinc-500">
          PDF/TXT context is optional for generation.
        </p>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-5">
          <p className="text-sm text-zinc-500">Subject</p>
          <p className="mt-1 text-lg font-extrabold">{values.subject || "Science"}</p>
        </div>
        <div className="rounded-2xl bg-white p-5">
          <p className="text-sm text-zinc-500">Class/Grade</p>
          <p className="mt-1 text-lg font-extrabold">{values.className || "8"}</p>
        </div>
        <div className="rounded-2xl bg-white p-5">
          <p className="text-sm text-zinc-500">Due Date</p>
          <p className="mt-1 text-lg font-extrabold">{values.dueDate || "21-06-2025"}</p>
        </div>
        <div className="rounded-2xl bg-white p-5">
          <p className="text-sm text-zinc-500">Summary</p>
          <p className="mt-1 text-lg font-extrabold">
            {totals.questions} Questions, {totals.marks} Marks
          </p>
        </div>
      </div>
      <div className="mt-4 rounded-2xl bg-white p-5">
        <p className="text-sm font-extrabold">Question Configuration</p>
        <div className="mt-4 space-y-3">
          {values.questions.map((row, index) => (
            <div key={`${row.type}-${index}`} className="flex justify-between gap-3 text-sm">
              <span>{row.type}</span>
              <span className="font-bold">
                {row.count} x {row.marks}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
