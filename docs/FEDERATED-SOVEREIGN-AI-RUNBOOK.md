# Federated Sovereign AI Runbook (TAMV MD X4)

## Objetivo
Alinear el núcleo TAMV con prácticas modernas de **federated learning** (inspiradas en FATE, TFF y librerías empresariales) sin ceder soberanía de datos.

## Implementación entregada
- `src/core/federated/FederatedLearningOrchestrator.ts`
  - Agregación tipo FedAvg ponderada por `sampleCount`.
  - Rechazo de updates inválidos por shape de pesos.
  - Control mínimo de calidad por `minClients`.
  - Clipping por norma L2 para reducir deriva y atenuar outliers.
- Tests en `src/test/federated.orchestrator.test.ts`.

## Patrón de operación recomendado
1. Cada nodo territorial entrena localmente (nunca exporta dataset crudo).
2. Solo envía `weights` + `sampleCount` + `loss`.
3. El agregador central (o comité federado) ejecuta `runFederatedAveraging`.
4. El modelo global se redistribuye a nodos autorizados.

## Endurecimiento para producción (siguiente iteración)
1. Firmas criptográficas de updates por nodo (`clientId` + nonce + timestamp).
2. Differential Privacy en gradientes (noise calibration).
3. Secure aggregation multi-party.
4. SLOs de entrenamiento federado (latencia ronda, tasa de rechazo, convergencia).
