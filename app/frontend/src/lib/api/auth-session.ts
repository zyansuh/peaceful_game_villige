import type { AuthStatusResponse, AuthUser } from '@/types/auth';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function parseError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (typeof data?.detail === 'string') return data.detail;
    if (Array.isArray(data?.detail)) {
      return data.detail.map((d: { msg?: string }) => d.msg || '').filter(Boolean).join(', ');
    }
  } catch {
    /* ignore */
  }
  return res.statusText || 'Request failed';
}

/** Cookie-based API calls (relative URL → Vite proxy in dev). */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (init?.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(path, {
    ...init,
    credentials: 'include',
    headers,
  });

  if (!res.ok) {
    throw new ApiError(await parseError(res), res.status);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  try {
    return await apiFetch<AuthUser>('/api/v1/auth/me');
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return null;
    throw err;
  }
}

export async function fetchAuthSession(): Promise<AuthStatusResponse> {
  try {
    return await apiFetch<AuthStatusResponse>('/api/v1/auth/session');
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      return { authenticated: false, user: null };
    }
    throw err;
  }
}

export function startDiscordLogin(): void {
  window.location.href = '/api/v1/auth/discord/login';
}

export async function logoutSession(): Promise<void> {
  await apiFetch<{ message: string }>('/api/v1/auth/logout', { method: 'POST' });
}
