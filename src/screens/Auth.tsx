import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Stop,
} from 'react-native-svg';

import {
  Body,
  Button,
  Eyebrow,
  H1,
  Icon,
  Neon,
  Small,
} from '@/components';
import { useAuth } from '@/auth/AuthContext';
import { ApiError } from '@/services/api';
import { useTheme } from '@/theme/ThemeContext';

type Mode = 'login' | 'register';
type SocialProvider = 'google' | 'linkedin' | 'github';

export const Auth = () => {
  const { theme } = useTheme();
  const { login, signup, requestPasswordReset } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingProvider, setLoadingProvider] =
    useState<SocialProvider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [forgotting, setForgotting] = useState(false);

  const isLogin = mode === 'login';

  const canSubmit = useMemo(() => {
    if (submitting) return false;
    const emailOk = email.includes('@') && email.includes('.');
    if (isLogin) return emailOk && password.length >= 4;
    return emailOk && password.length >= 8 && name.trim().length > 1;
  }, [isLogin, email, password, name, submitting]);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      if (isLogin) {
        await login({ email: email.trim(), password });
      } else {
        await signup({
          email: email.trim(),
          password,
          displayName: name.trim(),
        });
      }
    } catch (err) {
      setError(humanizeError(err, isLogin));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSocial = (provider: SocialProvider) => {
    setLoadingProvider(provider);
    setError(
      'Login social ainda não está disponível. Use e-mail e senha por enquanto.',
    );
    setTimeout(() => setLoadingProvider(null), 600);
  };

  const handleForgot = async () => {
    setError(null);
    setInfo(null);
    const trimmed = email.trim();
    if (!trimmed.includes('@') || !trimmed.includes('.')) {
      setError('Informe um e-mail válido para receber as instruções.');
      return;
    }
    setForgotting(true);
    try {
      await requestPasswordReset(trimmed);
      setInfo(
        'Se houver uma conta para este e-mail, enviaremos as instruções de recuperação em instantes.',
      );
    } catch (err) {
      setError(humanizeError(err, true));
    } finally {
      setForgotting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: theme.bg[0] }}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <BrandMark />

        <View style={{ alignItems: 'center', marginTop: 4 }}>
          <Eyebrow style={{ marginBottom: 6 }}>IMPULSO</Eyebrow>
          <H1 style={{ textAlign: 'center', marginBottom: 8 }}>
            {isLogin ? (
              <>
                Bem-vindo de <Neon>volta</Neon>
              </>
            ) : (
              <>
                Comece sua <Neon>jornada</Neon>
              </>
            )}
          </H1>
          <Body
            style={{
              color: theme.ink[2],
              textAlign: 'center',
              maxWidth: 280,
            }}
          >
            {isLogin
              ? 'Entre para continuar construindo momentum'
              : 'Crie sua conta em segundos e defina sua primeira meta'}
          </Body>
        </View>

        <ModeToggle mode={mode} onChange={setMode} />

        <View style={{ marginTop: 20, gap: 10 }}>
          <SocialButton
            provider="google"
            loading={loadingProvider === 'google'}
            onPress={() => handleSocial('google')}
          />
          <SocialButton
            provider="linkedin"
            loading={loadingProvider === 'linkedin'}
            onPress={() => handleSocial('linkedin')}
          />
          <SocialButton
            provider="github"
            loading={loadingProvider === 'github'}
            onPress={() => handleSocial('github')}
          />
        </View>

        <Divider />

        <View style={{ gap: 10 }}>
          {!isLogin ? (
            <Field
              label="NOME"
              placeholder="Seu nome"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              textContentType="name"
            />
          ) : null}
          <Field
            label="E-MAIL"
            placeholder="voce@exemplo.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
          />
          <Field
            label="SENHA"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="password"
          />
        </View>

        {error ? (
          <View
            style={{
              marginTop: 14,
              padding: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.danger,
              backgroundColor: 'rgba(242, 116, 94, 0.08)',
            }}
          >
            <Small style={{ color: theme.danger }}>{error}</Small>
          </View>
        ) : null}

        {info ? (
          <View
            style={{
              marginTop: 14,
              padding: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.accent,
              backgroundColor: 'rgba(120, 220, 180, 0.08)',
            }}
          >
            <Small style={{ color: theme.accent }}>{info}</Small>
          </View>
        ) : null}

        {isLogin ? (
          <Pressable
            style={{ alignSelf: 'flex-end', marginTop: 10 }}
            onPress={handleForgot}
            disabled={forgotting}
          >
            {forgotting ? (
              <ActivityIndicator size="small" color={theme.accent} />
            ) : (
              <Text
                style={{
                  fontFamily: 'Geist_600SemiBold',
                  fontSize: 12,
                  color: theme.accent,
                }}
              >
                Esqueceu a senha?
              </Text>
            )}
          </Pressable>
        ) : null}

        <Button
          label={isLogin ? 'Entrar' : 'Criar conta'}
          onPress={handleSubmit}
          disabled={!canSubmit}
          rightAdornment={
            submitting ? (
              <ActivityIndicator size="small" color={theme.accentInk} />
            ) : (
              <Icon name="arrow" size={16} stroke={2} color={theme.accentInk} />
            )
          }
          style={{ marginTop: 16 }}
        />

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: 14,
          }}
        >
          <Small style={{ color: theme.ink[3] }}>
            {isLogin ? 'Novo por aqui? ' : 'Já tem uma conta? '}
          </Small>
          <Pressable
            onPress={() => {
              setError(null);
              setMode(isLogin ? 'register' : 'login');
            }}
          >
            <Text
              style={{
                fontFamily: 'Geist_600SemiBold',
                fontSize: 12,
                color: theme.accent,
              }}
            >
              {isLogin ? 'Criar conta' : 'Entrar'}
            </Text>
          </Pressable>
        </View>

        {!isLogin ? (
          <View style={{ marginTop: 12, alignItems: 'center' }}>
            <Small
              style={{
                color: theme.ink[3],
                fontSize: 10,
                lineHeight: 15,
                textAlign: 'center',
                maxWidth: 280,
              }}
            >
              Ao criar conta você concorda com os{' '}
              <Text style={{ color: theme.ink[1] }}>Termos</Text> e{' '}
              <Text style={{ color: theme.ink[1] }}>Política de Privacidade</Text>
            </Small>
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

/* ================== Subcomponents ================== */

const BrandMark = () => {
  const { theme } = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingTop: 24, marginBottom: 16 }}>
      <Svg width={72} height={72} viewBox="0 0 72 72">
        <Defs>
          <LinearGradient id="brandG" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={theme.accent} stopOpacity={1} />
            <Stop offset="100%" stopColor={theme.accent} stopOpacity={0.5} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={36}
          cy={36}
          r={32}
          fill="none"
          stroke="url(#brandG)"
          strokeWidth={2}
          opacity={0.3}
        />
        <Circle
          cx={36}
          cy={36}
          r={24}
          fill="none"
          stroke={theme.accent}
          strokeWidth={2}
          strokeDasharray="113 30"
        />
        <Path
          d="M 24 42 L 36 24 L 32 36 L 48 30 L 36 48 L 40 36 Z"
          fill={theme.accent}
        />
      </Svg>
    </View>
  );
};

