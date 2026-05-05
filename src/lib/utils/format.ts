import type {CurrencyCode} from '../../types/domain';

function parseDateValue(value: string) {
  if (!value) {
    return new Date(NaN);
  }

  return new Date(`${value}T12:00:00`);
}

export function formatCurrency(value: number, currency: CurrencyCode) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(parseDateValue(value));
}

export function formatDateRangeLabel(startDate: string, endDate: string) {
  const start = parseDateValue(startDate);
  const end = parseDateValue(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 'Select dates';
  }

  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();

  if (sameMonth) {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(start) + ` - ${end.getDate()}, ${end.getFullYear()}`;
  }

  const startLabel = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : {year: 'numeric'}),
  }).format(start);
  const endLabel = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(end);

  return `${startLabel} - ${endLabel}`;
}

export function toAmount(value: string) {
  const parsed = Number(value.replace(/[^0-9.]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}
