import Redis from 'ioredis';
import { supabaseAdmin } from '../integrations/supabase/admin';

// Enumeración de las 7 Federaciones para asegurar integridad
export enum Federacion {
  HOSPEDAJE = 'FED_HOSPEDAJE',
  GASTRONOMIA = 'FED_GASTRONOMIA',
  MINERIA_PLATERIA = 'FED_PLATERIA',
  TURISMO_ACTIVO = 'FED_TURISMO',
  MOVILIDAD = 'FED_MOVILIDAD',
  COMERCIO_LOCAL = 'FED_COMERCIO',
  GOBIERNO_DIGITAL = 'FED_GOBIERNO'
}

interface CheckInPayload {
  turistaId: string;
  hotelId: string;
  noches: number;
}

interface CrossFedEvent {
  origen: Federacion;
  destino: Federacion;
  payload: any;
}

export class FederationBus {
  private readonly subscriber: Redis;
  private readonly publisher: Redis;

  constructor(redisUrl = process.env.REDIS_URL) {
    if (!redisUrl) {
      throw new Error('REDIS_URL no está configurada para FederationBus');
    }

    // Configuración con reintentos para evitar caídas en el stream
    const redisConfig = {
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => Math.min(times * 50, 2000),
    };

    this.subscriber = new Redis(redisUrl, redisConfig);
    this.publisher = new Redis(redisUrl, redisConfig);
    this.initListeners();
  }

  private initListeners() {
    // Suscripción masiva a canales críticos de la federación
    const channels = [
      'CHECKIN_HOSPEDAJE', 
      'LSM_REALTIME_STREAM', 
      'SOVEREIGNTY_ALERTS'
    ];

    this.subscriber.subscribe(...channels, (err) => {
      if (err) {
        console.error('CRITICAL: Error en Kernel de Federación', err);
      }
    });

    this.subscriber.on('message', async (channel, message) => {
      try {
        const data = JSON.parse(message);
        
        switch (channel) {
          case 'CHECKIN_HOSPEDAJE':
            await this.handleCheckIn(data as CheckInPayload);
            break;
          case 'LSM_REALTIME_STREAM':
            // Sincronización con el LSMRenderEngine que vimos antes
            console.log('[LSM] Stream de telemetría procesado');
            break;
        }
      } catch (error) {
        console.error(`[BUS] Error procesando canal ${channel}:`, error);
      }
    });
  }

  /**
   * Lógica de Plusvalía Cruzada: Hospedaje -> Gastronomía
   */
  private async handleCheckIn(payload: CheckInPayload) {
    console.log(`[FEDERACION] Ejecutando Protocolo de Retención. Turista: ${payload.turistaId}`);

    const oferta = await this.generarOfertaGastronomica(payload.hotelId);

    // Registro en Supabase con esquema de "Plusvalía Federada"
    const { error } = await supabaseAdmin.from('plusvalia_tracker').insert({
      origen_federacion: Federacion.HOSPEDAJE,
      destino_federacion: Federacion.GASTRONOMIA,
      tipo_evento: 'cross_sell_automatico',
      valor_estimado_mxn: payload.noches * 250, // Factor de retención estimado
      metadata: { 
        hotelId: payload.hotelId, 
        oferta,
        protocol: 'EOCT-KERNEL-B' 
      },
    });

    if (error) console.error('Error en Ledger de Plusvalía:', error);

    // Disparo a Realito AI para la entrega de la oferta en la interfaz del usuario
    await this.publisher.publish(
      'REALITO_TRIGGER',
      JSON.stringify({
        turistaId: payload.turistaId,
        triggerType: 'BIENVENIDA_CON_OFERTA',
        timestamp: new Date().toISOString(),
        ofertaData: oferta,
        visualStyle: 'CRYSTAL_GLOW' // Instrucción para el frontend
      }),
    );
  }

  private async generarOfertaGastronomica(hotelId: string) {
    // Aquí podrías conectar con una DB para traer restaurantes Platinum cercanos
    return {
      origenHotel: hotelId,
      restaurante: 'Paste_Minero_Reserva',
      descuento: '15%',
      vence_en_mins: 120,
      premium: true
    };
  }

  /**
   * Método para emitir eventos de soberanía digital (Defensa/Alertas)
   */
  public async emitSovereigntyEvent(type: string, details: any) {
    await this.publisher.publish('SOVEREIGNTY_ALERTS', JSON.stringify({
      type,
      details,
      timestamp: Date.now()
    }));
  }
}
