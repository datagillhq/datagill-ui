"use client";

import type { ReactNode } from "react";

// BetterAuth's React client uses a context-free hook pattern — no provider
// needed at the app level. This file is kept as an explicit re-export boundary
// so imports from "@datagill/auth/provider" remain valid if a provider is
// added in future (e.g., for optimistic session updates).

export function SessionProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
