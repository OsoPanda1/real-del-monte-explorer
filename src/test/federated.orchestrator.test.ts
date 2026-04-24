import { describe, expect, it } from 'vitest';
import { runFederatedAveraging } from '@/core/federated/FederatedLearningOrchestrator';

describe('runFederatedAveraging', () => {
  it('calcula FedAvg ponderado por sampleCount', () => {
    const result = runFederatedAveraging({
      round: 1,
      baseWeights: [1, 1],
      minClients: 2,
      updates: [
        { clientId: 'A', sampleCount: 10, weights: [1.2, 1.1], loss: 0.2 },
        { clientId: 'B', sampleCount: 30, weights: [1.4, 1.3], loss: 0.1 },
      ],
    });

    expect(result.acceptedClients).toEqual(['A', 'B']);
    expect(result.rejectedClients).toEqual([]);
    expect(result.globalWeights[0]).toBeCloseTo(1.35, 3);
    expect(result.globalWeights[1]).toBeCloseTo(1.25, 3);
    expect(result.meanLoss).toBeCloseTo(0.125, 3);
    expect(result.convergenceDelta).toBeGreaterThan(0);
  });

  it('rechaza ronda si no alcanza clientes mínimos', () => {
    const result = runFederatedAveraging({
      round: 2,
      baseWeights: [2, 2],
      minClients: 3,
      updates: [{ clientId: 'A', sampleCount: 10, weights: [2.1, 2.1], loss: 0.4 }],
    });

    expect(result.globalWeights).toEqual([2, 2]);
    expect(result.meanLoss).toBeNull();
    expect(result.convergenceDelta).toBe(0);
  });

  it('rechaza updates con shape inválido', () => {
    const result = runFederatedAveraging({
      round: 3,
      baseWeights: [1, 2, 3],
      minClients: 1,
      updates: [
        { clientId: 'invalid', sampleCount: 4, weights: [1, 2] },
        { clientId: 'valid', sampleCount: 2, weights: [1.1, 1.9, 3.1] },
      ],
    });

    expect(result.acceptedClients).toEqual(['valid']);
    expect(result.rejectedClients).toEqual(['invalid']);
  });
});
