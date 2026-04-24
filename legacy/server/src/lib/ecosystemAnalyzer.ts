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

interface ConsolidationTrack {
  track: string;
  folder: string;
  objective: string;
  repos: string[];
}

export interface EcosystemGap {
  key: string;
  title: string;
  description: string;
  matchedRepos: string[];
  status: 'present' | 'missing';
}

export interface ConsolidationPlan {
  profile: string;
  targetRepo: string;
  analyzedRepos: number;
  generatedAt: string;
  migrationWaves: Array<{
    wave: string;
    goal: string;
    tracks: ConsolidationTrack[];
  }>;
  backlog: string[];
}

const FEATURE_CATALOG: EcosystemFeature[] = [
  {
    key: 'federation',
    title: 'Federación de módulos',
    description: 'Bus de interoperabilidad entre dominios y servicios.',
    repoSignals: [/federacion/i, /federation/i, /sovereign/i, /kernel/i],
  },
  {
    key: 'immersive_ui',
    title: 'Experiencias inmersivas',
    description: 'Capas XR/3D/4D para visualización y navegación.',
    repoSignals: [/xr/i, /vr/i, /meta/i, /omniverse/i, /horizon/i, /twin/i],
  },
  {
    key: 'docs_hub',
    title: 'Centro documental',
    description: 'Repositorio de documentación para onboarding y operación.',
    repoSignals: [/docs/i, /academy/i, /masterclass/i, /manifest/i],
  },
  {
    key: 'automation',
    title: 'Automatización y bots',
    description: 'Automatización de flujos y notificaciones (bots/feeds).',
    repoSignals: [/bot/i, /rss/i, /hub/i, /agent/i, /workflow/i],
  },
];

const PROJECT_CAPABILITIES: Record<string, boolean> = {
  federation: true,
  immersive_ui: true,
  docs_hub: true,
  automation: false,
};

const CONSOLIDATION_TRACKS: Array<{
  track: string;
  folder: string;
  objective: string;
  signals: RegExp[];
}> = [
  {
    track: 'kernel-civilizatorio',
    folder: 'packages/kernel',
    objective: 'Unificar núcleo heptafederado, guardián ético y protocolos de resiliencia.',
    signals: [/kernel/i, /tamv/i, /isabella/i, /federation/i, /dekateotl/i],
  },
  {
    track: 'territorio-digital',
    folder: 'apps/rdm-digital',
    objective: 'Concentrar frontend, gemelo digital, mapas y capas XR/3D.',
    signals: [/real-del-monte/i, /rdm/i, /twin/i, /map/i, /xr/i, /vr/i],
  },
  {
    track: 'servicios-soberanos',
    folder: 'services/api',
    objective: 'Consolidar backend, orquestación API, observabilidad y seguridad operativa.',
    signals: [/api/i, /backend/i, /express/i, /prisma/i, /server/i],
  },
  {
    track: 'datos-y-forense',
    folder: 'packages/data-forensics',
    objective: 'Agrupar bookPI, ledgers, telemetría y evidencia de auditoría.',
    signals: [/bookpi/i, /datagit/i, /ledger/i, /forense/i, /analytics/i, /telemetry/i],
  },
  {
    track: 'docs-y-gobernanza',
    folder: 'docs/',
    objective: 'Versionar manifiestos, estándares, runbooks y playbooks de gobernanza.',
    signals: [/docs/i, /manifest/i, /playbook/i, /runbook/i, /policy/i],
  },
];

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

function buildHeaders() {
  const token = process.env.GITHUB_TOKEN;

  return {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'real-del-monte-explorer',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function fetchViaApi(profile: string): Promise<GithubRepo[]> {
  const all: GithubRepo[] = [];

  for (let page = 1; page <= 10; page += 1) {
    const response = await fetch(
      `https://api.github.com/users/${profile}/repos?per_page=100&sort=updated&page=${page}`,
      { headers: buildHeaders() },
    );

    if (!response.ok) {
      throw new Error(`GitHub API error ${response.status}`);
    }

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      break;
    }

    all.push(...data.map(asRepo));

    if (data.length < 100) {
      break;
    }
  }

  return Array.from(new Map(all.map((repo) => [repo.name, repo])).values());
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

function repoFingerprint(repo: GithubRepo): string {
  return `${repo.name} ${repo.description || ''} ${repo.topics.join(' ')}`.toLowerCase();
}

function findReposBySignals(repos: GithubRepo[], signals: RegExp[]): string[] {
  return repos
    .filter((repo) => signals.some((signal) => signal.test(repoFingerprint(repo))))
    .map((repo) => repo.name);
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
  return FEATURE_CATALOG.map((feature) => {
    const matchedRepos = findReposBySignals(repos, feature.repoSignals);
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

export function buildConsolidationPlan(
  repos: GithubRepo[],
  profile: string,
  targetRepo = 'tamv-digital-nexus',
): ConsolidationPlan {
  const tracks = CONSOLIDATION_TRACKS.map((track) => ({
    track: track.track,
    folder: track.folder,
    objective: track.objective,
    repos: findReposBySignals(repos, track.signals),
  }));

  const assigned = new Set(tracks.flatMap((track) => track.repos));
  const backlog = repos
    .map((repo) => repo.name)
    .filter((name) => !assigned.has(name))
    .sort((a, b) => a.localeCompare(b));

  return {
    profile,
    targetRepo,
    analyzedRepos: repos.length,
    generatedAt: new Date().toISOString(),
    migrationWaves: [
      {
        wave: 'wave-1-core',
        goal: 'Consolidar núcleo operativo sin romper producción.',
        tracks: tracks.filter((track) => ['kernel-civilizatorio', 'servicios-soberanos'].includes(track.track)),
      },
      {
        wave: 'wave-2-territorio-xr',
        goal: 'Integrar experiencia territorial, mapa, gemelo digital y contenido multimedia.',
        tracks: tracks.filter((track) => ['territorio-digital', 'datos-y-forense'].includes(track.track)),
      },
      {
        wave: 'wave-3-gobernanza',
        goal: 'Cerrar documentación, compliance y automatización operativa.',
        tracks: tracks.filter((track) => ['docs-y-gobernanza'].includes(track.track)),
      },
    ],
    backlog,
  };
}
