"use client";

import { useState, useEffect, FC, useRef } from "react";
import { User } from "@/lib/types";
import { XMarkIcon } from "@heroicons/react/24/outline";

// Helper hook for closing modal on outside click
const useClickOutside = (
  ref: React.RefObject<HTMLDivElement>,
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

// Reusable component for editing skills
const SkillsEditor: FC<{
  skills: string[];
  setSkills: (skills: string[]) => void;
}> = ({ skills, setSkills }) => {
  const [inputValue, setInputValue] = useState("");

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      const newSkill = inputValue.trim();
      if (!skills.includes(newSkill)) {
        setSkills([...skills, newSkill]);
      }
      setInputValue("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        Skills
      </label>
      <div className="mt-1 flex flex-wrap items-center gap-2 rounded-lg border border-neutral-300 bg-white p-2 dark:border-neutral-700 dark:bg-neutral-900">
        {skills.map((skill) => (
          <span
            key={skill}
            className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-sm text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
          >
            {skill}
            <button
              type="button"
              onClick={() => handleRemoveSkill(skill)}
              className="text-neutral-500 hover:text-neutral-800 dark:hover:text-white"
            >
              <XMarkIcon className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleAddSkill}
          placeholder={
            skills.length > 0
              ? "Add another skill..."
              : "Add a skill and press Enter..."
          }
          className="flex-grow bg-transparent p-1 text-sm focus:outline-none dark:text-neutral-300"
        />
      </div>
    </div>
  );
};

interface ProfileEditModalProps {
  userProfile: User;
  onClose: () => void;
  onSuccess: () => void;
}

export const ProfileEditModal: FC<ProfileEditModalProps> = ({
  userProfile,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    githubUrl: "",
    skills: [] as string[],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const modalRef = useRef<HTMLDivElement>(
    null,
  ) as React.RefObject<HTMLDivElement>;

  useClickOutside(modalRef, onClose);

  useEffect(() => {
    setFormData({
      name: userProfile.name || "",
      githubUrl: userProfile.githubUrl || "",
      skills: userProfile.skills || [],
    });
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [userProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const response = await fetch("/api/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile.");
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="relative w-full max-w-lg rounded-xl bg-white shadow-2xl dark:bg-neutral-900"
      >
        <div className="flex items-center justify-between border-b border-neutral-200 p-6 dark:border-neutral-800">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 p-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Name *
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-black focus:ring-black dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            </div>
            <div>
              <label
                htmlFor="githubUrl"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                GitHub URL
              </label>
              <input
                type="url"
                name="githubUrl"
                id="githubUrl"
                value={formData.githubUrl}
                onChange={handleInputChange}
                placeholder="https://github.com/your-username"
                className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-black focus:ring-black dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            </div>
            <SkillsEditor
              skills={formData.skills}
              setSkills={(newSkills) =>
                setFormData((prev) => ({ ...prev, skills: newSkills }))
              }
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <div className="flex justify-end gap-4 border-t border-neutral-200 p-4 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
