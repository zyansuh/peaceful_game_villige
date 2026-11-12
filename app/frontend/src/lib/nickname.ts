import type { AuthUser } from '@/types/auth';

/** Site-wide display nickname priority (must match backend services/nickname.py). */
export function getDisplayNickname(
  user: Partial<{
    name?: string | null;
    nickname_configured?: boolean;
    discord_guild_nickname?: string | null;
    discord_global_name?: string | null;
    discord_username?: string | null;
    display_name?: string | null;
  }> | null | undefined,
  fallback = '알 수 없는 사용자'
): string {
  if (!user) return fallback;
  if (user.display_name?.trim()) return user.display_name.trim();

  if (user.nickname_configured && user.name?.trim()) {
    return user.name.trim();
  }

  return (
    user.discord_guild_nickname?.trim() ||
    user.discord_global_name?.trim() ||
    user.discord_username?.trim() ||
    user.name?.trim() ||
    fallback
  );
}

export function getNicknamePrefill(user: AuthUser | null | undefined): string {
  if (!user) return '';
  if (user.nickname_configured && user.name?.trim()) return user.name.trim();
  return (
    user.discord_guild_nickname?.trim() ||
    user.discord_global_name?.trim() ||
    user.discord_username?.trim() ||
    ''
  );
}
