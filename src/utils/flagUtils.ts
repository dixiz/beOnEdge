import { TRUE_VALUES } from '../constants';

export function parseBooleanFlag(value?: string): boolean {
  return TRUE_VALUES.includes(value || '');
}

