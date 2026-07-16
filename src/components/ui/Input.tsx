import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export default function Input({
  className = "",
  ...props
}: InputProps) {
  return (
    <input
      {...props}
      className={`
        w-full
        rounded-xl
        border
        border-slate-300
        bg-white
        px-4
        py-3
        outline-none
        transition
        duration-200
        focus:border-[#D4AF37]
        focus:ring-4
        focus:ring-[#D4AF37]/20
        ${className}
      `}
    />
  );
}