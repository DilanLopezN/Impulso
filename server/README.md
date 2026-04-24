# Impulso — Back-end

Estrutura inicial do back-end do Impulso. Apenas a base — nenhuma regra de
negócio do `README_BACKEND.md` foi implementada ainda. Este documento descreve
a arquitetura projetada a partir daquele checklist.

## Visão geral

O back-end é dividido em duas superfícies principais, comunicando-se via banco
relacional + fila/event bus:

```
                   ┌────────────────────────┐
   Mobile / Web ──▶│  api/  (NestJS+Fastify)│──┐
                   │  TypeScript            │  │  enqueue
                   └──────────┬─────────────┘  │  jobs/events
                              │ SQL            ▼
                       ┌──────┴───────┐   ┌──────────────┐
                       │  PostgreSQL  │◀──│   Redis /    │
                       │              │   │   NATS       │
                       └──────┬───────┘   └──────┬───────┘
                              │ SQL              │ consume
                              ▼                  ▼
                       ┌────────────────────────────────┐
                       │ workers/  (Go)                 │
                       │ XP/streak recompute, ranking   │
                       │ snapshots, sync reconciliation │
                       └────────────────────────────────┘
```

### `api/` — NestJS + Fastify + TypeScript

API principal exposta para clientes (mobile, futuras versões web/admin).
Responsável por:

- Autenticação e sessão.
- CRUD de domínio (metas, hábitos, marcos, perfil).
- Endpoints de sincronização offline/online (`/sync/push`, `/sync/pull`,
  `/sync/state`).
- Validação, autorização e contratos OpenAPI.
- Publicação de eventos de domínio para a fila.

Stack: NestJS sobre Fastify (HTTP rápido, baixo overhead), TypeScript estrito,
módulos por contexto (`auth`, `goals`, `habits`, `gamification`, `leaderboard`,
`sync`, `notifications`, `analytics`).

### `workers/` — Go

Serviços de processamento pesado/rápido, fora do caminho da requisição HTTP.
Responsáveis por:

- Recomputação determinística de XP/streak a partir do `event_log`.
- Snapshots periódicos de ranking (semanal/mensal/geral).
- Reconciliação de operações da outbox e resolução de conflitos.
- Jobs de fechamento diário (timezone-aware).
- Tarefas batch com alto throughput (Go > Node para CPU-bound).

Comunicam-se com a API exclusivamente via banco e fila — sem HTTP interno.

### `contracts/`

Contratos compartilhados entre clientes e back-end (OpenAPI, schemas de
eventos). Fonte única de verdade para tipos publicados.

## Diretórios

```
server/
├── api/              # NestJS + Fastify + TypeScript
├── workers/          # Go (heavy/fast processing)
├── contracts/        # OpenAPI / event schemas
├── docker-compose.yml
└── README.md
```

## Mapeamento de módulos (referência ao `README_BACKEND.md` §5.1)

| Módulo          | Onde vive                          |
|-----------------|------------------------------------|
| `auth`          | `api/`                             |
| `goals`         | `api/`                             |
| `habits`        | `api/`                             |
| `gamification`  | `api/` (escrita) + `workers/` (recompute) |
| `leaderboard`   | `api/` (leitura) + `workers/` (snapshots) |
| `sync`          | `api/` (push/pull) + `workers/` (reconciliação) |
| `notifications` | `workers/`                         |
| `analytics`     | `workers/`                         |

## Subir o ambiente local

```bash
docker compose up -d           # Postgres + Redis
cd api && npm install && npm run start:dev
cd workers && go run ./cmd/worker
```
