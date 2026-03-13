import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

const THEMES = ['historia', 'cultura', 'gastronomia', 'ecoturismo'] as const;

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

    if (!THEMES.includes(slug as (typeof THEMES)[number])) {
      return res.status(404).json({ error: `Theme "${slug}" not found` });
    }

    const db = prisma as any;

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
      .map((event: any) => {
        const payload = {
          id: event.id,
          title: event.title,
          description: event.description,
          category: event.category,
          startsAt: event.startsAt,
          endsAt: event.endsAt,
          business: event.business,
          distanceKm: hasLocation ? distanceKm(lat, lon, event.latitude, event.longitude) : null,
        };

        return payload;
      })
      .sort((a: any, b: any) => {
        if (a.distanceKm === null && b.distanceKm === null) return 0;
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm;
      })
      .slice(0, 8);

    const normalizedBusinesses = businesses
      .map((business: any) => ({
        ...business,
        distanceKm:
          hasLocation && typeof business.latitude === 'number' && typeof business.longitude === 'number'
            ? distanceKm(lat, lon, business.latitude, business.longitude)
            : null,
      }))
      .sort((a: any, b: any) => {
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
