"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  useAuthContext,
} from "@/features/auth/context/AuthContext";

import {
  authService,
} from "@/features/auth/services/auth.service";

import {
  isFranchiseToken,
} from "@/features/franchise/auth/franchiseAuth";

import {
  clearAuthStorage,
  getToken,
} from "@/lib/auth";

function getSafeRedirect(
  redirect: string | null
): string {
  if (
    redirect &&
    (
      redirect === "/franchise" ||
      redirect.startsWith("/franchise/")
    ) &&
    !redirect.startsWith("/franchise/login")
  ) {
    return redirect;
  }

  return "/franchise";
}

export default function FranchiseLoginClient() {
  const router =
    useRouter();

  const searchParams =
    useSearchParams();

  const {
    login: saveContextSession,
  } = useAuthContext();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const redirect =
    getSafeRedirect(
      searchParams.get("redirect")
    );

  useEffect(() => {
    const existingToken =
      getToken();

    if (
      isFranchiseToken(
        existingToken
      )
    ) {
      router.replace(redirect);
    }
  }, [
    redirect,
    router,
  ]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const session =
        await authService.login({
          email: email.trim(),
          password,
        });

      if (
        !isFranchiseToken(
          session.accessToken
        )
      ) {
        clearAuthStorage();

        throw new Error(
          "This account does not have franchise access."
        );
      }

      if (!session.user) {
        clearAuthStorage();

        throw new Error(
          "Franchise account details were not returned."
        );
      }

      saveContextSession(
        {
          ...session.user,
          role: "ROLE_FRANCHISE",
        },
        session.accessToken
      );

      window.location.replace(
        redirect
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-2xl font-bold text-[#0B2D5C] shadow-xl">
            HM
          </div>

          <h1 className="mt-6 text-3xl font-bold text-white">
            Holy Matrimony
          </h1>

          <p className="mt-2 text-sm font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
            Franchise Portal
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white p-7 shadow-2xl sm:p-8">
          <div className="mb-7">
            <h2 className="text-2xl font-bold text-slate-900">
              Franchise Sign In
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Sign in with an authorized Holy Matrimony franchise account.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-700">
                {error}
              </p>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="franchise-email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email Address
              </label>

              <input
                id="franchise-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                placeholder="franchise@theholymatrimony.com"
                className="h-12 w-full rounded-xl border border-slate-300 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="franchise-password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Password
              </label>

              <input
                id="franchise-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                placeholder="Enter your password"
                className="h-12 w-full rounded-xl border border-slate-300 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-xl bg-gradient-to-r from-[#0B2D5C] to-blue-700 text-sm font-bold text-white shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Signing in..."
                : "Sign In to Franchise Portal"}
            </button>
          </form>

          <div className="mt-7 border-t border-slate-100 pt-6 text-center">
            <a
              href="/login"
              className="text-sm font-semibold text-[#0B2D5C] hover:underline"
            >
              ← Member Sign In
            </a>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Authorized Holy Matrimony franchise users only.
        </p>
      </div>
    </main>
  );
}
