# Impulso — History

Diário técnico do back-end. Cada entrada lista exatamente o que foi entregue,
onde vive no repositório e quais itens do `README_BACKEND.md` foram
cobertos. Serve como memória contínua do projeto para não repetir trabalho
e manter o checklist coerente com o código.

Formato: uma seção por entrega, do mais recente para o mais antigo.

---

## 2026-04-24 — Sessões por dispositivo, recuperação de senha e LGPD

Branch: `claude/auth-session-management-fX3bD`

### Escopo

Fechamento dos itens pendentes de §2.1 (Usuário e autenticação) do
`README_BACKEND.md`:

- Listagem e revogação de sessões ativas por dispositivo.
- Recuperação de senha (token de uso único, hash SHA-256, TTL 30 min).
- LGPD: exportação dos dados do usuário (JSON) e exclusão da conta com
  soft delete + anonimização + revogação de todas as sessões.

Também: integração completa do `users/auth` no app mobile com URLs do
backend lidas de `.env` (`EXPO_PUBLIC_API_URL` para NestJS,
`EXPO_PUBLIC_WORKERS_URL` para futuros workers Go), o que permite trocar
o destino dinamicamente para testar com `ngrok` ou IP de LAN sem mexer no
código.

### Prisma — novo model

`server/api/prisma/schemas/auth.prisma`:

- `PasswordResetToken` — `userId`, `tokenHash` (SHA-256), `expiresAt`,
  `usedAt`, `createdAt`, `ipAddress`, `userAgent`. Index por `userId`.

`schemas/user.prisma` recebe a relação `passwordResetTokens`.

### NestJS — módulos

```
server/api/src/modules/
├── sessions/                          # NOVO
│   ├── sessions.module.ts
│   ├── sessions.controller.ts         # GET/DELETE /sessions
│   ├── sessions.service.ts
│   └── sessions.types.ts
├── auth/
│   ├── auth.controller.ts             # +POST /auth/password/{forgot,reset}
│   ├── auth.service.ts                # +issuePasswordReset, +resetPassword,
│   │                                   # +revokeAllSessions
│   └── dto/{forgot-password,reset-password}.dto.ts
└── users/
    ├── users.controller.ts            # +GET /users/me/export, +DELETE /users/me
    ├── users.service.ts               # +exportData, +deleteAccount
    ├── users.types.ts                 # UserDataExport
    └── dto/delete-account.dto.ts
```

### Endpoints novos

| Método | Rota                          | Descrição                                                                                  |
| ------ | ----------------------------- | ------------------------------------------------------------------------------------------ |
| GET    | `/sessions`                   | Lista sessões ativas do usuário; marca a corrente com `current=true`.                      |
| DELETE | `/sessions/:id`               | Revoga sessão específica (e seus refresh tokens).                                          |
| DELETE | `/sessions/others`            | Revoga todas exceto a atual; retorna `{ revoked: number }`.                                |
| POST   | `/auth/password/forgot`       | Sempre 202; em dev o token vai para os logs.                                               |
| POST   | `/auth/password/reset`        | Token de uso único (TTL 30 min). Em sucesso revoga **todas** as sessões.                   |
| GET    | `/users/me/export`            | Snapshot JSON (`schemaVersion: 1`) com identidade + sessões. Pronto para LGPD.             |
| DELETE | `/users/me`                   | Exige senha no body. Soft delete (preenche `deletedAt`), anonimiza email/nome/avatar e revoga sessões. |

### Regras críticas implementadas

- **Recuperação de senha**: o servidor armazena apenas o hash SHA-256 do
  token (igual ao tratamento de refresh tokens). Resposta de
  `/forgot` é estruturalmente idêntica para e-mail existente ou não, para
  não vazar a existência da conta.
- **Reset bem sucedido revoga tudo**: garante que se o e-mail foi
  comprometido, atacante perde os tokens em curso.
- **Exclusão de conta**: confirmação por senha + soft delete preservando
  o id (mantém integridade futura com `goals`, `xp_ledger`, etc.) e
  anonimizando PII no momento do delete. `passwordHash` é trocado por
  string que `bcrypt.compare` nunca vai aceitar.
- **Revogação de sessão**: rota `/sessions/others` é segura por padrão
  (não permite encerrar a sessão atual via essa chamada, evitando
  self-lockout acidental). Encerrar a atual continua sendo via logout.

