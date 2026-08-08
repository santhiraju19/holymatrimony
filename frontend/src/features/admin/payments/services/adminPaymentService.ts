import api, {
  getApiErrorMessage,
} from "@/lib/api";

import type {
  AdminPayment,
  AdminPaymentPage,
  ApiResponse,
  PaymentStatus,
} from "../types/adminPayment";

interface GetAdminPaymentsParams {
  page?: number;

  size?: number;

  search?: string;

  status?:
    | PaymentStatus
    | "";
}

function unwrap<T>(
  response: ApiResponse<T>
): T {
  if (!response.success) {
    throw new Error(
      response.message ||
        "Admin payment request failed."
    );
  }

  return response.data;
}

export async function getAdminPayments({
  page = 0,
  size = 20,
  search = "",
  status = "",
}: GetAdminPaymentsParams = {}): Promise<AdminPaymentPage> {
  try {
    const response =
      await api.get<
        ApiResponse<AdminPaymentPage>
      >(
        "/admin/payments",
        {
          params: {
            page,
            size,

            ...(search.trim()
              ? {
                  search:
                    search.trim(),
                }
              : {}),

            ...(status
              ? {
                  status,
                }
              : {}),
          },
        }
      );

    return unwrap(
      response.data
    );
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Unable to load payments."
      )
    );
  }
}

export async function getAdminPayment(
  paymentId: string
): Promise<AdminPayment> {
  try {
    const response =
      await api.get<
        ApiResponse<AdminPayment>
      >(
        `/admin/payments/${paymentId}`
      );

    return unwrap(
      response.data
    );
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Unable to load payment."
      )
    );
  }
}