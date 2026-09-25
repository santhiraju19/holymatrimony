"use client";

import {
  CheckCircle2,
  Headphones,
  Infinity as InfinityIcon,
  Loader2,
  Phone,
  RefreshCw,
  ShoppingBag,
  Video,
  XCircle,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import secureConnectService from "../services/secureConnect.service";
import type {
  CallMediaType,
  SecureConnectBalance,
  SecureConnectMediaBalance,
  SecureConnectTopUpPackage,
} from "../types";

/*
 * ============================================================
 * Razorpay Types
 * ============================================================
 */

interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayFailureResponse {
  error?: {
    code?: string;
    description?: string;
    source?: string;
    step?: string;
    reason?: string;
  };
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;

  handler: (
    response: RazorpaySuccessResponse
  ) => void | Promise<void>;

  theme?: {
    color?: string;
  };

  modal?: {
    confirm_close?: boolean;
    ondismiss?: () => void;
  };

  retry?: {
    enabled?: boolean;
  };
}

interface RazorpayInstance {
  open(): void;

  on(
    event: "payment.failed",
    callback: (
      response: RazorpayFailureResponse
    ) => void
  ): void;
}

interface RazorpayConstructor {
  new (
    options: RazorpayOptions
  ): RazorpayInstance;
}

/*
 * ============================================================
 * Razorpay Access
 * ============================================================
 *
 * OrderSummary.tsx already owns the application's global
 * Window.Razorpay declaration. Do not redeclare it here with
 * another file-local constructor type.
 */

function getRazorpayConstructor():
  RazorpayConstructor | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  return (
    window as unknown as {
      Razorpay?: RazorpayConstructor;
    }
  ).Razorpay;
}

/*
 * ============================================================
 * Helpers
 * ============================================================
 */

function formatMinutes(
  seconds: number
): string {
  if (
    !Number.isFinite(seconds) ||
    seconds <= 0
  ) {
    return "0 min";
  }

  const minutes =
    Math.floor(seconds / 60);

  if (minutes <= 0) {
    return "< 1 min";
  }

  return `${minutes} min`;
}

