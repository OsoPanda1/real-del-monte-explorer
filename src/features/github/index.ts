import { useQuery } from '@tanstack/react-query';

const GITHUB_API_URL = 'https://api.github.com';
const DEFAULT_USERNAME = 'OsoPanda1';

export interface GithubProfile {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  fork: boolean;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  language: string | null;
  open_issues_count: number;
  topics: string[];
  visibility: string;
  pushed_at: string;
  updated_at: string;
}

interface GithubNodeZeroData {
  profile: GithubProfile;
  repos: GithubRepo[];
  totals: {
    stars: number;
    forks: number;
    watchers: number;
    openIssues: number;
  };
}

const githubRequest = async <T>(path: string): Promise<T> => {
  const response = await fetch(`${GITHUB_API_URL}${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error (${response.status})`);
  }

  return response.json();
};

export function useGithubNodeZero(username: string = DEFAULT_USERNAME) {
  return useQuery<GithubNodeZeroData>({
    queryKey: ['github', 'node-zero', username],
    queryFn: async () => {
      const [profile, repos] = await Promise.all([
        githubRequest<GithubProfile>(`/users/${username}`),
        githubRequest<GithubRepo[]>(`/users/${username}/repos?per_page=100&sort=updated`),
      ]);

      const nonForkRepos = repos.filter((repo) => !repo.fork);
      const totals = nonForkRepos.reduce(
        (acc, repo) => ({
          stars: acc.stars + repo.stargazers_count,
          forks: acc.forks + repo.forks_count,
          watchers: acc.watchers + repo.watchers_count,
          openIssues: acc.openIssues + repo.open_issues_count,
        }),
        { stars: 0, forks: 0, watchers: 0, openIssues: 0 },
      );

      return {
        profile,
        repos: nonForkRepos.slice(0, 6),
        totals,
      };
    },
    staleTime: 1000 * 60 * 10,
    refetchInterval: 1000 * 60 * 15,
  });
}
