import { UserCircle } from "lucide-react";

export default function AccountSettingsPage() {
  return (
    <div className="flex flex-1 flex-col px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your email, password, and subscription.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600/10">
          <UserCircle className="h-5 w-5 text-indigo-400" />
        </div>
        <p className="text-sm font-medium text-foreground">Account management coming soon</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Update your email, password, and plan from here.
        </p>
      </div>
    </div>
  );
}
