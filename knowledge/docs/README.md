# Impulso

App mobile de metas, hábitos e gamificação construído com **Expo + React Native + TypeScript**.

> **Status atual:** o projeto está com **interface muito bem evoluída** e uma camada inicial de estado local para prototipação, porém ainda sem a lógica de domínio completa (persistência, regras de XP/streak, autenticação, backend e sincronização).

## 1) Visão do sistema (mapeamento funcional completo)

### 1.1 Objetivo do produto
O Impulso ajuda usuários a:
- Definir metas pessoais e profissionais.
- Acompanhar hábitos diários.
- Visualizar progresso com feedback gamificado (XP, nível, streak, conquistas e ranking).

### 1.2 Jornada principal do usuário
1. **Onboarding**: usuário entende proposta e entra no app.
2. **Home**: vê resumo do dia, momentum, tarefas de hoje e metas ativas.
3. **Hábitos**: marca hábitos concluídos no dia e acompanha visão semanal.
4. **Detalhe da meta**: acompanha progresso e marcos.
5. **Criar meta**: fluxo de 3 etapas para cadastrar uma nova meta.
6. **Conquistas / Rank / Perfil**: visualização de progresso, posição e métricas pessoais.

### 1.3 Escopo entregue hoje
- Navegação local entre telas.
- Tema com modo e acento customizáveis.
- Componentes visuais reutilizáveis.
- Estado inicial mockado (`seed`) para metas/hábitos/XP.
- Interações de demonstração (toggle de hábito, toggle de marcos, celebração visual).

### 1.4 Limites atuais
- Sem API/back-end.
- Sem armazenamento persistente.
- Sem autenticação.
- Sem engine real de pontuação/recompensas.
- Sem notificações reais.

---

## 2) Arquitetura técnica (mapeamento de módulos)

## 2.1 Stack
- **Expo SDK 53** com New Architecture.
- **React 19** / **React Native 0.79**.
- **TypeScript strict**.
- `react-native-svg` para ilustrações/ícones customizados.
- `expo-linear-gradient` para efeitos visuais.
- `@expo-google-fonts/geist` + `geist-mono`.

### 2.2 Estrutura de pastas
```text
App.tsx                 # bootstrap do app (fonts + providers)
src/
├── components/         # design system e primitivas visuais
├── data/seed.ts        # mock principal de estado inicial
├── navigation/         # fluxo de rotas local (sem react-navigation)
├── screens/            # telas de negócio
├── theme/              # tokens, paletas, ThemeContext
└── types/              # tipos de domínio compartilhados
_legacy/                # protótipo web original preservado
```

### 2.3 Camadas
- **Apresentação:** `screens` e `components`.
- **Estado local:** `AppNavigator` usando `useState`.
- **Tema/design tokens:** `ThemeContext` + `tokens` + `colors`.
- **Dados de exemplo:** `seed.ts`.

---

## 3) Mapeamento de telas e funcionalidades atuais

### 3.1 Onboarding
- 3 slides informativos.
- Navegação avançar/pular.
- Sem persistência de “onboarding já concluído”.

### 3.2 Home
- Saudação + resumo diário.
- Cartão de momentum com progresso agregado de metas.
- Lista “Foco de hoje” com toggles simulados.
- Metas ativas com navegação para detalhe.
- Insight gamificado estático.

### 3.3 Hábitos
- Lista de hábitos com toggle `todayDone`.
- Heatmap de 30 dias **simulado**.
- Visão semanal baseada em vetor mockado (`week`).

### 3.4 Goal Detail
- Exibe progresso, prazo, sequência e XP da meta.
- Lista de marcos com toggle `done`.
- Botões de share/opções ainda sem ação.

### 3.5 Create Goal
- Wizard 3 passos (categoria → definição → ajustes).
- Validação básica de formulário no cliente.
- No fim, dispara celebração, mas **não persiste meta real** no estado.

### 3.6 Achievements
- Cards de conquistas obtidas e bloqueadas.
- Filtro visual por categoria.
- Conteúdo atualmente estático (sem cálculo por regras reais).

### 3.7 Rank
- Leaderboard visual com top 3 + lista.
- Filtros de escopo/período.
- Dados estáticos (sem origem externa).

### 3.8 Profile
- Resumo de nível/XP/streak e estatísticas.
- Ações de reset de estado e reabrir onboarding.
- Métricas majoritariamente mockadas.

---

## 4) Modelo de dados atual

### 4.1 Entidades já tipadas
- `Goal`
- `Milestone`
- `Habit`
- `WeekDay`
- `AppState`

### 4.2 Campos relevantes já existentes
- **Gamificação:** `xp`, `xpToNext`, `level`, `streak`.
- **Meta:** `progress`, `deadline`, `daysLeft`, `xpTotal`, `milestones`.
- **Hábito:** `todayDone`, `streak`, `weekDone`, `week`.

### 4.3 Lacunas de modelo para produção
- IDs e timestamps padronizados (`createdAt`, `updatedAt`, `completedAt`).
- Relações entre hábito/meta e histórico de eventos.
- Auditoria de ações (quem alterou, quando, origem).
- Estado offline/sync (`dirty`, `lastSyncedAt`, `version`).

---

## 5) Mapeamento de lógica existente vs. necessária

