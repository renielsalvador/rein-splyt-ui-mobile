import {
  getEventLifecycle,
  getEventStatusBadge,
  isEventIncludedInDashboard,
  sortEventsByStartDate,
} from '../src/features/events/eventStatus';
import type {Event} from '../src/types/domain';

function buildEvent(overrides: Partial<Event>): Event {
  return {
    id: 'event_1',
    name: 'Test event',
    currency: 'PHP',
    icon: 'event',
    isActive: true,
    startDate: '2026-05-01',
    endDate: '2026-05-10',
    createdBy: 'user_1',
    createdAt: '2026-05-01T00:00:00.000Z',
    updatedAt: '2026-05-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('eventStatus helpers', () => {
  test('excludes inactive and ended events from dashboard calculations', () => {
    expect(
      isEventIncludedInDashboard(
        buildEvent({isActive: false, endDate: '2026-05-20'}),
        '2026-05-07',
      ),
    ).toBe(false);
    expect(
      isEventIncludedInDashboard(
        buildEvent({isActive: true, endDate: '2026-05-06'}),
        '2026-05-07',
      ),
    ).toBe(false);
    expect(
      isEventIncludedInDashboard(
        buildEvent({isActive: true, endDate: '2026-05-07'}),
        '2026-05-07',
      ),
    ).toBe(true);
  });

  test('returns lifecycle and badge state', () => {
    expect(
      getEventLifecycle(
        buildEvent({startDate: '2026-05-01', endDate: '2026-05-10'}),
        '2026-05-07',
      ),
    ).toBe('ongoing');
    expect(getEventStatusBadge(buildEvent({isActive: false}), '2026-05-07')).toEqual({
      label: 'Inactive',
      tone: 'outline',
    });
    expect(getEventStatusBadge(buildEvent({endDate: '2026-05-06'}), '2026-05-07')).toEqual({
      label: 'Ended',
      tone: 'danger',
    });
  });

  test('sorts ongoing included events first, then remaining by start date', () => {
    const events = sortEventsByStartDate(
      [
        buildEvent({id: 'ended', startDate: '2026-04-01', endDate: '2026-04-03'}),
        buildEvent({id: 'upcoming', startDate: '2026-05-20', endDate: '2026-05-22'}),
        buildEvent({
          id: 'inactive',
          isActive: false,
          startDate: '2026-05-03',
          endDate: '2026-05-08',
        }),
        buildEvent({id: 'ongoing', startDate: '2026-05-02', endDate: '2026-05-12'}),
      ],
      '2026-05-07',
    );

    expect(events.map(event => event.id)).toEqual(['ongoing', 'upcoming', 'inactive', 'ended']);
  });
});
