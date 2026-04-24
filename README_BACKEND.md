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
- [ ] Gestão de sessão por dispositivo. <!-- persistência de device/UA/IP já feita; falta listar/revogar sessões -->
- [ ] Recuperação de senha.
- [ ] Exclusão e exportação de dados (LGPD).

### 2.2 Metas
- [ ] Criar meta (tipos: hábito, prazo, numérica, projeto).
- [ ] Editar meta (nome, categoria, prazo, meta-alvo, frequência).
- [ ] Arquivar/desarquivar meta.
- [ ] Excluir meta com regra de retenção de histórico.
- [ ] Gerenciar marcos da meta.

### 2.3 Hábitos
- [ ] Criar hábito com periodicidade.
- [ ] Marcar/desmarcar conclusão diária.
- [ ] Recalcular sequência (streak) e progresso semanal.
- [ ] Regras idempotentes para evitar pontuação duplicada.
- [ ] Ajuste manual de histórico com trilha de auditoria.

### 2.4 Gamificação
- [ ] Motor de XP por evento de domínio.
- [ ] Cálculo de nível e `xpToNext`.
- [ ] Conquistas por regras configuráveis.
- [ ] Histórico de eventos de pontuação.
- [ ] Anti-fraude básico (limites por janela temporal / detecção de padrão anômalo).

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
- [x] `auth` (contas, sessão, tokens)
- [ ] `goals` (metas e marcos)
- [ ] `habits` (hábitos e check-ins)
- [ ] `gamification` (XP, nível, conquistas)
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
- [ ] `goals`
- [ ] `milestones`
- [ ] `habits`
- [ ] `habit_checkins` (evento diário)
- [ ] `xp_ledger` (livro-razão de pontuação)
- [ ] `achievements`
- [ ] `user_achievements`
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

### 8.2 Goals / Habits
- [ ] `GET /goals`
- [ ] `POST /goals`
- [ ] `PATCH /goals/:id`
- [ ] `POST /goals/:id/milestones`
- [ ] `POST /habits`
- [ ] `POST /habits/:id/checkin`
- [ ] `DELETE /habits/:id/checkin?date=YYYY-MM-DD`

### 8.3 Gamification / Profile / Ranking
- [ ] `GET /profile/summary`
- [ ] `GET /gamification/ledger`
- [ ] `GET /achievements`
- [ ] `GET /leaderboard?scope=global&period=weekly`

### 8.4 Sync
- [ ] `POST /sync/push`
- [ ] `GET /sync/pull`
- [ ] `GET /sync/state`

---

## 9) Backlog por prioridade

### P0 — Base obrigatória
- [ ] Definir contratos de API (OpenAPI). <!-- `contracts/openapi.yaml` iniciado com módulos `auth` e `users`; demais domínios pendentes -->
- [x] Implementar autenticação + sessão.
- [ ] Implementar CRUD de metas/hábitos.
- [ ] Implementar motor de XP/streak no domínio.
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
