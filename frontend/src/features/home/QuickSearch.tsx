"use client";

import {
  FormEvent,
  ReactNode,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { motion } from "framer-motion";

import {
  ChevronRight,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import {
  DENOMINATIONS,
  RELIGION_OPTIONS,
} from "@/features/profile/data/profileOptions";

const AGE_OPTIONS = Array.from(
  {
    length: 53,
  },
  (_, index) =>
    String(index + 18)
);

export default function QuickSearch() {
  const router = useRouter();

  const [
    ageFrom,
    setAgeFrom,
  ] = useState("21");

  const [
    ageTo,
    setAgeTo,
  ] = useState("35");

  const [
    religion,
    setReligion,
  ] = useState("Christianity");

  const [
    denomination,
    setDenomination,
  ] = useState("");

  const [
    location,
    setLocation,
  ] = useState("");

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ): void {
    event.preventDefault();

    const params =
      new URLSearchParams();

    if (
      ageFrom.trim()
    ) {
      params.set(
        "ageFrom",
        ageFrom.trim()
      );
    }

    if (
      ageTo.trim()
    ) {
      params.set(
        "ageTo",
        ageTo.trim()
      );
    }

    if (
      religion.trim()
    ) {
      params.set(
        "religion",
        religion.trim()
      );
    }

    if (
      denomination.trim()
    ) {
      params.set(
        "denomination",
        denomination.trim()
      );
    }

    if (
      location.trim()
    ) {
      params.set(
        "location",
        location.trim()
      );
    }

    const query =
      params.toString();

    router.push(
      query
        ? `/search?${query}`
        : "/search"
    );
  }

  function handleAdvancedSearch(): void {
    router.push(
      "/search"
    );
  }

  return (
    <section className="relative z-20 -mt-12 pb-8 sm:-mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{
            opacity: 0,
            y: 35,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.7,
          }}
          className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.14)]"
        >
          {/* =====================================================
              Header
              ===================================================== */}

          <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50/80 via-white to-amber-50/50 px-5 py-5 sm:px-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Search
                    size={17}
                    className="text-blue-600"
                  />

                  <p className="text-xs font-black uppercase tracking-[0.12em] text-blue-600">
                    Quick Search
                  </p>
                </div>

                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                  Start Your Partner Search
                </h2>

                <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-600">
                  Choose a few important preferences now.
                  You can refine your results further with
                  Advanced Search.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  handleAdvancedSearch
                }
                className="inline-flex w-fit items-center gap-1.5 text-sm font-bold text-blue-700 transition hover:text-blue-900"
              >
                Advanced Search

                <ChevronRight
                  size={16}
                />
              </button>
            </div>
          </div>

          {/* =====================================================
              Search Form
              ===================================================== */}

          <form
            onSubmit={
              handleSubmit
            }
            className="p-5 sm:p-7"
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">

              {/* Age From */}

              <Field
                label="Age From"
              >
                <select
                  value={
                    ageFrom
                  }
                  onChange={(event) =>
                    setAgeFrom(
                      event.target.value
                    )
                  }
                  className={
                    inputClassName
                  }
                >
                  {AGE_OPTIONS.map(
                    (age) => (
                      <option
                        key={
                          age
                        }
                        value={
                          age
                        }
                      >
                        {age}
                      </option>
                    )
                  )}
                </select>
              </Field>

              {/* Age To */}

              <Field
                label="Age To"
              >
                <select
                  value={
                    ageTo
                  }
                  onChange={(event) =>
                    setAgeTo(
                      event.target.value
                    )
                  }
                  className={
                    inputClassName
                  }
                >
                  {AGE_OPTIONS.map(
                    (age) => (
                      <option
                        key={
                          age
                        }
                        value={
                          age
                        }
                      >
                        {age}
                      </option>
                    )
                  )}
                </select>
              </Field>

              {/* Religion */}

              <Field
                label="Religion"
              >
                <select
                  value={
                    religion
                  }
                  onChange={(event) =>
                    setReligion(
                      event.target.value
                    )
                  }
                  className={
                    inputClassName
                  }
                >
                  <option value="">
                    Any Religion
                  </option>

                  {RELIGION_OPTIONS.map(
                    (option) => (
                      <option
                        key={
                          option
                        }
                        value={
                          option
                        }
                      >
                        {option}
                      </option>
                    )
                  )}
                </select>
              </Field>

              {/* Denomination */}

              <Field
                label="Denomination"
              >
                <select
                  value={
                    denomination
                  }
                  onChange={(event) =>
                    setDenomination(
                      event.target.value
                    )
                  }
                  className={
                    inputClassName
                  }
                >
                  <option value="">
                    Any Denomination
                  </option>

                  {DENOMINATIONS.map(
                    (option) => (
                      <option
                        key={
                          option
                        }
                        value={
                          option
                        }
                      >
                        {option}
                      </option>
                    )
                  )}
                </select>
              </Field>

              {/* Location */}

              <Field
                label="Location"
              >
                <input
                  value={
                    location
                  }
                  onChange={(event) =>
                    setLocation(
                      event.target.value
                    )
                  }
                  type="text"
                  placeholder="City or state"
                  className={
                    inputClassName
                  }
                />
              </Field>

              {/* Search */}

              <div className="flex items-end">
                <button
                  type="submit"
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/15 transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                >
                  <Search
                    size={17}
                  />

                  Search
                </button>
              </div>
            </div>

            {/* =================================================
                Advanced Search Hint
                ================================================= */}

            <div className="mt-5 flex items-start gap-2 rounded-xl border border-slate-100 bg-slate-50/80 px-3.5 py-3">
              <SlidersHorizontal
                size={15}
                className="mt-0.5 shrink-0 text-slate-400"
              />

              <p className="text-[11px] leading-5 text-slate-500">
                Advanced Search includes community,
                mother tongue, marital status, height,
                education, profession, lifestyle and
                verification filters.
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
}

const inputClassName =
  "min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50";

interface FieldProps {
  label: string;
  children: ReactNode;
}

function Field({
  label,
  children,
}: FieldProps) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold text-slate-600">
        {label}
      </label>

      {children}
    </div>
  );
}