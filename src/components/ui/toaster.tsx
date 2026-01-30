import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        className: "rounded-xl border border-border bg-white text-foreground shadow-soft",
      }}
    />
  );
}
