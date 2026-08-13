import api from "@/lib/api";

import type {
  AdminReportDetail,
  AdminReportPage,
  ApiResponse,
  ReportReason,
  ReportStatus,
} from "../types/adminReport";

interface GetAdminReportsParams {
  page?: number;
  size?: number;
  search?: string;
  status?: ReportStatus | "";
  reason?: ReportReason | "";
}

export async function getAdminReports({
  page = 0,
  size = 20,
  search = "",
  status = "",
  reason = "",
}: GetAdminReportsParams = {}): Promise<AdminReportPage> {
  const response = await api.get<
    ApiResponse<AdminReportPage>
  >("/admin/reports", {
    params: {
      page,
      size,
      ...(search
        ? { search }
        : {}),
      ...(status
        ? { status }
        : {}),
      ...(reason
        ? { reason }
        : {}),
    },
  });

  return response.data.data;
}

export async function getAdminReport(
  reportId: string
): Promise<AdminReportDetail> {
  const response = await api.get<
    ApiResponse<AdminReportDetail>
  >(`/admin/reports/${reportId}`);

  return response.data.data;
}

export async function updateAdminReportStatus(
  reportId: string,
  status: ReportStatus
): Promise<AdminReportDetail> {
  const response = await api.patch<
    ApiResponse<AdminReportDetail>
  >(
    `/admin/reports/${reportId}/status`,
    {
      status,
    }
  );

  return response.data.data;
}