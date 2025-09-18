"use client";
import * as React from "react";
import { twMerge } from "tailwind-merge";

interface SheetProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  React.useEffect(() => {
    // keep API parity; parent controls state
    void onOpenChange;
  }, [onOpenChange]);
  return <div data-state={open ? "open" : "closed"}>{children}</div>;
}

export function SheetTrigger({ asChild, children, ...props }: { asChild?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  if (asChild) return <>{children}</>;
  return (
    <button {...props}>
      {children}
    </button>
  );
}

export function SheetContent({ side = "right", className, children }: { side?: "right" | "left" | "top" | "bottom" } & React.HTMLAttributes<HTMLDivElement>) {
  const base = "fixed z-50 bg-white shadow-2xl p-2";
  const sides: Record<string, string> = {
    right: "top-0 right-0 h-full w-72",
    left: "top-0 left-0 h-full w-72",
    top: "top-0 left-0 right-0 h-64",
    bottom: "bottom-0 left-0 right-0 h-64",
  };
  return (
    <div role="dialog" aria-modal className={twMerge(base, sides[side], className)}>
      {children}
    </div>
  );
}

export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={twMerge("px-2 py-2", className)} {...props} />;
}
export function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={twMerge("text-base font-bold", className)} {...props} />;
}
export function SheetDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={twMerge("text-sm text-slate-600", className)} {...props} />;
}
export function SheetClose({ asChild, children, ...props }: { asChild?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  if (asChild) return <>{children}</>;
  return <button {...props}>{children || "إغلاق"}</button>;
}
