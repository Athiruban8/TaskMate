"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ProjectForm from "@/app/components/ProjectForm";
import { ProjectDetails } from "@/lib/types";
import Navigation from "@/app/components/NavBar";

export default function EditProjectPage() {
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  useEffect(() => {
    if (!id) return;
    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/projects/${id}`);
        if (!response.ok) throw new Error("Failed to fetch project data.");
        const data = await response.json();
        setProject(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const handleSuccess = () => {
    // On success, redirect back to the project page
    router.push(`/projects/${id}`);
  };

  const handleClose = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-neutral-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent dark:border-white dark:border-t-transparent" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-neutral-950">
        <p className="text-red-500">{error || "Project not found."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <Navigation />
      {/* Render the form in a modal-like overlay */}
      <div className="fixed inset-0 z-40 bg-white dark:bg-neutral-950">
        <ProjectForm
          onClose={handleClose}
          onSuccess={handleSuccess}
          projectToEdit={project}
        />
      </div>
    </div>
  );
}
