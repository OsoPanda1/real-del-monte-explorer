export interface FederatedClientUpdate {
  clientId: string;
  sampleCount: number;
  weights: number[];
  loss?: number;
  metrics?: Record<string, number>;
}

export interface FederatedRoundInput {
  modelId: string;
  round: number;
  baseWeights: number[];
  updates: FederatedClientUpdate[];
  clipNorm?: number;
  minClients?: number;
}

export interface FederatedRoundOutput {
  modelId: string;
  round: number;
  acceptedClients: string[];
  rejectedClients: string[];
  globalWeights: number[];
  meanLoss: number | null;
  convergenceDelta: number;
  updatedAt: string;
}

function l2norm(values: number[]): number {
  return Math.sqrt(values.reduce((acc, value) => acc + value * value, 0));
}

function clipByNorm(delta: number[], maxNorm: number): number[] {
  const norm = l2norm(delta);
  if (norm <= maxNorm || norm === 0) {
    return delta;
  }

  const scale = maxNorm / norm;
  return delta.map((value) => value * scale);
}

function isCompatibleShape(baseWeights: number[], clientWeights: number[]): boolean {
  return baseWeights.length === clientWeights.length && baseWeights.length > 0;
}

export function runFederatedAveraging(input: FederatedRoundInput): FederatedRoundOutput {
  const minClients = input.minClients ?? 3;
  const clipNorm = input.clipNorm ?? 10;

  const accepted = input.updates.filter(
    (update) => update.sampleCount > 0 && isCompatibleShape(input.baseWeights, update.weights),
  );

  const rejected = input.updates
    .filter((update) => !accepted.includes(update))
    .map((update) => update.clientId);

  if (accepted.length < minClients) {
    return {
      modelId: input.modelId,
      round: input.round,
      acceptedClients: accepted.map((u) => u.clientId),
      rejectedClients: rejected,
      globalWeights: [...input.baseWeights],
      meanLoss: null,
      convergenceDelta: 0,
      updatedAt: new Date().toISOString(),
    };
  }

  const totalSamples = accepted.reduce((acc, update) => acc + update.sampleCount, 0);
  const nextWeights = new Array(input.baseWeights.length).fill(0);
  let lossAccumulator = 0;
  let lossWeight = 0;

  for (const update of accepted) {
    const delta = update.weights.map((weight, index) => weight - input.baseWeights[index]);
    const clippedDelta = clipByNorm(delta, clipNorm);
    const factor = update.sampleCount / totalSamples;

    clippedDelta.forEach((value, index) => {
      nextWeights[index] += (input.baseWeights[index] + value) * factor;
    });

    if (typeof update.loss === 'number') {
      lossAccumulator += update.loss * update.sampleCount;
      lossWeight += update.sampleCount;
    }
  }

  const convergenceDelta = nextWeights
    .map((weight, index) => Math.abs(weight - input.baseWeights[index]))
    .reduce((acc, value) => acc + value, 0);

  return {
    modelId: input.modelId,
    round: input.round,
    acceptedClients: accepted.map((u) => u.clientId),
    rejectedClients: rejected,
    globalWeights: nextWeights,
    meanLoss: lossWeight > 0 ? lossAccumulator / lossWeight : null,
    convergenceDelta,
    updatedAt: new Date().toISOString(),
  };
}

interface ModelState {
  modelId: string;
  currentRound: number;
  weights: number[];
  lastResult?: FederatedRoundOutput;
}

export class FederatedCoordinator {
  private readonly models = new Map<string, ModelState>();

  upsertModel(modelId: string, initialWeights: number[]): ModelState {
    const existing = this.models.get(modelId);
    if (existing) return existing;

    const created: ModelState = {
      modelId,
      currentRound: 0,
      weights: [...initialWeights],
    };

    this.models.set(modelId, created);
    return created;
  }

  executeRound(input: Omit<FederatedRoundInput, 'baseWeights'> & { baseWeights?: number[] }): FederatedRoundOutput {
    const state = this.upsertModel(input.modelId, input.baseWeights ?? [0.1, 0.2, 0.3]);

    const payload: FederatedRoundInput = {
      ...input,
      baseWeights: input.baseWeights ?? state.weights,
    };

    const result = runFederatedAveraging(payload);

    state.currentRound = result.round;
    state.weights = [...result.globalWeights];
    state.lastResult = result;

    this.models.set(input.modelId, state);
    return result;
  }

  getModel(modelId: string): ModelState | null {
    return this.models.get(modelId) ?? null;
  }

  listModels(): Array<Pick<ModelState, 'modelId' | 'currentRound'>> {
    return Array.from(this.models.values()).map((state) => ({
      modelId: state.modelId,
      currentRound: state.currentRound,
    }));
  }
}

export const federatedCoordinator = new FederatedCoordinator();
