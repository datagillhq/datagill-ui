"use client";

import { cn } from "@/lib/utils";
import { authClient } from "@datagill/auth/client";
import { LayoutDashboard, LogOut, Plug, Settings, UserCircle, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Integrations", href: "/settings/integrations", icon: Plug },
  { label: "Team", href: "/settings/team", icon: Users },
  { label: "Account", href: "/settings/account", icon: UserCircle },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();

  async function handleSignOut() {
    try {
      await authClient.signOut();
    } finally {
      router.push("/sign-in");
    }
  }

  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "??";

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="flex w-56 flex-col border-r border-border bg-card px-4 py-6">
        <div className="mb-8 px-2">
          <p className="text-sm font-semibold text-foreground">DataGill</p>
          <p className="text-xs text-muted-foreground">{session?.user?.email ?? ""}</p>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-indigo-600/10 font-medium text-indigo-400"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="flex items-center gap-2 border-t border-border pt-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600/20 text-xs font-semibold text-indigo-400">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-xs font-medium text-foreground">
              {session?.user?.name ?? ""}
            </p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </aside>

      {/* Page content */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-14 items-center justify-end gap-3 border-b border-border px-6">
          <Link
            href="/settings/integrations"
            className="text-muted-foreground hover:text-foreground"
          >
            <Settings className="h-4 w-4" />
          </Link>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600/20 text-xs font-semibold text-indigo-400">
            {initials}
          </div>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
