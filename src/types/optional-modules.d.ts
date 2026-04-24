declare module "mapbox-gl" {
  const mapboxgl: unknown;
  export default mapboxgl;
}

declare module "react-map-gl" {
  export const Map: unknown;
  export default Map;
}

declare module "@deck.gl/react" {
  export const DeckGL: unknown;
  export default DeckGL;
}

declare module "@deck.gl/layers" {
  export class ScatterplotLayer<TData = unknown> {
    constructor(props?: Record<string, unknown>);
  }
  export class IconLayer<TData = unknown> {
    constructor(props?: Record<string, unknown>);
  }
}

declare module "ioredis" {
  export default class Redis {
    constructor(url?: string);
    publish(channel: string, message: string): Promise<number>;
    subscribe(...channels: string[]): Promise<number>;
    on(event: "message", handler: (channel: string, message: string) => void): void;
  }
}

declare module "pg" {
  export class Pool {
    constructor(config?: Record<string, unknown>);
    query(sql: string, params?: unknown[]): Promise<{ rows: Array<Record<string, unknown>> }>;
  }
}
