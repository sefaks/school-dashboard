"use client";

import { SessionProvider } from "next-auth/react";

// Provider using for wrap the app with session provider, so we can use session in the app. 
export function Providers({ children }: { children: React.ReactNode }) {
    return <SessionProvider>{children}</SessionProvider>;
}
