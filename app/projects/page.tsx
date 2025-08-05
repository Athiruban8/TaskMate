"use client";

import { useState, useEffect } from "react";
import {
  PlusIcon,
  TrashIcon,
  UserIcon,
  MapPinIcon,
  UsersIcon,
  FolderIcon, // A more generic icon for an empty state
} from "@heroicons/react/24/outline";
import ProjectForm from "../components/ProjectForm";
import Navigation from "../components/NavBar";
import { useAuth } from "../../lib/auth-context";

interface Project {
  id: string;
  title: string;
  description: string;
  city: string;
  teamSize: number;
  createdAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  technologies: Array<{
    technology: {
      id: string;
      name: string;
      slug: string;
      color: string | null;
    };
  }>;
  categories: Array<{
    category: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
  industries: Array<{
    industry: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
  members: Array<{
    user: {
      id: string;
      name: string;
    };
  }>;
  _count: {
    members: number;
  };
  memberCount?: number;
  spotsLeft?: number;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleFormSuccess = () => {
    fetchProjects();
    setShowForm(false);
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffInDays < 1) return "Today";
    if (diffInDays < 2) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // A cleaner loading state
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
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <Navigation />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
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
            onClick={() => setShowForm(true)}
          >
            <PlusIcon className="h-4 w-4" />
            New Idea
          </button>
        </div>

        {/* Projects Grid or Empty State */}
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
              onClick={() => setShowForm(true)}
              className="mt-6 rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const memberCount = project._count?.members || 0;
              const spotsLeft = project.teamSize - memberCount;
              const isFullyBooked = spotsLeft <= 0;
              const progressPercentage = (memberCount / project.teamSize) * 100;

              return (
                <div
                  key={project.id}
                  className="group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition-all hover:-translate-y-1 hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
                >
                  {/* Main Content */}
                  <div className="flex-grow p-6">
                    {project.owner.id === user?.id && (
                      <button className="absolute top-4 right-4 z-10 text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-500 dark:text-neutral-500">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}

                    <h3 className="mb-2 text-xl font-semibold text-neutral-900 dark:text-white">
                      {project.title}
                    </h3>

                    <p className="mb-5 line-clamp-3 text-sm text-neutral-500 dark:text-neutral-400">
                      {project.description}
                    </p>

                    {/* Tech & Categories */}
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.slice(0, 3).map((tech) => (
                        <span
                          key={tech.technology.id}
                          className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                        >
                          {tech.technology.name}
                        </span>
                      ))}
                      {project.categories.slice(0, 2).map((cat) => (
                        <span
                          key={cat.category.id}
                          className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                        >
                          {cat.category.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="space-y-4 bg-neutral-50/75 p-6 dark:bg-neutral-950/50">
                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                      <div
                        className="flex items-center gap-1.5"
                        title={project.owner.name}
                      >
                        <UserIcon className="h-4 w-4" />
                        <span className="truncate">{project.owner.name}</span>
                      </div>
                      <span
                        title={new Date(project.createdAt).toLocaleDateString()}
                      >
                        {formatDate(project.createdAt)}
                      </span>
                    </div>

                    {/* Progress Bar & Status */}
                    <div>
                      <div className="mb-1 flex justify-between text-xs font-medium text-neutral-600 dark:text-neutral-300">
                        <span>Team</span>
                        <span>
                          {isFullyBooked ? "Full" : `${spotsLeft} spots left`}
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                        <div
                          className={`h-full rounded-full transition-all ${isFullyBooked ? "bg-red-500" : "bg-green-500"}`}
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Request to Join Button */}
                    <button
                      disabled={isFullyBooked}
                      className={`w-full rounded-lg py-2.5 text-sm font-semibold transition-colors ${
                        isFullyBooked
                          ? "cursor-not-allowed bg-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-600"
                          : "cursor-pointer bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                      }`}
                    >
                      {isFullyBooked ? "Team Full" : "Request to Join"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {showForm && (
        <ProjectForm
          onClose={() => setShowForm(false)}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}
