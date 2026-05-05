import { apiFetch } from "@/lib/api";

type GitHubAuthStartResponse = {
  install_url: string;
  expires_at: string;
};

export async function startGitHubAuth(token: string | null, returnTo: string): Promise<string> {
  const response = await apiFetch<GitHubAuthStartResponse>("/v1/auth/github", {
    method: "POST",
    body: JSON.stringify({ return_to: returnTo }),
    token,
  });

  if (!response?.install_url) {
    throw new Error("GitHub install URL was not returned.");
  }

  return response.install_url;
}
