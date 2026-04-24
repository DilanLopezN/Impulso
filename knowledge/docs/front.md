# Front — Mapa de mudanças

Documento vivo com tudo que foi/é feito no app (React Native + Expo).

## Fluxo atual

```
             unauthenticated                       authenticated
┌──────────────┐  login ok  ┌──────────────┐ first  ┌──────────────┐
│   Auth.tsx   │──────────▶ │ AuthContext  │──────▶ │  Onboarding  │
│ (login/reg)  │  signup ok │ (user+tokens)│ session│ (3 passos)   │
└──────────────┘            └──────────────┘        └──────┬───────┘
                                                           │ completeWelcome
                                                           ▼
                                                    ┌──────────────┐
                                                    │  Home + tabs │
                                                    └──────────────┘
```

- **Primeiro login**: usuário que se **registra** (`signup`) é marcado como
  `isFirstSession = true` e vê o Onboarding/Welcome. Ao **entrar** (`login`)
  com conta existente, `isFirstSession = false` e vai direto para o Home.
- O logout (via tela Perfil → "Sair") limpa `user`/`tokens` e volta para Auth.

## Arquivos adicionados

| Caminho                                  | Responsabilidade                                       |
| ---------------------------------------- | ------------------------------------------------------ |
| `.env.example`                           | Modelo das variáveis `EXPO_PUBLIC_*` (API NestJS, workers Go). Copie para `.env` e edite. |
| `src/services/api.ts`                    | Wrapper de `fetch` com base URL (lida de `EXPO_PUBLIC_API_URL`), JSON e `ApiError`. Também expõe `WORKERS_BASE_URL`. |
| `src/services/auth.service.ts`           | Chamadas de `/auth/signup`, `/login`, `/refresh`, `/logout`. |
| `src/services/password.service.ts`       | Chamadas de `/auth/password/forgot` e `/auth/password/reset`. |
| `src/services/sessions.service.ts`       | Chamadas de `/sessions` (listar, revogar uma, revogar outras). |
| `src/services/account.service.ts`        | Chamadas LGPD: `/users/me/export` (portabilidade) e `DELETE /users/me`. |
| `src/auth/AuthContext.tsx`               | Provider + hook `useAuth()`. Expõe agora também `requestPasswordReset`, `resetPassword`, `listSessions`, `revokeSession`, `revokeOtherSessions`, `exportMyData`, `deleteMyAccount`. |
| `src/screens/Auth.tsx`                   | Tela de login/registro seguindo o design de `_legacy/screens/Auth.jsx`. **Atualizada:** o link "Esqueceu a senha?" agora dispara `POST /auth/password/forgot`. |
| `src/screens/AccountSecurity.tsx`        | Tela "Conta e segurança": lista sessões ativas com botão de encerrar individual e em lote, exporta dados em JSON via `Share` e exclui a conta com confirmação por senha. |

## Arquivos modificados

| Caminho                                  | Mudança                                                |
| ---------------------------------------- | ------------------------------------------------------ |
| `App.tsx`                                | Envolve `AppNavigator` em `<AuthProvider>`.            |
| `src/navigation/AppNavigator.tsx`        | Decide entre `Auth` → `Onboarding (boas-vindas)` → app, com base em `useAuth()`. Sincroniza `state.name` com `user.displayName` após login. **Atualizado:** registra a rota `security` para a tela `AccountSecurity`. |
| `src/screens/Profile.tsx`                | Itens "Sair" e novo "Conta e segurança" no menu.       |
| `src/screens/index.ts`                   | Exporta `Auth` e `AccountSecurity`.                    |
| `src/services/api.ts`                    | Adiciona `WORKERS_BASE_URL` e força leitura de URLs do `.env`. |
| `src/types/index.ts`                     | Adiciona `'security'` ao union `Route`.                |

## Tela de Auth (`src/screens/Auth.tsx`)

Design espelhado de `_legacy/screens/Auth.jsx`:

- Brand mark (SVG com gradient + símbolo Impulso).
- Toggle **Entrar / Criar conta** (modo login vs registro).
- 3 botões sociais (`Google`, `LinkedIn`, `GitHub`) — **UI apenas**, não
  chamam backend. Ao tocar, exibem aviso "Login social ainda não está
  disponível". Mantidos prontos para integração futura.
- Divider "OU COM E-MAIL".
- Campos:
  - Nome (apenas no modo registro)
  - E-mail
  - Senha (mínimo 4 no login / 8 no registro — alinhado com o DTO do backend).
- Botão primário (submit) com `ActivityIndicator` enquanto carrega.
- Alternância de modo via link inferior.
- Aviso legal de Termos/Privacidade no registro.
- Exibição de erros traduzidos (401 → credenciais; 409 → e-mail já usado;
  400 → mensagem do DTO).

