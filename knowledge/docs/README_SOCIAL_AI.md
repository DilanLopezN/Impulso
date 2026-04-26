# Impulso Social — Guia de Arquitetura Node.js + Go (tutorial para I.A.)

Este documento foi criado para orientar uma I.A. (ou time técnico) a evoluir o Impulso de app de metas/hábitos para uma plataforma com funcionalidades de rede social.

Baseado no estado atual:
- `server/api` usa NestJS + Fastify (Node/TypeScript) para API de produto.
- `server/workers` usa Go para processamento assíncrono pesado.
- O app mobile (React Native) já está integrado com auth/sessões/metas e preparado para expansão.

---

## 1) Regra-mãe para dividir responsabilidades

### Coloque em **Node.js (API)** quando:
1. Está no caminho da requisição do usuário (latência baixa de UX).
2. Precisa de iteração rápida de produto (novas rotas, validações, experimentos).
3. É CRUD/transação de domínio com regras de autorização.
4. Precisa compartilhar contratos e tipagem com front com mínimo atrito.

### Coloque em **Go (Workers/Serviços de processamento)** quando:
1. É processamento em lote, contínuo ou assíncrono.
2. É CPU-bound, fan-out grande, ou precisa throughput alto.
3. Pode rodar fora do request/response sem prejudicar UX imediata.
4. Depende de recomputação determinística (rankings, score, anti-fraude, agregações).

---

## 2) Mapeamento recomendado para uma camada social

## 2.1 Node.js (NestJS/Fastify) — “produto online”

Implementar no `server/api`:

1. **Social Graph (seguidores/seguidos/amigos)**
   - `POST /social/follow/:userId`
   - `DELETE /social/follow/:userId`
   - `GET /social/followers/:userId`
   - `GET /social/following/:userId`
   - Motivo: regra de permissão/bloqueio/privacidade no request.

2. **Feed write path (criação de post/atividade)**
   - `POST /feed/posts` (texto, mídia, visibilidade)
   - `PATCH /feed/posts/:id`
   - `DELETE /feed/posts/:id`
   - Motivo: UX imediata + validação de payload.

3. **Interações rápidas (like, comentário, salvar, reportar)**
   - `POST /feed/posts/:id/like`
   - `DELETE /feed/posts/:id/like`
   - `POST /feed/posts/:id/comments`
   - `POST /moderation/reports`
   - Motivo: resposta síncrona, idempotência e autorização.

4. **Perfis sociais e privacidade**
   - `PATCH /users/me/privacy`
   - `PATCH /users/me/profile`
   - Motivo: configurações do usuário e políticas de visibilidade.

5. **Notificações de produto (orquestração)**
   - criar evento de domínio no Node; entrega pesada em Go.

6. **API de leitura com SLA de UX**
   - timeline personalizada via cache/materialized views prontas.
   - Node consulta dados já pré-computados por Go.

## 2.2 Go (workers) — “motor de escala e consistência”

Implementar no `server/workers`:

1. **Fan-out do feed**
   - Consumir evento `POST_CREATED`.
   - Construir distribuição para seguidores e inbox de feed.
   - Estratégias: fan-out on write para perfis médios + fallback on read para contas gigantes.

2. **Ranking social e trending**
   - Recalcular score por janela (1h, 24h, 7d).
   - Gerar snapshots para leitura rápida.

3. **Recomendações (Who to follow / posts sugeridos)**
   - Jobs periódicos com sinais: interação, interesses, coortes.

4. **Moderação automática e anti-spam**
   - Deduplicação, rate profiles, heurísticas de abuso.
   - Marcar conteúdo para revisão humana.

5. **Entrega assíncrona de notificações**
   - Push/email/in-app com retentativa e DLQ.

6. **Reconciliação e auditoria**
   - Reprocessar eventos para garantir consistência entre contadores (likes, comments, scores).

---

## 3) Modelo de eventos (contratos)

Criar/expandir em `server/contracts`:

