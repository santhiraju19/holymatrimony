
import type { ReactNode } from "react";

export interface ProfileInfoItem {
  label: string;
  value: ReactNode;
}

interface ProfileInfoSectionProps {
  title: string;
  description?: string;
  items: ProfileInfoItem[];
}

function hasVisibleValue(
  value: ReactNode
): boolean {
  return (
    value !== null &&
    value !== undefined &&
    value !== ""
  );
}

export default function ProfileInfoSection({
  title,
  description,
  items,
}: ProfileInfoSectionProps) {
  const visibleItems = items.filter((item) =>
    hasVisibleValue(item.value)
  );

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-slate-900">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        )}
      </div>

      <dl className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
        {visibleItems.map((item) => (
          <div key={item.label}>
            <dt className="text-sm font-medium text-slate-500">
              {item.label}
            </dt>

            <dd className="mt-1 font-semibold text-slate-900">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}