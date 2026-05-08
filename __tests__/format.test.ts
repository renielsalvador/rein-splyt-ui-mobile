import {formatDateLabel, formatDateRangeLabel} from '../src/lib/utils/format';

describe('date formatting utilities', () => {
  it('formats date-only values', () => {
    expect(formatDateLabel('2026-05-06')).toBe('May 6');
    expect(formatDateRangeLabel('2026-05-06', '2026-05-08')).toBe('May 6 - 8, 2026');
  });

  it('renders an empty date range as no dates', () => {
    expect(formatDateRangeLabel(undefined, undefined)).toBe('No dates');
  });

  it('formats ISO timestamp values without throwing', () => {
    expect(formatDateLabel('2026-05-06T03:16:00.000Z')).toBe('May 6');
  });
});