Eventos mínimos:
- `USER_FOLLOWED`
- `POST_CREATED`
- `POST_LIKED`
- `POST_COMMENTED`
- `POST_REPORTED`
- `PROFILE_UPDATED`

Campos obrigatórios por evento:
- `eventId` (UUID)
- `eventType`
- `occurredAt` (ISO UTC)
- `actorUserId`
- `targetId` (post/user/comment)
- `idempotencyKey`
- `ruleVersion`
- `sourceDeviceId` (quando aplicável)

> Regra para I.A.: nunca processar evento crítico sem validar idempotência e versão de regra.

---

## 4) Fluxos de referência para I.A.

## Fluxo A — usuário publica post
1. App chama `POST /feed/posts` (Node).
2. Node grava post + outbox/event_log em transação.
3. Node responde `201` imediatamente.
4. Worker Go consome `POST_CREATED`.
5. Go faz fan-out e atualiza estruturas de leitura.
6. Node serve timeline já materializada no próximo `GET /feed/home`.

## Fluxo B — like em post
1. App chama `POST /feed/posts/:id/like` com `idempotencyKey`.
2. Node valida permissão e grava relação like (upsert idempotente).
3. Node publica `POST_LIKED`.
4. Go atualiza contadores, score de trending e notificação assíncrona.

---

## 5) Estratégia de dados para social

## Tabelas de escrita (Node)
- `social_follows`
- `posts`
- `post_media`
- `post_likes`
- `post_comments`
- `post_reports`
- `event_log`
- `outbox`

## Tabelas/materializações de leitura (Go)
- `feed_inbox` (user_id + post_id + rank_score)
- `post_counters` (likes/comments/reposts)
- `trending_snapshots`
- `creator_scores`
- `recommendations_follow`

> Regra para I.A.: separar claramente “write model” e “read model”.

---

## 6) Observabilidade e SLOs (social)

### No Node
- P95 de endpoints críticos (`create post`, `like`, `follow`) < 250ms.
- Logs com `requestId`, `userId`, `idempotencyKey`.
- Rate limit por IP + usuário em rotas sociais.

### No Go
- Lag de fila por tópico/consumer group.
- Taxa de erro por tipo de job.
- Tempo de recomputação de snapshots.
- Métrica de consistência (contador real vs materializado).

---

## 7) Roadmap sugerido (incremental)

## Fase 1 — Social básico (Node-first)
- Follow/unfollow.
- Criar post texto.
- Like e comentário.
- Feed simples por data.

## Fase 2 — Escala controlada (Go entra forte)
- Fan-out assíncrono.
- Counters materializados.
- Notificação assíncrona.
- Trending diário.

## Fase 3 — Inteligência social
- Recomendação de conexões.
- Recomendação de conteúdo.
- Anti-spam comportamental.
- Moderação assistida por IA.

---

## 8) Checklist operacional para uma I.A. implementar

1. Ler `server/README.md`, `server/api/README.md`, `server/workers/README.md`.
2. Adicionar contratos sociais em `server/contracts/openapi.yaml` e schemas de eventos.
3. Implementar rotas write path em `server/api/src/modules/social` e `feed`.
4. Garantir `idempotencyKey` em mutações críticas.
5. Persistir outbox em mesma transação da escrita principal.
6. Criar consumers Go por evento com retries + dead-letter.
7. Materializar visões de leitura para timeline/ranking.
8. Expor endpoints de leitura no Node usando essas visões.
9. Adicionar métricas e alarms mínimos.
10. Validar consistência com job de reconciliação noturno.

---

## 9) Decisão rápida (resumo para IA)

- **Node.js** = experiência imediata do usuário, contratos, autenticação/autorização, CRUD social e APIs de leitura.
- **Go** = processamento assíncrono pesado, fan-out, ranking/trending, recomendações, moderação automatizada, reconciliação.

Se houver dúvida: comece no Node para validar produto; mova para Go quando houver gargalo de CPU, volume de eventos ou latência de fila.
