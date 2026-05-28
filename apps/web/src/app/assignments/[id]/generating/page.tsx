"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Check, Loader2, XCircle } from "lucide-react";
import { io } from "socket.io-client";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Button } from "@/components/ui/button";
import { apiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

const states = ["Queued", "Processing", "Structuring", "Saving", "Completed"];
const eventToIndex: Record<string, number> = {
  queued: 0,
  processing: 1,
  structuring: 2,
  saving: 3,
  completed: 4,
};

export default function GeneratingPage() {
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const assignmentId = params.id;

  useEffect(() => {
    const socket = io(apiUrl, { transports: ["websocket", "polling"] });
    socket.emit("assignment:join", assignmentId);

    Object.entries(eventToIndex).forEach(([eventName, index]) => {
      socket.on(eventName, () => {
        setActive(index);
        if (eventName === "completed") {
          setTimeout(() => router.push(`/assignments/${assignmentId}/output`), 500);
          // clear any timeout state
          setTimedOut(false);
        }
      });
    });
    socket.on("failed", () => setFailed(true));

    // Long-running generation timeout (graceful UX fallback)
    const generationTimeout = setTimeout(() => {
      setTimedOut(true);
      setFailed(true);
    }, 2 * 60 * 1000); // 2 minutes

    const fallbackTimers = states.map((_, index) =>
      setTimeout(() => setActive((current) => Math.max(current, index)), 1000 * (index + 1)),
    );

    return () => {
      fallbackTimers.forEach(clearTimeout);
      clearTimeout(generationTimeout);
      socket.disconnect();
    };
  }, [assignmentId, router]);

  return (
    <PageWrapper label="Assignment" showFab={false}>
      <section className="grid min-h-[calc(100vh-70px)] place-items-center px-4">
        <div className="w-full max-w-[620px] rounded-3xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#1f1f1f] text-white">
            {failed ? (
              <XCircle className="size-8" />
            ) : (
              <Loader2 className="size-8 animate-spin" />
            )}
          </div>
          <h1 className="mt-6 text-3xl font-extrabold">
            {failed ? "Failed to generate assignment" : "Generating assignment"}
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Realtime queue updates are streaming through Socket.io while BullMQ
            prepares the question paper.
            {timedOut ? (
              <span> Generation taking longer than expected — you can retry.</span>
            ) : null}
          </p>

          <div className="mt-8 space-y-4 text-left">
            {states.map((state, index) => {
              const complete = active > index;
              const current = active === index;
              return (
                <div key={state} className="flex items-center gap-4">
                  <div
                    className={cn(
                      "grid size-9 place-items-center rounded-full border text-sm font-bold",
                      complete && "border-emerald-500 bg-emerald-500 text-white",
                      current && "border-[#1f1f1f] bg-[#1f1f1f] text-white",
                      !complete && !current && "border-zinc-200 bg-zinc-50 text-zinc-400",
                    )}
                  >
                    {complete ? <Check className="size-4" /> : index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-extrabold">{state}</p>
                    <p className="text-sm text-zinc-500">
                      {current
                        ? "In progress"
                        : complete
                          ? "Completed"
                          : "Waiting"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {failed ? (
            <Button className="mt-8" onClick={() => setFailed(false)}>
              Try Again
            </Button>
          ) : null}
        </div>
      </section>
    </PageWrapper>
  );
}
