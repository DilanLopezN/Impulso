import { Platform } from 'react-native';

// Defaults usados apenas quando o `.env` não define a variável correspondente.
// Para apontar para outro host (LAN, ngrok, staging) edite `.env` na raiz do
// projeto — `EXPO_PUBLIC_*` é injetado pelo Expo em build time.
const FALLBACK_API_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
const FALLBACK_WORKERS_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';

const stripTrail = (value: string) => value.replace(/\/$/, '');

export const API_BASE_URL = stripTrail(
  process.env.EXPO_PUBLIC_API_URL ?? FALLBACK_API_URL,
);

export const WORKERS_BASE_URL = stripTrail(
  process.env.EXPO_PUBLIC_WORKERS_URL ?? FALLBACK_WORKERS_URL,
);

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string | null;
  signal?: AbortSignal;
};

export const apiRequest = async <T>(
  path: string,
  { method = 'GET', body, token, signal }: RequestOptions = {},
): Promise<T> => {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  const text = await response.text();
  const payload = text.length > 0 ? safeParse(text) : undefined;

  if (!response.ok) {
    const message =
      (payload && typeof payload === 'object' && 'message' in payload
        ? String((payload as { message: unknown }).message)
        : response.statusText) || 'Request failed';
    throw new ApiError(message, response.status, payload);
  }

  return payload as T;
};

const safeParse = (raw: string): unknown => {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
};
