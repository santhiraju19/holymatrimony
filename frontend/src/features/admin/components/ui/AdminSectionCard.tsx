import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface AdminSectionCardProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export default function AdminSectionCard({
  title,
  description,
  icon: Icon,
  actions,
  children,
  className = "",
  contentClassName = "",
}: AdminSectionCardProps) {
  const hasHeader =
    Boolean(title) ||
    Boolean(description) ||
    Boolean(Icon) ||
    Boolean(actions);

  return (
    <section
      className={[
        "overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm",
        className,
      ].join(" ")}
    >
      {hasHeader && (
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
          <div className="flex min-w-0 items-start gap-3">
            {Icon && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0B2D5C]">
                <Icon
                  size={19}
                  strokeWidth={2}
                />
              </div>
            )}

            <div className="min-w-0">
              {title && (
                <h2 className="text-lg font-bold tracking-tight text-[#0B2D5C]">
                  {title}
                </h2>
              )}

              {description && (
                <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
                  {description}
                </p>
              )}
            </div>
          </div>

          {actions && (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}

      <div
        className={[
          "p-5 sm:p-6",
          contentClassName,
        ].join(" ")}
      >
        {children}
      </div>
    </section>
  );
}
