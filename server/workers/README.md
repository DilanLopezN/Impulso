# `workers/` — Impulso Background Workers

Serviços de processamento pesado/rápido em **Go**. Vivem fora do caminho da
requisição HTTP da API e consomem trabalho via banco e fila.

Apenas a base mínima foi criada: bootstrap, configuração via env e um servidor
HTTP de health check. Nenhum job real foi implementado.

## Comandos

```bash
go run ./cmd/worker
go build ./...
go test ./...
```

Health check: `GET http://localhost:8080/health`.

## Estrutura prevista

```
workers/
├── cmd/
│   └── worker/main.go               # ✅ entrypoint (composição de jobs)
├── internal/
│   ├── config/                      # ✅ env loader
│   ├── httpserver/                  # ✅ health/metrics
│   ├── jobs/
│   │   ├── xprecompute/             # 🚧 recompute determinístico de XP
│   │   ├── leaderboard/             # 🚧 snapshots de ranking
│   │   ├── syncreconcile/           # 🚧 reconciliação outbox
│   │   └── dailyclose/              # 🚧 fechamento diário (timezone-aware)
│   ├── storage/                     # 🚧 repositórios (postgres)
│   └── queue/                       # 🚧 cliente da fila (redis/nats)
└── go.mod
```
