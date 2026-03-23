import { ChronusEngine, type PublishClient, type QueryableDb } from './engine/ChronusEngine';

const databaseUrl = process.env.DATABASE_URL;
const redisUrl = process.env.REDIS_URL;

const mockDb: QueryableDb = {
  async query() {
    return { rows: [{ activos: 0 }] };
  },
};

const mockPubSub: PublishClient = {
  async publish(channel: string, payload: string) {
    console.log(`[KERNEL:MOCK] ${channel}`, payload);
  },
};

if (!databaseUrl || !redisUrl) {
  console.warn('[KERNEL] DATABASE_URL y REDIS_URL no configurados. Se usará modo mock local.');
}

const chronus = new ChronusEngine(mockDb, mockPubSub);

setInterval(async () => {
  try {
    await chronus.calcularSaturacionZonal('centro_historico', {
      clima: 'despejado',
      eventos_activos: [],
      turistas_concurrentes: 0,
    });
  } catch (error) {
    console.error('[KERNEL] Error en ciclo de autopoiesis', error);
  }
}, 60_000);

console.log('[KERNEL] Chronus-Real activo en modo soberano edge-first.');