### 5.1 Lógica já implementada
- Toggle de conclusão de hábito do dia.
- Toggle de marcos da meta em detalhe.
- Incremento simplificado de `todayDone`.
- Controle local de rota/tab.

### 5.2 Lógica que precisa ser implementada (prioritária)

## P0 — Fundacional (necessário para produto real)
1. **Persistência local**
   - Salvar estado em armazenamento local (ex.: AsyncStorage/MMKV).
   - Reidratar estado no boot.
2. **Store central de domínio**
   - Migrar `useState` do navigator para camada de estado (Redux Toolkit/Zustand + selectors).
3. **Engine de regras de progresso**
   - Cálculo de XP por ação.
   - Regras de level up.
   - Atualização real de streak diário.
4. **CRUD completo de metas e hábitos**
   - Criar/editar/arquivar/excluir.
   - CreateGoal realmente adicionando entidade.
5. **Datas reais e calendário**
   - Substituir datas hardcoded por cálculo em tempo real.
   - Recalcular `daysLeft`, reset diário e semanais.

## P1 — Produto utilizável em produção
6. **Autenticação + conta**
   - Signup/login/logout.
   - Identidade do usuário e sessão.
7. **Backend/API**
   - Sincronizar metas, hábitos, progresso, conquistas e rank.
   - Estratégia offline-first + reconciliação.
8. **Notificações e lembretes**
   - Agenda por hábito/meta.
   - Push local/remoto com preferência do usuário.
9. **Conquistas dinâmicas**
   - Regras em motor configurável e desbloqueio automático.
10. **Ranking real**
   - Ranking por janela temporal (semana/mês/geral) e escopo (global/amigos).

## P2 — Escala e qualidade
11. **Testes automatizados**
   - Unitários para regras de XP/streak.
   - Integração para fluxos (criar meta, concluir hábito).
   - E2E para jornada principal.
12. **Observabilidade**
   - Telemetria de eventos.
   - Crash reporting.
   - Métricas de retenção e conclusão diária.
13. **Acessibilidade e i18n**
   - Labels, contraste, leitores de tela.
   - Internacionalização pt/en.
14. **Segurança e conformidade**
   - Gestão de secrets, LGPD (consentimento, exportação/exclusão de dados).

---

## 6) Requisitos funcionais detalhados para “adicionar lógica no sistema”

### RF-01 — Concluir hábito diário
- Usuário marca/desmarca hábito do dia.
- Sistema recalcula streak, XP, progresso semanal.
- Deve ser idempotente (não duplicar XP ao remarcar).

### RF-02 — Criar meta com impacto real
- Ao concluir wizard, meta é criada no estado persistido.
- Meta aparece na Home, Detalhe e Perfil.
- Deve suportar tipo: hábito, prazo, numérica e projeto.

### RF-03 — Atualizar marcos
- Alternar marco recalcula progresso percentual.
- Regras de XP por marco concluído.
- Desfazer ação reverte efeitos de pontuação quando aplicável.

### RF-04 — Cálculo de nível
- Fórmula clara e centralizada para `xpToNext`.
- Múltiplos level-ups em lote quando XP excede limiar.

### RF-05 — Fechamento diário
- Virada do dia recalcula tarefas pendentes e streak.
- Rotina de reset parcial para indicadores “hoje”.

### RF-06 — Conquistas
- Engine avalia regras por evento (ex.: 30 dias de streak).
- Notifica desbloqueio e adiciona ao inventário.

### RF-07 — Ranking
- Recalcula pontuação por período.
- Empate com critério explícito (ex.: maior streak, depois timestamp).

### RF-08 — Perfil
- Métricas agregadas vindas de histórico real, não constantes fixas.

---

## 7) Requisitos não funcionais

- **RNF-01 Performance:** telas principais abaixo de 300ms para interações comuns.
- **RNF-02 Offline-first:** app funcional sem rede e sincronização posterior.
- **RNF-03 Confiabilidade:** consistência de XP/streak sob concorrência de eventos.
- **RNF-04 Segurança:** proteção de dados sensíveis e tokens de sessão.
- **RNF-05 Manutenibilidade:** regras de negócio isoladas da camada visual.
- **RNF-06 Testabilidade:** cobertura mínima para casos críticos de domínio.

---

## 8) Backlog técnico sugerido (ordem prática)

1. Introduzir camada `domain/` com casos de uso (`completeHabit`, `toggleMilestone`, `createGoal`).
2. Criar `repositories/` com implementação local (storage) e interface para API.
3. Migrar `AppState` para store central e remover mutações diretas em tela.
4. Implementar sistema de eventos de domínio (`HABIT_COMPLETED`, `MILESTONE_DONE`, etc.).
5. Conectar Achievements e Rank a dados calculados.
6. Criar suíte de testes de regras antes de integrar backend.

---

## 9) Como rodar

```bash
npm install
npm start
npm run ios
npm run android
npm run web
npm run typecheck
```

---

## 10) Resumo executivo

O Impulso já possui uma excelente base visual e estrutura de telas. Para se tornar um produto com lógica robusta, os próximos passos são: **persistência + motor de regras (XP/streak/nível) + CRUD real + sincronização backend**. Este README agora funciona como documento de referência de arquitetura, lacunas e roadmap técnico para evolução do sistema.
