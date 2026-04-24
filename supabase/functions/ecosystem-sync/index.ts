// Edge function: fetches the public GitHub repos of the configured user, classifies
// them into ecosystem buckets and returns a normalized graph payload (nodes + edges).
// The function uses a short in-memory cache to avoid hitting the GitHub anonymous rate
// limit. In production, provide a GITHUB_TOKEN via Supabase secrets to raise the limit
// and to optionally include private repos.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GITHUB_USER = Deno.env.get("ECOSYSTEM_GITHUB_USER") ?? "OsoPanda1";
const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN") ?? "";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

type RepoRaw = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  archived: boolean;
  fork: boolean;
  private: boolean;
  topics?: string[];
  pushed_at: string;
  updated_at: string;
  created_at: string;
  size: number;
};

type EcosystemNode = {
  id: string;
  name: string;
  description: string;
  url: string;
  homepage: string | null;
  language: string | null;
  stars: number;
  category: CategoryId;
  topics: string[];
  pushedAt: string;
  updatedAt: string;
  archived: boolean;
  fork: boolean;
};

type CategoryId =
  | "tamv"
  | "rdm"
  | "ai"
  | "web"
  | "backend"
  | "data"
  | "iot"
  | "av"
  | "security"
  | "devops"
  | "docs"
  | "community"
  | "experiment"
  | "other";

const CATEGORY_PATTERNS: Array<{ id: CategoryId; re: RegExp }> = [
  { id: "tamv", re: /tamv|anubis|villase|mdx|md-?x|tamvonline|utamv/i },
  { id: "rdm", re: /real[-_ ]?del[-_ ]?monte|rdm|pueblo|minero|hidalgo|realito/i },
  { id: "ai", re: /\bai\b|\bagent\b|llm|gpt|chatbot|assistant|rag|ml-|mlops|genai/i },
  { id: "av", re: /avixa|audio|video|av[-_]|streaming|broadcast|media|omniverse/i },
  { id: "iot", re: /iot|sensor|esp32|arduino|raspberry|firmware|hardware|smart-?city/i },
  { id: "web", re: /nextjs|react|astro|frontend|landing|portal|hub|website|site|design-?system/i },
  { id: "backend", re: /api|server|gateway|microservice|graphql|fastapi|express|grpc|minter/i },
  { id: "data", re: /data|dataset|science|analytics|research|zenodo|orcid|citemesh/i },
  { id: "security", re: /auth|oauth|security|crypto|vault|sso|identity|sovereign/i },
  { id: "devops", re: /devops|k8s|kubernetes|docker|ci-?cd|terraform|infra|deploy|nexus/i },
  { id: "docs", re: /docs|documentation|blog|cms|content|wiki|readme|index-html/i },
  { id: "community", re: /community|social|network|chat|forum|group|loop|telegram|userbot/i },
  { id: "experiment", re: /test|demo|sandbox|poc|prototype|experiment|lab|dream|genesis|new-beg/i },
];

function classify(name: string, description: string | null, topics: string[]): CategoryId {
  const haystack = `${name} ${description ?? ""} ${topics.join(" ")}`.toLowerCase();
  for (const { id, re } of CATEGORY_PATTERNS) {
    if (re.test(haystack)) return id;
  }
  return "other";
}

let cached: { at: number; payload: unknown } | null = null;

async function fetchAllRepos(): Promise<RepoRaw[]> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.mercy-preview+json", // needed for topics
    "User-Agent": "tamv-rdm-ecosystem-sync",
  };
  if (GITHUB_TOKEN) headers.Authorization = `Bearer ${GITHUB_TOKEN}`;

  const all: RepoRaw[] = [];
  for (let page = 1; page <= 4; page++) {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=pushed&page=${page}`,
      { headers },
    );
    if (!res.ok) {
      throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
    }
    const chunk = (await res.json()) as RepoRaw[];
    all.push(...chunk);
    if (chunk.length < 100) break;
  }
  return all;
}

function buildGraph(repos: RepoRaw[]) {
  const nodes: EcosystemNode[] = repos
    .filter((r) => !r.fork) // drop external forks from the ecosystem view
    .map((r) => ({
      id: r.name,
      name: r.name,
      description: r.description ?? "",
      url: r.html_url,
      homepage: r.homepage,
      language: r.language,
      stars: r.stargazers_count,
      category: classify(r.name, r.description, r.topics ?? []),
      topics: r.topics ?? [],
      pushedAt: r.pushed_at,
      updatedAt: r.updated_at,
      archived: r.archived,
      fork: r.fork,
    }));

  // Edges: connect nodes that share at least one topic, or that share the same
  // category AND at least one meaningful keyword. Keep edge count bounded so
  // the force graph stays readable.
  const edges: Array<{ source: string; target: string; weight: number }> = [];
  const byTopic = new Map<string, string[]>();
  for (const n of nodes) {
    for (const t of n.topics) {
      if (!byTopic.has(t)) byTopic.set(t, []);
      byTopic.get(t)!.push(n.id);
    }
  }
  for (const [, ids] of byTopic) {
    if (ids.length < 2 || ids.length > 20) continue;
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        edges.push({ source: ids[i], target: ids[j], weight: 1 });
      }
    }
  }
  // Cap edges to the strongest 300 by weight just in case
  const top = edges.slice(0, 300);

  const counts: Record<CategoryId, number> = {
    tamv: 0, rdm: 0, ai: 0, web: 0, backend: 0, data: 0, iot: 0, av: 0,
    security: 0, devops: 0, docs: 0, community: 0, experiment: 0, other: 0,
  };
  for (const n of nodes) counts[n.category]++;

  return {
    user: GITHUB_USER,
    generatedAt: new Date().toISOString(),
    total: nodes.length,
    counts,
    nodes,
    edges: top,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const now = Date.now();
    if (cached && now - cached.at < CACHE_TTL_MS) {
      return new Response(JSON.stringify(cached.payload), {
        headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "HIT" },
      });
    }

    const repos = await fetchAllRepos();
    const payload = buildGraph(repos);
    cached = { at: now, payload };

    return new Response(JSON.stringify(payload), {
      headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "MISS" },
    });
  } catch (err) {
    console.error("ecosystem-sync error", err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Unknown error",
        hint: "If this is a GitHub rate limit, configure GITHUB_TOKEN as a Supabase secret.",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
