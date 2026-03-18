import { ThemeToggle } from "@/components/theme-toggle";

export function AppHeader() {
  return (
    <header className="app-header">
      <div>
        <div className="app-kicker">DataGill</div>
        <div className="app-title">Feature Intelligence Console</div>
      </div>
      <ThemeToggle />
    </header>
  );
}
