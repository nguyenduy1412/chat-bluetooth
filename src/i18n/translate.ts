import type { TOptions } from 'i18next';
import i18next from 'i18next';
import type { TxKeyPath } from './types';

export function translate(key: TxKeyPath, options?: TOptions): string {
  if (i18next.isInitialized) {
    return i18next.t(key, options);
  }
  return key;
}
