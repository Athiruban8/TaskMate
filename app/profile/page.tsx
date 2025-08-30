"use client";

import { useState, useEffect, FC } from "react";
import { useAuth } from "@/lib/auth-context";
import { User } from "@/lib/types";
import Navigation from "@/components/NavBar";
import { ProfileEditModal } from "@/components/ProfileEditModal";
import {
  PencilIcon,
  UserCircleIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";

export default function ProfilePage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [error, setError] = useState("");

  const fetchProfile = async () => {
    try {
      setProfileLoading(true);
      const response = await fetch("/api/me");
      if (!response.ok) throw new Error("Could not fetch profile.");
      const data: User = await response.json();
      setProfile(data);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Failed to load profile.");
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    if (authUser) {
      fetchProfile();
    } else if (!authLoading) {
      setProfileLoading(false);
    }
  }, [authUser, authLoading]);

  const isLoading = authLoading || profileLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950">
        <Navigation />
        <div className="flex h-[calc(100vh-80px)] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent dark:border-white dark:border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!authUser || !profile) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950">
        <Navigation />
        <div className="p-8 text-center text-neutral-500 dark:text-neutral-400">
          {error || "Please log in to view your profile."}
        </div>
      </div>
    );
  }

  return (
    <>
      {showEditModal && (
        <ProfileEditModal
          userProfile={profile}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            fetchProfile(); // Refetch data after successful update
          }}
        />
      )}
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <Navigation />
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <header className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <UserCircleIcon className="h-24 w-24 text-neutral-300 dark:text-neutral-700" />
            <div className="flex-grow">
              <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
                {profile.name}
              </h1>
              <p className="text-neutral-500 dark:text-neutral-400">
                {profile.email}
              </p>
              {/* {profile.city && <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{profile.city}</p>} */}
            </div>
            <button
              onClick={() => setShowEditModal(true)}
              className="inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              <PencilIcon className="h-4 w-4" />
              Edit Profile
            </button>
          </header>

          <main className="mt-10 space-y-8">
            {profile.githubUrl && (
              <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  About
                </h2>
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-2 text-sm text-black hover:underline dark:text-white"
                >
                  <LinkIcon className="h-4 w-4 text-neutral-500" />
                  {profile.githubUrl}
                </a>
              </div>
            )}

            {profile.skills && profile.skills.length > 0 && (
              <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
                  Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
