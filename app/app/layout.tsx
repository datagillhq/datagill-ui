import type { ReactNode } from "react";
import { AppShellSidebar } from "@/components/app-shell-sidebar";
import { AppShellTopbar } from "@/components/app-shell-topbar";

export default function ProductLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:grid lg:grid-cols-[280px_1fr] lg:px-8">
      <div className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
        <AppShellSidebar />
      </div>
      <div className="flex flex-col gap-6">
        <AppShellTopbar />
        {children}
      </div>
    </main>
  );
}
