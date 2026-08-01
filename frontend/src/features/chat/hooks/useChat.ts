"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import chatWebSocketService, {
  ChatTypingEvent,
  WebSocketConnectionStatus,
} from "@/features/chat/api/chat-websocket.service";

import communicationService from "@/features/chat/api/communication.service";

import presenceService, {
  PresenceStatus,
} from "@/features/chat/api/presence.service";

import {
  ChatMessage,
  Conversation,
  SendMessageRequest,
} from "@/features/chat/types";

import {
  mergeMessages,
  sortMessagesChronologically,
} from "@/features/chat/utils/chat.utils";

import { getApiErrorMessage } from "@/lib/api";

const FALLBACK_POLLING_INTERVAL = 5000;
const PRESENCE_REFRESH_INTERVAL = 10000;
const SEND_TIMEOUT = 10000;
const INCOMING_TYPING_TIMEOUT = 3000;

function normalizeId(
  value: string | null | undefined
): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

export default function useChat() {
  const [conversations, setConversations] =
    useState<Conversation[]>([]);

  const [
    selectedConversationId,
    setSelectedConversationId,
  ] = useState<string | null>(null);

  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const [
    loadingConversations,
    setLoadingConversations,
  ] = useState(true);

  const [
    loadingMessages,
    setLoadingMessages,
  ] = useState(false);

  const [sending, setSending] =
    useState(false);

  const [
    uploadingImage,
    setUploadingImage,
  ] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [
    webSocketStatus,
    setWebSocketStatus,
  ] = useState<WebSocketConnectionStatus>(
    "disconnected"
  );

  const [
    typingConversationId,
    setTypingConversationId,
  ] = useState<string | null>(null);

  const [
    presenceByUserId,
    setPresenceByUserId,
  ] = useState<
    Record<string, PresenceStatus>
  >({});

  const selectedConversationIdRef =
    useRef<string | null>(null);

  const incomingTypingTimeoutRef =
    useRef<number | null>(null);

  useEffect(() => {
    selectedConversationIdRef.current =
      selectedConversationId;
  }, [selectedConversationId]);

  const selectedConversation =
    useMemo(() => {
      if (!selectedConversationId) {
        return null;
      }

      return (
        conversations.find(
          (conversation) =>
            normalizeId(
              conversation.id
            ) ===
            normalizeId(
              selectedConversationId
            )
        ) ?? null
      );
    }, [
      conversations,
      selectedConversationId,
    ]);

  const selectedUserPresence =
    useMemo(() => {
      if (!selectedConversation) {
        return null;
      }

      const userId =
        normalizeId(
          selectedConversation
            .otherUser.userId
        );

      return (
        presenceByUserId[userId] ??
        null
      );
    }, [
      presenceByUserId,
      selectedConversation,
    ]);

  const clearIncomingTypingTimer =
    useCallback(() => {
      if (
        incomingTypingTimeoutRef.current !==
        null
      ) {
        window.clearTimeout(
          incomingTypingTimeoutRef.current
        );

        incomingTypingTimeoutRef.current =
          null;
      }
    }, []);

  const clearIncomingTypingState =
    useCallback(() => {
      clearIncomingTypingTimer();
      setTypingConversationId(null);
    }, [clearIncomingTypingTimer]);

  const loadConversations =
    useCallback(
      async (silent = false) => {
        if (!silent) {
          setLoadingConversations(true);
        }

        try {
          const data =
            await communicationService
              .getConversations({
                page: 0,
                size: 50,
              });

          setConversations(
            data.conversations
          );

          setSelectedConversationId(
            (currentId) => {
              if (
                currentId &&
                data.conversations.some(
                  (conversation) =>
                    normalizeId(
                      conversation.id
                    ) ===
                    normalizeId(
                      currentId
                    )
                )
              ) {
                return currentId;
              }

              return (
                data.conversations[0]
                  ?.id ?? null
              );
            }
          );

          setError(null);
        } catch (
          caughtError: unknown
        ) {
          if (!silent) {
            setError(
              getApiErrorMessage(
                caughtError,
                "Unable to load conversations."
              )
            );
          }
        } finally {
          if (!silent) {
            setLoadingConversations(
              false
            );
          }
        }
      },
      []
    );

  const markAsRead = useCallback(
    async (
      conversationId: string
    ) => {
      try {
        await communicationService
          .markConversationAsRead(
            conversationId
          );

        setConversations(
          (current) =>
            current.map(
              (conversation) =>
                normalizeId(
                  conversation.id
                ) ===
                normalizeId(
                  conversationId
                )
                  ? {
                      ...conversation,
                      unreadCount: 0,
                    }
                  : conversation
            )
        );
      } catch {
        // Read status should not block chat.
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
          await communicationService
            .getMessages(
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

        await markAsRead(
          conversationId
        );

        setError(null);
      } catch (
        caughtError: unknown
      ) {
        if (!silent) {
          setMessages([]);

          setError(
            getApiErrorMessage(
              caughtError,
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

  const loadUserPresence =
    useCallback(
      async (userId: string) => {
        const normalizedUserId =
          normalizeId(userId);

        if (!normalizedUserId) {
          return;
        }

        try {
          const presence =
            await presenceService
              .getPresence(userId);

          setPresenceByUserId(
            (current) => ({
              ...current,
              [normalizedUserId]:
                presence,
            })
          );
        } catch {
          // Presence failure must not block chat.
        }
      },
      []
    );

  const selectConversation =
    useCallback(
      (conversationId: string) => {
        clearIncomingTypingState();

        setSelectedConversationId(
          conversationId
        );
      },
      [clearIncomingTypingState]
    );

  const clearSelection =
    useCallback(() => {
      clearIncomingTypingState();

      setSelectedConversationId(null);
      setMessages([]);
    }, [clearIncomingTypingState]);

  const updateConversationPreview =
    useCallback(
      (message: ChatMessage) => {
        setConversations(
          (current) => {
            const updated =
              current.map(
                (conversation) => {
                  if (
                    normalizeId(
                      conversation.id
                    ) !==
                    normalizeId(
                      message.conversationId
                    )
                  ) {
                    return conversation;
                  }

                  const isSelected =
                    normalizeId(
                      selectedConversationIdRef
                        .current
                    ) ===
                    normalizeId(
                      message.conversationId
                    );

                  const isIncoming =
                    normalizeId(
                      conversation.otherUser
                        .userId
                    ) ===
                    normalizeId(
                      message.senderId
                    );

                  const preview =
                    message.messageType ===
                    "IMAGE"
                      ? message.content?.trim() ||
                        "📷 Image"
                      : message.content;

                  return {
                    ...conversation,

                    lastMessage: preview,

                    lastMessageSenderId:
                      message.senderId,

                    lastMessageAt:
                      message.createdAt,

                    updatedAt:
                      message.createdAt,

                    unreadCount:
                      isIncoming &&
                      !isSelected
                        ? conversation
                            .unreadCount +
                          1
                        : isSelected
                          ? 0
                          : conversation
                              .unreadCount,
                  };
                }
              );

            return [...updated].sort(
              (first, second) => {
                const firstTime =
                  first.lastMessageAt
                    ? new Date(
                        first.lastMessageAt
                      ).getTime()
                    : 0;

                const secondTime =
                  second.lastMessageAt
                    ? new Date(
                        second.lastMessageAt
                      ).getTime()
                    : 0;

                return (
                  secondTime -
                  firstTime
                );
              }
            );
          }
        );
      },
      []
    );

  const handleWebSocketMessage =
    useCallback(
      (message: ChatMessage) => {
        const selectedId =
          selectedConversationIdRef
            .current;

        if (
          normalizeId(selectedId) ===
          normalizeId(
            message.conversationId
          )
        ) {
          setMessages((current) =>
            mergeMessages(current, [
              message,
            ])
          );

          void markAsRead(
            message.conversationId
          );
        }

        setTypingConversationId(
          (currentId) =>
            normalizeId(currentId) ===
            normalizeId(
              message.conversationId
            )
              ? null
              : currentId
        );

        updateConversationPreview(
          message
        );

        void loadConversations(true);

        setSending(false);
        setUploadingImage(false);
        setError(null);
      },
      [
        loadConversations,
        markAsRead,
        updateConversationPreview,
      ]
    );

  const handleTypingEvent =
    useCallback(
      (event: ChatTypingEvent) => {
        const eventConversationId =
          normalizeId(
            event.conversationId
          );

        const selectedId =
          normalizeId(
            selectedConversationIdRef
              .current
          );

        if (
          !event.typing ||
          !eventConversationId ||
          eventConversationId !==
            selectedId
        ) {
          return;
        }

        clearIncomingTypingTimer();

        setTypingConversationId(
          eventConversationId
        );

        incomingTypingTimeoutRef.current =
          window.setTimeout(() => {
            setTypingConversationId(
              null
            );

            incomingTypingTimeoutRef.current =
              null;
          }, INCOMING_TYPING_TIMEOUT);
      },
      [clearIncomingTypingTimer]
    );

  const handlePresenceEvent =
    useCallback(
      (presence: PresenceStatus) => {
        const userId =
          normalizeId(
            presence.userId
          );

        if (!userId) {
          return;
        }

        setPresenceByUserId(
          (current) => ({
            ...current,
            [userId]: presence,
          })
        );
      },
      []
    );

  const sendTypingStatus =
    useCallback(
      (typing: boolean) => {
        const conversation =
          selectedConversation;

        if (
          !typing ||
          !conversation ||
          !chatWebSocketService
            .isConnected()
        ) {
          return;
        }

        chatWebSocketService.sendTyping({
          conversationId:
            conversation.id,

          receiverUserId:
            conversation.otherUser
              .userId,

          typing: true,
        });
      },
      [selectedConversation]
    );

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

      const request: SendMessageRequest = {
        receiverUserId:
          selectedConversation
            .otherUser.userId,

        content: trimmedContent,
        mediaUrl: null,
        messageType: "TEXT",
      };

      try {
        const sentThroughWebSocket =
          chatWebSocketService
            .sendMessage(request);

        if (sentThroughWebSocket) {
          return;
        }

        const sentMessage =
          await communicationService
            .sendMessage(request);

        setMessages((current) =>
          mergeMessages(current, [
            sentMessage,
          ])
        );

        updateConversationPreview(
          sentMessage
        );

        await loadConversations(true);

        setSending(false);
      } catch (
        caughtError: unknown
      ) {
        setSending(false);

        setError(
          getApiErrorMessage(
            caughtError,
            "Unable to send the message."
          )
        );

        throw caughtError;
      }
    },
    [
      selectedConversation,
      loadConversations,
      updateConversationPreview,
    ]
  );

  const sendImage = useCallback(
  async (
    file: File,
    caption: string
  ) => {
    if (!selectedConversation) {
      return;
    }

    setUploadingImage(true);
    setError(null);

    try {
      const uploadedImage =
        await communicationService
          .uploadChatImage(file);

      const request: SendMessageRequest = {
        receiverUserId:
          selectedConversation
            .otherUser.userId,

        content:
          caption.trim() || null,

        mediaUrl:
          uploadedImage.mediaUrl,

        messageType: "IMAGE",
      };

      /*
       * Image messages are persisted through REST.
       * The backend controller broadcasts the saved
       * database response to both users.
       */
      const sentMessage =
        await communicationService
          .sendMessage(request);

      setMessages((current) =>
        mergeMessages(current, [
          sentMessage,
        ])
      );

      updateConversationPreview(
        sentMessage
      );

      await loadConversations(true);
    } catch (caughtError: unknown) {
      setError(
        getApiErrorMessage(
          caughtError,
          "Unable to upload and send the image."
        )
      );

      throw caughtError;
    } finally {
      setUploadingImage(false);
    }
  },
  [
    selectedConversation,
    loadConversations,
    updateConversationPreview,
  ]
);

  const refresh =
    useCallback(async () => {
      await loadConversations(true);

      const conversationId =
        selectedConversationIdRef
          .current;

      if (conversationId) {
        await loadMessages(
          conversationId,
          true
        );
      }

      const otherUserId =
        selectedConversation
          ?.otherUser.userId;

      if (otherUserId) {
        await loadUserPresence(
          otherUserId
        );
      }
    }, [
      loadConversations,
      loadMessages,
      loadUserPresence,
      selectedConversation,
    ]);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    clearIncomingTypingState();

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
    clearIncomingTypingState,
  ]);

  useEffect(() => {
    const userId =
      selectedConversation
        ?.otherUser.userId;

    if (!userId) {
      return;
    }

    void loadUserPresence(userId);
  }, [
    selectedConversation,
    loadUserPresence,
  ]);

  useEffect(() => {
    const userId =
      selectedConversation
        ?.otherUser.userId;

    if (!userId) {
      return;
    }

    const refreshPresence = () => {
      void loadUserPresence(userId);
    };

    const handleVisibilityChange =
      () => {
        if (
          document.visibilityState ===
          "visible"
        ) {
          refreshPresence();
        }
      };

    const intervalId =
      window.setInterval(
        refreshPresence,
        PRESENCE_REFRESH_INTERVAL
      );

    window.addEventListener(
      "focus",
      refreshPresence
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      window.clearInterval(
        intervalId
      );

      window.removeEventListener(
        "focus",
        refreshPresence
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [
    selectedConversation,
    loadUserPresence,
  ]);

  useEffect(() => {
    chatWebSocketService.connect({
      onMessage:
        handleWebSocketMessage,

      onTyping:
        handleTypingEvent,

      onPresence:
        handlePresenceEvent,

      onStatusChange:
        setWebSocketStatus,

      onError: (message) => {
        setSending(false);
        setUploadingImage(false);

        console.warn(
          "[Chat WebSocket]",
          message
        );
      },
    });

    return () => {
      chatWebSocketService.disconnect();
    };
  }, [
    handleWebSocketMessage,
    handleTypingEvent,
    handlePresenceEvent,
  ]);

  useEffect(() => {
    if (
      webSocketStatus === "connected"
    ) {
      return;
    }

    const interval =
      window.setInterval(() => {
        void refresh();
      }, FALLBACK_POLLING_INTERVAL);

    return () => {
      window.clearInterval(interval);
    };
  }, [
    refresh,
    webSocketStatus,
  ]);

  useEffect(() => {
    if (!sending) {
      return;
    }

    const timeout =
      window.setTimeout(() => {
        setSending(false);
      }, SEND_TIMEOUT);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [sending]);

  useEffect(() => {
    return () => {
      clearIncomingTypingTimer();
    };
  }, [clearIncomingTypingTimer]);

  const isOtherUserTyping =
    Boolean(
      typingConversationId &&
      selectedConversationId &&
      normalizeId(
        typingConversationId
      ) ===
        normalizeId(
          selectedConversationId
        )
    );

  return {
    conversations,
    selectedConversation,
    selectedConversationId,
    selectedUserPresence,
    messages,

    loadingConversations,
    loadingMessages,
    sending,
    uploadingImage,
    error,

    webSocketStatus,

    isRealtimeConnected:
      webSocketStatus ===
      "connected",

    isOtherUserTyping,

    selectConversation,
    clearSelection,
    sendMessage,
    sendImage,
    sendTypingStatus,
    refresh,
  };
}