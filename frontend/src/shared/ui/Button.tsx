import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "success" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-orange-600 hover:bg-orange-700 text-white border-transparent",
  secondary: "bg-white hover:bg-slate-50 text-slate-700 border-slate-300",
  danger: "bg-red-600 hover:bg-red-700 text-white border-transparent",
  success: "bg-emerald-600 hover:bg-emerald-700 text-white border-transparent",
  ghost: "bg-transparent hover:bg-slate-100 text-slate-700 border-transparent",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  disabled,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border font-medium transition focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}