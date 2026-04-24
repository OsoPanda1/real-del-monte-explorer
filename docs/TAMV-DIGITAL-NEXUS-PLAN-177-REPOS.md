# TAMV Digital Nexus — Plan maestro para unificar 177 repositorios

## Objetivo
Concentrar el ecosistema de `https://github.com/OsoPanda1` en un único repositorio operativo: `https://github.com/OsoPanda1/tamv-digital-nexus`, sin perder trazabilidad técnica, contexto histórico ni gobernanza.

## Estado actual detectado
- El backend ya incluye un analizador de ecosistema (`/api/v1/ecosystem/*`) para consultar repos y detectar brechas funcionales.
- El fetch anterior consultaba solo la primera página de GitHub (máximo 100 repos), por lo que no era suficiente para un universo de 177 repos.
- No existía un endpoint que transformara el inventario de repositorios en un plan de consolidación accionable por olas.

## Mejoras implementadas en esta iteración
1. **Paginación real de GitHub API** (hasta 10 páginas x 100 repos) con deduplicación por nombre.
2. **Soporte opcional para `GITHUB_TOKEN`** para reducir rate-limits en inventarios grandes.
3. **Generación automática de plan de consolidación** por olas (`wave-1`, `wave-2`, `wave-3`) y tracks técnicos.
4. **Nuevo endpoint `GET /api/v1/ecosystem/consolidation-plan`** para obtener una estrategia ejecutable hacia `tamv-digital-nexus`.

## Arquitectura de consolidación recomendada
```text
/apps
  /rdm-digital               # frontend territorial y experiencias XR
/services
  /api                       # backend soberano y orquestación
/packages
  /kernel                    # heptafederación y núcleo MD-X4
  /data-forensics            # BookPI, DataGit, telemetría y cadena de custodia
/docs                        # manifiestos, runbooks, compliance y gobernanza
```

## Olas de migración (propuesta)

### Wave 1 — Core operativo
- Kernel civilizatorio.
- Servicios backend críticos.
- CI/CD mínimo con build + test + healthchecks.

### Wave 2 — Territorio y forense
- Gemelo digital y mapas 2D/3D/XR.
- Evidencia técnica, telemetría y auditoría.

### Wave 3 — Gobernanza y cierre
- Documentación normativa, estándares y playbooks.
- Automatización y agentes operativos.

## Endpoint de trabajo
```bash
curl "http://localhost:3001/api/v1/ecosystem/consolidation-plan?profile=OsoPanda1&targetRepo=tamv-digital-nexus"
```

## Criterios de “repo ya unificado”
- Tiene carpeta objetivo asignada (`apps|services|packages|docs`).
- Cuenta con README migrado + enlace a origen histórico.
- Tiene test/build mínimos en CI.
- No rompe contratos API ni tipos compartidos.
- Queda registrado en ledger de migración (book de decisiones técnicas).

## Próximo paso sugerido
Ejecutar este endpoint diariamente y congelar en JSON el resultado (`/reports/ecosystem-plan-YYYY-MM-DD.json`) para gobernar el avance de unificación de manera auditable.
