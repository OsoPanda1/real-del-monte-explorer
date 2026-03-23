interface GithubRepo {
  name: string;
  htmlUrl: string;
  description: string | null;
  language: string | null;
  stargazersCount: number;
  updatedAt: string;
  topics: string[];
  archived: boolean;
  fork: boolean;
}

interface EcosystemFeature {
  key: string;
  title: string;
  description: string;
  repoSignals: RegExp[];
}

export interface EcosystemGap {
  key: string;
  title: string;
  description: string;
  matchedRepos: string[];
  status: 'present' | 'missing';
}

const FEATURE_CATALOG: EcosystemFeature[] = [
  {
    key: 'federation',
    title: 'Federación de módulos',
    description: 'Bus de interoperabilidad entre dominios y servicios.',
    repoSignals: [/federacion/i, /federation/i, /sovereign/i],
  },
  {
    key: 'immersive_ui',
    title: 'Experiencias inmersivas',
    description: 'Capas XR/3D/4D para visualización y navegación.',
    repoSignals: [/xr/i, /vr/i, /meta/i, /omniverse/i, /horizon/i],
  },
  {
    key: 'docs_hub',
    title: 'Centro documental',
    description: 'Repositorio de documentación para onboarding y operación.',
    repoSignals: [/docs/i, /academy/i, /masterclass/i],
  },
  {
    key: 'automation',
    title: 'Automatización y bots',
    description: 'Automatización de flujos y notificaciones (bots/feeds).',
    repoSignals: [/bot/i, /rss/i, /hub/i],
  },
];

const PROJECT_CAPABILITIES: Record<string, boolean> = {
  federation: true,
  immersive_ui: true,
  docs_hub: true,
  automation: false,
};

function asRepo(raw: any): GithubRepo {
  return {
    name: raw.name,
    htmlUrl: raw.html_url,
    description: raw.description,
    language: raw.language,
    stargazersCount: raw.stargazers_count,
    updatedAt: raw.updated_at,
    topics: Array.isArray(raw.topics) ? raw.topics : [],
    archived: Boolean(raw.archived),
    fork: Boolean(raw.fork),
  };
}

async function fetchViaApi(profile: string): Promise<GithubRepo[]> {
  const response = await fetch(`https://api.github.com/users/${profile}/repos?per_page=100&sort=updated`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'real-del-monte-explorer',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error ${response.status}`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    return [];
  }

  return data.map(asRepo);
}

async function fetchViaHtml(profile: string): Promise<GithubRepo[]> {
  const response = await fetch(`https://github.com/${profile}?tab=repositories`);

  if (!response.ok) {
    throw new Error(`GitHub HTML error ${response.status}`);
  }

  const html = await response.text();
  const repoRegex = new RegExp(`/${profile}/([A-Za-z0-9._-]+)`, 'g');
  const names = new Set<string>();

  for (const match of html.matchAll(repoRegex)) {
    names.add(match[1]);
  }

  return Array.from(names).map((name) => ({
    name,
    htmlUrl: `https://github.com/${profile}/${name}`,
    description: null,
    language: null,
    stargazersCount: 0,
    updatedAt: '',
    topics: [],
    archived: false,
    fork: false,
  }));
}

export async function fetchEcosystemRepos(profile: string): Promise<GithubRepo[]> {
  try {
    const repos = await fetchViaApi(profile);
    if (repos.length > 0) {
      return repos;
    }
  } catch {
    // ignore and use HTML fallback
  }

  return fetchViaHtml(profile);
}

export function buildEcosystemGaps(repos: GithubRepo[]): EcosystemGap[] {
  const haystack = repos.map((repo) => `${repo.name} ${(repo.description || '')} ${repo.topics.join(' ')}`);

  return FEATURE_CATALOG.map((feature) => {
    const matchedRepos = repos
      .filter((repo, idx) => feature.repoSignals.some((signal) => signal.test(haystack[idx])))
      .map((repo) => repo.name);

    const status: EcosystemGap['status'] = PROJECT_CAPABILITIES[feature.key] ? 'present' : 'missing';

    return {
      key: feature.key,
      title: feature.title,
      description: feature.description,
      matchedRepos,
      status,
    };
  });
}
