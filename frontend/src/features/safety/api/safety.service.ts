import api from "@/lib/api";

/*
 * ============================================================
 * GENERIC API RESPONSE
 * ============================================================
 */

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/*
 * ============================================================
 * REPORT REASONS
 * ============================================================
 */

export type ReportReason =
  | "INAPPROPRIATE_MESSAGES"
  | "HARASSMENT"
  | "FAKE_PROFILE"
  | "SCAM_OR_FRAUD"
  | "OFFENSIVE_CONTENT"
  | "OTHER";

/*
 * ============================================================
 * BLOCK STATUS
 * ============================================================
 */

export interface BlockStatusResponse {
  userId: string;

  blockedByMe: boolean;

  messagingBlocked: boolean;
}

/*
 * ============================================================
 * REPORT REQUEST
 * ============================================================
 */

export interface ReportUserRequest {
  reason: ReportReason;

  details?: string;

  conversationId?: string;
}

/*
 * ============================================================
 * REPORT RESPONSE
 * ============================================================
 */

export interface UserReportResponse {
  id: string;

  reportedUserId: string;

  conversationId: string | null;

  reason: ReportReason;

  details: string | null;

  status:
    | "PENDING"
    | "UNDER_REVIEW"
    | "RESOLVED"
    | "DISMISSED";

  createdAt: string;
}

/*
 * ============================================================
 * SAFETY SERVICE
 * ============================================================
 */

const safetyService = {

  /*
   * ----------------------------------------------------------
   * GET BLOCK STATUS
   * ----------------------------------------------------------
   */

  async getBlockStatus(
    userId: string
  ): Promise<BlockStatusResponse> {

    const response =
      await api.get<
        ApiResponse<BlockStatusResponse>
      >(
        `/safety/users/${userId}/block-status`
      );

    return response.data.data;
  },


  /*
   * ----------------------------------------------------------
   * BLOCK USER
   * ----------------------------------------------------------
   */

  async blockUser(
    userId: string
  ): Promise<BlockStatusResponse> {

    const response =
      await api.put<
        ApiResponse<BlockStatusResponse>
      >(
        `/safety/users/${userId}/block`
      );

    return response.data.data;
  },


  /*
   * ----------------------------------------------------------
   * UNBLOCK USER
   * ----------------------------------------------------------
   */

  async unblockUser(
    userId: string
  ): Promise<BlockStatusResponse> {

    const response =
      await api.delete<
        ApiResponse<BlockStatusResponse>
      >(
        `/safety/users/${userId}/block`
      );

    return response.data.data;
  },


  /*
   * ----------------------------------------------------------
   * REPORT USER
   * ----------------------------------------------------------
   */

  async reportUser(
    userId: string,
    request: ReportUserRequest
  ): Promise<UserReportResponse> {

    const response =
      await api.post<
        ApiResponse<UserReportResponse>
      >(
        `/safety/users/${userId}/report`,
        request
      );

    return response.data.data;
  },
};

export default safetyService;