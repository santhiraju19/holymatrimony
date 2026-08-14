interface SectionHeadingProps {
  title: string;
  subtitle?: string;
}

export default function SectionHeading({
  title,
  subtitle,
}: SectionHeadingProps) {
  return (
    <div className="mx-auto text-center">
      <h2 className="text-2xl font-bold tracking-tight text-[#0B2D5C] sm:text-3xl lg:text-4xl">
        {title}
      </h2>

      {subtitle && (
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:mt-4 sm:text-base">
          {subtitle}
        </p>
      )}
    </div>
  );
}
