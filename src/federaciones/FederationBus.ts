import { supabaseAdmin } from '../integrations/supabase/admin';

export enum Federacion {
  HOSPEDAJE = 'FED_HOSPEDAJE',
  GASTRONOMIA = 'FED_GASTRONOMIA',
  MINERIA_PLATERIA = 'FED_PLATERIA',
  TURISMO_ACTIVO = 'FED_TURISMO',
  MOVILIDAD = 'FED_MOVILIDAD',
  COMERCIO_LOCAL = 'FED_COMERCIO',
  GOBIERNO_DIGITAL = 'FED_GOBIERNO',
}

interface CheckInPayload {
  turistaId: string;
  hotelId: string;
  noches: number;
}

export class FederationBus {
  private readonly subscriber: Redis;
  private readonly publisher: Redis;

  constructor(redisUrl = process.env.REDIS_URL) {
    if (!redisUrl) {
      throw new Error('REDIS_URL no está configurada para FederationBus');
    }

    this.subscriber = new Redis(redisUrl);
    this.publisher = new Redis(redisUrl);
    this.initListeners();
  }

  private initListeners() {
    const channels = ['CHECKIN_HOSPEDAJE', 'LSM_REALTIME_STREAM', 'SOVEREIGNTY_ALERTS'];

    this.subscriber.subscribe(...channels).catch((err) => {
      console.error('CRITICAL: Error en Kernel de Federación', err);
    });

    this.subscriber.onMessage(async (channel, message) => {
      try {
        const data = JSON.parse(message);

        switch (channel) {
          case 'CHECKIN_HOSPEDAJE':
            await this.handleCheckIn(data as CheckInPayload);
            break;
          case 'LSM_REALTIME_STREAM':
            console.log('[LSM] Stream de telemetría procesado');
            break;
          default:
            break;
        }
      } catch (error) {
        console.error(`[BUS] Error procesando canal ${channel}:`, error);
      }
    });
  }

  private async handleCheckIn(payload: CheckInPayload) {
    console.log(`[FEDERACION] Ejecutando Protocolo de Retención. Turista: ${payload.turistaId}`);

    const oferta = await this.generarOfertaGastronomica(payload.hotelId);

    const registro = {
      author_name: 'federation-bus',
      title: `Cross-sell ${payload.turistaId}`,
      content: JSON.stringify({
        origen_federacion: Federacion.HOSPEDAJE,
        destino_federacion: Federacion.GASTRONOMIA,
        tipo_evento: 'cross_sell_automatico',
        valor_estimado_mxn: payload.noches * 250,
        metadata: {
          hotelId: payload.hotelId,
          oferta,
          protocol: 'EOCT-KERNEL-B',
        },
      }),
    };

    const { error } = await supabaseAdmin.from('forum_posts').insert(registro);
    if (error) console.error('Error en Ledger de Plusvalía:', error);

    await this.publisher.publish(
      'REALITO_TRIGGER',
      JSON.stringify({
        turistaId: payload.turistaId,
        triggerType: 'BIENVENIDA_CON_OFERTA',
        ofertaData: oferta,
      }),
    );
  }

  private async generarOfertaGastronomica(hotelId: string) {
    return {
      origenHotel: hotelId,
      restaurante: 'Paste_Minero_Reserva',
      descuento: '15%',
      vence_en_mins: 120,
      premium: true,
    };
  }

  public async emitSovereigntyEvent(type: string, details: unknown) {
    await this.publisher.publish(
      'SOVEREIGNTY_ALERTS',
      JSON.stringify({
        type,
        details,
        timestamp: Date.now(),
      }),
    );
  }
}
