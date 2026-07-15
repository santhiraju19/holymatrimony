import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "outline";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export default function Button({
  variant = "primary",
  children,
  className = "",
  ...props
}: Props) {
  const styles = {
    primary:
      "bg-[#0B2D5C] text-white hover:bg-[#123C73]",

    secondary:
      "bg-[#D4AF37] text-black hover:brightness-110",

    outline:
      "border border-[#0B2D5C] text-[#0B2D5C] hover:bg-[#0B2D5C] hover:text-white",
  };

  return (
    <button
      className={`rounded-xl px-6 py-3 font-semibold transition-all duration-300 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}