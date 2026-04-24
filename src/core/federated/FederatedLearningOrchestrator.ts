export interface FederatedClientUpdate {
  clientId: string;
  sampleCount: number;
  weights: number[];
  loss?: number;
  metrics?: Record<string, number>;
}

export interface FederatedRoundInput {
  round: number;
  baseWeights: number[];
  updates: FederatedClientUpdate[];
  clipNorm?: number;
  minClients?: number;
}

export interface FederatedRoundOutput {
  round: number;
  acceptedClients: string[];
  rejectedClients: string[];
  globalWeights: number[];
  meanLoss: number | null;
  convergenceDelta: number;
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
      round: input.round,
      acceptedClients: accepted.map((u) => u.clientId),
      rejectedClients: rejected,
      globalWeights: [...input.baseWeights],
      meanLoss: null,
      convergenceDelta: 0,
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
    round: input.round,
    acceptedClients: accepted.map((u) => u.clientId),
    rejectedClients: rejected,
    globalWeights: nextWeights,
    meanLoss: lossWeight > 0 ? lossAccumulator / lossWeight : null,
    convergenceDelta,
  };
}
