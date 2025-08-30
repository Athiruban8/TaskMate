"use client";

import { useState, useEffect, FC } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { RequestCard } from "@/components/RequestCard";
import { JoinRequest, RequestStatus, User } from "@/lib/types";
import { InboxIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";

interface IncomingRequest {
  id: string;
  title: string;
  requests: JoinRequest[];
}

interface SentRequest {
  id: string;
  status: RequestStatus;
  project: {
    id: string;
    title: string;
  };
}

const SentRequestCard: FC<{
  request: SentRequest;
  onWithdraw: (id: string) => void;
}> = ({ request, onWithdraw }) => (
  <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
    <div>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Request for project:
      </p>
      <Link
        href={`/projects/${request.project.id}`}
        className="font-semibold text-neutral-800 hover:underline dark:text-white"
      >
        {request.project.title}
      </Link>
    </div>
    <div className="mt-4 flex items-center justify-between">
      <span
        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
          request.status === "PENDING"
            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300"
            : request.status === "APPROVED"
              ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
              : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
        }`}
      >
        {request.status}
      </span>
      {request.status === "PENDING" && (
        <button
          onClick={() => onWithdraw(request.id)}
          className="cursor-pointer text-sm font-medium text-red-600 hover:underline dark:text-red-400"
        >
          Withdraw
        </button>
      )}
    </div>
  </div>
);

export default function MyRequestsPage() {
  const [incomingRequests, setIncomingRequests] = useState<IncomingRequest[]>(
    [],
  );
  const [sentRequests, setSentRequests] = useState<SentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("incoming");
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchAllRequests = async () => {
      try {
        setLoading(true);
        const [incomingRes, sentRes] = await Promise.all([
          fetch("/api/me/requests/incoming"),
          fetch("/api/me/requests/sent"),
        ]);
        if (incomingRes.ok) setIncomingRequests(await incomingRes.json());
        if (sentRes.ok) setSentRequests(await sentRes.json());
      } catch (error: any) {
        console.error("Failed to fetch requests", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllRequests();
  }, [user]);

  const handleRequestAction = async (
    requestId: string,
    action: "approve" | "reject",
  ) => {
    await fetch(`/api/requests/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    // remove the request from the UI
    setIncomingRequests((prev) =>
      prev
        .map((proj) => ({
          ...proj,
          requests: proj.requests.filter((req) => req.id !== requestId),
        }))
        .filter((proj) => proj.requests.length > 0),
    );
  };

  const handleWithdraw = async (requestId: string) => {
    await fetch(`/api/requests/${requestId}`, { method: "DELETE" });
    // remove the withdrawn request from the UI
    setSentRequests((prev) => prev.filter((req) => req.id !== requestId));
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent dark:border-white dark:border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
        My Requests
      </h1>
      <div className="mt-6 border-b border-neutral-200 dark:border-neutral-800">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("incoming")}
            className={`flex cursor-pointer items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium whitespace-nowrap ${activeTab === "incoming" ? "border-black text-black dark:border-white dark:text-white" : "border-transparent text-neutral-500 hover:text-neutral-700"}`}
          >
            <InboxIcon className="h-5 w-5" /> Incoming
          </button>
          <button
            onClick={() => setActiveTab("sent")}
            className={`flex cursor-pointer items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium whitespace-nowrap ${activeTab === "sent" ? "border-black text-black dark:border-white dark:text-white" : "border-transparent text-neutral-500 hover:text-neutral-700"}`}
          >
            <PaperAirplaneIcon className="h-5 w-5" /> Sent
          </button>
        </nav>
      </div>

      <div className="mt-8">
        {activeTab === "incoming" && (
          <div className="space-y-8">
            {incomingRequests.length > 0 ? (
              incomingRequests.map((project) => (
                <div key={project.id}>
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    {project.title}
                  </h2>
                  <div className="mt-4 space-y-4">
                    {project.requests.map((req) => (
                      <RequestCard
                        key={req.id}
                        request={req}
                        onAction={handleRequestAction}
                      />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="pt-4 text-neutral-500">
                You have no incoming project requests.
              </p>
            )}
          </div>
        )}

        {activeTab === "sent" && (
          <div className="space-y-4">
            {sentRequests.length > 0 ? (
              sentRequests.map((req) => (
                <SentRequestCard
                  key={req.id}
                  request={req}
                  onWithdraw={handleWithdraw}
                />
              ))
            ) : (
              <p className="pt-4 text-neutral-500">
                You haven&apos;t sent any join requests.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
