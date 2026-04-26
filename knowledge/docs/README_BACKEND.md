# Impulso — README de Back-end

Este documento define a visão do **back-end** do Impulso com foco em regras de negócio, arquitetura, sincronização **offline/online**, requisitos e backlog técnico em formato de checklist.

---

## 1) Objetivo do back-end

- [ ] Centralizar regras críticas de domínio (XP, nível, streak, conquistas e ranking).
- [ ] Garantir consistência dos dados entre dispositivos e sessões.
- [ ] Suportar operação **offline-first** com reconciliação segura quando houver conexão.
- [ ] Fornecer API estável para app mobile e possíveis clientes futuros (web/admin).
- [ ] Permitir observabilidade, auditoria e evolução de regras sem quebrar clientes.

---

## 2) Escopo funcional do domínio

### 2.1 Usuário e autenticação
- [ ] Cadastro de conta (email/senha e provedores sociais). <!-- email/senha implementado; provedores sociais pendentes -->
- [x] Login/logout com refresh token.
- [x] Gestão de sessão por dispositivo. <!-- `GET /sessions`, `DELETE /sessions/:id`, `DELETE /sessions/others` -->
- [x] Recuperação de senha. <!-- `POST /auth/password/forgot` + `POST /auth/password/reset` (token SHA-256 hash, TTL 30 min, uso único) -->
- [x] Exclusão e exportação de dados (LGPD). <!-- `GET /users/me/export` + `DELETE /users/me` (soft delete + anonimização + revoga sessões) -->

> Nota LGPD: o `DELETE /users/me` faz **soft delete** preservando a linha
> (com `deletedAt`) para integridade referencial, mas anonimiza `email`,
> `displayName` e invalida o `passwordHash`. As sessões e refresh tokens são
> revogados em transação.

### 2.2 Metas
- [x] Criar meta (tipos: hábito, prazo, numérica, projeto). <!-- `POST /goals` com validação por tipo (HABIT exige `frequency`, DEADLINE exige `deadline`, NUMERIC exige `targetValue`). -->
- [x] Editar meta (nome, categoria, prazo, meta-alvo, frequência). <!-- `PATCH /goals/:id`; bloqueado em metas arquivadas (409). -->
- [x] Arquivar/desarquivar meta. <!-- `POST /goals/:id/archive` e `POST /goals/:id/unarchive`. -->
- [x] Excluir meta com regra de retenção de histórico. <!-- `DELETE /goals/:id` faz soft-delete (`deletedAt`); `?includeDeleted=true` recupera para auditoria. -->
- [x] Gerenciar marcos da meta. <!-- `POST/PATCH/DELETE /goals/:id/milestones[/:milestoneId]`; cada mutação recalcula `progress`. -->

> Implementação em `server/api/src/modules/goals/`.
> Schema em `server/api/prisma/schemas/goal.prisma` (`goals` + `milestones`).
> Front-end consome via `src/services/goals.service.ts` + `src/goals/GoalsContext.tsx`.

### 2.3 Hábitos
- [x] Criar hábito com periodicidade. <!-- `POST /habits` aceita DAILY/WEEKLY/CUSTOM (com `weekdays`/`targetPerWeek`). -->
- [x] Marcar/desmarcar conclusão diária. <!-- `POST /habits/:id/checkin` (idempotente por `(habitId, date)`) e `DELETE /habits/:id/checkin`. -->
- [x] Recalcular sequência (streak) e progresso semanal. <!-- `streak`/`weekDone`/`weekTarget` derivados dos check-ins no fuso do usuário. -->
- [x] Regras idempotentes para evitar pontuação duplicada. <!-- Unique `(habit_id, date)` + `idempotencyKey` no `xp_ledger`. -->
- [x] Ajuste manual de histórico com trilha de auditoria. <!-- `POST /habits/:id/checkin/adjust` grava em `habit_audit_log`. -->

### 2.4 Gamificação
- [x] Motor de XP por evento de domínio. <!-- `GamificationService.awardXp` com idempotência e compensação. -->
- [x] Cálculo de nível e `xpToNext`. <!-- `levelFromXp` (curva 100 + 50·(L-1)) sincroniza `user_gamification_profile`. -->
- [x] Conquistas por regras configuráveis. <!-- Catálogo declarativo em `achievements.catalog.ts`, avaliado a cada check-in. -->
- [x] Histórico de eventos de pontuação. <!-- `xp_ledger` + `GET /gamification/ledger` paginado por cursor. -->
- [x] Anti-fraude básico (limites por janela temporal / detecção de padrão anômalo). <!-- `xp_rate_buckets` aplica 60/min e 1500/h por usuário. -->

