import { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "ghost" | "outline";
  size?: "default" | "sm" | "lg";
}

export function Button({
  variant = "default",
  size = "default",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60",
        {
          "bg-primary text-primaryForeground hover:bg-primary/90": variant === "default",
          "bg-secondary text-secondaryForeground hover:bg-secondary/80": variant === "secondary",
          "border border-border bg-white hover:bg-muted": variant === "outline",
          "hover:bg-muted": variant === "ghost",
        },
        {
          "h-10 px-4": size === "default",
          "h-9 px-3": size === "sm",
          "h-11 px-6": size === "lg",
        },
        className,
      )}
      {...props}
    />
  );
}
