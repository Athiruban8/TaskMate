"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase";

export interface ChatMessage {
  id: string;
  content: string;
  user: { id: string; name: string };
  createdAt: string;
}

interface UseRealtimeChatOptions {
  roomName: string;
}

export function useRealtimeChat({ roomName }: UseRealtimeChatOptions) {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const channel = useMemo(() => supabase.channel(`project-chat-${roomName}`), [supabase, roomName]);

  useEffect(() => {
    // Low-latency UI updates when clients broadcast
    channel.on("broadcast", { event: "message" }, ({ payload }) => {
      setMessages((prev) => [...prev, payload as ChatMessage]);
    });

    // Authoritative updates from DB changes (covers non-broadcast senders)
    channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'Message', filter: `projectId=eq.${roomName}` },
      async () => {
        try {
          const res = await fetch(`/api/projects/${roomName}/messages`);
          if (res.ok) {
            const data = await res.json();
            setMessages(data);
          }
        } catch {}
      }
    );

    channel.subscribe();
    return () => {
      channel.unsubscribe();
    };
  }, [channel, roomName]);

  const sendMessage = useCallback(async (message: ChatMessage) => {
    await channel.send({ type: "broadcast", event: "message", payload: message });
  }, [channel]);

  return { messages, setMessages, sendMessage };
}


