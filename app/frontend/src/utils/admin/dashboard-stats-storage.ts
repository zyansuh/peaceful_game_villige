export type DashboardStatKey =
  | 'totalApplications'
  | 'otterCount'
  | 'lionCount'
  | 'foxCount'
  | 'remainingOtter'
  | 'remainingLion'
  | 'remainingFox';

export type DashboardStatsComputed = Record<DashboardStatKey, number>;

export type DashboardStatsOverrides = Partial<DashboardStatsComputed>;

const STORAGE_KEY = 'admin_dashboard_stat_overrides';

export function loadDashboardOverrides(): DashboardStatsOverrides {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as DashboardStatsOverrides;
  } catch {
    return {};
  }
}

export function saveDashboardOverrides(overrides: DashboardStatsOverrides): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

export function setDashboardOverride(key: DashboardStatKey, value: number | null): DashboardStatsOverrides {
  const current = loadDashboardOverrides();
  if (value === null) {
    delete current[key];
  } else {
    current[key] = value;
  }
  saveDashboardOverrides(current);
  return { ...current };
}

export function clearDashboardOverrides(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function resolveStat(
  key: DashboardStatKey,
  computed: DashboardStatsComputed,
  overrides: DashboardStatsOverrides
): number {
  if (overrides[key] !== undefined && overrides[key] !== null) {
    return overrides[key] as number;
  }
  return computed[key];
}

export function isStatOverridden(key: DashboardStatKey, overrides: DashboardStatsOverrides): boolean {
  return overrides[key] !== undefined && overrides[key] !== null;
}
