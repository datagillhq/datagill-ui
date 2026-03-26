import { AppHeader } from "@/components/app-header";
import { HomePlaceholder } from "@/components/home-placeholder";

export default function HomePage() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <HomePlaceholder />
      </main>
    </>
  );
}