### Front-end

- `.env.example` (raiz) com `EXPO_PUBLIC_API_URL` e `EXPO_PUBLIC_WORKERS_URL`.
- `src/services/api.ts` agora exporta `WORKERS_BASE_URL` e exige leitura via
  `process.env.EXPO_PUBLIC_*` (com fallback de dev).
- Novos serviços: `password.service.ts`, `sessions.service.ts`,
  `account.service.ts`.
- `AuthContext` expõe `requestPasswordReset`, `resetPassword`,
  `listSessions`, `revokeSession`, `revokeOtherSessions`, `exportMyData`,
  `deleteMyAccount`.
- Tela `Auth.tsx`: o link "Esqueceu a senha?" agora chama o backend de
  verdade.
- Nova tela `AccountSecurity.tsx` (rota `security`) com lista de sessões,
  exportação via `Share` e exclusão de conta com modal de confirmação.
- Profile recebe item de menu "Conta e segurança" para abrir a tela.

### Contratos

`server/contracts/openapi.yaml` ganhou:

- Tag `sessions`.
- Caminhos: `/auth/password/forgot`, `/auth/password/reset`, `/sessions`,
  `/sessions/{id}`, `/sessions/others`, `/users/me/export`,
  `DELETE /users/me`.
- Schemas: `ForgotPasswordRequest`, `ResetPasswordRequest`,
  `DeleteAccountRequest`, `Session`, `UserDataExport`.

### Itens marcados no `README_BACKEND.md`

- §2.1 — `Gestão de sessão por dispositivo` ✅
- §2.1 — `Recuperação de senha` ✅
- §2.1 — `Exclusão e exportação de dados (LGPD)` ✅
- §5.1 — Módulos `users` e `sessions` ✅
- §7 — Modelo `password_reset_tokens` ✅
- §8.1 — endpoints de password reset, sessions e users LGPD ✅

### Pendências conscientes (não entregues nesta rodada)

- Envio real de e-mail no `/auth/password/forgot` (hoje só log em dev).
  Próximo passo: integrar provider (SES, Postmark, Resend) e template.
- Tela mobile específica para colar/abrir o token de reset (deep link).
  `useAuth().resetPassword(token, newPassword)` já existe no app.
- Migration SQL para `password_reset_tokens` — schema Prisma pronto, falta
  rodar `prisma migrate dev --name auth_session_management` contra Postgres.
- Testes automatizados (unit + e2e) dos novos fluxos.

---

## 2026-04-24 — Autenticação e usuários com Prisma

Branch: `claude/implement-auth-prisma-GevTa`

### Escopo

Primeira camada viva do domínio: cadastro, login, rotação de refresh token,
logout e leitura/edição de perfil do usuário autenticado. ORM: Prisma, com
schemas separados por contexto.

### Prisma — schemas por domínio

Habilitado o preview feature `prismaSchemaFolder` para quebrar o schema em
arquivos por contexto. O `package.json` aponta `prisma.schema = "prisma"`.

```
server/api/prisma/
├── schema.prisma          # generator + datasource (raiz)
└── schemas/
    ├── user.prisma        # User
    └── auth.prisma        # Session + RefreshToken
```

Modelos:
- `User` — id UUID, `email` único, `passwordHash`, `displayName`, `avatarUrl`,
  `timezone`, `emailVerified`, timestamps e `deletedAt` (soft delete).
- `Session` — bind por `userId`, metadados de dispositivo (`deviceId`,
  `deviceName`, `userAgent`, `ipAddress`), `lastSeenAt`, `revokedAt`.
- `RefreshToken` — guarda apenas o hash SHA-256 do token (nunca o token cru),
  com `expiresAt`, `revokedAt`, `replacedBy` para cadeia de rotação.

### NestJS — módulos

