"use client";
import * as React from "react";
import { twMerge } from "tailwind-merge";

export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "single" | "multiple";
  defaultValue?: string[];
}

export function Accordion({ className, children }: AccordionProps) {
  return <div className={twMerge("space-y-2", className)}>{children}</div>;
}

export function AccordionItem({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={twMerge("rounded-2xl border border-slate-200", className)}>{children}</div>;
}

export function AccordionTrigger({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={twMerge("w-full flex items-center justify-between px-3 py-2 text-[11px] tracking-wide font-extrabold text-slate-600 uppercase", className)} {...props}>
      {children}
    </button>
  );
}

export function AccordionContent({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={twMerge("px-2 pb-2", className)}>{children}</div>;
}

