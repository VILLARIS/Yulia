# BIOQUÍMICA NUTRICIONAL

Simulador conversacional educativo para Bioquímica aplicada a la Nutrición.

## Estado

Fase 1 completada: arquitectura del monorepo, aplicación React/Vite, API Express, sistema visual, contratos de rutas, configuración de entorno y esquema PostgreSQL inicial.

Las funciones académicas, integración con OpenAI, persistencia activa, autenticación y supervisión se implementarán en las fases posteriores. La interfaz marca esas áreas como pendientes y no las presenta como terminadas.

## Estructura

```text
apps/
  web/       Frontend React + Vite + Tailwind CSS
  api/       Backend Node.js + Express
packages/
  shared/    Contratos y datos configurables compartidos
database/
  migrations/ Esquema PostgreSQL versionado
docs/        Arquitectura y decisiones del proyecto
```

## Requisitos

- Node.js 20 o superior
- pnpm 9 o superior
- PostgreSQL 15 o superior

## Inicio local

1. Copie `.env.example` como `.env` y complete las variables.
2. Ejecute `pnpm install`.
3. Ejecute `pnpm dev`.
4. Abra `http://localhost:5173`.

La clave de OpenAI se usa exclusivamente en el backend. Nunca debe utilizarse en variables prefijadas con `VITE_`.

## Verificación

```bash
pnpm check
```

