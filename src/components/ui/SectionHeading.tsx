interface Props {
  title: string;
  subtitle?: string;
}

export default function SectionHeading({
  title,
  subtitle,
}: Props) {
  return (
    <div className="mb-14 text-center">
      <h2 className="text-4xl font-bold text-[#0B2D5C]">
        {title}
      </h2>

      {subtitle && (
        <p className="mx-auto mt-4 max-w-2xl text-gray-500">
          {subtitle}
        </p>
      )}
    </div>
  );
}