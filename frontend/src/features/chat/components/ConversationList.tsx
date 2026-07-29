"use client";

import {
  MessageCircle,
  RefreshCw,
  Search,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import {
  Conversation,
} from "@/features/chat/types";

import ConversationListItem from "./ConversationListItem";

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  loading: boolean;
  onSelect: (conversationId: string) => void;
  onRefresh: () => void;
}

export default function ConversationList({
  conversations,
  selectedConversationId,
  loading,
  onSelect,
  onRefresh,
}: ConversationListProps) {
  const [search, setSearch] =
    useState("");

  const filteredConversations =
    useMemo(() => {
      const normalizedSearch =
        search.trim().toLowerCase();

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
    }, [conversations, search]);

  return (
    <aside className="flex h-full min-h-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#0B2D5C]">
              Messages
            </h1>

            <p className="mt-1 text-xs text-slate-500">
              {conversations.length}{" "}
              {conversations.length === 1
                ? "conversation"
                : "conversations"}
            </p>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            aria-label="Refresh conversations"
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-[#0B2D5C]"
          >
            <RefreshCw
              size={18}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />
          </button>
        </div>

        <div className="relative mt-4">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search conversations"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading &&
        conversations.length === 0 ? (
          <ConversationSkeleton />
        ) : filteredConversations.length >
          0 ? (
          filteredConversations.map(
            (conversation) => (
              <ConversationListItem
                key={conversation.id}
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
          <div className="flex h-full min-h-80 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <MessageCircle size={27} />
            </div>

            <h3 className="mt-4 font-semibold text-slate-800">
              {search
                ? "No conversations found"
                : "No conversations yet"}
            </h3>

            <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
              {search
                ? "Try searching with a different name."
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
    <div className="space-y-1 p-3">
      {Array.from({
        length: 5,
      }).map((_, index) => (
        <div
          key={index}
          className="flex animate-pulse items-center gap-3 rounded-xl p-3"
        >
          <div className="h-12 w-12 rounded-full bg-slate-200" />

          <div className="flex-1 space-y-2">
            <div className="h-3 w-2/5 rounded bg-slate-200" />
            <div className="h-3 w-4/5 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}