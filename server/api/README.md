# `api/` — Impulso HTTP API

API principal do Impulso. **NestJS sobre Fastify**, TypeScript estrito.

Apenas a base mínima foi criada: bootstrap, módulo raiz e um health check.
Nenhum módulo de domínio (`auth`, `goals`, `habits`, etc.) foi implementado.

## Comandos

```bash
npm install
npm run start:dev      # hot reload na porta 3000
npm run typecheck
npm run build
```

Health check: `GET http://localhost:3000/health`.

## Estrutura prevista

```
src/
├── main.ts                  # bootstrap (Fastify adapter)
├── app.module.ts            # módulo raiz
├── config/                  # carregamento de config/env
└── modules/
    ├── health/              # ✅ implementado
    ├── auth/                # 🚧 pendente
    ├── goals/               # 🚧 pendente
    ├── habits/              # 🚧 pendente
    ├── gamification/        # 🚧 pendente
    ├── leaderboard/         # 🚧 pendente
    ├── sync/                # 🚧 pendente
    ├── notifications/       # 🚧 pendente
    └── analytics/           # 🚧 pendente
```
