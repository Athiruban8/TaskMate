"use client";
import { useEffect, useMemo, useState } from "react";
import { useRealtimeChat, type ChatMessage } from "@/hooks/use-realtime-chat";
import { useChatScroll } from "@/hooks/use-chat-scroll";
import { cn } from "@/lib/utils";
import { ChatMessageItem } from "./chat-message";

interface RealtimeChatProps {
  roomName: string;
  currentUserId: string;
  currentUserName: string;
  onLocalMessage?: (message: ChatMessage) => void;
}

export function RealtimeChat({
  roomName,
  currentUserId,
  currentUserName,
  onLocalMessage,
}: RealtimeChatProps) {
  const { messages, setMessages, sendMessage } = useRealtimeChat({ roomName });
  const [input, setInput] = useState("");
  const listRef = useChatScroll<HTMLDivElement>(messages);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/projects/${roomName}/messages`);
      if (res.ok) {
        const initial: ChatMessage[] = await res.json();
        setMessages(initial);
      }
    }
    load();
  }, [roomName, setMessages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput("");
    const toSend: ChatMessage = {
      id: crypto.randomUUID(),
      content: trimmed,
      createdAt: new Date().toISOString(),
      user: { id: currentUserId, name: currentUserName },
    };
    // Optimistic append for sender UX and preview updates
    setMessages((prev) => [...prev, toSend]);
    onLocalMessage?.(toSend);
    // broadcast quickly for low-latency UI across clients
    void sendMessage(toSend);
    // persist to DB (postgres_changes listener will refresh authoritative state)
    const res = await fetch(`/api/projects/${roomName}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: trimmed }),
    });
    if (!res.ok) {
      const reload = await fetch(`/api/projects/${roomName}/messages`);
      if (reload.ok) setMessages(await reload.json());
    }
  };

  // group messages to control header
  const items = useMemo(() => {
    return messages.map((m, idx) => {
      const prev = messages[idx - 1];
      const showHeader =
        !prev ||
        prev.user.id !== m.user.id ||
        new Date(m.createdAt).getTime() - new Date(prev.createdAt).getTime() >
          5 * 60 * 1000;
      return { m, showHeader };
    });
  }, [messages]);

  return (
    <div className="flex h-[600px] w-full flex-col rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <div className="border-b border-neutral-200 p-4 dark:border-neutral-800">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
          Team Chat
        </h3>
      </div>
      <div ref={listRef} className="flex-1 overflow-y-auto p-4">
        {items.map(({ m, showHeader }) => (
          <ChatMessageItem
            key={m.id + m.createdAt}
            message={m}
            isOwnMessage={m.user.id === currentUserId}
            showHeader={showHeader}
          />
        ))}
      </div>
      <div className="border-t border-neutral-200 p-3 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            placeholder="Write a message"
            className={cn(
              "flex-1 rounded-md border bg-transparent px-3 py-2 text-sm outline-none",
              "border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-neutral-400 dark:border-neutral-700 dark:text-neutral-100 dark:placeholder-neutral-500",
            )}
          />
          <button
            onClick={handleSend}
            className="inline-flex items-center justify-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
