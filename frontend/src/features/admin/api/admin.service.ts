import api from "@/lib/api";

import type {
  AdminAnalyticsData,
  AdminAnalyticsExportType,
  AdminDashboardData,
} from "../types";

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface AnalyticsDateRange {
  from?: string;
  to?: string;
}

function buildDateParams(
  range?: AnalyticsDateRange
) {
  const params = new URLSearchParams();

  if (range?.from) {
    params.set("from", range.from);
  }

  if (range?.to) {
    params.set("to", range.to);
  }

  return params;
}

export const adminService = {
  async getDashboard():
    Promise<AdminDashboardData> {

    const response = await api.get<
      ApiEnvelope<AdminDashboardData>
    >("/admin/dashboard");

    return response.data.data;
  },

  async getAnalytics(
    range?: AnalyticsDateRange
  ): Promise<AdminAnalyticsData> {

    const params =
      buildDateParams(range);

    const query =
      params.toString();

    const response = await api.get<
      ApiEnvelope<AdminAnalyticsData>
    >(
      `/admin/analytics${
        query ? `?${query}` : ""
      }`
    );

    return response.data.data;
  },

  async downloadAnalyticsCsv(
    type: AdminAnalyticsExportType,
    range?: AnalyticsDateRange
  ): Promise<void> {

    const params =
      buildDateParams(range);

    const query =
      params.toString();

    const response =
      await api.get<Blob>(
        `/admin/analytics/export/${type}${
          query ? `?${query}` : ""
        }`,
        {
          responseType: "blob",
        }
      );

    const disposition =
      response.headers[
        "content-disposition"
      ];

    let fileName =
      `holy-matrimony-${type}.csv`;

    if (
      typeof disposition === "string"
    ) {
      const match =
        disposition.match(
          /filename="?([^"]+)"?/i
        );

      if (match?.[1]) {
        fileName = match[1];
      }
    }

    const url =
      window.URL.createObjectURL(
        response.data
      );

    const anchor =
      document.createElement("a");

    anchor.href = url;
    anchor.download = fileName;

    document.body.appendChild(
      anchor
    );

    anchor.click();
    anchor.remove();

    window.URL.revokeObjectURL(
      url
    );
  },
};
