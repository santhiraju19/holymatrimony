import {
  ChevronRight,
} from "lucide-react";

interface ProfileInfoItem {
  label: string;
  value:
    | string
    | number
    | null
    | undefined;
}

interface ProfileInfoSectionProps {
  title: string;
  description?: string;
  items: ProfileInfoItem[];
}

export default function ProfileInfoSection({
  title,
  description,
  items,
}: ProfileInfoSectionProps) {
  const visibleItems =
    items.filter(
      (item) =>
        item.value !== null &&
        item.value !== undefined &&
        String(
          item.value
        ).trim().length > 0
    );

  return (
    <section className="overflow-hidden rounded-[20px] border border-slate-200/80 bg-white shadow-[0_7px_24px_rgba(15,23,42,0.045)]">

      {/* Header */}
      <div className="border-b border-slate-100 bg-gradient-to-r from-white to-blue-50/35 px-4 py-3.5 sm:px-5">
        <h2 className="text-sm font-black tracking-[-0.015em] text-[#0B2D5C] sm:text-base">
          {title}
        </h2>

        {description && (
          <p className="mt-0.5 text-[11px] leading-5 text-slate-500">
            {description}
          </p>
        )}
      </div>

      {/* Details */}
      <div className="divide-y divide-slate-100 px-4 sm:px-5">
        {visibleItems.length > 0 ? (
          visibleItems.map(
            (
              item,
              index
            ) => (
              <div
                key={`${item.label}-${index}`}
                className="grid gap-1 py-3 sm:grid-cols-[145px_minmax(0,1fr)] sm:items-center sm:gap-4"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.08em] text-slate-400 sm:text-[11px]">
                  {item.label}
                </p>

                <div className="flex min-w-0 items-center justify-between gap-2">
                  <p
                    title={String(
                      item.value
                    )}
                    className="min-w-0 truncate text-sm font-bold text-slate-700"
                  >
                    {
                      item.value
                    }
                  </p>

                  <ChevronRight
                    size={13}
                    className="shrink-0 text-slate-300"
                  />
                </div>
              </div>
            )
          )
        ) : (
          <div className="py-6 text-center">
            <p className="text-xs font-medium text-slate-400">
              Information not provided
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
