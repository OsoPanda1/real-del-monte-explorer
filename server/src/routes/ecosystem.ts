import { Router } from 'express';
import { z } from 'zod';
import { buildEcosystemGaps, fetchEcosystemRepos } from '../lib/ecosystemAnalyzer';
import { AppError } from '../middleware/errorHandler';

const router = Router();

const ecosystemQuerySchema = z.object({
  profile: z.string().min(1).default('OsoPanda1'),
  includeForks: z.coerce.boolean().optional().default(false),
  includeArchived: z.coerce.boolean().optional().default(false),
});

function filterRepos<T extends { fork: boolean; archived: boolean }>(
  repos: T[],
  includeForks: boolean,
  includeArchived: boolean,
): T[] {
  return repos.filter((repo) => {
    if (!includeForks && repo.fork) return false;
    if (!includeArchived && repo.archived) return false;
    return true;
  });
}

router.get('/repos', async (req, res, next) => {
  try {
    const { profile, includeForks, includeArchived } = ecosystemQuerySchema.parse(req.query);
    const repos = await fetchEcosystemRepos(profile);
    const filtered = filterRepos(repos, includeForks, includeArchived);

    res.json({
      success: true,
      data: {
        profile,
        total: filtered.length,
        repos: filtered,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
});

router.get('/gap-report', async (req, res, next) => {
  try {
    const { profile, includeForks, includeArchived } = ecosystemQuerySchema.parse(req.query);
    const repos = await fetchEcosystemRepos(profile);
    const filtered = filterRepos(repos, includeForks, includeArchived);
    const gaps = buildEcosystemGaps(filtered);

    res.json({
      success: true,
      data: {
        profile,
        totalReposAnalizados: filtered.length,
        reposFuente: filtered.map((repo) => repo.name),
        resumen: {
          presentes: gaps.filter((gap) => gap.status === 'present').length,
          faltantes: gaps.filter((gap) => gap.status === 'missing').length,
        },
        gaps,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
});

export default router;
