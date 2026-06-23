import type { AuthUser } from '@/types/auth';
import {
  fetchCurrentUser,
  logoutSession,
  startDiscordLogin,
} from './auth-session';

export const authApi = {
  async getCurrentUser(): Promise<AuthUser | null> {
    return fetchCurrentUser();
  },

  login(): void {
    startDiscordLogin();
  },

  async logout(): Promise<void> {
    await logoutSession();
  },
};
