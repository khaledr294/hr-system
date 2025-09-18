export const AR_GREG_LOCALE = 'ar-SA-u-ca-gregory';

export function formatDate(input: Date | string | number, options: Intl.DateTimeFormatOptions = {}) {
  const d = input instanceof Date ? input : new Date(input);
  const base: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return d.toLocaleDateString(AR_GREG_LOCALE, { ...base, ...options });
}

export function formatDateTime(input: Date | string | number, options: Intl.DateTimeFormatOptions = {}) {
  const d = input instanceof Date ? input : new Date(input);
  const base: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: undefined, hour12: false } as const;
  return d.toLocaleString(AR_GREG_LOCALE, { ...base, ...options });
}
