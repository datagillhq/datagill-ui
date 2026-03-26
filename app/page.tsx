import { AppHeader } from "@/components/app-header";
import { MarketingHome } from "@/components/marketing-home";

export default function HomePage() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <MarketingHome />
      </main>
    </>
  );
}
