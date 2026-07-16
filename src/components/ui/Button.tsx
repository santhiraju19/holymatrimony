import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline";
}

export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "bg-[#0B2D5C] text-white hover:bg-[#123C73]",

    secondary:
      "bg-slate-300 text-white hover:bg-slate-400",

    outline:
      "border border-[#0B2D5C] text-[#0B2D5C] hover:bg-[#0B2D5C] hover:text-white",
  };

  return (
    <button
      {...props}
      className={`rounded-xl px-6 py-3 font-semibold transition ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}