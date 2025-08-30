"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { ProjectDetails } from "@/lib/types";

// Helper hook for closing dropdowns when clicking outside
const useClickOutside = (
  ref: React.RefObject<HTMLDivElement | null>,
  handler: () => void,
) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
};

interface ProjectFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

interface Option {
  id: string;
  name: string;
}

interface Technology extends Option {
  slug: string;
  color: string | null;
}

interface Category extends Option {
  slug: string;
}

interface Industry extends Option {
  slug: string;
}

// Multi-select component
const MultiSelect = ({
  options,
  selectedIds,
  onToggle,
  placeholder,
  label,
}: {
  options: Option[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  placeholder: string;
  label: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  useClickOutside(dropdownRef, () => setIsOpen(false));

  const filteredOptions = useMemo(
    () =>
      options.filter((option) =>
        option.name.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [options, searchTerm],
  );

  const selectedOptions = options.filter((opt) => selectedIds.includes(opt.id));

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {label}
      </label>
      <div
        className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-300 bg-white p-2.5 dark:border-neutral-700 dark:bg-neutral-900"
        onClick={() => setIsOpen(true)}
      >
        {selectedOptions.length > 0 ? (
          selectedOptions.map((option) => (
            <span
              key={option.id}
              className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-sm text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
            >
              {option.name}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(option.id);
                }}
                className="text-neutral-500 hover:text-neutral-800 dark:hover:text-white"
              >
                <XMarkIcon className="h-3.5 w-3.5" />
              </button>
            </span>
          ))
        ) : (
          <span className="px-1 text-neutral-400 dark:text-neutral-500">
            {placeholder}
          </span>
        )}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setIsOpen(true);
            setSearchTerm(e.target.value);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={selectedOptions.length > 0 ? "Add more..." : ""}
          className="flex-grow bg-transparent text-sm focus:outline-none dark:text-neutral-500"
        />
      </div>
      {isOpen && (
        <div className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-800">
          <div className="sticky top-0 bg-white p-2 dark:bg-neutral-800">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full rounded-md border-none bg-neutral-100 py-2 pr-3 pl-9 text-sm focus:ring-2 focus:ring-black dark:bg-neutral-900 dark:text-neutral-500 dark:focus:ring-white"
              />
            </div>
          </div>
          <ul className="py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <li
                  key={option.id}
                  onClick={() => onToggle(option.id)}
                  className="flex cursor-pointer items-center justify-between px-4 py-2.5 text-sm hover:bg-neutral-100 dark:text-neutral-500 dark:hover:bg-neutral-700"
                >
                  <span>{option.name}</span>
                  {selectedIds.includes(option.id) && (
                    <CheckIcon className="h-4 w-4 text-black dark:text-white" />
                  )}
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-sm text-neutral-500">
                No results found.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

interface ProjectFormProps {
  onClose: () => void;
  onSuccess?: () => void;
  projectToEdit?: ProjectDetails | null;
}

export default function ProjectForm({
  onClose,
  onSuccess,
  projectToEdit,
}: ProjectFormProps) {
  const isEditMode = !!projectToEdit;
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [teamSize, setTeamSize] = useState(3);
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>(
    [],
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);

  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);

  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { user } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);
  useClickOutside(modalRef, onClose);
  // Pre-populate form if in edit mode
  useEffect(() => {
    if (isEditMode && projectToEdit) {
      setTitle(projectToEdit.title);
      setDescription(projectToEdit.description);
      setCity(projectToEdit.city || "");
      setTeamSize(projectToEdit.teamSize);
      setSelectedTechnologies(projectToEdit.technologies.map((t) => t.id));
      setSelectedCategories(projectToEdit.categories.map((c) => c.id));
      setSelectedIndustries(projectToEdit.industries.map((i) => i.id));
    }
  }, [isEditMode, projectToEdit]);

  useEffect(() => {
    fetchOptions();
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const fetchOptions = async () => {
    try {
      const [techRes, catRes, indRes] = await Promise.all([
        fetch("/api/technologies"),
        fetch("/api/categories"),
        fetch("/api/industries"),
      ]);
      if (techRes.ok) setTechnologies(await techRes.json());
      if (catRes.ok) setCategories(await catRes.json());
      if (indRes.ok) setIndustries(await indRes.json());
    } catch (error) {
      console.error("Error fetching options:", error);
      setError("Could not load project options.");
    }
  };

  const handleToggle =
    (setter: React.Dispatch<React.SetStateAction<string[]>>) =>
    (id: string) => {
      setter((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
      );
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (selectedTechnologies.length === 0 || selectedCategories.length === 0) {
      setError(
        "Please fill out all required fields, including at least one technology and category.",
      );
      return;
    }
    setSubmitting(true);
    setShowDeleteConfirm(false);
    setError("");

    const projectData = {
      title,
      description,
      city,
      teamSize,
      ownerId: user.id,
      technologyIds: selectedTechnologies,
      categoryIds: selectedCategories,
      industryIds: selectedIndustries,
    };

    try {
      const url = isEditMode
        ? `/api/projects/${projectToEdit.id}`
        : "/api/projects";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save project");
      }
      onSuccess?.();
    } catch (err: any) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditMode || !projectToEdit) return;
    setDeleting(true);
    setError("");
    try {
      await fetch(`/api/projects/${projectToEdit.id}`, { method: "DELETE" });
      router.push("/projects"); // redirect to projects page after deletion
    } catch (err: any) {
      setError("Failed to delete project.");
      setDeleting(false);
    }
  };

  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="animate-scale-up relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-neutral-900"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 p-6 dark:border-neutral-800">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {isEditMode ? "Edit Project" : "Share an Idea"}
          </h2>
          <button
            onClick={onClose}
            className="cursor-pointer text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-h-[calc(90vh-160px)] space-y-6 overflow-y-auto p-6"
        >
          <div>
            <label
              htmlFor="title"
              className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Project Title *
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., AI-Powered Story Generator"
              className="w-full border-b-2 border-neutral-200 bg-transparent py-2 transition-colors focus:border-black focus:outline-none dark:border-neutral-700 dark:text-neutral-500 dark:focus:border-white"
            />
          </div>
          <div>
            <label
              htmlFor="description"
              className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Description *
            </label>
            <textarea
              id="description"
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your project, the problem it solves, and the help you need..."
              className="w-full rounded-lg border border-neutral-200 bg-neutral-100 p-3 transition-all focus:ring-2 focus:ring-black focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-500 dark:focus:ring-white"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="city"
                className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                City
              </label>
              <input
                id="city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g., San Francisco"
                className="w-full border-b-2 border-neutral-200 bg-transparent py-2 transition-colors focus:border-black focus:outline-none dark:border-neutral-700 dark:text-neutral-500 dark:focus:border-white"
              />
            </div>
            <div>
              <label
                htmlFor="teamSize"
                className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Team Size:{" "}
                <span className="font-bold text-black dark:text-white">
                  {teamSize}
                </span>
              </label>
              <input
                id="teamSize"
                type="range"
                min="2"
                max="20"
                required
                value={teamSize}
                onChange={(e) => setTeamSize(parseInt(e.target.value))}
                className="slider-thumb h-2 w-full cursor-pointer appearance-none rounded-lg bg-neutral-200 dark:bg-neutral-700"
              />
            </div>
          </div>

          <MultiSelect
            options={technologies}
            selectedIds={selectedTechnologies}
            onToggle={handleToggle(setSelectedTechnologies)}
            placeholder="Select technologies..."
            label="Tech Stack *"
          />
          <MultiSelect
            options={categories}
            selectedIds={selectedCategories}
            onToggle={handleToggle(setSelectedCategories)}
            placeholder="Select categories..."
            label="Categories *"
          />
          <MultiSelect
            options={industries}
            selectedIds={selectedIndustries}
            onToggle={handleToggle(setSelectedIndustries)}
            placeholder="Select industries..."
            label="Industries"
          />

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}
        </form>

        <div className="flex items-center justify-between gap-4 border-t border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <div>
            {isEditMode && !showDeleteConfirm && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={deleting || submitting}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <TrashIcon className="h-4 w-4" />
                Delete
              </button>
            )}

            {showDeleteConfirm && (
              <div className="flex items-center gap-2">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Are you sure?
                </p>
                <button
                  onClick={handleDelete}
                  className="cursor-pointer rounded-lg px-4 py-3 font-bold text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  {deleting ? "Deleting..." : "Yes, delete"}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="cursor-pointer rounded-lg bg-neutral-100 px-4 py-3 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-lg bg-neutral-100 px-4 py-3 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={submitting || deleting}
              className="flex-1 cursor-pointer rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              {submitting
                ? isEditMode
                  ? "Saving..."
                  : "Publishing..."
                : isEditMode
                  ? "Save Changes"
                  : "Publish Idea"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
