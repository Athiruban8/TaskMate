"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeftIcon,
  UserIcon,
  CalendarIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Navigation from "../../components/NavBar";

interface Project {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
}

export default function ProjectDetailPage() {
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser] = useState({ id: "1", name: "John Doe" });

  useEffect(() => {
    if (params.id) {
      fetchProject();
    }
  }, [params.id]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setProject(data);
      }
    } catch (error) {
      console.error("Error fetching project:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async () => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      const response = await fetch(`/api/projects/${params.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading project...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold text-gray-900">
              Project not found
            </h1>
            <p className="mb-4 text-gray-600">
              The project you're looking for doesn't exist.
            </p>
            <a
              href="/"
              className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              Back to Projects
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back button */}
        <div className="mb-6">
          <a
            href="/"
            className="inline-flex items-center text-gray-600 transition-colors hover:text-gray-900"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Projects
          </a>
        </div>

        {/* Project header */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex-1">
              <h1 className="mb-2 text-3xl font-bold text-gray-900">
                {project.title}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <UserIcon className="mr-1 h-4 w-4" />
                  <span>{project.owner.name}</span>
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="mr-1 h-4 w-4" />
                  <span>{formatDate(project.createdAt)}</span>
                </div>
              </div>
            </div>
            {project.owner.id === currentUser.id && (
              <div className="flex space-x-2">
                <button className="p-2 text-gray-400 transition-colors hover:text-blue-600">
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={deleteProject}
                  className="p-2 text-gray-400 transition-colors hover:text-red-500"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <div className="prose max-w-none">
            <p className="leading-relaxed text-gray-700">
              {project.description}
            </p>
          </div>
        </div>

        {/* Project actions */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Join this project
          </h2>
          <p className="mb-4 text-gray-600">
            Interested in this project? Send a request to join the team.
          </p>
          <button className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700">
            Request to Join
          </button>
        </div>
      </div>
    </div>
  );
}
