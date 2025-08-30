"use client";

import { useState } from "react";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import { JoinRequest } from "@/lib/types";
import { UserCircleIcon } from "@heroicons/react/16/solid";

interface RequestCardProps {
  request: JoinRequest;
  onAction: (requestId: string, action: "approve" | "reject") => Promise<void>;
  isRejecting?: boolean;
  onUndo?: () => void;
}

export const RequestCard = ({
  request,
  onAction,
  isRejecting,
  onUndo,
}: RequestCardProps) => {
  const [loadingAction, setLoadingAction] = useState<
    "approve" | "reject" | null
  >(null);
  const [error, setError] = useState("");

  const handleAction = async (action: "approve" | "reject") => {
    setLoadingAction(action);
    setError("");
    try {
      await onAction(request.id, action);
    } catch (err: any) {
      setError(err.message || "An error occurred.");
      setLoadingAction(null);
    }
  };

  const Spinner = () => (
    <div
      className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
      role="status"
      aria-label="loading"
    ></div>
  );

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 transition-all dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-neutral-800 dark:text-white">
            {request.user.name || "Anonymous User"}
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {request.user.email}
          </p>
        </div>
        {/* Placeholder for user avatar */}
        <UserCircleIcon className="h-10 w-10 shrink-0 rounded-full bg-neutral-200 dark:bg-neutral-700" />
      </div>

      {request.user.skills && request.user.skills.length > 0 && (
        <div className="mt-4">
          <h4 className="text-xs font-medium tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
            Skills
          </h4>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {request.user.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {request.message && (
        <div className="mt-4">
          <h4 className="text-xs font-medium tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
            Message
          </h4>
          <blockquote className="mt-1.5 border-l-2 border-neutral-200 pl-3 text-sm text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
            {request.message}
          </blockquote>
        </div>
      )}

      {error && (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Action/Undo Buttons */}
      <div className="mt-5 flex min-h-[38px] items-center justify-end gap-3">
        {isRejecting ? (
          <>
            <p className="text-sm text-neutral-500">Request rejected.</p>
            <button
              onClick={onUndo}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-black transition-colors hover:bg-neutral-100 dark:text-white dark:hover:bg-neutral-800"
            >
              <ArrowUturnLeftIcon className="h-4 w-4" />
              Undo
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => handleAction("reject")}
              disabled={loadingAction !== null}
              className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              {loadingAction === "reject" ? <Spinner /> : "Reject"}
            </button>
            <button
              onClick={() => handleAction("approve")}
              disabled={loadingAction !== null}
              className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md bg-black px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              {loadingAction === "approve" ? <Spinner /> : "Approve"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