type ModeToggleProps = {
  mode: Mode;
  onChange: (mode: Mode) => void;
};

const ModeToggle = ({ mode, onChange }: ModeToggleProps) => {
  const { theme } = useTheme();
  const options: { id: Mode; label: string }[] = [
    { id: 'login', label: 'Entrar' },
    { id: 'register', label: 'Criar conta' },
  ];
  return (
    <View
      style={{
        marginTop: 24,
        flexDirection: 'row',
        backgroundColor: theme.glassStrong,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 12,
        padding: 3,
      }}
    >
      {options.map((opt) => {
        const active = mode === opt.id;
        return (
          <Pressable
            key={opt.id}
            onPress={() => onChange(opt.id)}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 9,
              alignItems: 'center',
              backgroundColor: active ? theme.accent : 'transparent',
              shadowColor: theme.accent,
              shadowOpacity: active ? 0.45 : 0,
              shadowRadius: 14,
              shadowOffset: { width: 0, height: 0 },
            }}
          >
            <Text
              style={{
                fontFamily: 'Geist_600SemiBold',
                fontSize: 13,
                color: active ? theme.accentInk : theme.ink[2],
              }}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const Divider = () => {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginVertical: 18,
      }}
    >
      <View style={{ flex: 1, height: 1, backgroundColor: theme.border }} />
      <Eyebrow style={{ fontSize: 9, color: theme.ink[3] }}>
        OU COM E-MAIL
      </Eyebrow>
      <View style={{ flex: 1, height: 1, backgroundColor: theme.border }} />
    </View>
  );
};

type FieldProps = Omit<TextInputProps, 'style'> & {
  label: string;
};

const Field = ({ label, ...rest }: FieldProps) => {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View>
      <Eyebrow style={{ marginBottom: 6, fontSize: 9 }}>{label}</Eyebrow>
      <TextInput
        {...rest}
        onFocus={(e) => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
        placeholderTextColor={theme.ink[3]}
        style={{
          backgroundColor: theme.glassStrong,
          borderWidth: 1,
          borderColor: focused ? theme.accent : theme.border,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 12,
          color: theme.ink[0],
          fontFamily: 'Geist_500Medium',
          fontSize: 14,
        }}
      />
    </View>
  );
};

type SocialButtonProps = {
  provider: SocialProvider;
  loading: boolean;
  onPress: () => void;
};

const SOCIAL_LABEL: Record<SocialProvider, string> = {
  google: 'Continuar com Google',
  linkedin: 'Continuar com LinkedIn',
  github: 'Continuar com GitHub',
};

const SOCIAL_BG: Record<SocialProvider, string> = {
  google: '#ffffff',
  linkedin: '#ffffff',
  github: '#24292f',
};

const SOCIAL_INK: Record<SocialProvider, string> = {
  google: '#0a0e18',
  linkedin: '#0a0e18',
  github: '#ffffff',
};

const SocialButton = ({ provider, loading, onPress }: SocialButtonProps) => {
  const { theme } = useTheme();
  const bg = SOCIAL_BG[provider];
  const ink = SOCIAL_INK[provider];
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => ({
        paddingVertical: 13,
        paddingHorizontal: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: bg,
        borderWidth: 1,
        borderColor: theme.borderStrong,
        opacity: loading ? 0.6 : pressed ? 0.9 : 1,
      })}
    >
      {loading ? (
        <ActivityIndicator size="small" color={ink} />
      ) : (
        <SocialLogo provider={provider} />
      )}
      <Text
        style={{
          fontFamily: 'Geist_600SemiBold',
          fontSize: 14,
          color: ink,
        }}
      >
        {SOCIAL_LABEL[provider]}
      </Text>
    </Pressable>
  );
};

