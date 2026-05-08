import {eventSchema} from '../src/lib/validation/forms';

describe('eventSchema', () => {
  test('allows events without dates', () => {
    expect(
      eventSchema.safeParse({
        name: 'House bills',
        currency: 'PHP',
        startDate: undefined,
        endDate: undefined,
      }),
    ).toEqual({
      success: true,
      data: {
        name: 'House bills',
        description: undefined,
        currency: 'PHP',
        startDate: undefined,
        endDate: undefined,
      },
    });
  });

  test('rejects partial date ranges', () => {
    const result = eventSchema.safeParse({
      name: 'House bills',
      currency: 'PHP',
      startDate: '2026-05-01',
      endDate: undefined,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Select an event date range.');
    }
  });
});
