import { SearchShell } from "@/components/search-shell";

type HomePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

export default async function HomePage({ searchParams }: HomePageProps) {
  return <SearchShell searchParams={searchParams} />;
}
