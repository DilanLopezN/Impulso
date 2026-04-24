import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Share,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  Body,
  Button,
  Card,
  Eyebrow,
  H2,
  Icon,
  Mono,
  Small,
} from '@/components';
import { useAuth } from '@/auth/AuthContext';
import { ApiError } from '@/services/api';
import type { SessionView } from '@/services/sessions.service';
import { useTheme } from '@/theme/ThemeContext';

type AccountSecurityProps = {
  onBack: () => void;
};

export const AccountSecurity = ({ onBack }: AccountSecurityProps) => {
  const { theme } = useTheme();
  const {
    user,
    listSessions,
    revokeSession,
    revokeOtherSessions,
    exportMyData,
    deleteMyAccount,
  } = useAuth();

  const [sessions, setSessions] = useState<SessionView[] | null>(null);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokingOthers, setRevokingOthers] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    setError(null);
    setLoadingSessions(true);
    try {
      const list = await listSessions();
      setSessions(list);
    } catch (err) {
      setError(humanize(err) ?? 'Não foi possível carregar as sessões.');
    } finally {
      setLoadingSessions(false);
    }
  }, [listSessions]);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  const handleRevoke = (session: SessionView) => {
    if (session.current) return;
    Alert.alert(
      'Encerrar sessão',
      `Encerrar a sessão de ${session.deviceName ?? 'dispositivo desconhecido'}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Encerrar',
          style: 'destructive',
          onPress: async () => {
            setRevokingId(session.id);
            try {
              await revokeSession(session.id);
              await loadSessions();
            } catch (err) {
              setError(humanize(err) ?? 'Não foi possível encerrar a sessão.');
            } finally {
              setRevokingId(null);
            }
          },
        },
      ],
    );
  };

  const handleRevokeOthers = () => {
    Alert.alert(
      'Encerrar outras sessões',
      'Você continuará logado neste dispositivo. As demais sessões serão desconectadas.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Encerrar todas',
          style: 'destructive',
          onPress: async () => {
            setRevokingOthers(true);
            try {
              const count = await revokeOtherSessions();
              await loadSessions();
              Alert.alert(
                'Sessões encerradas',
                count === 0
                  ? 'Não havia outras sessões ativas.'
                  : `${count} sessão(ões) encerrada(s).`,
              );
            } catch (err) {
              setError(humanize(err) ?? 'Não foi possível encerrar as sessões.');
            } finally {
              setRevokingOthers(false);
            }
          },
        },
      ],
    );
  };

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    try {
      const data = await exportMyData();
      const json = JSON.stringify(data, null, 2);
      await Share.share({
        title: `impulso-export-${data.user.id}.json`,
        message: json,
      });
    } catch (err) {
      setError(humanize(err) ?? 'Não foi possível exportar seus dados.');
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    setDeleteError(null);
    if (deletePassword.length < 1) {
      setDeleteError('Informe sua senha para confirmar.');
      return;
    }
    setDeleting(true);
    try {
      await deleteMyAccount(deletePassword);
      // AuthContext clears tokens; AppNavigator will redirect to Auth screen.
    } catch (err) {
      const status = err instanceof ApiError ? err.status : null;
      if (status === 401) {
        setDeleteError('Senha incorreta.');
      } else {
        setDeleteError(humanize(err) ?? 'Não foi possível excluir sua conta.');
      }
    } finally {
      setDeleting(false);
    }
  };

  const userInfo = useMemo(() => {
    if (!user) return null;
    return `${user.displayName} · ${user.email}`;
  }, [user]);

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 4,
          paddingBottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <Pressable onPress={onBack} hitSlop={12}>
          <Icon name="chevronL" size={20} color={theme.ink[1]} />
        </Pressable>
        <Eyebrow>CONTA E SEGURANÇA</Eyebrow>
      </View>

      <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
        <H2 style={{ marginBottom: 4 }}>Privacidade e dispositivos</H2>
        <Small style={{ color: theme.ink[3] }}>{userInfo ?? ''}</Small>
      </View>

      {error ? (
        <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
          <Card
            style={{
              padding: 12,
              borderColor: theme.danger,
              borderWidth: 1,
              backgroundColor: 'rgba(242, 116, 94, 0.08)',
            }}
          >
            <Small style={{ color: theme.danger }}>{error}</Small>
          </Card>
        </View>
      ) : null}

      {/* Sessions */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <Eyebrow>SESSÕES ATIVAS</Eyebrow>
          <Pressable onPress={loadSessions} hitSlop={8} disabled={loadingSessions}>
            <Mono style={{ color: theme.accent, fontSize: 11 }}>
              {loadingSessions ? 'CARREGANDO…' : 'ATUALIZAR'}
            </Mono>
          </Pressable>
        </View>

        <Card>
          {loadingSessions && !sessions ? (
            <View style={{ padding: 24, alignItems: 'center' }}>
              <ActivityIndicator color={theme.accent} />
            </View>
          ) : sessions && sessions.length > 0 ? (
            sessions.map((session, idx) => (
              <SessionRow
                key={session.id}
                session={session}
                last={idx === sessions.length - 1}
                revoking={revokingId === session.id}
                onRevoke={() => handleRevoke(session)}
              />
            ))
          ) : (
            <View style={{ padding: 24 }}>
              <Body style={{ color: theme.ink[3] }}>
                Nenhuma sessão ativa encontrada.
              </Body>
            </View>
          )}
        </Card>

        <Button
          label="Encerrar outras sessões"
          onPress={handleRevokeOthers}
          disabled={revokingOthers || !sessions || sessions.length <= 1}
          style={{ marginTop: 12 }}
          rightAdornment={
            revokingOthers ? (
              <ActivityIndicator size="small" color={theme.accentInk} />
            ) : (
              <Icon name="lock" size={14} stroke={2} color={theme.accentInk} />
            )
          }
        />
      </View>

      {/* LGPD: export */}
      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 }}>
        <Eyebrow style={{ marginBottom: 8 }}>SEUS DADOS</Eyebrow>
        <Card style={{ padding: 16 }}>
          <Body style={{ fontFamily: 'Geist_600SemiBold', marginBottom: 4 }}>
            Exportar meus dados
          </Body>
          <Small style={{ color: theme.ink[3], marginBottom: 12 }}>
            Gera um JSON com identidade e sessões. Conforme LGPD, você pode
            solicitar a portabilidade a qualquer momento.
          </Small>
          <Button
            label={exporting ? 'Exportando…' : 'Exportar JSON'}
            onPress={handleExport}
            disabled={exporting}
            rightAdornment={
              exporting ? (
                <ActivityIndicator size="small" color={theme.accentInk} />
              ) : (
                <Icon name="share" size={14} stroke={2} color={theme.accentInk} />
              )
            }
          />
        </Card>
      </View>

      {/* LGPD: delete */}
      <View style={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 12 }}>
        <Eyebrow style={{ marginBottom: 8 }}>EXCLUIR CONTA</Eyebrow>
        <Card
          style={{
            padding: 16,
            borderWidth: 1,
            borderColor: theme.danger,
          }}
        >
          <Body style={{ fontFamily: 'Geist_600SemiBold', marginBottom: 4 }}>
            Excluir minha conta
          </Body>
          <Small style={{ color: theme.ink[3], marginBottom: 12 }}>
            Anonimiza seus dados pessoais e revoga todos os acessos. Esta ação
            é irreversível.
          </Small>
          <Pressable
            onPress={() => {
              setDeletePassword('');
              setDeleteError(null);
              setDeleteOpen(true);
            }}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 12,
              backgroundColor: theme.danger,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Icon name="close" size={14} stroke={2} color={theme.bg[0]} />
            <Text
              style={{
                color: theme.bg[0],
                fontFamily: 'Geist_600SemiBold',
                fontSize: 14,
              }}
            >
              Excluir conta
            </Text>
          </Pressable>
        </Card>
      </View>

      <DeleteConfirm
        visible={deleteOpen}
        password={deletePassword}
        onChangePassword={setDeletePassword}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
        error={deleteError}
      />
    </ScrollView>
  );
};

type SessionRowProps = {
  session: SessionView;
  last: boolean;
  revoking: boolean;
  onRevoke: () => void;
};

const SessionRow = ({ session, last, revoking, onRevoke }: SessionRowProps) => {
  const { theme } = useTheme();
  const label = session.deviceName ?? guessFromUserAgent(session.userAgent);
  const meta = [
    session.ipAddress,
    formatRelative(session.lastSeenAt),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <View
      style={{
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: theme.border,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          backgroundColor: theme.glassStrong,
          borderWidth: 1,
          borderColor: theme.border,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name="lock" size={14} stroke={1.8} color={theme.ink[1]} />
      </View>
      <View style={{ flex: 1 }}>
        <Body style={{ fontFamily: 'Geist_600SemiBold' }}>
          {label}
          {session.current ? (
            <Text style={{ color: theme.accent, fontSize: 11 }}>  · ATUAL</Text>
          ) : null}
        </Body>
        <Mono style={{ color: theme.ink[3], fontSize: 11, marginTop: 2 }}>
          {meta}
        </Mono>
      </View>
      {session.current ? (
        <Mono style={{ color: theme.ink[3], fontSize: 10 }}>— </Mono>
      ) : revoking ? (
        <ActivityIndicator size="small" color={theme.danger} />
      ) : (
        <Pressable onPress={onRevoke} hitSlop={8}>
          <Mono style={{ color: theme.danger, fontSize: 11 }}>ENCERRAR</Mono>
        </Pressable>
      )}
    </View>
  );
};

type DeleteConfirmProps = {
  visible: boolean;
  password: string;
  onChangePassword: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
  loading: boolean;
  error: string | null;
};

const DeleteConfirm = ({
  visible,
  password,
  onChangePassword,
  onCancel,
  onConfirm,
  loading,
  error,
}: DeleteConfirmProps) => {
  const { theme } = useTheme();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.6)',
          justifyContent: 'center',
          paddingHorizontal: 24,
        }}
      >
        <Card style={{ padding: 20 }}>
          <H2 style={{ marginBottom: 6 }}>Excluir minha conta</H2>
          <Small style={{ color: theme.ink[3], marginBottom: 16 }}>
            Confirme com sua senha. Esta operação é irreversível.
          </Small>
          <Eyebrow style={{ marginBottom: 6, fontSize: 9 }}>SENHA</Eyebrow>
          <TextInput
            value={password}
            onChangeText={onChangePassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor={theme.ink[3]}
            style={{
              backgroundColor: theme.glassStrong,
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 12,
              color: theme.ink[0],
              fontFamily: 'Geist_500Medium',
              fontSize: 14,
              marginBottom: 12,
            }}
          />
          {error ? (
            <Small style={{ color: theme.danger, marginBottom: 12 }}>
              {error}
            </Small>
          ) : null}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable
              onPress={onCancel}
              disabled={loading}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.border,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: theme.ink[1],
                  fontFamily: 'Geist_600SemiBold',
                  fontSize: 13,
                }}
              >
                Cancelar
              </Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              disabled={loading}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 12,
                backgroundColor: theme.danger,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {loading ? (
                <ActivityIndicator size="small" color={theme.bg[0]} />
              ) : (
                <Icon name="close" size={14} stroke={2} color={theme.bg[0]} />
              )}
              <Text
                style={{
                  color: theme.bg[0],
                  fontFamily: 'Geist_600SemiBold',
                  fontSize: 13,
                }}
              >
                Confirmar exclusão
              </Text>
            </Pressable>
          </View>
        </Card>
      </View>
    </Modal>
  );
};

const humanize = (err: unknown): string | null => {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return null;
};

const guessFromUserAgent = (ua: string | null): string => {
  if (!ua) return 'Dispositivo desconhecido';
  if (/Android/i.test(ua)) return 'Android';
  if (/iPhone|iPad|iOS/i.test(ua)) return 'iOS';
  if (/Mac OS X/i.test(ua)) return 'Mac';
  if (/Windows/i.test(ua)) return 'Windows';
  if (/Linux/i.test(ua)) return 'Linux';
  return 'Web';
};

const formatRelative = (iso: string): string => {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diff = Date.now() - then;
  const minutes = Math.round(diff / 60_000);
  if (minutes < 1) return 'agora';
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.round(hours / 24);
  return `há ${days} d`;
};
