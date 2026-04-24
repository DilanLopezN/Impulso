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
| `src/services/api.ts`                    | Wrapper de `fetch` com base URL, JSON e `ApiError`.    |
| `src/services/auth.service.ts`           | Chamadas de `/auth/signup`, `/login`, `/refresh`, `/logout`. |
| `src/auth/AuthContext.tsx`               | Provider + hook `useAuth()` (user, tokens, first session, login/signup/logout). |
| `src/screens/Auth.tsx`                   | Tela de login/registro seguindo o design de `_legacy/screens/Auth.jsx`. |

## Arquivos modificados

| Caminho                                  | Mudança                                                |
| ---------------------------------------- | ------------------------------------------------------ |
| `App.tsx`                                | Envolve `AppNavigator` em `<AuthProvider>`.            |
| `src/navigation/AppNavigator.tsx`        | Decide entre `Auth` → `Onboarding (boas-vindas)` → app, com base em `useAuth()`. Sincroniza `state.name` com `user.displayName` após login. |
| `src/screens/Profile.tsx`                | Adiciona item "Sair" acionando `logout()`.             |
| `src/screens/index.ts`                   | Exporta `Auth`.                                        |

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

Base URL via `EXPO_PUBLIC_API_URL` (padrão: `http://10.0.2.2:3000` em
Android, `http://localhost:3000` no resto). Alinhado com endpoints do
`server/api`:

| Função         | Método / rota           | Payload                                     |
| -------------- | ----------------------- | ------------------------------------------- |
| `signup`       | `POST /auth/signup`     | `{ email, password, displayName, timezone? }` |
| `login`        | `POST /auth/login`      | `{ email, password }`                       |
| `refresh`      | `POST /auth/refresh`    | `{ refreshToken }`                          |
| `logout`       | `POST /auth/logout`     | `{ refreshToken }`                          |

Respostas (`AuthResult`) trazem `user` (PublicUser) e `tokens` (`accessToken`,
`accessTokenExpiresAt`, `refreshToken`, `refreshTokenExpiresAt`). Ficam em
memória dentro do `AuthContext`.

## Pendências conhecidas

- **Persistência de sessão**: hoje tokens/usuário ficam apenas em memória.
  Reiniciar o app volta para a tela de Auth. Próximo passo: usar
  `expo-secure-store` (tokens) + `AsyncStorage` (flag `hasSeenWelcome`).
- **Refresh automático**: `authService.refresh` existe, mas não é chamado
  automaticamente. Pendente: interceptor que renova `accessToken` ao 401.
- **Login social**: botões UI-only. Implementar `expo-auth-session` com
  providers Google/LinkedIn/GitHub quando o backend expuser os endpoints.
- **Recuperação de senha**: link "Esqueceu a senha?" apenas sinaliza que
  ainda não existe fluxo.
- **Flag de primeira sessão pós-login**: hoje só quem faz `signup` vê o
  welcome. Se quisermos mostrar também "primeiro login em um novo
  dispositivo", adicionar flag server-side (`user.hasCompletedOnboarding`)
  ou local por device.
