"use client";

import { useState, useEffect } from "react";
import {
  PlusIcon,
  TrashIcon,
  UserIcon,
  FolderIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import ProjectForm from "@/app/components/ProjectForm";
import Navigation from "@/app/components/NavBar";
import { useAuth } from "@/lib/auth-context";
import { JoinRequestModal } from "@/app/components/JoinRequestModal";
import { ProjectSummary, RequestStatus } from "@/lib/types";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [selectedProject, setSelectedProject] = useState<ProjectSummary | null>(
    null,
  );

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/projects");
      if (response.ok) {
        let data = await response.json();
        if (user) {
          data = data.map((project: ProjectSummary) => {
            const userRequest = project.requests?.find(
              (req) => req.userId === user.id,
            );
            return {
              ...project,
              hasSentRequest: !!userRequest,
              requestStatus: userRequest?.status,
              isAlreadyMember: project.members?.some(
                (member) => member.userId === user.id,
              ),
            };
          });
        }
        setProjects(data);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const handleRequestSuccess = (projectId: string) => {
    setProjects((prevProjects) =>
      prevProjects.map((p) =>
        p.id === projectId
          ? { ...p, hasSentRequest: true, requestStatus: RequestStatus.PENDING }
          : p,
      ),
    );
    setSelectedProject(null);
  };

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
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-neutral-950">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-neutral-800 dark:border-neutral-200"></div>
          <p className="mt-4 font-light text-neutral-600 dark:text-neutral-400">
            Finding creative projects...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {showProjectForm && (
        <ProjectForm
          onClose={() => setShowProjectForm(false)}
          onSuccess={() => {
            fetchProjects();
            setShowProjectForm(false);
          }}
        />
      )}
      {selectedProject && (
        <JoinRequestModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onSuccess={() => handleRequestSuccess(selectedProject.id)}
        />
      )}
      <div className="min-h-screen bg-white dark:bg-neutral-950">
        <Navigation />
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col items-center text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
                Project Board
              </h1>
              <p className="mt-2 text-base text-neutral-500 dark:text-neutral-400">
                Discover, create, and collaborate on new ideas.
              </p>
            </div>
            <button
              className="mt-6 flex shrink-0 cursor-pointer items-center gap-2 rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-700 sm:mt-0 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
              onClick={() => setShowProjectForm(true)}
            >
              <PlusIcon className="h-4 w-4" />
              New Idea
            </button>
          </div>
          {projects.length === 0 ? (
            <div className="py-16 text-center">
              <FolderIcon className="mx-auto h-16 w-16 text-neutral-300 dark:text-neutral-700" />
              <h3 className="mt-4 text-xl font-semibold text-neutral-900 dark:text-white">
                No projects here yet
              </h3>
              <p className="mt-1 text-neutral-500 dark:text-neutral-400">
                Why not be the first to share an idea?
              </p>
              <button
                onClick={() => setShowProjectForm(true)}
                className="mt-6 rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
              >
                Create Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => {
                const memberCount = (project._count?.members || 0) + 1;
                const isFullyBooked = memberCount >= project.teamSize;
                const progressPercentage =
                  (memberCount / project.teamSize) * 100;

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
                  if (project.requestStatus === "PENDING") {
                    buttonText = "Request Sent";
                    buttonDisabled = true;
                  } else if (project.requestStatus === "REJECTED") {
                    buttonText = "Request Rejected";
                    buttonDisabled = true;
                  }
                } else if (isFullyBooked) {
                  buttonText = "Team Full";
                }
                return (
                  <Link
                    href={`/projects/${project.id}`}
                    key={project.id}
                    className="group relative flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition-all hover:-translate-y-1 hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
                  >
                    <div className="flex-grow p-6">
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
                        <span
                          title={new Date(
                            project.createdAt,
                          ).toLocaleDateString()}
                        >
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
                            setSelectedProject(project);
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
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
