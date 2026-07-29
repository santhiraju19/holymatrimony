"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import communicationService from "@/features/chat/api/communication.service";

import {
  ChatMessage,
  Conversation,
} from "@/features/chat/types";

import {
  mergeMessages,
  sortMessagesChronologically,
} from "@/features/chat/utils/chat.utils";

import { getApiErrorMessage } from "@/lib/api";

const POLLING_INTERVAL = 5000;

export default function useChat() {
  const [conversations, setConversations] =
    useState<Conversation[]>([]);

  const [selectedConversationId, setSelectedConversationId] =
    useState<string | null>(null);

  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const [loadingConversations, setLoadingConversations] =
    useState(true);

  const [loadingMessages, setLoadingMessages] =
    useState(false);

  const [sending, setSending] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const selectedConversationIdRef =
    useRef<string | null>(null);

  useEffect(() => {
    selectedConversationIdRef.current =
      selectedConversationId;
  }, [selectedConversationId]);

  const selectedConversation =
    useMemo(
      () =>
        conversations.find(
          (conversation) =>
            conversation.id ===
            selectedConversationId
        ) ?? null,
      [
        conversations,
        selectedConversationId,
      ]
    );

  const loadConversations =
    useCallback(
      async (silent = false) => {
        if (!silent) {
          setLoadingConversations(true);
        }

        try {
          const data =
            await communicationService.getConversations(
              {
                page: 0,
                size: 50,
              }
            );

          setConversations(
            data.conversations
          );

          setSelectedConversationId(
            (currentId) => {
              if (
                currentId &&
                data.conversations.some(
                  (conversation) =>
                    conversation.id ===
                    currentId
                )
              ) {
                return currentId;
              }

              return (
                data.conversations[0]?.id ??
                null
              );
            }
          );

          setError(null);
        } catch (error: unknown) {
          if (!silent) {
            setError(
              getApiErrorMessage(
                error,
                "Unable to load conversations."
              )
            );
          }
        } finally {
          if (!silent) {
            setLoadingConversations(false);
          }
        }
      },
      []
    );

  const markAsRead = useCallback(
    async (conversationId: string) => {
      try {
        await communicationService.markConversationAsRead(
          conversationId
        );

        setConversations((current) =>
          current.map((conversation) =>
            conversation.id ===
            conversationId
              ? {
                  ...conversation,
                  unreadCount: 0,
                }
              : conversation
          )
        );
      } catch {
        /*
         * Reading messages should still work
         * even if the read-receipt request fails.
         */
      }
    },
    []
  );

  const loadMessages = useCallback(
    async (
      conversationId: string,
      silent = false
    ) => {
      if (!silent) {
        setLoadingMessages(true);
      }

      try {
        const data =
          await communicationService.getMessages(
            conversationId,
            {
              page: 0,
              size: 100,
            }
          );

        const orderedMessages =
          sortMessagesChronologically(
            data.messages
          );

        setMessages((current) =>
          silent
            ? mergeMessages(
                current,
                orderedMessages
              )
            : orderedMessages
        );

        await markAsRead(conversationId);

        setError(null);
      } catch (error: unknown) {
        if (!silent) {
          setMessages([]);

          setError(
            getApiErrorMessage(
              error,
              "Unable to load messages."
            )
          );
        }
      } finally {
        if (!silent) {
          setLoadingMessages(false);
        }
      }
    },
    [markAsRead]
  );

  const selectConversation =
    useCallback(
      (conversationId: string) => {
        setSelectedConversationId(
          conversationId
        );
      },
      []
    );

  const clearSelection =
    useCallback(() => {
      setSelectedConversationId(null);
      setMessages([]);
    }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmedContent =
        content.trim();

      if (
        !trimmedContent ||
        !selectedConversation
      ) {
        return;
      }

      setSending(true);
      setError(null);

      try {
        const sentMessage =
          await communicationService.sendMessage(
            {
              receiverUserId:
                selectedConversation.otherUser
                  .userId,
              content: trimmedContent,
              messageType: "TEXT",
            }
          );

        setMessages((current) =>
          mergeMessages(current, [
            sentMessage,
          ])
        );

        setConversations((current) =>
          current.map((conversation) =>
            conversation.id ===
            selectedConversation.id
              ? {
                  ...conversation,
                  lastMessage:
                    sentMessage.content,
                  lastMessageSenderId:
                    sentMessage.senderId,
                  lastMessageAt:
                    sentMessage.createdAt,
                  updatedAt:
                    sentMessage.createdAt,
                }
              : conversation
          )
        );

        await loadConversations(true);
      } catch (error: unknown) {
        setError(
          getApiErrorMessage(
            error,
            "Unable to send the message."
          )
        );

        throw error;
      } finally {
        setSending(false);
      }
    },
    [
      selectedConversation,
      loadConversations,
    ]
  );

  const refresh = useCallback(async () => {
    await loadConversations(true);

    const conversationId =
      selectedConversationIdRef.current;

    if (conversationId) {
      await loadMessages(
        conversationId,
        true
      );
    }
  }, [
    loadConversations,
    loadMessages,
  ]);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      return;
    }

    void loadMessages(
      selectedConversationId
    );
  }, [
    selectedConversationId,
    loadMessages,
  ]);

  useEffect(() => {
    const interval = window.setInterval(
      () => {
        void refresh();
      },
      POLLING_INTERVAL
    );

    return () => {
      window.clearInterval(interval);
    };
  }, [refresh]);

  return {
    conversations,
    selectedConversation,
    selectedConversationId,
    messages,

    loadingConversations,
    loadingMessages,
    sending,
    error,

    selectConversation,
    clearSelection,
    sendMessage,
    refresh,
  };
}