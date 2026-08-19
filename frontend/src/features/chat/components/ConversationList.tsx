"use client";

import {
  MessageCircle,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import type {
  Conversation,
} from "@/features/chat/types";

import ConversationListItem from "./ConversationListItem";

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId:
    string | null;
  loading: boolean;
  onSelect: (
    conversationId: string
  ) => void;
  onRefresh: () => void;
}

export default function ConversationList({
  conversations,
  selectedConversationId,
  loading,
  onSelect,
  onRefresh,
}: ConversationListProps) {
  const [
    search,
    setSearch,
  ] = useState("");

  const filteredConversations =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      if (!normalizedSearch) {
        return conversations;
      }

      return conversations.filter(
        (conversation) => {
          const user =
            conversation.otherUser;

          return [
            user.fullName,
            user.profession,
            user.denomination,
            user.city,
            user.state,
          ]
            .filter(Boolean)
            .some((value) =>
              value!
                .toLowerCase()
                .includes(
                  normalizedSearch
                )
            );
        }
      );
    }, [
      conversations,
      search,
    ]);

  const unreadTotal =
    conversations.reduce(
      (
        total,
        conversation
      ) =>
        total +
        (
          conversation.unreadCount ??
          0
        ),
      0
    );

  return (
    <aside className="flex h-full min-h-0 flex-col border-r border-slate-200/80 bg-white">

      {/* Header */}
      <div className="border-b border-slate-100 bg-gradient-to-b from-blue-50/60 to-white px-3.5 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1">
              <Sparkles
                size={9}
                className="text-[#B38B19]"
              />

              <p className="text-[8px] font-black uppercase tracking-[0.12em] text-[#B38B19]">
                Connections
              </p>
            </div>

            <div className="mt-0.5 flex items-center gap-2">
              <h2 className="text-base font-black text-[#0B2D5C]">
                Conversations
              </h2>

              {unreadTotal > 0 && (
                <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[8px] font-black text-white">
                  {unreadTotal > 99
                    ? "99+"
                    : unreadTotal}
                </span>
              )}
            </div>

            <p className="mt-0.5 text-[10px] text-slate-400">
              {conversations.length}{" "}
              {conversations.length === 1
                ? "conversation"
                : "conversations"}
            </p>
          </div>

          <button
            type="button"
            onClick={
              onRefresh
            }
            aria-label="Refresh conversations"
            title="Refresh"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#0B2D5C]"
          >
            <RefreshCw
              size={14}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />
          </button>
        </div>

        {/* Search */}
        <div className="relative mt-2.5">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(
              event
            ) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search messages"
            className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2 pl-9 pr-3 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
          />
        </div>
      </div>

      {/* Conversations */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading &&
        conversations.length ===
          0 ? (
          <ConversationSkeleton />
        ) : filteredConversations.length >
          0 ? (
          filteredConversations.map(
            (conversation) => (
              <ConversationListItem
                key={
                  conversation.id
                }
                conversation={
                  conversation
                }
                selected={
                  selectedConversationId ===
                  conversation.id
                }
                onSelect={() =>
                  onSelect(
                    conversation.id
                  )
                }
              />
            )
          )
        ) : (
          <div className="flex h-full min-h-[200px] flex-col items-center justify-center px-5 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0B2D5C]">
              <MessageCircle
                size={18}
              />
            </div>

            <h3 className="mt-3 text-xs font-black text-[#0B2D5C]">
              {search
                ? "No conversations found"
                : "No conversations yet"}
            </h3>

            <p className="mt-1 max-w-xs text-[10px] leading-5 text-slate-500">
              {search
                ? "Try another name, city or profession."
                : "Once an interest is accepted, you can begin chatting here."}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}

function ConversationSkeleton() {
  return (
    <div className="space-y-1 p-2.5">
      {Array.from({
        length: 5,
      }).map(
        (_, index) => (
          <div
            key={
              index
            }
            className="flex animate-pulse items-center gap-2.5 rounded-xl p-2.5"
          >
            <div className="h-10 w-10 rounded-full bg-slate-200" />

            <div className="flex-1 space-y-2">
              <div className="h-2.5 w-2/5 rounded bg-slate-200" />

              <div className="h-2.5 w-4/5 rounded bg-slate-100" />
            </div>
          </div>
        )
      )}
    </div>
  );
}
