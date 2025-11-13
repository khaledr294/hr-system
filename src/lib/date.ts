export const AR_GREG_LOCALE = 'ar-SA-u-ca-gregory';
const DEFAULT_TIME_ZONE = 'Asia/Riyadh';

function toDate(input: Date | string | number): Date {
  return input instanceof Date ? input : new Date(input);
}

export function formatDate(
  input: Date | string | number,
  options: Intl.DateTimeFormatOptions = {},
  locale: string = AR_GREG_LOCALE,
) {
  const date = toDate(input);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const base: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: DEFAULT_TIME_ZONE,
  };

  return new Intl.DateTimeFormat(locale, { ...base, ...options }).format(date);
}

export function formatDateTime(
  input: Date | string | number,
  options: Intl.DateTimeFormatOptions = {},
  locale: string = AR_GREG_LOCALE,
) {
  const date = toDate(input);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const base: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: undefined,
    hour12: false,
    timeZone: DEFAULT_TIME_ZONE,
  } as const;

  return new Intl.DateTimeFormat(locale, { ...base, ...options }).format(date);
}
