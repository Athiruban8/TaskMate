"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { FolderIcon } from "@heroicons/react/24/outline";
import { ProjectCard } from "@/app/components/ProjectCard"; // Import the shared component
import { ProjectSummary } from "@/lib/types";
import { JoinRequestModal } from "@/app/components/JoinRequestModal";
import Navigation from "@/app/components/NavBar";

export default function MyProjectsPage() {
  const [ownedProjects, setOwnedProjects] = useState<ProjectSummary[]>([]);
  const [memberProjects, setMemberProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<ProjectSummary | null>(
    null,
  );
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const fetchMyProjects = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/me/projects");
        if (!response.ok) throw new Error("Failed to fetch projects.");
        const data = await response.json();

        const processProjects = (projects: ProjectSummary[]) => {
          return projects.map((project) => {
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
        };

        setOwnedProjects(processProjects(data.ownedProjects || []));
        setMemberProjects(processProjects(data.memberProjects || []));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyProjects();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950">
        <Navigation />
        <div className="flex h-[calc(100vh-80px)] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent dark:border-white dark:border-t-transparent" />
        </div>
      </div>
    );
  }

  const hasOwnedProjects = ownedProjects.length > 0;
  const hasMemberProjects = memberProjects.length > 0;

  return (
    <>
      <div className="min-h-screen bg-white dark:bg-neutral-950">
        <Navigation />
        <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {!hasOwnedProjects && !hasMemberProjects ? (
            <div className="flex h-[calc(100vh-200px)] flex-col items-center justify-center text-center">
              <FolderIcon className="h-16 w-16 text-neutral-300 dark:text-neutral-700" />
              <h2 className="mt-4 text-xl font-semibold text-neutral-800 dark:text-white">
                No projects yet
              </h2>
              <p className="mt-1 text-neutral-500 dark:text-neutral-400">
                You haven't created or joined any projects.
              </p>
              <Link
                href="/projects"
                className="mt-6 rounded-md bg-black px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-black"
              >
                Explore Projects
              </Link>
            </div>
          ) : (
            <div className="space-y-16">
              {hasOwnedProjects && (
                <section>
                  <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
                    My Projects
                  </h1>
                  <p className="mt-2 text-neutral-500 dark:text-neutral-400">
                    Projects you've created and are managing.
                  </p>
                  <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {ownedProjects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onRequestJoin={setSelectedProject}
                      />
                    ))}
                  </div>
                </section>
              )}

              {hasMemberProjects && (
                <section>
                  <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
                    Projects I'm Part Of
                  </h1>
                  <p className="mt-2 text-neutral-500 dark:text-neutral-400">
                    Projects where you are a collaborator.
                  </p>
                  <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {memberProjects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onRequestJoin={setSelectedProject}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
