import type {Event} from '../../types/domain';

export type EventLifecycle = 'ongoing' | 'upcoming' | 'ended';

function padDatePart(value: number) {
  return value.toString().padStart(2, '0');
}

export function getTodayDateString() {
  const today = new Date();
  return `${today.getFullYear()}-${padDatePart(today.getMonth() + 1)}-${padDatePart(
    today.getDate(),
  )}`;
}

export function getEventLifecycle(
  event: Pick<Event, 'startDate' | 'endDate'>,
  today = getTodayDateString(),
): EventLifecycle {
  if (event.endDate < today) {
    return 'ended';
  }

  if (event.startDate <= today) {
    return 'ongoing';
  }

  return 'upcoming';
}

export function isEventIncludedInDashboard(
  event: Pick<Event, 'isActive' | 'endDate'>,
  today = getTodayDateString(),
) {
  return event.isActive && event.endDate >= today;
}

export function getEventStatusBadge(
  event: Pick<Event, 'isActive' | 'startDate' | 'endDate'>,
  today = getTodayDateString(),
) {
  if (!event.isActive) {
    return {
      label: 'Inactive',
      tone: 'outline' as const,
    };
  }

  const lifecycle = getEventLifecycle(event, today);

  if (lifecycle === 'ongoing') {
    return {
      label: 'Ongoing',
      tone: 'success' as const,
    };
  }

  if (lifecycle === 'ended') {
    return {
      label: 'Ended',
      tone: 'danger' as const,
    };
  }

  return null;
}

export function sortEventsByStartDate(events: Event[], today = getTodayDateString()) {
  return events.slice().sort((left, right) => {
    const leftIncluded = isEventIncludedInDashboard(left, today);
    const rightIncluded = isEventIncludedInDashboard(right, today);

    if (leftIncluded !== rightIncluded) {
      return leftIncluded ? -1 : 1;
    }

    const leftLifecycle = getEventLifecycle(left, today);
    const rightLifecycle = getEventLifecycle(right, today);

    if (leftLifecycle !== rightLifecycle) {
      if (leftLifecycle === 'ongoing') {
        return -1;
      }

      if (rightLifecycle === 'ongoing') {
        return 1;
      }
    }

    if (left.startDate !== right.startDate) {
      return right.startDate.localeCompare(left.startDate);
    }

    return right.updatedAt.localeCompare(left.updatedAt);
  });
}