### 2.5 Ranking
- [ ] Ranking por período (semanal, mensal, geral).
- [ ] Ranking por escopo (global, amigos, times).
- [ ] Critérios de desempate documentados.
- [ ] Snapshot periódico para performance.

### 2.6 Perfil e métricas
- [ ] Agregados de progresso por usuário.
- [ ] Métricas de consistência (dias ativos, conclusão por categoria).
- [ ] Timeline de atividades.

---

## 3) Regras de negócio (núcleo)

### 3.1 Regras de XP
- [ ] Toda ação relevante gera evento de domínio (ex.: `HABIT_COMPLETED`, `MILESTONE_COMPLETED`).
- [ ] XP deve ser calculado no servidor (fonte de verdade).
- [ ] Reprocessamento de eventos deve ser determinístico.
- [ ] Operações repetidas devem ser idempotentes com `idempotencyKey`.

### 3.2 Regras de streak
- [ ] Streak incrementa somente quando a periodicidade do hábito é satisfeita no dia.
- [ ] Falha de dia obrigatório quebra streak conforme configuração.
- [ ] Fuso horário do usuário é obrigatório para cálculo diário.
- [ ] Mudança de fuso deve ter regra explícita para evitar “quebra injusta”.

### 3.3 Regras de metas/marcos
- [ ] Progresso da meta deve refletir marcos concluídos + progresso numérico quando aplicável.
- [ ] Concluir marco pode gerar bônus de XP.
- [ ] Desfazer marco deve aplicar compensação de XP (quando a regra permitir).

### 3.4 Regras de ranking
- [ ] Ranking usa pontos consolidados por janela temporal.
- [ ] Empate: maior streak > maior número de metas concluídas > menor timestamp da última ação.
- [ ] Cálculo assíncrono com atualização eventual e previsível.

### 3.5 Regras de consistência
- [ ] Nenhuma regra de pontuação crítica depende apenas do cliente.
- [ ] Toda mutação relevante gera registro em `event_log`.
- [ ] Versão de regra (`ruleVersion`) registrada em cada evento calculado.

---

## 4) Requisitos não funcionais

### 4.1 Confiabilidade
- [ ] APIs críticas com SLO de disponibilidade.
- [ ] Retentativa segura em operações idempotentes.
- [ ] Estratégia de degradação para serviços auxiliares (ex.: ranking).

### 4.2 Performance
- [ ] P95 de endpoints principais dentro de meta definida.
- [ ] Índices para consultas de timeline, hábitos e ranking.
- [ ] Cache para leitura frequente de perfil/resumo.

### 4.3 Segurança
- [ ] Tokens com rotação e expiração curta para access token.
- [ ] Criptografia em trânsito (TLS) e em repouso para dados sensíveis.
- [ ] Rate limiting + proteção contra abuso.

### 4.4 Observabilidade
- [ ] Logs estruturados por `requestId` e `userId` (quando permitido).
- [ ] Métricas técnicas e de negócio.
- [ ] Tracing distribuído.
- [ ] Alertas para erro de sincronização e filas acumuladas.

### 4.5 Qualidade
- [ ] Testes unitários do domínio.
- [ ] Testes de contrato de API.
- [ ] Testes de integração com banco e fila.
- [ ] Testes de reconciliação offline/online.

---

## 5) Arquitetura sugerida

- [ ] API REST (ou GraphQL) para operações do app.
- [ ] Camada de domínio isolada (use cases + policy/rules).
- [ ] Repositórios para persistência (banco relacional).
- [ ] Fila/event bus para tarefas assíncronas (ranking, notificações, recomputações).
- [ ] Workers dedicados para processamento pesado.
- [ ] Scheduler para rotinas diárias (fechamento do dia, snapshots de ranking).

### 5.1 Módulos de back-end
- [x] `auth` (contas, sessão, tokens, recuperação de senha)
- [x] `users` (perfil, exportação e exclusão LGPD)
- [x] `sessions` (listar/revogar sessões por dispositivo)
- [x] `goals` (metas e marcos)
- [x] `habits` (hábitos e check-ins)
- [x] `gamification` (XP, nível, conquistas)
- [ ] `leaderboard` (ranking e snapshots)
- [ ] `sync` (fila de mudanças e reconciliação)
- [ ] `notifications` (push e lembretes)
- [ ] `analytics` (eventos de produto)

