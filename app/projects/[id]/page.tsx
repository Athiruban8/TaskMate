"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  UserPlusIcon,
  MapPinIcon,
  UsersIcon,
  TagIcon,
  CubeTransparentIcon,
  SparklesIcon,
  InboxIcon,
  ArrowUturnLeftIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/lib/auth-context";
import { JoinRequestModal } from "@/app/components/JoinRequestModal";
import { ProjectDetails, JoinRequest, RequestStatus } from "@/lib/types";
import { RealtimeChat } from "@/app/components/realtime-chat";
import ProjectForm from "@/app/components/ProjectForm";

interface RequestCardProps {
  request: JoinRequest;
  onAction: (requestId: string, action: "approve" | "reject") => Promise<void>;
  isRejecting?: boolean;
  onUndo?: () => void;
}
const RequestCard = ({
  request,
  onAction,
  isRejecting,
  onUndo,
}: RequestCardProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAction = async (action: "approve" | "reject") => {
    setLoading(true);
    setError("");
    try {
      await onAction(request.id, action);
    } catch (err: any) {
      setError(err.message || "An error occurred.");
      setLoading(false);
    }
  };
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
        <div className="h-10 w-10 shrink-0 rounded-full bg-neutral-200 dark:bg-neutral-700" />
      </div>
      {request.message && (
        <div className="mt-4">
          <h4 className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
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

      {/* undo button logic */}
      <div className="mt-5 flex items-center justify-end gap-3">
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
              disabled={loading}
              className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              {loading ? "..." : "Reject"}
            </button>
            <button
              onClick={() => handleAction("approve")}
              disabled={loading}
              className="rounded-md bg-black px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              {loading ? "..." : "Approve"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
const TechBadge = ({ name }: { name: string }) => (
  <span className="inline-flex items-center rounded-md bg-neutral-100 px-2.5 py-1 text-sm font-medium text-neutral-700 ring-1 ring-neutral-200 ring-inset dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-700">
    {name}
  </span>
);

const InfoCard = ({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
    <div className="flex items-center gap-3">
      <Icon className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
      <h3 className="text-sm font-semibold text-neutral-800 dark:text-white">
        {title}
      </h3>
    </div>
    <div className="mt-3 text-neutral-600 dark:text-neutral-300">
      {children}
    </div>
  </div>
);

export default function ProjectPage() {
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("description");
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [rejectingRequest, setRejectingRequest] = useState<{
    id: string;
    timer: NodeJS.Timeout;
  } | null>(null);

  const params = useParams();
  const { user: currentUser } = useAuth();
  const id = params.id as string;

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${id}`);
      if (!response.ok) {
        throw new Error("Project not found.");
      }
      const data: ProjectDetails = await response.json();
      if (currentUser) {
        const userRequest = data.requests?.find(
          (req) => req.userId === currentUser.id,
        );
        data.hasSentRequest = !!userRequest;
        data.requestStatus = userRequest?.status;
        data.isAlreadyMember = data.members?.some(
          (m) => m.user.id === currentUser.id,
        );
      }
      setProject(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchProject();
  }, [id, currentUser]);

  const isOwner = project?.owner?.id === currentUser?.id;

  useEffect(() => {
    if (isOwner && activeTab === "requests") {
      const fetchRequests = async () => {
        setRequestsLoading(true);
        try {
          const response = await fetch(`/api/projects/${id}/requests`);
          if (!response.ok) throw new Error("Failed to fetch requests.");
          const data = await response.json();
          setRequests(data);
        } catch (err) {
          console.error(err);
        } finally {
          setRequestsLoading(false);
        }
      };
      fetchRequests();
    }
  }, [isOwner, activeTab, id]);

  const handleRequestAction = async (
    requestId: string,
    action: "approve" | "reject",
  ) => {
    if (rejectingRequest) {
      clearTimeout(rejectingRequest.timer);
      setRejectingRequest(null);
    }

    if (action === "approve") {
      await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      setRequests((prev) => prev.filter((req) => req.id !== requestId));
      const response = await fetch(`/api/projects/${id}`);
      const data = await response.json();
      setProject(data);
    } else {
      // handle reject with undo
      const timer = setTimeout(async () => {
        await fetch(`/api/requests/${requestId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "reject" }),
        });
        setRequests((prev) => prev.filter((req) => req.id !== requestId));
        setRejectingRequest(null);
      }, 5000); // 5-second undo window
      setRejectingRequest({ id: requestId, timer });
    }
  };

  const handleEditProject = () => {
    setShowProjectForm(true);
  };

  const handleSuccess = () => {
    fetchProject();
    setShowProjectForm(false);
  };

  const handleClose = () => {
    setShowProjectForm(false);
  };

  const handleUndoReject = () => {
    if (rejectingRequest) {
      clearTimeout(rejectingRequest.timer);
      setRejectingRequest(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-neutral-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent dark:border-white dark:border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center dark:bg-neutral-950">
        <h1 className="text-2xl font-bold text-neutral-800 dark:text-white">
          Project Not Found
        </h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">{error}</p>
        <Link
          href="/projects"
          className="mt-6 inline-flex items-center rounded-md bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Projects
        </Link>
      </div>
    );
  }

  if (!project) return null;

  const getButtonState = () => {
    const isOwnerCheck = project.owner?.id === currentUser?.id;
    if (isOwnerCheck) return { text: "You are the owner", disabled: true };
    if (project.isAlreadyMember)
      return { text: "You are a member", disabled: true };
    if (project.hasSentRequest) {
      if (project.requestStatus === "PENDING")
        return { text: "Request Sent", disabled: true };
      if (project.requestStatus === "REJECTED")
        return { text: "Request Rejected", disabled: true };
    }
    const memberCount = (project.members?.length || 0) + 1;
    if (memberCount >= project.teamSize)
      return { text: "Team Full", disabled: true };
    return { text: "Request to Join", disabled: false };
  };
  const buttonState = getButtonState();

  return (
    <>
      {showJoinModal && (
        <JoinRequestModal
          project={project}
          onClose={() => setShowJoinModal(false)}
          onSuccess={() => {
            setProject((p) =>
              p
                ? {
                    ...p,
                    hasSentRequest: true,
                    requestStatus: "PENDING" as RequestStatus,
                  }
                : null,
            );
            setShowJoinModal(false);
          }}
        />
      )}
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          {/* Header */}
          <header className="mb-8">
            <Link
              href="/projects"
              className="mb-4 inline-flex items-center text-sm font-medium text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white"
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back to Projects
            </Link>
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
                {project.title}
              </h1>
              <div className="flex gap-3">
                {project.owner?.id === currentUser?.id ? (
                  <button
                    onClick={() => handleEditProject()}
                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  >
                    <PencilIcon className="h-4 w-4" />
                    Edit Project
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowJoinModal(true)}
                    disabled={buttonState.disabled}
                    className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                  >
                    <UserPlusIcon className="mr-2 h-4 w-4" />
                    Request to Join
                  </button>
                )}
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-8 lg:col-span-2">
              {isOwner && (
                <div className="border-b border-neutral-200 dark:border-neutral-800">
                  <nav className="-mb-px flex space-x-6">
                    <button
                      onClick={() => setActiveTab("description")}
                      className={`border-b-2 px-1 py-3 text-sm font-medium whitespace-nowrap ${activeTab === "description" ? "border-black text-black dark:border-white dark:text-white" : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-600 dark:hover:text-neutral-200"}`}
                    >
                      Description
                    </button>
                    <button
                      onClick={() => setActiveTab("requests")}
                      className={`flex cursor-pointer items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium whitespace-nowrap ${activeTab === "requests" ? "border-black text-black dark:border-white dark:text-white" : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-600 dark:hover:text-neutral-200"}`}
                    >
                      <InboxIcon className="h-4 w-4" /> Requests
                      {requests.length > 0 && (
                        <span className="ml-1 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                          {requests.length}
                        </span>
                      )}
                    </button>
                  </nav>
                </div>
              )}
              {activeTab === "description" && (
                <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    Project Description
                  </h2>
                  <p className="mt-3 whitespace-pre-wrap text-neutral-600 dark:text-neutral-400">
                    {project.description}
                  </p>
                </div>
              )}
              {(project.owner?.id === currentUser?.id || project.isAlreadyMember) && (
                <RealtimeChat
                  roomName={id}
                  currentUserId={currentUser!.id}
                  currentUserName={currentUser!.user_metadata?.name || currentUser!.email || "You"}
                />
              )}
              {activeTab === "requests" && isOwner && (
                <div className="space-y-4">
                  {requestsLoading ? (
                    <div className="flex justify-center p-8">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-black border-t-transparent dark:border-white dark:border-t-transparent" />
                    </div>
                  ) : requests.length > 0 ? (
                    requests.map((req) => (
                      <RequestCard
                        key={req.id}
                        request={req}
                        onAction={handleRequestAction}
                        isRejecting={rejectingRequest?.id === req.id}
                        onUndo={handleUndoReject}
                      />
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-700">
                      <InboxIcon className="mx-auto h-12 w-12 text-neutral-400" />
                      <h3 className="mt-2 text-lg font-medium text-neutral-900 dark:text-white">
                        No pending requests
                      </h3>
                    </div>
                  )}
                </div>
              )}
              {activeTab === "description" &&
                project.technologies.length > 0 && (
                  <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                    <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
                      Technologies
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <TechBadge key={tech.id} name={tech.name} />
                      ))}
                    </div>
                  </div>
                )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              <InfoCard icon={MapPinIcon} title="Location">
                <p>{project.city || "Remote"}</p>
              </InfoCard>
              <InfoCard
                icon={UsersIcon}
                title={`Team Members (${project.members.length + 1} / ${project.teamSize})`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                      <p className="text-sm font-medium text-neutral-800 dark:text-white">
                        {project.owner.name}
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">
                      <SparklesIcon className="h-3 w-3" />
                      Owner
                    </div>
                  </div>
                  {project.members.map((member) => (
                    <div
                      key={member.user.id}
                      className="flex items-center gap-3"
                    >
                      <div className="h-8 w-8 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                      <p className="text-sm font-medium text-neutral-800 dark:text-white">
                        {member.user.name}
                      </p>
                    </div>
                  ))}
                </div>
              </InfoCard>

              {project.categories.length > 0 && (
                <InfoCard icon={TagIcon} title="Categories">
                  <div className="flex flex-wrap gap-2">
                    {project.categories.map((cat) => (
                      <TechBadge key={cat.id} name={cat.name} />
                    ))}
                  </div>
                </InfoCard>
              )}

              {project.industries.length > 0 && (
                <InfoCard icon={CubeTransparentIcon} title="Industries">
                  <div className="flex flex-wrap gap-2">
                    {project.industries.map((ind) => (
                      <TechBadge key={ind.id} name={ind.name} />
                    ))}
                  </div>
                </InfoCard>
              )}
            </aside>
          </div>
        </div>
        {showProjectForm && (
          <ProjectForm
            onClose={() => handleClose()}
            onSuccess={() => handleSuccess()}
            projectToEdit={project}
          />
        )}
      </div>
    </>
  );
}