## Tela de boas-vindas (`src/screens/Onboarding.tsx`)

Reutiliza a tela de onboarding que já existia (3 slides com botões
**Pular** / **Continuar** e CTA final "Criar minha primeira meta"). É
exibida automaticamente após o primeiro `signup`. No Perfil há
"Revisitar onboarding" que força reabertura sem afetar o estado de auth.

## Integração com backend

Base URL **sempre** via `.env` no root do repo:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000          # NestJS (auth/users/sessions)
EXPO_PUBLIC_WORKERS_URL=http://localhost:4000      # workers Go (futuro)
```

Veja `.env.example` para os exemplos cobrindo emulador Android, dispositivo
físico em LAN e túneis ngrok. Como o Expo só injeta variáveis em build time,
sempre rode `npm start --clear` após mudar valores no `.env`.

Os fallbacks em `src/services/api.ts` são apenas para o caso do `.env` estar
ausente (`http://10.0.2.2:3000` em Android emulador, `http://localhost:3000`
no resto). Em produção/teste real **defina o `.env`**.

Endpoints alinhados com o `server/api`:

| Função                  | Método / rota                  | Payload                                       |
| ----------------------- | ------------------------------ | --------------------------------------------- |
| `signup`                | `POST /auth/signup`            | `{ email, password, displayName, timezone? }` |
| `login`                 | `POST /auth/login`             | `{ email, password }`                         |
| `refresh`               | `POST /auth/refresh`           | `{ refreshToken }`                            |
| `logout`                | `POST /auth/logout`            | `{ refreshToken }`                            |
| `requestPasswordReset`  | `POST /auth/password/forgot`   | `{ email }` → 202 (sem confirmação se existe) |
| `resetPassword`         | `POST /auth/password/reset`    | `{ token, password }`                         |
| `listSessions`          | `GET /sessions`                | Bearer access token                           |
| `revokeSession`         | `DELETE /sessions/:id`         | Bearer access token                           |
| `revokeOtherSessions`   | `DELETE /sessions/others`      | Bearer access token → `{ revoked: number }`   |
| `exportMyData`          | `GET /users/me/export`         | Bearer access token → JSON portátil           |
| `deleteMyAccount`       | `DELETE /users/me`             | Bearer + `{ password }` (confirmação LGPD)    |

Respostas (`AuthResult`) trazem `user` (PublicUser) e `tokens` (`accessToken`,
`accessTokenExpiresAt`, `refreshToken`, `refreshTokenExpiresAt`). Ficam em
memória dentro do `AuthContext`.

## Tela "Conta e segurança" (`src/screens/AccountSecurity.tsx`)

Acessada via Perfil → "Conta e segurança". Reúne 3 fluxos:

1. **Sessões ativas** — lista cada sessão com `deviceName`/userAgent
   detectado, IP e quando foi vista pela última vez. A sessão atual é
   marcada com `· ATUAL` e não pode ser encerrada por aqui (use Sair). Há
   botão "Encerrar outras sessões" que revoga todas exceto a corrente.
2. **Exportar meus dados** — chama `GET /users/me/export` e usa
   `Share.share` do React Native para entregar o JSON ao usuário.
3. **Excluir minha conta** — abre modal pedindo senha; chama
   `DELETE /users/me` com confirmação. Em sucesso, o `AuthContext` limpa
   tokens e o `AppNavigator` redireciona automaticamente para a tela `Auth`.

## Pendências conhecidas

- **Persistência de sessão**: hoje tokens/usuário ficam apenas em memória.
  Reiniciar o app volta para a tela de Auth. Próximo passo: usar
  `expo-secure-store` (tokens) + `AsyncStorage` (flag `hasSeenWelcome`).
- **Refresh automático**: `authService.refresh` existe, mas não é chamado
  automaticamente. Pendente: interceptor que renova `accessToken` ao 401.
- **Login social**: botões UI-only. Implementar `expo-auth-session` com
  providers Google/LinkedIn/GitHub quando o backend expuser os endpoints.
- **UI de redefinição de senha**: o backend já aceita
  `POST /auth/password/reset`, mas o app ainda não tem tela própria para
  receber o token via deep link e setar a nova senha. O método
  `useAuth().resetPassword(token, newPassword)` está pronto — falta só a
  tela e o registro de scheme/deep link.
- **Flag de primeira sessão pós-login**: hoje só quem faz `signup` vê o
  welcome. Se quisermos mostrar também "primeiro login em um novo
  dispositivo", adicionar flag server-side (`user.hasCompletedOnboarding`)
  ou local por device.
