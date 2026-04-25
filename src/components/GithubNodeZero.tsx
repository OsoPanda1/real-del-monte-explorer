import { ExternalLink, GitFork, Github, RefreshCcw, Star, Users } from 'lucide-react';
import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useGithubNodeZero } from '@/features/github';

const PROFILE_URL = 'https://github.com/OsoPanda1';

const formatter = new Intl.NumberFormat('es-MX');

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

export default function GithubNodeZero() {
  const { data, isLoading, isError, error, refetch, isFetching } = useGithubNodeZero('OsoPanda1');

  const topLanguages = useMemo(() => {
    if (!data?.repos?.length) return [];

    const accumulator = new Map<string, number>();
    data.repos.forEach((repo) => {
      if (!repo.language) return;
      accumulator.set(repo.language, (accumulator.get(repo.language) ?? 0) + 1);
    });

    return Array.from(accumulator.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [data?.repos]);

  if (isLoading) {
    return (
      <section className="rounded-3xl border bg-card p-6 md:p-8 shadow-sm animate-pulse">
        <div className="h-6 w-52 rounded bg-muted mb-4" />
        <div className="h-14 rounded bg-muted mb-3" />
        <div className="h-24 rounded bg-muted" />
      </section>
    );
  }

  if (isError || !data) {
    return (
      <section className="rounded-3xl border bg-card p-6 md:p-8 shadow-sm space-y-3">
        <Badge variant="destructive">No se pudo cargar Node Zero</Badge>
        <p className="text-sm text-muted-foreground">{error instanceof Error ? error.message : 'Sin respuesta de GitHub'}</p>
        <Button onClick={() => refetch()} variant="outline" size="sm">Reintentar</Button>
      </section>
    );
  }

  const { profile, repos, totals } = data;

  return (
    <section className="rounded-3xl border bg-card p-6 md:p-8 shadow-sm space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge className="bg-slate-900 text-white border-slate-800">Nodo Cero · GitHub Database Vivo</Badge>
          <h3 className="text-2xl md:text-3xl font-bold mt-3 flex items-center gap-2">
            <Github className="w-7 h-7" />
            Perfil maestro de {profile.login}
          </h3>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Esta sección usa el perfil como fuente primaria para mantener RDM Digital sincronizado y en mejora continua.
          </p>
        </div>

        <Button asChild>
          <a href={PROFILE_URL} target="_blank" rel="noreferrer">
            Ver perfil
            <ExternalLink className="w-4 h-4 ml-2" />
          </a>
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border bg-background p-4">
          <p className="text-xs text-muted-foreground uppercase">Repos públicos</p>
          <p className="text-2xl font-bold mt-1">{formatter.format(profile.public_repos)}</p>
        </div>
        <div className="rounded-xl border bg-background p-4">
          <p className="text-xs text-muted-foreground uppercase">Seguidores</p>
          <p className="text-2xl font-bold mt-1 flex items-center gap-2"><Users className="w-4 h-4" />{formatter.format(profile.followers)}</p>
        </div>
        <div className="rounded-xl border bg-background p-4">
          <p className="text-xs text-muted-foreground uppercase">Estrellas agregadas</p>
          <p className="text-2xl font-bold mt-1 flex items-center gap-2"><Star className="w-4 h-4" />{formatter.format(totals.stars)}</p>
        </div>
        <div className="rounded-xl border bg-background p-4">
          <p className="text-xs text-muted-foreground uppercase">Forks agregados</p>
          <p className="text-2xl font-bold mt-1 flex items-center gap-2"><GitFork className="w-4 h-4" />{formatter.format(totals.forks)}</p>
        </div>
      </div>

      <article className="rounded-2xl border bg-background p-4 md:p-5">
        <div className="flex items-center gap-3 mb-3">
          <img src={profile.avatar_url} alt={`Avatar de ${profile.login}`} className="w-12 h-12 rounded-full border object-cover" loading="lazy" />
          <div>
            <p className="font-semibold">{profile.name || profile.login}</p>
            <p className="text-xs text-muted-foreground">Última actualización detectada: {formatDate(profile.updated_at)}</p>
          </div>
        </div>
        {profile.bio && <p className="text-sm text-muted-foreground">{profile.bio}</p>}
      </article>

      <div className="space-y-3">
        <h4 className="font-semibold">Repositorios más recientes (no forks)</h4>
        <div className="grid md:grid-cols-2 gap-3">
          {repos.map((repo) => (
            <a
              key={repo.id}
              href={repo.html_url}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border bg-background p-4 hover:border-primary/60 transition-colors"
            >
              <p className="font-medium">{repo.name}</p>
              {repo.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{repo.description}</p>}
              <div className="flex flex-wrap gap-2 mt-3 text-xs text-muted-foreground">
                {repo.language && <Badge variant="secondary">{repo.language}</Badge>}
                <span>★ {formatter.format(repo.stargazers_count)}</span>
                <span>Forks {formatter.format(repo.forks_count)}</span>
              </div>
            </a>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {topLanguages.map(([language, count]) => (
          <Badge key={language} variant="outline">{language} · {count}</Badge>
        ))}
      </div>

      <p className="text-xs text-muted-foreground flex items-center gap-2">
        <RefreshCcw className={`w-3 h-3 ${isFetching ? 'animate-spin' : ''}`} />
        Auto-sync cada 15 minutos desde GitHub API.
      </p>
    </section>
  );
}
