import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

const THEMES = ['historia', 'cultura', 'gastronomia', 'ecoturismo'] as const;
type ThemeSlug = (typeof THEMES)[number];

interface ExploreBusiness {
  id: string;
  name: string;
  category: string;
  description: string;
  address: string | null;
  phone: string | null;
  imageUrl: string | null;
  isPremium: boolean;
  latitude: number | null;
  longitude: number | null;
}

interface ExploreEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  startsAt: Date;
  endsAt: Date;
  latitude: number;
  longitude: number;
  business: Omit<ExploreBusiness, 'latitude' | 'longitude'> | null;
}

interface ExploreRoute {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  type: string | null;
  stops: Array<{
    id: string;
    name: string;
    order: number;
    latitude: number;
    longitude: number;
    description: string | null;
  }>;
}

interface ExploreSection {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  blocks: Array<{
    id: string;
    title: string;
    subtitle: string | null;
    body: string;
    order: number;
    recommendations: Array<{
      id: string;
      order: number;
      reason: string | null;
      business: ExploreBusiness;
    }>;
  }>;
}

interface ExplorePrisma {
  contentSection: {
    findFirst: (args: object) => Promise<ExploreSection | null>;
  };
  route: {
    findMany: (args: object) => Promise<ExploreRoute[]>;
  };
  business: {
    findMany: (args: object) => Promise<ExploreBusiness[]>;
  };
  liveEvent: {
    findMany: (args: object) => Promise<ExploreEvent[]>;
  };
}

function isThemeSlug(value: string): value is ThemeSlug {
  return THEMES.includes(value as ThemeSlug);
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

router.get('/theme/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);
    const hasLocation = Number.isFinite(lat) && Number.isFinite(lon);

    if (!isThemeSlug(slug)) {
      return res.status(404).json({ error: `Theme "${slug}" not found` });
    }

    const db = prisma as unknown as ExplorePrisma;

    const section = await db.contentSection.findFirst({
      where: { slug, isActive: true },
      include: {
        blocks: {
          orderBy: { order: 'asc' },
          include: {
            recommendations: {
              orderBy: { order: 'asc' },
              include: {
                business: {
                  select: {
                    id: true,
                    name: true,
                    category: true,
                    description: true,
                    address: true,
                    phone: true,
                    imageUrl: true,
                    isPremium: true,
                    latitude: true,
                    longitude: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const now = new Date();
    const [routes, businesses, events] = await Promise.all([
      db.route.findMany({
        where: { isActive: true, type: slug },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { stops: true },
      }),
      db.business.findMany({
        where: { isActive: true },
        orderBy: [{ isPremium: 'desc' }, { createdAt: 'desc' }],
        take: 12,
      }),
      db.liveEvent.findMany({
        where: { startsAt: { lte: now }, endsAt: { gte: now } },
        include: {
          business: {
            select: {
              id: true,
              name: true,
              category: true,
              description: true,
              address: true,
              phone: true,
              imageUrl: true,
              isPremium: true,
            },
          },
        },
      }),
    ]);

    const normalizedEvents = events
      .map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        category: event.category,
        startsAt: event.startsAt,
        endsAt: event.endsAt,
        business: event.business,
        distanceKm: hasLocation ? distanceKm(lat, lon, event.latitude, event.longitude) : null,
      }))
      .sort((a, b) => {
        if (a.distanceKm === null && b.distanceKm === null) return 0;
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm;
      })
      .slice(0, 8);

    const normalizedBusinesses = businesses
      .map((business) => ({
        ...business,
        distanceKm:
          hasLocation && typeof business.latitude === 'number' && typeof business.longitude === 'number'
            ? distanceKm(lat, lon, business.latitude, business.longitude)
            : null,
      }))
      .sort((a, b) => {
        if (a.distanceKm === null && b.distanceKm === null) return 0;
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm;
      })
      .slice(0, 6);

    return res.json({
      section,
      routes,
      businesses: normalizedBusinesses,
      liveEvents: normalizedEvents,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
