export type ClassKey = 'otter' | 'lion' | 'fox';

export function classifyClassName(className: string): ClassKey | null {
  if (!className) return null;
  if (className.includes('수달') || className.toLowerCase().includes('overwatch')) return 'otter';
  if (className.includes('사자') || className.toLowerCase().includes('pubg')) return 'lion';
  if (className.includes('여우') || className.toLowerCase().includes('valorant')) return 'fox';
  return null;
}

export const CLASS_LABELS: Record<ClassKey, string> = {
  otter: '수달반',
  lion: '사자반',
  fox: '여우반',
};
