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
    <aside
      className="
        flex
        h-full
        min-h-0
        flex-col
        bg-white
      "
    >
      {/* =====================================================
          Premium Header
          ===================================================== */}

      <div
        className="
          shrink-0
          border-b
          border-slate-200/80
          bg-gradient-to-b
          from-[#F7FAFF]
          via-white
          to-white
          px-4
          pb-3.5
          pt-4
        "
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <Sparkles
                size={10}
                className="shrink-0 text-[#B38B19]"
              />

              <p
                className="
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.16em]
                  text-[#B38B19]
                "
              >
                Connections
              </p>
            </div>

            <div className="mt-1 flex items-center gap-2">
              <h2
                className="
                  text-[19px]
                  font-black
                  tracking-[-0.035em]
                  text-[#0B2D5C]
                "
              >
                Conversations
              </h2>

              {unreadTotal > 0 && (
                <span
                  className="
                    inline-flex
                    h-5
                    min-w-5
                    items-center
                    justify-center
                    rounded-full
                    bg-gradient-to-r
                    from-blue-600
                    to-indigo-600
                    px-1.5
                    text-[9px]
                    font-black
                    text-white
                    shadow-sm
                  "
                >
                  {unreadTotal >
                  99
                    ? "99+"
                    : unreadTotal}
                </span>
              )}
            </div>

            <p className="mt-1 text-[10px] font-medium text-slate-400">
              {conversations.length}{" "}
              {conversations.length ===
              1
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
            title="Refresh conversations"
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-slate-200
              bg-white
              text-slate-500
              shadow-[0_4px_12px_rgba(15,23,42,0.05)]
              transition-all
              hover:-translate-y-0.5
              hover:border-blue-200
              hover:bg-blue-50
              hover:text-[#0B2D5C]
            "
          >
            <RefreshCw
              size={15}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />
          </button>
        </div>

        {/* Search */}

        <div className="relative mt-3">
          <Search
            size={15}
            className="
              absolute
              left-3.5
              top-1/2
              -translate-y-1/2
              text-slate-400
            "
          />

          <input
            value={
              search
            }
            onChange={(
              event
            ) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search name, city or profession"
            className="
              h-10
              w-full
              rounded-[14px]
              border
              border-slate-200
              bg-slate-50/80
              py-2
              pl-10
              pr-3
              text-xs
              font-medium
              text-slate-800
              outline-none
              transition-all
              placeholder:font-normal
              placeholder:text-slate-400
              focus:border-blue-300
              focus:bg-white
              focus:ring-4
              focus:ring-blue-50
            "
          />
        </div>
      </div>

      {/* =====================================================
          Conversation Feed
          ===================================================== */}

      <div
        className="
          min-h-0
          flex-1
          overflow-y-auto
          overscroll-contain
          bg-white
        "
      >
        {loading &&
        conversations.length ===
          0 ? (
          <ConversationSkeleton />
        ) : filteredConversations.length >
          0 ? (
          <div className="py-1.5">
            {filteredConversations.map(
              (
                conversation
              ) => (
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
            )}
          </div>
        ) : (
          <div
            className="
              flex
              h-full
              min-h-[260px]
              flex-col
              items-center
              justify-center
              px-6
              text-center
            "
          >
            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                border
                border-blue-100
                bg-blue-50
                text-[#0B2D5C]
              "
            >
              <MessageCircle
                size={21}
              />
            </div>

            <h3
              className="
                mt-3.5
                text-sm
                font-black
                text-[#0B2D5C]
              "
            >
              {search
                ? "No conversations found"
                : "No conversations yet"}
            </h3>

            <p
              className="
                mt-1.5
                max-w-[230px]
                text-[11px]
                leading-5
                text-slate-500
              "
            >
              {search
                ? "Try searching by another name, city or profession."
                : "Once an interest is accepted, your conversations will appear here."}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}

function ConversationSkeleton() {
  return (
    <div className="space-y-1.5 p-2.5">
      {Array.from({
        length: 6,
      }).map(
        (
          _,
          index
        ) => (
          <div
            key={
              index
            }
            className="
              flex
              animate-pulse
              items-center
              gap-3
              rounded-2xl
              px-3
              py-3
            "
          >
            <div className="h-11 w-11 shrink-0 rounded-full bg-slate-200" />

            <div className="min-w-0 flex-1">
              <div className="h-3 w-2/5 rounded bg-slate-200" />

              <div className="mt-2 h-2.5 w-4/5 rounded bg-slate-100" />

              <div className="mt-2 h-2 w-3/5 rounded bg-slate-100" />
            </div>
          </div>
        )
      )}
    </div>
  );
}