---

## 6) Estratégia offline + online (sincronização)

> Objetivo: o app funciona 100% para operações essenciais sem internet e sincroniza com segurança quando voltar online.

### 6.1 Princípios
- [ ] **Offline-first no cliente**: gravação local imediata com UX responsiva.
- [ ] **Outbox pattern** no cliente: cada mutação entra em fila local para envio posterior.
- [ ] **Idempotência no servidor**: cada mutação enviada deve ter `idempotencyKey`.
- [ ] **Versionamento por entidade**: usar `version`/`updatedAt` para detectar conflito.
- [ ] **Sincronização incremental**: usar cursor (`since`) para baixar apenas delta.

### 6.2 Fluxo sugerido (viável)
- [ ] Cliente cria mutação local (`operationId`, `entityId`, `type`, `payload`, `createdAt`).
- [ ] Estado local é atualizado imediatamente (optimistic UI).
- [ ] Operação é marcada como `pending` na outbox.
- [ ] Quando online, cliente envia lote ordenado por `createdAt`.
- [ ] Servidor valida, aplica regras e retorna `ack` com versão final da entidade.
- [ ] Cliente marca operação como `applied` e atualiza snapshots locais.
- [ ] Cliente executa `pull delta` para reconciliar alterações remotas.

### 6.3 Resolução de conflitos (proposta prática)
- [ ] Conflitos simples de texto/campos não críticos: **Last Write Wins** com `updatedAt`.
- [ ] Conflitos de eventos críticos (XP, streak, conclusão diária): **server authority** + recomputação.
- [ ] Se conflito não resolvível automaticamente: marcar `needs_user_review` com UI de revisão.

### 6.4 Endpoints mínimos para sync
- [ ] `POST /sync/push` (envio de mutações com idempotência).
- [ ] `GET /sync/pull?since=<cursor>` (delta de alterações).
- [ ] `GET /sync/state` (cursor atual, health e versão de schema).
- [ ] `POST /sync/retry-failed` (reprocessar lote com falha).

### 6.5 Modelo de dados para sync
- [ ] Tabela/coleção `operation_log` com status (`pending`, `applied`, `failed`, `conflict`).
- [ ] Campo `sourceDeviceId` para rastreio de origem.
- [ ] Campo `ruleVersion` para rastrear regra de negócio aplicada.
- [ ] Campo `serverTimestamp` para ordenação canônica.

---

## 7) Modelo de dados (alto nível)

- [x] `users`
- [x] `sessions` <!-- inclui `refresh_tokens` com rotação e detecção de reuso -->
- [x] `password_reset_tokens` <!-- token SHA-256 hash, expiração curta, uso único -->
- [x] `goals` <!-- soft-delete via `deletedAt`, arquivamento via `archivedAt` -->
- [x] `milestones` <!-- ordenadas por `order`, recalcula `progress` da meta -->
- [x] `habits` <!-- `frequency` (DAILY/WEEKLY/CUSTOM), `weekdays`, soft-delete + archive -->
- [x] `habit_checkins` (evento diário) <!-- unique `(habit_id, date)` garante idempotência por dia -->
- [x] `habit_audit_log` <!-- trilha de auditoria de ajustes manuais -->
- [x] `xp_ledger` (livro-razão de pontuação) <!-- unique `(user_id, idempotency_key)` -->
- [x] `user_gamification_profile` <!-- snapshot de XP/level/streak mantido na mesma transação -->
- [x] `achievements` <!-- regra em JSON, catálogo upsertado em runtime -->
- [x] `user_achievements`
- [x] `xp_rate_buckets` <!-- contadores de janelas para anti-fraude -->
- [ ] `leaderboard_snapshots`
- [ ] `operation_log` (sync)
- [ ] `audit_log`

---

## 8) API mínima (MVP de produção)

### 8.1 Auth
- [x] `POST /auth/signup`
- [x] `POST /auth/login`
- [x] `POST /auth/refresh`
- [x] `POST /auth/logout`
- [x] `POST /auth/password/forgot`
- [x] `POST /auth/password/reset`
- [x] `GET /sessions`
- [x] `DELETE /sessions/:id`
- [x] `DELETE /sessions/others`
- [x] `GET /users/me/export` <!-- LGPD: portabilidade -->
- [x] `DELETE /users/me` <!-- LGPD: direito ao esquecimento -->>