const SocialLogo = ({ provider }: { provider: SocialProvider }) => {
  if (provider === 'google') {
    return (
      <Svg width={18} height={18} viewBox="0 0 48 48">
        <Path
          fill="#EA4335"
          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
        />
        <Path
          fill="#4285F4"
          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
        />
        <Path
          fill="#FBBC05"
          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
        />
        <Path
          fill="#34A853"
          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
        />
      </Svg>
    );
  }
  if (provider === 'linkedin') {
    return (
      <Svg width={18} height={18} viewBox="0 0 24 24">
        <Path
          fill="#0A66C2"
          d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0z"
        />
      </Svg>
    );
  }
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path
        fill="#ffffff"
        d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.09 1.85 1.24 1.85 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.58C20.57 22.3 24 17.8 24 12.5 24 5.87 18.63.5 12 .5z"
      />
    </Svg>
  );
};

const humanizeError = (err: unknown, isLogin: boolean): string => {
  if (err instanceof ApiError) {
    if (err.status === 401) return 'E-mail ou senha incorretos.';
    if (err.status === 409) return 'Este e-mail já está cadastrado.';
    if (err.status === 400) {
      const payload = err.payload as { message?: unknown } | null;
      if (payload && typeof payload.message === 'string')
        return payload.message;
      if (payload && Array.isArray(payload.message))
        return (payload.message as string[]).join(' • ');
      return 'Dados inválidos. Revise e tente novamente.';
    }
    return err.message || 'Não foi possível processar sua solicitação.';
  }
  if (err instanceof Error && err.message.includes('Network')) {
    return 'Sem conexão com o servidor. Verifique sua internet ou a API.';
  }
  return isLogin
    ? 'Não foi possível entrar. Tente novamente.'
    : 'Não foi possível criar sua conta. Tente novamente.';
};
