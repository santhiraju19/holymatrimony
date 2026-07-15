interface Props {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export default function AuthCard({
  title,
  subtitle,
  children,
}: Props) {
  return (
    <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl border border-slate-100">

      <div className="mb-8 text-center">

        <h1 className="text-4xl font-extrabold text-[#0B2D5C]">
          Holy Matrimony
        </h1>

        <p className="mt-2 text-sm tracking-widest uppercase text-[#D4AF37]">
          Faith • Family • Forever
        </p>

        <h2 className="mt-6 text-2xl font-semibold text-slate-800">
          {title}
        </h2>

        <p className="mt-2 text-gray-500">
          {subtitle}
        </p>

      </div>

      {children}

    </div>
  );
}