function formatMoney(
  amountInPaise: number,
  currency: string
): string {
  if (
    currency.toUpperCase() === "INR"
  ) {
    return `₹${(
      amountInPaise / 100
    ).toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  }

  return `${currency} ${(
    amountInPaise / 100
  ).toFixed(2)}`;
}

function getErrorMessage(
  error: unknown
): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const axiosError =
      error as {
        response?: {
          data?: {
            message?: string;
            error?: string;
          };
        };
      };

    return (
      axiosError.response?.data?.message ??
      axiosError.response?.data?.error ??
      "The request could not be completed."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "The request could not be completed.";
}

async function wait(
  milliseconds: number
): Promise<void> {
  await new Promise<void>(
    (resolve) => {
      window.setTimeout(
        resolve,
        milliseconds
      );
    }
  );
}

/*
 * ============================================================
 * Balance Media Card
 * ============================================================
 */

function MediaCard({
  title,
  description,
  balance,
}: {
  title: string;
  description: string;
  balance: SecureConnectMediaBalance;
}) {
  const isVideo =
    balance.mediaType === "VIDEO";

  const Icon =
    isVideo
      ? Video
      : Phone;

  if (balance.unlimited) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
              <Icon size={20} />
            </div>

            <div>
              <h3 className="font-black text-[#0B2D5C]">
                {title}
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                {description}
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-black text-emerald-700">
            <InfinityIcon size={14} />
            Unlimited
          </span>
        </div>

        <div className="mt-5 rounded-2xl border border-emerald-100 bg-white/80 p-4">
          <p className="text-sm font-black text-emerald-700">
            Unlimited Secure Connect
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            No minute balance or top-up is required while your
            Platinum membership is active.
          </p>
        </div>
      </div>
    );
  }

  if (!balance.canInitiate) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-200 text-slate-500">
            <Icon size={20} />
          </div>

          <div>
            <h3 className="font-black text-[#0B2D5C]">
              {title}
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-black text-slate-700">
            {isVideo
              ? "Receive only"
              : "Calling unavailable"}
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {isVideo
              ? "Your current plan cannot initiate secure video calls. You can still receive video calls from eligible members."
              : "An eligible active membership is required to initiate Secure Connect calls."}
          </p>

          {balance.topUpRemainingSeconds > 0 && (
            <p className="mt-3 text-xs font-bold text-amber-700">
              Stored top-up balance:{" "}
              {formatMinutes(
                balance.topUpRemainingSeconds
              )}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#0B2D5C]">
          <Icon size={20} />
        </div>

        <div>
          <h3 className="font-black text-[#0B2D5C]">
            {title}
          </h3>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
          <span className="text-xs font-semibold text-slate-500">
            Plan minutes
          </span>

          <span className="text-sm font-black text-[#0B2D5C]">
            {formatMinutes(
              balance.planRemainingSeconds
            )}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
          <span className="text-xs font-semibold text-slate-500">
            Purchased top-up
          </span>

          <span className="text-sm font-black text-[#0B2D5C]">
            {formatMinutes(
              balance.topUpRemainingSeconds
            )}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
          <span className="text-xs font-black text-[#0B2D5C]">
            Available
          </span>

          <span className="text-base font-black text-[#0B2D5C]">
            {formatMinutes(
              balance.totalRemainingSeconds
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

/*
 * ============================================================
 * Top-Up Package Card
 * ============================================================
 */

function TopUpPackageCard({
  packageOption,
  purchasing,
  onPurchase,
}: {
  packageOption: SecureConnectTopUpPackage;
  purchasing: boolean;
  onPurchase: (
    packageOption: SecureConnectTopUpPackage
  ) => void;
}) {
  const isVideo =
    packageOption.mediaType === "VIDEO";

  const Icon =
    isVideo
      ? Video
      : Phone;

  return (
    <button
      type="button"
      disabled={purchasing}
      onClick={() => {
        onPurchase(packageOption);
      }}
      className="group flex min-h-32 flex-col rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md disabled:pointer-events-none disabled:opacity-60"
    >
      <div className="flex w-full items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0B2D5C]">
          <Icon size={18} />
        </div>

        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-black text-[#9A7412]">
          {formatMoney(
            packageOption.amount,
            packageOption.currency
          )}
        </span>
      </div>

      <div className="mt-4">
        <p className="text-base font-black text-[#0B2D5C]">
          {packageOption.minutes} minutes
        </p>

        <p className="mt-1 text-xs font-semibold text-slate-500">
          Secure {isVideo ? "Video" : "Audio"} Top-Up
        </p>
      </div>
    </button>
  );
}

/*
 * ============================================================
 * Main Component
 * ============================================================
 */

export default function SecureConnectBalanceCard() {
  const [balance, setBalance] =
    useState<SecureConnectBalance | null>(
      null
    );

  const [packages, setPackages] =
    useState<SecureConnectTopUpPackage[]>(
      []
    );

  const [loading, setLoading] =
    useState(true);

  const [packagesLoading, setPackagesLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [purchaseError, setPurchaseError] =
    useState<string | null>(null);

  const [purchaseSuccess, setPurchaseSuccess] =
    useState<string | null>(null);

  const [
    purchasingPackageCode,
    setPurchasingPackageCode,
  ] = useState<string | null>(null);

  const loadBalance =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const data =
          await secureConnectService.getBalance();

        setBalance(data);
      } catch (loadError) {
        console.error(
          "Failed to load Secure Connect balance:",
          loadError
        );

        setError(
          getErrorMessage(loadError)
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadBalance();
  }, [loadBalance]);

  const canPurchaseTopUps =
    balance?.activeMembership === true &&
    (
      balance.plan === "SILVER" ||
      balance.plan === "GOLD"
    );

  const loadPackages =
    useCallback(async () => {
      if (!canPurchaseTopUps) {
        setPackages([]);
        return;
      }

      try {
        setPackagesLoading(true);

        const data =
          await secureConnectService
            .getTopUpPackages();

        setPackages(data);
      } catch (packageError) {
        console.error(
          "Failed to load Secure Connect top-up packages:",
          packageError
        );

        setPurchaseError(
          getErrorMessage(packageError)
        );
      } finally {
        setPackagesLoading(false);
      }
    }, [canPurchaseTopUps]);

  useEffect(() => {
    void loadPackages();
  }, [loadPackages]);

  const eligiblePackages =
    useMemo(() => {
      if (!balance) {
        return [];
      }

      if (balance.plan === "SILVER") {
        return packages.filter(
          (packageOption) =>
            packageOption.mediaType ===
            "AUDIO"
        );
      }

      if (balance.plan === "GOLD") {
        return packages.filter(
          (packageOption) =>
            packageOption.mediaType ===
              "AUDIO" ||
            packageOption.mediaType ===
              "VIDEO"
        );
      }

      return [];
    }, [
      balance,
      packages,
    ]);

  const audioPackages =
    eligiblePackages.filter(
      (packageOption) =>
        packageOption.mediaType === "AUDIO"
    );

  const videoPackages =
    eligiblePackages.filter(
      (packageOption) =>
        packageOption.mediaType === "VIDEO"
    );

  async function pollTopUpStatus(
    topUpPaymentId: string
  ): Promise<
    "SUCCESS" |
    "FAILED" |
    "PENDING"
  > {
    /*
     * Browser signature verification is not authoritative
     * fulfillment. Razorpay payment.captured webhook performs
     * the wallet credit and changes status to SUCCESS.
     *
     * Poll for up to roughly 15 seconds.
     */
    for (
      let attempt = 0;
      attempt < 15;
      attempt += 1
    ) {
      const status =
        await secureConnectService
          .getTopUpStatus(
            topUpPaymentId
          );

      if (
        status.status === "SUCCESS"
      ) {
        return "SUCCESS";
      }

      if (
        status.status === "FAILED"
      ) {
        return "FAILED";
      }

      await wait(1000);
    }

    return "PENDING";
  }

  async function handlePurchase(
    packageOption: SecureConnectTopUpPackage
  ): Promise<void> {
    if (
      purchasingPackageCode !== null
    ) {
      return;
    }

    setPurchaseError(null);
    setPurchaseSuccess(null);
    setPurchasingPackageCode(
      packageOption.packageCode
    );

    try {
      /*
       * The backend re-validates membership eligibility and
       * supplies the authoritative package price.
       */
      const order =
        await secureConnectService
          .createTopUpOrder(
            packageOption.packageCode
          );

      if (
        !order.topUpPaymentId ||
        !order.orderId ||
        !order.key ||
        order.amount <= 0 ||
        !order.currency
      ) {
        throw new Error(
          "The Secure Connect payment order could not be created."
        );
      }

      const Razorpay =
        getRazorpayConstructor();

      if (!Razorpay) {
        throw new Error(
          "Unable to load the secure payment window. Please refresh the page and try again."
        );
      }

      const options: RazorpayOptions = {
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: "Holy Matrimony",
        description:
          `${order.minutes} min Secure ${
            order.mediaType === "VIDEO"
              ? "Video"
              : "Audio"
          } Top-Up`,
        order_id: order.orderId,

        handler: async (
          response: RazorpaySuccessResponse
        ) => {
          try {
            /*
             * Verify the browser checkout signature.
             *
             * This does NOT credit minutes.
             */
            await secureConnectService
              .verifyTopUpPayment({
                razorpay_order_id:
                  response.razorpay_order_id,
                razorpay_payment_id:
                  response.razorpay_payment_id,
                razorpay_signature:
                  response.razorpay_signature,
              });

            /*
             * Wait for the authenticated payment.captured
             * webhook to perform authoritative fulfillment.
             */
            const finalStatus =
              await pollTopUpStatus(
                order.topUpPaymentId
              );

            if (
              finalStatus === "SUCCESS"
            ) {
              setPurchaseSuccess(
                `${order.minutes} Secure ${
                  order.mediaType === "VIDEO"
                    ? "Video"
                    : "Audio"
                } minutes were added successfully.`
              );

              setPurchaseError(null);

              await loadBalance();
              return;
            }

            if (
              finalStatus === "FAILED"
            ) {
              setPurchaseError(
                "The payment was not completed. No Secure Connect minutes were added."
              );

              return;
            }

            setPurchaseSuccess(
              "Payment verification was received. Your Secure Connect balance will update after payment confirmation."
            );
          } catch (verificationError) {
            console.error(
              "Secure Connect top-up verification failed:",
              verificationError
            );

            setPurchaseError(
              getErrorMessage(
                verificationError
              )
            );
          } finally {
            setPurchasingPackageCode(
              null
            );
          }
        },

        theme: {
          color: "#0B2D5C",
        },

        modal: {
          confirm_close: true,
          ondismiss: () => {
            setPurchasingPackageCode(
              null
            );
          },
        },

        retry: {
          enabled: true,
        },
      };

      const razorpay =
        new Razorpay(
          options
        );

      razorpay.on(
        "payment.failed",
        (
          response: RazorpayFailureResponse
        ) => {
          setPurchasingPackageCode(
            null
          );

          setPurchaseError(
            response.error?.description ??
              "The payment could not be completed. No Secure Connect minutes were added."
          );
        }
      );

      razorpay.open();
    } catch (purchaseFailure) {
      console.error(
        "Secure Connect top-up checkout failed:",
        purchaseFailure
      );

      setPurchasingPackageCode(
        null
      );

      setPurchaseError(
        getErrorMessage(
          purchaseFailure
        )
      );
    }
  }

  if (loading) {
    return (
      <section className="animate-pulse rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="h-7 w-56 rounded bg-slate-200" />
        <div className="mt-3 h-4 w-80 max-w-full rounded bg-slate-100" />

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="h-64 rounded-3xl bg-slate-100" />
          <div className="h-64 rounded-3xl bg-slate-100" />
        </div>
      </section>
    );
  }

  if (!balance || error) {
    return (
      <section className="rounded-[28px] border border-red-200 bg-red-50 p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-black text-red-700">
              Secure Connect minutes unavailable
            </h2>

            <p className="mt-2 text-sm leading-6 text-red-600">
              {error ??
                "We could not load your Secure Connect balance."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              void loadBalance();
            }}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-700 px-5 text-sm font-black text-white transition hover:bg-red-800"
          >
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.07)]">
      <div className="border-b border-slate-200 bg-gradient-to-r from-blue-50 via-white to-amber-50 px-5 py-5 sm:px-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0B2D5C] text-[#F2D675] shadow-md">
              <Headphones size={22} />
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.15em] text-[#B38B19]">
                Secure Connect
              </p>

              <h2 className="mt-1 text-xl font-black text-[#0B2D5C]">
                Your Calling Minutes
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Included plan minutes and purchased top-ups
                are tracked separately.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-black text-[#0B2D5C]">
              {balance.plan}
            </span>

            <button
              type="button"
              onClick={() => {
                void loadBalance();
              }}
              aria-label="Refresh Secure Connect balance"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:text-[#0B2D5C]"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-7">
        <div className="grid gap-4 lg:grid-cols-2">
          <MediaCard
            title="Audio Calling"
            description="Secure voice calls between Holy Matrimony members."
            balance={balance.audio}
          />

          <MediaCard
            title="Video Calling"
            description="Private Secure Connect video conversations."
            balance={balance.video}
          />
        </div>

        {purchaseSuccess && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <CheckCircle2
              size={20}
              className="mt-0.5 shrink-0 text-emerald-600"
            />

            <p className="text-sm font-semibold leading-6 text-emerald-700">
              {purchaseSuccess}
            </p>
          </div>
        )}

        {purchaseError && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
            <XCircle
              size={20}
              className="mt-0.5 shrink-0 text-red-600"
            />

            <p className="text-sm font-semibold leading-6 text-red-700">
              {purchaseError}
            </p>
          </div>
        )}

        {canPurchaseTopUps && (
          <div className="mt-6 rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-blue-50 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F2D675] text-[#0B2D5C]">
                <ShoppingBag size={20} />
              </div>

              <div>
                <h3 className="text-lg font-black text-[#0B2D5C]">
                  Add Secure Connect Minutes
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Purchase additional calling minutes without
                  changing your membership. Purchased minutes
                  remain separate from your included allowance.
                </p>
              </div>
            </div>

            {packagesLoading ? (
              <div className="mt-6 flex min-h-28 items-center justify-center rounded-2xl border border-slate-200 bg-white">
                <Loader2
                  size={22}
                  className="animate-spin text-[#0B2D5C]"
                />

                <span className="ml-2 text-sm font-bold text-slate-500">
                  Loading top-up packages...
                </span>
              </div>
            ) : (
              <>
                {audioPackages.length > 0 && (
                  <div className="mt-6">
                    <div className="mb-3 flex items-center gap-2">
                      <Phone
                        size={17}
                        className="text-[#0B2D5C]"
                      />

                      <h4 className="text-sm font-black text-[#0B2D5C]">
                        Audio Top-Ups
                      </h4>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      {audioPackages.map(
                        (packageOption) => (
                          <TopUpPackageCard
                            key={
                              packageOption.packageCode
                            }
                            packageOption={
                              packageOption
                            }
                            purchasing={
                              purchasingPackageCode !==
                              null
                            }
                            onPurchase={(
                              selectedPackage
                            ) => {
                              void handlePurchase(
                                selectedPackage
                              );
                            }}
                          />
                        )
                      )}
                    </div>
                  </div>
                )}

                {balance.plan === "GOLD" &&
                  videoPackages.length > 0 && (
                    <div className="mt-6">
                      <div className="mb-3 flex items-center gap-2">
                        <Video
                          size={17}
                          className="text-[#0B2D5C]"
                        />

                        <h4 className="text-sm font-black text-[#0B2D5C]">
                          Video Top-Ups
                        </h4>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        {videoPackages.map(
                          (packageOption) => (
                            <TopUpPackageCard
                              key={
                                packageOption.packageCode
                              }
                              packageOption={
                                packageOption
                              }
                              purchasing={
                                purchasingPackageCode !==
                                null
                              }
                              onPurchase={(
                                selectedPackage
                              ) => {
                                void handlePurchase(
                                  selectedPackage
                                );
                              }}
                            />
                          )
                        )}
                      </div>
                    </div>
                  )}

                {eligiblePackages.length === 0 &&
                  !packagesLoading && (
                    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                      No Secure Connect top-up packages are
                      currently available for your membership.
                    </div>
                  )}
              </>
            )}

            {purchasingPackageCode && (
              <div className="mt-5 flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm font-bold text-[#0B2D5C]">
                <Loader2
                  size={18}
                  className="animate-spin"
                />

                Secure payment in progress...
              </div>
            )}

            <p className="mt-5 text-xs leading-5 text-slate-500">
              Minutes are added only after payment confirmation.
              Closing or cancelling the payment window does not
              add calling credit.
            </p>
          </div>
        )}

        {balance.plan === "PLATINUM" &&
          balance.activeMembership && (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-700">
              Your Platinum membership includes unlimited Secure
              Audio and Video Calling, so top-ups are not
              required.
            </div>
          )}

        {!balance.activeMembership && (
          <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-[#0B2D5C]">
            An eligible active membership is required to initiate
            Secure Connect calls or purchase additional minutes.
            Any previously purchased top-up minutes remain stored
            in your account.
          </div>
        )}
      </div>
    </section>
  );
}
