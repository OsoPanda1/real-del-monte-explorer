import { Router } from 'express';
import { z } from 'zod';
import { AppError } from '../middleware/errorHandler';
import { federatedCoordinator } from '../lib/federatedOrchestrator';

const router = Router();

const clientUpdateSchema = z.object({
  clientId: z.string().min(1),
  sampleCount: z.number().int().positive(),
  weights: z.array(z.number()).min(1),
  loss: z.number().optional(),
  metrics: z.record(z.string(), z.number()).optional(),
});

const executeRoundSchema = z.object({
  modelId: z.string().min(1).default('tamv-isabella-base'),
  round: z.number().int().positive(),
  baseWeights: z.array(z.number()).min(1).optional(),
  updates: z.array(clientUpdateSchema).min(1),
  clipNorm: z.number().positive().optional(),
  minClients: z.number().int().positive().optional(),
});

router.get('/health', (_req, res) => {
  const models = federatedCoordinator.listModels();
  res.json({
    success: true,
    data: {
      status: 'ok',
      activeModels: models.length,
      models,
      timestamp: new Date().toISOString(),
    },
  });
});

router.get('/models/:modelId', (req, res, next) => {
  try {
    const modelId = req.params.modelId;
    const model = federatedCoordinator.getModel(modelId);

    if (!model) {
      throw new AppError(`Modelo federado no encontrado: ${modelId}`, 404);
    }

    res.json({
      success: true,
      data: model,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/round', (req, res, next) => {
  try {
    const payload = executeRoundSchema.parse(req.body);
    const result = federatedCoordinator.executeRound(payload);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }

    next(error);
  }
});

export default router;
