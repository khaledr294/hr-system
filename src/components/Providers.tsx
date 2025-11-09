"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";
import { DarkModeProvider } from "./DarkModeProvider";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <DarkModeProvider>
        {children}
      </DarkModeProvider>
    </SessionProvider>
  );
}