```
server/api/src/
├── config/env.validation.ts           # validação estrita via class-validator
├── main.ts                            # ValidationPipe global (whitelist + transform)
├── app.module.ts                      # ConfigModule (global) + Prisma + Auth + Users + Health
└── modules/
    ├── prisma/
    │   ├── prisma.module.ts           # @Global
    │   └── prisma.service.ts          # conecta/desconecta com lifecycle
    ├── auth/
    │   ├── auth.module.ts             # JwtModule assíncrono
    │   ├── auth.controller.ts         # /auth/signup|login|refresh|logout
    │   ├── auth.service.ts            # regra de negócio
    │   ├── auth.types.ts              # PublicUser, AuthTokens, payload JWT
    │   ├── dto/{signup,login,refresh,logout}.dto.ts
    │   ├── guards/jwt-auth.guard.ts   # valida Bearer + sessão ativa
    │   └── decorators/current-user.decorator.ts
    └── users/
        ├── users.module.ts
        ├── users.controller.ts        # /users/me (GET, PATCH)
        ├── users.service.ts
        └── dto/update-user.dto.ts
```

### Regras de autenticação implementadas

- Hash de senha com **bcryptjs**; custo controlado por `PASSWORD_HASH_ROUNDS`
  (default 12).
- Access token: JWT curto, assinado com `JWT_ACCESS_SECRET`, TTL configurável
  via `JWT_ACCESS_TTL` (default `15m`). Payload: `{ sub: userId, sid: sessionId }`.
- Refresh token: string opaca de 48 bytes em base64url. Apenas o **hash
  SHA-256** vai ao banco, com `expiresAt` e `replacedBy`.
- **Rotação de uso único**: `/auth/refresh` revoga o token apresentado e cria
  um novo. Se um token já revogado for reapresentado, interpretamos como
  reuso e revogamos a sessão inteira (`session.revokedAt` + invalida todos
  os refresh tokens daquela sessão).
- `JwtAuthGuard` também checa `session.revokedAt` a cada request, então um
  logout invalida o access token em curso (além do refresh).
- Logout é idempotente: refresh token desconhecido retorna 204 sem vazar
  informação.

### Contratos

`server/contracts/openapi.yaml` criado com:
- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /users/me`
- `PATCH /users/me`
- `GET /health`
- `securitySchemes.bearerAuth` (JWT).

Schemas: `SignupRequest`, `LoginRequest`, `RefreshRequest`, `LogoutRequest`,
`UpdateUserRequest`, `AuthTokens`, `PublicUser`, `AuthResult`, `Error`.

### Variáveis de ambiente novas (`server/api/.env.example`)

- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET` (reservado para uso futuro em assinatura de refresh)
- `JWT_ACCESS_TTL` (default `15m`)
- `JWT_REFRESH_TTL_DAYS` (default `30`)
- `PASSWORD_HASH_ROUNDS` (default `12`)

Todas validadas no boot via `EnvSchema` (`class-validator`).

### Dependências adicionadas (`server/api/package.json`)

- Runtime: `@nestjs/config`, `@nestjs/jwt`, `@prisma/client`, `bcryptjs`,
  `class-transformer`, `class-validator`.
- Dev: `prisma`, `@types/bcryptjs`.
- Novos scripts: `prisma:generate`, `prisma:migrate`, `prisma:migrate:deploy`,
  `prisma:studio`.

### Itens marcados no `README_BACKEND.md`

- §2.1 Usuário e autenticação
  - [x] Login/logout com refresh token.
- §5.1 Módulos de back-end
  - [x] `auth` (contas, sessão, tokens)
- §7 Modelo de dados
  - [x] `users`
  - [x] `sessions` (inclui `refresh_tokens`)
- §8.1 Auth
  - [x] `POST /auth/signup`
  - [x] `POST /auth/login`
  - [x] `POST /auth/refresh`
  - [x] `POST /auth/logout`
- §9 P0
  - [x] Implementar autenticação + sessão.

### Pendências conscientes (não entregues nesta rodada)

- Provedores sociais de login (Google/Apple).
- Endpoint para listar/revogar sessões ativas (dados já existem, falta UI
  administrativa).
- Recuperação de senha (fluxo de e-mail + token de reset).
- LGPD: exclusão/exportação de dados do usuário.
- Migration SQL — os schemas Prisma estão prontos, mas `prisma migrate dev`
  ainda precisa rodar contra um Postgres para gerar a primeira migration.
- Rate limiting e proteção contra brute force em `/auth/login`.
- Testes automatizados (unit + e2e) do fluxo de auth.

### Como rodar localmente (referência)

```bash
cd server
docker compose up -d                 # Postgres
cd api
cp .env.example .env                 # preencher JWT_*_SECRET
npm install
npx prisma generate
npx prisma migrate dev --name init   # cria tabelas users/sessions/refresh_tokens
npm run start:dev
```
