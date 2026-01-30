import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-primary/20",
        className,
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";
