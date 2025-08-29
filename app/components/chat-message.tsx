"use client";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/hooks/use-realtime-chat";


interface ChatMessageItemProps {
  message: ChatMessage;
  isOwnMessage: boolean;
  showHeader: boolean;
}


export const ChatMessageItem = ({
  message,
  isOwnMessage,
  showHeader,
}: ChatMessageItemProps) => {
  const time = new Date(message.createdAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div
      className={cn("group mt-2 flex", {
        "justify-end": isOwnMessage,
        "justify-start": !isOwnMessage,
      })}
    >
      <div
        className={cn("flex w-fit max-w-[75%] flex-col gap-1", {
          "items-end": isOwnMessage,
          "items-start": !isOwnMessage,
        })}
      >
        {showHeader && (
          <div
            className={cn("flex items-center gap-2 px-3 text-xs", {
              "flex-row-reverse": isOwnMessage,
            })}
          >
            <span className="font-medium dark:text-neutral-50">
              {message.user.name}
            </span>
            <span className="text-foreground/50 dark:text-neutral-50">
              {time}
            </span>
          </div>
        )}
        <div
          className={cn("flex items-end gap-2", {
            "flex-row-reverse": isOwnMessage,
          })}
        >
          <div
            className={cn(
              "w-fit rounded-xl px-3 py-2 text-sm",
              isOwnMessage
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50",
            )}
          >
            {message.content}
          </div>
          {!showHeader && (
            <div className="mb-1 shrink-0 text-xs text-foreground/50 opacity-0 transition-opacity group-hover:opacity-100 dark:text-neutral-400">
              {time}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
