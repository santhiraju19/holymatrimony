import api from "@/lib/api";

import {
  ApiResponse,
  ChatMediaUploadResponse,
  ChatMessage,
  ConversationsPage,
  MessagesPage,
  SendMessageRequest,
} from "@/features/chat/types";


interface PaginationParams {
  page?: number;
  size?: number;
}


interface UnreadCountData {
  unreadCount?: number;
  count?: number;
}


export const communicationService = {

  /*
   * ============================================================
   * GET CONVERSATIONS
   * ============================================================
   */

  async getConversations(
    params: PaginationParams = {}
  ): Promise<ConversationsPage> {

    const response =
      await api.get<
        ApiResponse<ConversationsPage>
      >(
        "/communication/conversations",
        {
          params: {
            page:
              params.page ??
              0,

            size:
              params.size ??
              20,
          },
        }
      );

    return response.data.data;
  },


  /*
   * ============================================================
   * GET MESSAGES
   * ============================================================
   */

  async getMessages(
    conversationId: string,
    params: PaginationParams = {}
  ): Promise<MessagesPage> {

    const response =
      await api.get<
        ApiResponse<MessagesPage>
      >(
        `/communication/messages/${conversationId}`,
        {
          params: {
            page:
              params.page ??
              0,

            size:
              params.size ??
              50,
          },
        }
      );

    return response.data.data;
  },


  /*
   * ============================================================
   * SEND MESSAGE
   * ============================================================
   */

  async sendMessage(
    request: SendMessageRequest
  ): Promise<ChatMessage> {

    const response =
      await api.post<
        ApiResponse<ChatMessage>
      >(
        "/communication/messages",
        {
          receiverUserId:
            request.receiverUserId,

          content:
            request.content ??
            null,

          mediaUrl:
            request.mediaUrl ??
            null,

          messageType:
            request.messageType ??
            "TEXT",

          replyToMessageId:
            request.replyToMessageId ??
            null,
        }
      );

    return response.data.data;
  },


  /*
   * ============================================================
   * EDIT MESSAGE
   * ============================================================
   */

  async editMessage(
    messageId: string,
    content: string
  ): Promise<ChatMessage> {

    const response =
      await api.patch<
        ApiResponse<ChatMessage>
      >(
        `/communication/messages/${messageId}`,
        {
          content,
        }
      );

    return response.data.data;
  },


  /*
   * ============================================================
   * DELETE MESSAGE FOR EVERYONE
   * ============================================================
   */

  async deleteMessage(
    messageId: string
  ): Promise<ChatMessage> {

    const response =
      await api.delete<
        ApiResponse<ChatMessage>
      >(
        `/communication/messages/${messageId}`
      );

    return response.data.data;
  },


  /*
   * ============================================================
   * UPLOAD CHAT IMAGE
   * ============================================================
   */

  async uploadChatImage(
    file: File
  ): Promise<ChatMediaUploadResponse> {

    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    const response =
      await api.post<
        ApiResponse<ChatMediaUploadResponse>
      >(
        "/communication/media/images",
        formData
      );

    return response.data.data;
  },


  /*
   * ============================================================
   * MARK CONVERSATION AS READ
   * ============================================================
   */

  async markConversationAsRead(
    conversationId: string
  ): Promise<void> {

    await api.post(
      `/communication/conversations/${conversationId}/read`
    );
  },


  /*
   * ============================================================
   * TOTAL UNREAD COUNT
   * ============================================================
   */

  async getUnreadCount():
    Promise<number> {

    const response =
      await api.get<
        ApiResponse<
          UnreadCountData |
          number
        >
      >(
        "/communication/unread-count"
      );

    const data =
      response.data.data;

    if (
      typeof data ===
      "number"
    ) {
      return data;
    }

    return (
      data.unreadCount ??
      data.count ??
      0
    );
  },


  /*
   * ============================================================
   * CONVERSATION UNREAD COUNT
   * ============================================================
   */

  async getConversationUnreadCount(
    conversationId: string
  ): Promise<number> {

    const response =
      await api.get<
        ApiResponse<
          UnreadCountData |
          number
        >
      >(
        `/communication/conversations/${conversationId}/unread-count`
      );

    const data =
      response.data.data;

    if (
      typeof data ===
      "number"
    ) {
      return data;
    }

    return (
      data.unreadCount ??
      data.count ??
      0
    );
  },
};


export default communicationService;