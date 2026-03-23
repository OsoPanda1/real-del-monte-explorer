# Real del Monte Explorer

Plataforma web para promover turismo, cultura y servicios de Real del Monte, con experiencia conversacional de **REALITO AI**.

## Documentación clave

- Base integrada de IA (**ISABELLA AI™ v4.0 Enterprise + TAMV**):
  - `docs/REALITO-ISABELLA-TAMV-ENTERPRISE.md`
- Componente de chat REALITO:
  - `src/components/RealitoChat.tsx`
- Perfil base TAMV utilizado por REALITO:
  - `src/features/ai/isabellaTamvBase.ts`

## Desarrollo local

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Análisis de ecosistema GitHub

Se agregó un módulo backend para analizar repos de un perfil y generar un reporte de brechas funcionales:

- `GET /api/v1/ecosystem/repos?profile=OsoPanda1`
- `GET /api/v1/ecosystem/gap-report?profile=OsoPanda1`

Esto permite priorizar implementaciones en RDM basadas en señales de repositorios relacionados del ecosistema TAMV.
