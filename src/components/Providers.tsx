"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";
import { ThemeProvider } from "./ThemeProvider";
import ThemeInitializer from "./ThemeInitializer";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <ThemeInitializer />
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
