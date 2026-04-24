# Impulso — History

Diário técnico do back-end. Cada entrada lista exatamente o que foi entregue,
onde vive no repositório e quais itens do `README_BACKEND.md` foram
cobertos. Serve como memória contínua do projeto para não repetir trabalho
e manter o checklist coerente com o código.

Formato: uma seção por entrega, do mais recente para o mais antigo.

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