### 8.2 Goals / Habits
- [x] `GET /goals` <!-- aceita `?archived=true|false` e `?includeDeleted=true` -->
- [x] `POST /goals` <!-- valida requisitos por tipo -->
- [x] `GET /goals/:id`
- [x] `PATCH /goals/:id` <!-- 409 quando arquivada -->
- [x] `DELETE /goals/:id` <!-- soft-delete -->
- [x] `POST /goals/:id/archive`
- [x] `POST /goals/:id/unarchive`
- [x] `POST /goals/:id/milestones`
- [x] `PATCH /goals/:id/milestones/:milestoneId` <!-- recalcula `progress` -->
- [x] `DELETE /goals/:id/milestones/:milestoneId`
- [x] `GET /habits`
- [x] `POST /habits`
- [x] `GET /habits/:id`
- [x] `PATCH /habits/:id`
- [x] `DELETE /habits/:id`
- [x] `POST /habits/:id/archive`
- [x] `POST /habits/:id/unarchive`
- [x] `POST /habits/:id/checkin` <!-- idempotente por `(habitId, date)` -->
- [x] `DELETE /habits/:id/checkin?date=YYYY-MM-DD` <!-- compensa XP via ledger -->
- [x] `GET /habits/:id/checkins`
- [x] `POST /habits/:id/checkin/adjust` <!-- ajuste manual com auditoria -->

### 8.3 Gamification / Profile / Ranking
- [x] `GET /profile/summary`
- [x] `GET /gamification/ledger`
- [x] `GET /achievements`
- [ ] `GET /leaderboard?scope=global&period=weekly`

### 8.4 Sync
- [ ] `POST /sync/push`
- [ ] `GET /sync/pull`
- [ ] `GET /sync/state`

---

## 9) Backlog por prioridade

### P0 — Base obrigatória
- [~] Definir contratos de API (OpenAPI). <!-- `contracts/openapi.yaml` cobre `auth`, `users`, `sessions`, `goals`, `habits` e `gamification`; `sync`/`leaderboard` pendentes -->
- [x] Implementar autenticação + sessão.
- [x] Implementar CRUD de metas/hábitos.
- [x] Implementar motor de XP/streak no domínio.
- [ ] Implementar sync `push/pull` com idempotência.
- [ ] Implementar observabilidade mínima (logs + métricas + healthchecks).

### P1 — Produção inicial
- [ ] Implementar conquistas dinâmicas.
- [ ] Implementar ranking real por janela temporal.
- [ ] Implementar notificação de lembrete.
- [ ] Implementar jobs de fechamento diário.
- [ ] Implementar política de conflito avançada.

### P2 — Escala
- [ ] Hardening de segurança e fraude.
- [ ] Otimização de custo/performance.
- [ ] Ferramentas de operação (reprocessamento, admin).
- [ ] Testes de carga e caos.

---

## 10) Requisitos de infraestrutura e operação

- [ ] Ambiente de desenvolvimento com banco e fila local.
- [ ] Ambientes `staging` e `production` separados.
- [ ] CI com lint, testes e validação de contrato.
- [ ] CD com rollback seguro.
- [ ] Migrações versionadas de banco.
- [ ] Rotina de backup e restauração testada.

---

## 11) Critérios de pronto (Definition of Done)

- [ ] Regra de negócio implementada + testada.
- [ ] Endpoint documentado e versionado.
- [ ] Logs/metricas adicionados.
- [ ] Cobertura de cenários de erro e idempotência.
- [ ] Compatível com fluxo offline/online.
- [ ] Revisão de segurança concluída (quando aplicável).

---

## 12) Próximos passos recomendados

- [ ] Escolher stack do back-end (ex.: Node.js + NestJS/Fastify + PostgreSQL + Redis + fila).
- [ ] Publicar contrato OpenAPI inicial.
- [ ] Subir MVP com módulos `auth`, `goals`, `habits`, `sync`.
- [ ] Integrar app mobile com `push/pull` incremental.
- [ ] Validar em cenário real com modo avião + reconexão.

---

Se quiser, no próximo passo eu também posso transformar este checklist em um **plano de execução por sprints (S1, S2, S3...)** com estimativa e dependências.
