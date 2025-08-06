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
} from "@heroicons/react/24/outline";
import { useAuth } from "@/lib/auth-context";

interface User {
  id: string;
  name: string | null;
  email: string;
  skills: string[];
  githubUrl?: string | null;
}

interface Member {
  user: User;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
  color?: string | null;
}

interface Project {
  id: string;
  title: string;
  description: string;
  city: string | null;
  teamSize: number;
  createdAt: string;
  owner: User;
  members: Member[];
  technologies: Tag[];
  categories: Tag[];
  industries: Tag[];
}

const TechBadge = ({
  name,
  color,
}: {
  name: string;
  color?: string | null;
}) => (
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
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const params = useParams();
  const { user: currentUser } = useAuth();
  const id = params.id as string;

  useEffect(() => {
    if (!id) return;

    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/projects/${id}`);
        if (!response.ok) {
          throw new Error("Project not found.");
        }
        const data = await response.json();
        setProject(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

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

  const isOwner = currentUser?.id === project.owner.id;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Header */}
        <header className="mb-8">
          <Link
            href="/projects"
            className="mb-4 inline-flex items-center text-sm font-medium text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Projects
          </Link>
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {project.title}
            </h1>
            <div className="flex gap-3">
              {isOwner ? (
                <Link
                  href={`/projects/${project.id}/edit`}
                  className="inline-flex items-center justify-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                >
                  Edit Project
                </Link>
              ) : (
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
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
            <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Project Description
              </h2>
              <p className="mt-3 whitespace-pre-wrap text-neutral-600 dark:text-neutral-400">
                {project.description}
              </p>
            </div>

            {project.technologies.length > 0 && (
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
                    {/* TODO: ADD avatar */}
                    // placeholder for now
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
                  <div key={member.user.id} className="flex items-center gap-3">
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
    </div>
  );
}
