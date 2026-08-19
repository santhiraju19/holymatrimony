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

import {
  getApiErrorMessage,
} from "@/lib/api";

const FALLBACK_POLLING_INTERVAL =
  5000;

const PRESENCE_REFRESH_INTERVAL =
  10000;

const SEND_TIMEOUT =
  10000;

const INCOMING_TYPING_TIMEOUT =
  3000;

function normalizeId(
  value:
    | string
    | null
    | undefined
): string {
  return String(
    value ?? ""
  )
    .trim()
    .toLowerCase();
}

export default function useChat() {
  /*
   * ============================================================
   * STATE
   * ============================================================
   */

  const [
    conversations,
    setConversations,
  ] =
    useState<
      Conversation[]
    >([]);

  const [
    selectedConversationId,
    setSelectedConversationId,
  ] =
    useState<
      string | null
    >(null);

  const [
    messages,
    setMessages,
  ] =
    useState<
      ChatMessage[]
    >([]);

  const [
    replyingTo,
    setReplyingTo,
  ] =
    useState<
      ChatMessage | null
    >(null);

  const [
    loadingConversations,
    setLoadingConversations,
  ] =
    useState(true);

  const [
    loadingMessages,
    setLoadingMessages,
  ] =
    useState(false);

  const [
    sending,
    setSending,
  ] =
    useState(false);

  const [
    uploadingImage,
    setUploadingImage,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  const [
    webSocketStatus,
    setWebSocketStatus,
  ] =
    useState<
      WebSocketConnectionStatus
    >(
      "disconnected"
    );

  const [
    typingConversationId,
    setTypingConversationId,
  ] =
    useState<
      string | null
    >(null);

  const [
    presenceByUserId,
    setPresenceByUserId,
  ] =
    useState<
      Record<
        string,
        PresenceStatus
      >
    >({});

  /*
   * ============================================================
   * REFS
   * ============================================================
   */

  const selectedConversationIdRef =
    useRef<
      string | null
    >(null);

  const conversationsRef =
    useRef<
      Conversation[]
    >([]);

  const incomingTypingTimeoutRef =
    useRef<
      number | null
    >(null);

  /*
   * Keep references synchronized without forcing
   * WebSocket handlers to be recreated every time
   * conversation state changes.
   */

  useEffect(() => {
    selectedConversationIdRef.current =
      selectedConversationId;
  }, [
    selectedConversationId,
  ]);

  useEffect(() => {
    conversationsRef.current =
      conversations;
  }, [
    conversations,
  ]);

  /*
   * ============================================================
   * SELECTED CONVERSATION
   * ============================================================
   */

  const selectedConversation =
    useMemo(() => {
      if (
        !selectedConversationId
      ) {
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

  /*
   * ============================================================
   * SELECTED USER PRESENCE
   * ============================================================
   */

  const selectedUserPresence =
    useMemo(() => {
      if (
        !selectedConversation
      ) {
        return null;
      }

      const userId =
        normalizeId(
          selectedConversation
            .otherUser
            .userId
        );

      return (
        presenceByUserId[
          userId
        ] ?? null
      );
    }, [
      presenceByUserId,
      selectedConversation,
    ]);

  /*
   * ============================================================
   * TYPING HELPERS
   * ============================================================
   */

  const clearIncomingTypingTimer =
    useCallback(() => {
      if (
        incomingTypingTimeoutRef
          .current !== null
      ) {
        window.clearTimeout(
          incomingTypingTimeoutRef
            .current
        );

        incomingTypingTimeoutRef
          .current = null;
      }
    }, []);

  const clearIncomingTypingState =
    useCallback(() => {
      clearIncomingTypingTimer();

      setTypingConversationId(
        null
      );
    }, [
      clearIncomingTypingTimer,
    ]);

  /*
   * ============================================================
   * LOAD CONVERSATIONS
   * ============================================================
   */

  const loadConversations =
    useCallback(
      async (
        silent = false
      ) => {
        if (!silent) {
          setLoadingConversations(
            true
          );
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

          /*
           * Update ref immediately as well.
           *
           * This avoids waiting for the next React
           * render before WebSocket delivery checks
           * know about the conversations.
           */
          conversationsRef.current =
            data.conversations;

          setSelectedConversationId(
            (
              currentId
            ) => {
              if (
                currentId &&
                data.conversations
                  .some(
                    (
                      conversation
                    ) =>
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
                data.conversations[
                  0
                ]?.id ??
                null
              );
            }
          );

          setError(null);

        } catch (
          caughtError:
            unknown
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

  /*
   * ============================================================
   * MARK CONVERSATION AS READ
   * ============================================================
   */

  const markAsRead =
    useCallback(
      async (
        conversationId:
          string
      ) => {
        try {
          await communicationService
            .markConversationAsRead(
              conversationId
            );

          setConversations(
            (
              current
            ) =>
              current.map(
                (
                  conversation
                ) =>
                  normalizeId(
                    conversation.id
                  ) ===
                  normalizeId(
                    conversationId
                  )
                    ? {
                        ...conversation,

                        unreadCount:
                          0,
                      }
                    : conversation
              )
          );

          /*
           * Keep the ref synchronized because
           * WebSocket handlers read from it.
           */
          conversationsRef.current =
            conversationsRef.current
              .map(
                (
                  conversation
                ) =>
                  normalizeId(
                    conversation.id
                  ) ===
                  normalizeId(
                    conversationId
                  )
                    ? {
                        ...conversation,

                        unreadCount:
                          0,
                      }
                    : conversation
              );

        } catch {
          /*
           * Read-status failure must never block
           * normal chat operation.
           */
        }
      },
      []
    );

  /*
   * ============================================================
   * LOAD MESSAGES
   * ============================================================
   */

  const loadMessages =
    useCallback(
      async (
        conversationId:
          string,

        silent = false
      ) => {
        if (!silent) {
          setLoadingMessages(
            true
          );
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

          setMessages(
            (
              current
            ) =>
              silent
                ? mergeMessages(
                    current,
                    orderedMessages
                  )
                : orderedMessages
          );

          /*
           * Loading an open conversation means
           * the user has viewed the messages.
           */
          await markAsRead(
            conversationId
          );

          setError(null);

        } catch (
          caughtError:
            unknown
        ) {
          if (!silent) {
            setMessages(
              []
            );

            setError(
              getApiErrorMessage(
                caughtError,
                "Unable to load messages."
              )
            );
          }

        } finally {
          if (!silent) {
            setLoadingMessages(
              false
            );
          }
        }
      },
      [
        markAsRead,
      ]
    );

  /*
   * ============================================================
   * LOAD PRESENCE
   * ============================================================
   */

  const loadUserPresence =
    useCallback(
      async (
        userId: string
      ) => {
        const normalizedUserId =
          normalizeId(
            userId
          );

        if (
          !normalizedUserId
        ) {
          return;
        }

        try {
          const presence =
            await presenceService
              .getPresence(
                userId
              );

          setPresenceByUserId(
            (
              current
            ) => ({
              ...current,

              [
                normalizedUserId
              ]:
                presence,
            })
          );

        } catch {
          /*
           * Presence errors must not
           * prevent chat from working.
           */
        }
      },
      []
    );

  /*
   * ============================================================
   * REPLY TO MESSAGE
   * ============================================================
   */

  const startReply =
    useCallback(
      (
        message:
          ChatMessage
      ) => {
        if (
          message.deletedForEveryone
        ) {
          return;
        }

        setReplyingTo(
          message
        );
      },
      []
    );

  const cancelReply =
    useCallback(() => {
      setReplyingTo(
        null
      );
    }, []);

  /*
   * ============================================================
   * SELECT CONVERSATION
   * ============================================================
   */

  const selectConversation =
    useCallback(
      (
        conversationId:
          string
      ) => {
        clearIncomingTypingState();

        setReplyingTo(
          null
        );

        setSelectedConversationId(
          conversationId
        );
      },
      [
        clearIncomingTypingState,
      ]
    );

  /*
   * ============================================================
   * CLEAR SELECTION
   * ============================================================
   */

  const clearSelection =
    useCallback(() => {
      clearIncomingTypingState();

      setReplyingTo(
        null
      );

      setSelectedConversationId(
        null
      );

      setMessages(
        []
      );
    }, [
      clearIncomingTypingState,
    ]);

  /*
   * ============================================================
   * UPDATE CONVERSATION PREVIEW
   * ============================================================
   */

  const updateConversationPreview =
    useCallback(
      (
        message:
          ChatMessage
      ) => {
        setConversations(
          (
            current
          ) => {
            const updated =
              current.map(
                (
                  conversation
                ) => {
                  if (
                    normalizeId(
                      conversation.id
                    ) !==
                    normalizeId(
                      message
                        .conversationId
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
                      message
                        .conversationId
                    );

                  const isIncoming =
                    normalizeId(
                      conversation
                        .otherUser
                        .userId
                    ) ===
                    normalizeId(
                      message.senderId
                    );

                  const preview =
                    message
                      .deletedForEveryone
                      ? "This message was deleted"

                      : message
                            .messageType ===
                          "IMAGE"
                        ? message
                            .content
                            ?.trim() ||
                          "📷 Image"

                        : message
                            .content;

                  return {
                    ...conversation,

                    lastMessage:
                      preview,

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

            const sorted =
              [
                ...updated,
              ].sort(
                (
                  first,
                  second
                ) => {
                  const firstTime =
                    first
                      .lastMessageAt
                      ? new Date(
                          first.lastMessageAt
                        ).getTime()
                      : 0;

                  const secondTime =
                    second
                      .lastMessageAt
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

            conversationsRef.current =
              sorted;

            return sorted;
          }
        );
      },
      []
    );

  /*
   * ============================================================
   * WEBSOCKET MESSAGE
   * ============================================================
   *
   * The same queue carries:
   *
   * - newly sent messages
   * - SENT → DELIVERED updates
   * - future READ updates
   * - edited messages
   * - deleted messages
   *
   * We therefore merge by message ID.
   */

  const handleWebSocketMessage =
    useCallback(
      (
        message:
          ChatMessage
      ) => {
        const selectedId =
          selectedConversationIdRef
            .current;

        const conversation =
          conversationsRef.current
            .find(
              (
                currentConversation
              ) =>
                normalizeId(
                  currentConversation
                    .id
                ) ===
                normalizeId(
                  message
                    .conversationId
                )
            );

        /*
         * A message sent by conversation.otherUser
         * is an incoming message.
         *
         * This prevents the sender from acknowledging
         * delivery of their own WebSocket echo.
         */
        const isIncomingMessage =
          Boolean(
            conversation &&
            normalizeId(
              conversation
                .otherUser
                .userId
            ) ===
              normalizeId(
                message
                  .senderId
              )
          );

        /*
         * ========================================================
         * SENT → DELIVERED
         * ========================================================
         *
         * Receiving the persisted message over the
         * authenticated WebSocket proves that it reached
         * the receiver's connected client.
         */
        if (
          isIncomingMessage &&
          String(
            message.status
          )
            .trim()
            .toUpperCase() ===
            "SENT"
        ) {
          chatWebSocketService
            .sendDelivered({
              messageId:
                message.id,
            });
        }

        /*
         * Update the currently open conversation.
         *
         * mergeMessages() replaces the same message ID,
         * which supports SENT → DELIVERED, edit and delete.
         */
        if (
          normalizeId(
            selectedId
          ) ===
          normalizeId(
            message
              .conversationId
          )
        ) {
          setMessages(
            (
              current
            ) =>
              mergeMessages(
                current,
                [
                  message,
                ]
              )
          );

          /*
           * Only incoming messages should trigger a
           * read operation.
           *
           * Without this condition the sender's own
           * WebSocket echo could unnecessarily call
           * the read endpoint.
           */
        
         if (
  isIncomingMessage &&
  String(message.status)
    .trim()
    .toUpperCase() !== "READ"
) {
  void markAsRead(
    message.conversationId
  );
}
        }

        setReplyingTo(
          (
            currentReply
          ) => {
            if (
              !currentReply ||
              normalizeId(
                currentReply.id
              ) !==
                normalizeId(
                  message.id
                )
            ) {
              return currentReply;
            }

            if (
              message.deletedForEveryone
            ) {
              return null;
            }

            return message;
          }
        );

        /*
         * Any actual message arrival ends
         * the remote typing state.
         */
        if (
          isIncomingMessage
        ) {
          setTypingConversationId(
            (
              currentId
            ) =>
              normalizeId(
                currentId
              ) ===
              normalizeId(
                message
                  .conversationId
              )
                ? null
                : currentId
          );
        }

        /*
         * Edit/delete/delivery/read events are updates
         * to an existing message and must NOT increment
         * unread counts or reorder the conversation
         * as though a new message was sent.
         */
        const normalizedStatus =
          String(
            message.status ??
              ""
          )
            .trim()
            .toUpperCase();

        const isMessageMutation =
          Boolean(
            message.editedAt ||
            message.deletedAt ||
            message
              .deletedForEveryone
          );

        const isReceiptUpdate =
          normalizedStatus ===
            "DELIVERED" ||
          normalizedStatus ===
            "READ";

        if (
          !isMessageMutation &&
          !isReceiptUpdate
        ) {
          updateConversationPreview(
            message
          );
        }

        /*
         * Backend is the durable source of truth
         * for conversation preview/unread state.
         */
        void loadConversations(
          true
        );

        setSending(
          false
        );

        setUploadingImage(
          false
        );

        setError(
          null
        );
      },
      [
        loadConversations,
        markAsRead,
        updateConversationPreview,
      ]
    );

  /*
   * ============================================================
   * TYPING EVENT
   * ============================================================
   */

  const handleTypingEvent =
    useCallback(
      (
        event:
          ChatTypingEvent
      ) => {
        const eventConversationId =
          normalizeId(
            event
              .conversationId
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

        incomingTypingTimeoutRef
          .current =
          window.setTimeout(
            () => {
              setTypingConversationId(
                null
              );

              incomingTypingTimeoutRef
                .current =
                null;
            },
            INCOMING_TYPING_TIMEOUT
          );
      },
      [
        clearIncomingTypingTimer,
      ]
    );

  /*
   * ============================================================
   * PRESENCE EVENT
   * ============================================================
   */

  const handlePresenceEvent =
    useCallback(
      (
        presence:
          PresenceStatus
      ) => {
        const userId =
          normalizeId(
            presence.userId
          );

        if (!userId) {
          return;
        }

        setPresenceByUserId(
          (
            current
          ) => ({
            ...current,

            [
              userId
            ]:
              presence,
          })
        );
      },
      []
    );

  /*
   * ============================================================
   * SEND TYPING STATUS
   * ============================================================
   */

  const sendTypingStatus =
    useCallback(
      (
        typing:
          boolean
      ) => {
        const conversation =
          selectedConversation;

        if (
          !conversation ||
          !chatWebSocketService
            .isConnected()
        ) {
          return;
        }

        chatWebSocketService
          .sendTyping({
            conversationId:
              conversation.id,

            receiverUserId:
              conversation
                .otherUser
                .userId,

            typing,
          });
      },
      [
        selectedConversation,
      ]
    );

  /*
   * ============================================================
   * SEND TEXT MESSAGE
   * ============================================================
   */

  const sendMessage =
    useCallback(
      async (
        content:
          string
      ) => {
        const trimmedContent =
          content.trim();

        if (
          !trimmedContent ||
          !selectedConversation
        ) {
          return;
        }

        setSending(
          true
        );

        setError(
          null
        );

        const request:
          SendMessageRequest =
          {
            receiverUserId:
              selectedConversation
                .otherUser
                .userId,

            content:
              trimmedContent,

            mediaUrl:
              null,

            messageType:
              "TEXT",

            replyToMessageId:
              replyingTo?.id ??
              null,
          };

        try {
          const sentThroughWebSocket =
            chatWebSocketService
              .sendMessage(
                request
              );

          if (
            sentThroughWebSocket
          ) {
            setReplyingTo(
              null
            );

            return;
          }

          /*
           * REST fallback when WebSocket is unavailable.
           */
          const sentMessage =
            await communicationService
              .sendMessage(
                request
              );

          setMessages(
            (
              current
            ) =>
              mergeMessages(
                current,
                [
                  sentMessage,
                ]
              )
          );

          updateConversationPreview(
            sentMessage
          );

          setReplyingTo(
            null
          );

          await loadConversations(
            true
          );

          setSending(
            false
          );

        } catch (
          caughtError:
            unknown
        ) {
          setSending(
            false
          );

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
        replyingTo,
        loadConversations,
        updateConversationPreview,
      ]
    );

  /*
   * ============================================================
   * SEND IMAGE
   * ============================================================
   */

  const sendImage =
    useCallback(
      async (
        file:
          File,

        caption:
          string
      ) => {
        if (
          !selectedConversation
        ) {
          return;
        }

        setUploadingImage(
          true
        );

        setError(
          null
        );

        try {
          const uploadedImage =
            await communicationService
              .uploadChatImage(
                file
              );

          const request:
            SendMessageRequest =
            {
              receiverUserId:
                selectedConversation
                  .otherUser
                  .userId,

              content:
                caption
                  .trim() ||
                null,

              mediaUrl:
                uploadedImage
                  .mediaUrl,

              messageType:
                "IMAGE",

              replyToMessageId:
                replyingTo?.id ??
                null,
            };

          /*
           * Image messages use REST because
           * the media upload is already REST-based.
           *
           * Backend broadcasts the persisted message
           * to both participants.
           */
          const sentMessage =
            await communicationService
              .sendMessage(
                request
              );

          setMessages(
            (
              current
            ) =>
              mergeMessages(
                current,
                [
                  sentMessage,
                ]
              )
          );

          updateConversationPreview(
            sentMessage
          );

          setReplyingTo(
            null
          );

          await loadConversations(
            true
          );

        } catch (
          caughtError:
            unknown
        ) {
          setError(
            getApiErrorMessage(
              caughtError,
              "Unable to upload and send the image."
            )
          );

          throw caughtError;

        } finally {
          setUploadingImage(
            false
          );
        }
      },
      [
        selectedConversation,
        replyingTo,
        loadConversations,
        updateConversationPreview,
      ]
    );

  /*
   * ============================================================
   * EDIT MESSAGE
   * ============================================================
   */

  const editMessage =
    useCallback(
      async (
        messageId:
          string,

        content:
          string
      ) => {
        const trimmedContent =
          content.trim();

        if (
          !trimmedContent
        ) {
          throw new Error(
            "Message cannot be empty."
          );
        }

        setError(
          null
        );

        try {
          const updatedMessage =
            await communicationService
              .editMessage(
                messageId,
                trimmedContent
              );

          setMessages(
            (
              current
            ) =>
              mergeMessages(
                current,
                [
                  updatedMessage,
                ]
              )
          );

          setReplyingTo(
            (
              currentReply
            ) =>
              currentReply &&
              normalizeId(
                currentReply.id
              ) ===
                normalizeId(
                  updatedMessage.id
                )
                ? updatedMessage
                : currentReply
          );

          await loadConversations(
            true
          );

        } catch (
          caughtError:
            unknown
        ) {
          setError(
            getApiErrorMessage(
              caughtError,
              "Unable to edit the message."
            )
          );

          throw caughtError;
        }
      },
      [
        loadConversations,
      ]
    );

  /*
   * ============================================================
   * DELETE MESSAGE
   * ============================================================
   */

  const deleteMessage =
    useCallback(
      async (
        messageId:
          string
      ) => {
        setError(
          null
        );

        try {
          const deletedMessage =
            await communicationService
              .deleteMessage(
                messageId
              );

          setMessages(
            (
              current
            ) =>
              mergeMessages(
                current,
                [
                  deletedMessage,
                ]
              )
          );

          setReplyingTo(
            (
              currentReply
            ) =>
              currentReply &&
              normalizeId(
                currentReply.id
              ) ===
                normalizeId(
                  deletedMessage.id
                )
                ? null
                : currentReply
          );

          await loadConversations(
            true
          );

        } catch (
          caughtError:
            unknown
        ) {
          setError(
            getApiErrorMessage(
              caughtError,
              "Unable to delete the message."
            )
          );

          throw caughtError;
        }
      },
      [
        loadConversations,
      ]
    );


  /*
   * ============================================================
   * DELETE CONVERSATION
   * ============================================================
   */

  const deleteConversation =
    useCallback(
      async (
        conversationId:
          string
      ) => {
        if (!conversationId) {
          return;
        }

        setError(
          null
        );

        try {
          await communicationService
            .deleteConversation(
              conversationId
            );

          /*
           * Remove it immediately from
           * visible local state.
           */
          const remainingConversations =
            conversationsRef.current
              .filter(
                (
                  conversation
                ) =>
                  normalizeId(
                    conversation.id
                  ) !==
                  normalizeId(
                    conversationId
                  )
              );

          conversationsRef.current =
            remainingConversations;

          setConversations(
            remainingConversations
          );

          /*
           * If the deleted conversation
           * is currently open, clear it.
           */
          if (
            normalizeId(
              selectedConversationIdRef
                .current
            ) ===
            normalizeId(
              conversationId
            )
          ) {
            selectedConversationIdRef.current =
              null;

            setSelectedConversationId(
              null
            );

            setMessages(
              []
            );

            setReplyingTo(
              null
            );

            clearIncomingTypingState();
          }

          /*
           * Reload from backend so the
           * server remains authoritative.
           */
          await loadConversations(
            true
          );

        } catch (
          caughtError:
            unknown
        ) {
          setError(
            getApiErrorMessage(
              caughtError,
              "Unable to delete this chat."
            )
          );

          throw caughtError;
        }
      },
      [
        clearIncomingTypingState,
        loadConversations,
      ]
    );


  /*
   * ============================================================
   * REACT TO MESSAGE
   * ============================================================
   */

  const reactToMessage =
    useCallback(
      async (
        messageId:
          string,

        reaction:
          string
      ) => {
        const normalizedReaction =
          reaction.trim();

        if (
          !messageId ||
          !normalizedReaction
        ) {
          return;
        }

        setError(
          null
        );

        try {
          const updatedMessage =
            await communicationService
              .reactToMessage(
                messageId,
                normalizedReaction
              );

          setMessages(
            (
              current
            ) =>
              mergeMessages(
                current,
                [
                  updatedMessage,
                ]
              )
          );

          setReplyingTo(
            (
              currentReply
            ) =>
              currentReply &&
              normalizeId(
                currentReply.id
              ) ===
                normalizeId(
                  updatedMessage.id
                )
                ? updatedMessage
                : currentReply
          );

        } catch (
          caughtError:
            unknown
        ) {
          setError(
            getApiErrorMessage(
              caughtError,
              "Unable to react to the message."
            )
          );

          throw caughtError;
        }
      },
      []
    );

  /*
   * ============================================================
   * REMOVE MESSAGE REACTION
   * ============================================================
   */

  const removeMessageReaction =
    useCallback(
      async (
        messageId:
          string
      ) => {
        if (
          !messageId
        ) {
          return;
        }

        setError(
          null
        );

        try {
          const updatedMessage =
            await communicationService
              .removeMessageReaction(
                messageId
              );

          setMessages(
            (
              current
            ) =>
              mergeMessages(
                current,
                [
                  updatedMessage,
                ]
              )
          );

          setReplyingTo(
            (
              currentReply
            ) =>
              currentReply &&
              normalizeId(
                currentReply.id
              ) ===
                normalizeId(
                  updatedMessage.id
                )
                ? updatedMessage
                : currentReply
          );

        } catch (
          caughtError:
            unknown
        ) {
          setError(
            getApiErrorMessage(
              caughtError,
              "Unable to remove the message reaction."
            )
          );

          throw caughtError;
        }
      },
      []
    );

  /*
   * ============================================================
   * REFRESH
   * ============================================================
   */

  const refresh =
    useCallback(
      async () => {
        await loadConversations(
          true
        );

        const conversationId =
          selectedConversationIdRef
            .current;

        if (
          conversationId
        ) {
          await loadMessages(
            conversationId,
            true
          );
        }

        const otherUserId =
          selectedConversation
            ?.otherUser
            .userId;

        if (
          otherUserId
        ) {
          await loadUserPresence(
            otherUserId
          );
        }
      },
      [
        loadConversations,
        loadMessages,
        loadUserPresence,
        selectedConversation,
      ]
    );

  /*
   * ============================================================
   * INITIAL CONVERSATION LOAD
   * ============================================================
   */

  useEffect(() => {
    void loadConversations();
  }, [
    loadConversations,
  ]);

  /*
   * ============================================================
   * LOAD SELECTED CONVERSATION
   * ============================================================
   */

  useEffect(() => {
    clearIncomingTypingState();

    setReplyingTo(
      null
    );

    if (
      !selectedConversationId
    ) {
      setMessages(
        []
      );

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

  /*
   * ============================================================
   * LOAD SELECTED USER PRESENCE
   * ============================================================
   */

  useEffect(() => {
    const userId =
      selectedConversation
        ?.otherUser
        .userId;

    if (!userId) {
      return;
    }

    void loadUserPresence(
      userId
    );
  }, [
    selectedConversation,
    loadUserPresence,
  ]);

  /*
   * ============================================================
   * PRESENCE REFRESH
   * ============================================================
   */

  useEffect(() => {
    const userId =
      selectedConversation
        ?.otherUser
        .userId;

    if (!userId) {
      return;
    }

    const refreshPresence =
      () => {
        void loadUserPresence(
          userId
        );
      };

    const handleVisibilityChange =
      () => {
        if (
          document
            .visibilityState ===
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

  /*
   * ============================================================
   * WEBSOCKET HANDLER REFS
   * ============================================================
   *
   * Keep the latest React callbacks available to the long-lived
   * STOMP connection without making callback identity part of
   * the connection lifecycle.
   *
   * Conversation/message state may legitimately change and cause
   * these callbacks to be recreated. That must not disconnect and
   * recreate the WebSocket.
   */

  const webSocketMessageHandlerRef =
    useRef(
      handleWebSocketMessage
    );

  const typingEventHandlerRef =
    useRef(
      handleTypingEvent
    );

  const presenceEventHandlerRef =
    useRef(
      handlePresenceEvent
    );

  useEffect(() => {
    webSocketMessageHandlerRef.current =
      handleWebSocketMessage;
  }, [
    handleWebSocketMessage,
  ]);

  useEffect(() => {
    typingEventHandlerRef.current =
      handleTypingEvent;
  }, [
    handleTypingEvent,
  ]);

  useEffect(() => {
    presenceEventHandlerRef.current =
      handlePresenceEvent;
  }, [
    handlePresenceEvent,
  ]);

  /*
   * ============================================================
   * WEBSOCKET CONNECTION
   * ============================================================
   *
   * One connection for the lifetime of useChat().
   *
   * STOMP may perform its own network reconnect when necessary,
   * but normal React renders/state changes must not tear down the
   * connection.
   */

  useEffect(() => {
    chatWebSocketService
      .connect({
        onMessage: (
          message
        ) => {
          webSocketMessageHandlerRef
            .current(
              message
            );
        },

        onTyping: (
          event
        ) => {
          typingEventHandlerRef
            .current(
              event
            );
        },

        onPresence: (
          presence
        ) => {
          presenceEventHandlerRef
            .current(
              presence
            );
        },

        onStatusChange:
          setWebSocketStatus,

        onError: (
          message
        ) => {
          setSending(
            false
          );

          setUploadingImage(
            false
          );

          /*
           * Surface backend WebSocket errors
           * to the chat UI.
           *
           * This is especially important for
           * membership restrictions because
           * WebSocket sends do not reject the
           * sendMessage() Promise directly.
           */
          setError(
            message ||
              "Unable to send the message."
          );

          console.warn(
            "[Chat WebSocket]",
            message
          );
        },
      });

    return () => {
      chatWebSocketService
        .disconnect();
    };
  }, []);

  /*
   * ============================================================
   * REST FALLBACK POLLING
   * ============================================================
   */

  useEffect(() => {
    if (
      webSocketStatus ===
      "connected"
    ) {
      return;
    }

    const interval =
      window.setInterval(
        () => {
          void refresh();
        },
        FALLBACK_POLLING_INTERVAL
      );

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [
    refresh,
    webSocketStatus,
  ]);

  /*
   * ============================================================
   * SEND TIMEOUT SAFETY
   * ============================================================
   */

  useEffect(() => {
    if (!sending) {
      return;
    }

    const timeout =
      window.setTimeout(
        () => {
          setSending(
            false
          );
        },
        SEND_TIMEOUT
      );

    return () => {
      window.clearTimeout(
        timeout
      );
    };
  }, [
    sending,
  ]);

  /*
   * ============================================================
   * CLEANUP
   * ============================================================
   */

  useEffect(() => {
    return () => {
      clearIncomingTypingTimer();
    };
  }, [
    clearIncomingTypingTimer,
  ]);

  /*
   * ============================================================
   * OTHER USER TYPING
   * ============================================================
   */

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

  /*
   * ============================================================
   * PUBLIC API
   * ============================================================
   */

  return {
    conversations,

    selectedConversation,

    selectedConversationId,

    selectedUserPresence,

    messages,

    replyingTo,

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

    startReply,

    cancelReply,

    refresh,

    editMessage,

    deleteConversation,

    deleteMessage,

    reactToMessage,

    removeMessageReaction,

    
  };
}