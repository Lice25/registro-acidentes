import type { Accident } from './types';

const KEY = 'sra:acidentes';

export function loadAccidents(): Accident[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Accident[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveAccidents(items: Accident[]): void {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function uid(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  );
}
