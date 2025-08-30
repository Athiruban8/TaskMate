"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { TrashIcon, UserIcon } from "@heroicons/react/24/outline";
import { ProjectSummary, RequestStatus } from "@/lib/types";

interface ProjectCardProps {
  project: ProjectSummary;
  onDelete?: (projectId: string) => void;
  onRequestJoin: (project: ProjectSummary) => void;
}

export const ProjectCard = ({
  project,
  onDelete,
  onRequestJoin,
}: ProjectCardProps) => {
  const { user } = useAuth();
  const memberCount = (project._count?.members || 0) + 1;
  const isFullyBooked = memberCount >= project.teamSize;
  const progressPercentage = (memberCount / project.teamSize) * 100;

  const isOwner = project.owner.id === user?.id;
  let buttonText = "Request to Join";
  let buttonDisabled = isFullyBooked;

  if (isOwner) {
    buttonText = "You are the owner";
    buttonDisabled = true;
  } else if (project.isAlreadyMember) {
    buttonText = "You are a member";
    buttonDisabled = true;
  } else if (project.hasSentRequest) {
    if (project.requestStatus === RequestStatus.PENDING) {
      buttonText = "Request Sent";
      buttonDisabled = true;
    } else if (project.requestStatus === RequestStatus.REJECTED) {
      buttonText = "Request Rejected";
      buttonDisabled = true;
    }
  } else if (isFullyBooked) {
    buttonText = "Team Full";
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const startOfDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );
    const diffInTime = startOfToday.getTime() - startOfDate.getTime();
    const diffInDays = Math.round(diffInTime / (1000 * 60 * 60 * 24));
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <Link
      href={`/projects/${project.id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition-all hover:-translate-y-1 hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
    >
      <div className="flex-grow p-6">
        {isOwner && onDelete && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(project.id);
            }}
            className="absolute top-4 right-4 z-10 text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-500 dark:text-neutral-500"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        )}
        <h3 className="mb-2 text-xl font-semibold text-neutral-900 dark:text-white">
          {project.title}
        </h3>
        <p className="mb-5 line-clamp-3 text-sm text-neutral-500 dark:text-neutral-400">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-2">
          {project.technologies.slice(0, 3).map((tech) => (
            <span
              key={tech.technology.id}
              className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
            >
              {tech.technology.name}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-auto space-y-4 bg-neutral-50/75 p-6 dark:bg-neutral-950/50">
        <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
          <div
            className="flex items-center gap-1.5"
            title={project.owner.name || ""}
          >
            <UserIcon className="h-4 w-4" />
            <span className="truncate">{project.owner.name}</span>
          </div>
          <span title={new Date(project.createdAt).toLocaleDateString()}>
            {formatDate(project.createdAt)}
          </span>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-xs font-medium text-neutral-600 dark:text-neutral-300">
            <span>Team</span>
            <span>{`${memberCount} / ${project.teamSize}`}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
            <div
              className={`h-full rounded-full transition-all ${isFullyBooked ? "bg-red-500" : "bg-green-500"}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!buttonDisabled) {
              onRequestJoin(project);
            }
          }}
          disabled={buttonDisabled}
          className="w-full rounded-lg bg-black py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500 dark:bg-white dark:text-black dark:hover:bg-neutral-200 dark:disabled:bg-neutral-800 dark:disabled:text-neutral-600"
        >
          {buttonText}
        </button>
      </div>
    </Link>
  );
};
