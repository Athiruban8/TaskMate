"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navigation from "@/components/NavBar";
import { useAuth } from "@/lib/auth-context";
import {
  ChatBubbleLeftRightIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { RealtimeChat } from "@/components/realtime-chat";
import { createBrowserSupabaseClient } from "@/lib/supabase";
interface ChatProject {
  id: string;
  title: string;
  messages: { content: string; createdAt: string }[];
}

export default function ChatsPage() {
  const { user, loading: authLoading } = useAuth();
  const [chatProjects, setChatProjects] = useState<ChatProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<ChatProject | null>(
    null,
  );
  const [loadingChats, setLoadingChats] = useState(true);

  useEffect(() => {
    if (authLoading || !user) {
      setLoadingChats(false);
      return;
    }
    const fetchChats = async () => {
      try {
        setLoadingChats(true);
        const response = await fetch("/api/me/chats");
        if (!response.ok) throw new Error("Failed to load chats.");
        const data = await response.json();
        setChatProjects(data);
        if (data.length > 0) setSelectedProject(data[0]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingChats(false);
      }
    };
    fetchChats();
  }, [user, authLoading]);

  // subscribe to message inserts and update previews in real-time
  useEffect(() => {
    if (!user || chatProjects.length === 0) return;
    const supabase = createBrowserSupabaseClient();
    const channel = supabase.channel("chats-sidebar");
    channel.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "Message" },
      (payload: {
        new: { projectId: string; content: string; createdAt: string };
      }) => {
        const projectId = payload?.new?.projectId as string | undefined;
        const content = payload?.new?.content as string | undefined;
        const createdAt = payload?.new?.createdAt as string | undefined;
        if (!projectId || !content || !createdAt) return;
        setChatProjects((prev) => {
          const exists = prev.find((p) => p.id === projectId);
          if (!exists) return prev; // ignore projects not in list
          // update preview and move project to top
          const updated = prev.map((p) =>
            p.id === projectId
              ? { ...p, messages: [{ content, createdAt }] }
              : p,
          );
          const target = updated.find((p) => p.id === projectId)!;
          return [target, ...updated.filter((p) => p.id !== projectId)];
        });
      },
    );
    channel.subscribe();
    return () => {
      channel.unsubscribe();
    };
  }, [user, chatProjects.length]);

  if (authLoading || loadingChats) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950">
        <Navigation />
        <div className="flex h-[calc(100vh-80px)] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent dark:border-white dark:border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <Navigation />
      <div className="flex h-[calc(100vh-80px)] border-t border-neutral-200 dark:border-neutral-800">
        {/* Sidebar */}
        <aside className="w-full shrink-0 border-r border-neutral-200 md:w-80 lg:w-96 dark:border-neutral-800">
          <div className="p-4">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Chats
            </h1>
          </div>
          <div className="h-[calc(100%-68px)] overflow-y-auto">
            {chatProjects.length > 0 ? (
              chatProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className={`w-full p-4 text-left transition-colors ${selectedProject?.id === project.id ? "bg-neutral-100 dark:bg-neutral-800" : "hover:bg-neutral-50 dark:hover:bg-neutral-800/50"}`}
                >
                  <p className="font-semibold text-neutral-900 dark:text-white">
                    {project.title}
                  </p>
                  {project.messages[0] && (
                    <p className="mt-1 truncate text-sm text-neutral-500 dark:text-neutral-400">
                      {project.messages[0].content}
                    </p>
                  )}
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-neutral-500">
                <p>You are not part of any project chats yet.</p>
                <Link
                  href="/projects"
                  className="mt-2 inline-flex items-center gap-1 font-semibold text-black dark:text-white"
                >
                  Explore Projects <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="hidden flex-1 flex-col md:flex">
          {selectedProject && user ? (
            <div className="flex h-full flex-col p-4">
              <RealtimeChat
                roomName={selectedProject.id}
                currentUserId={user.id}
                currentUserName={
                  user.user_metadata?.name || user.email || "You"
                }
                onLocalMessage={(m) => {
                  setChatProjects((prev) =>
                    prev.map((p) =>
                      p.id === selectedProject.id
                        ? {
                            ...p,
                            messages: [
                              { content: m.content, createdAt: m.createdAt },
                              ...p.messages,
                            ].slice(0, 1),
                          }
                        : p,
                    ),
                  );
                }}
              />
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <ChatBubbleLeftRightIcon className="h-16 w-16 text-neutral-300 dark:text-neutral-700" />
              <h2 className="mt-4 text-xl font-semibold text-neutral-800 dark:text-white">
                Select a chat
              </h2>
              <p className="mt-1 text-neutral-500 dark:text-neutral-400">
                Choose a project from the sidebar to start chatting.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
