import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {getBackend} from '../lib/backend';
import type {AppBackend} from '../lib/backend/types';
import type {
  AuthFormValues,
  CreateContributionInput,
  CreateEventInput,
  CreateExpenseInput,
  Event,
  EventMember,
  EventSummary,
  Invite,
  JoinEventInput,
  MemberBalance,
  SettlementInstruction,
  UserProfile,
} from '../types/domain';

type AppContextValue = {
  backendReady: boolean;
  currentUser: UserProfile | null;
  events: Event[];
  summaries: Record<string, EventSummary>;
  balances: Record<string, MemberBalance[]>;
  settlements: Record<string, SettlementInstruction[]>;
  error: string | null;
  clearError: () => void;
  signIn: (input: AuthFormValues) => Promise<void>;
  signUp: (input: Required<AuthFormValues>) => Promise<void>;
  signOut: () => Promise<void>;
  refreshEvents: () => Promise<void>;
  createEvent: (input: CreateEventInput) => Promise<Event>;
  joinEvent: (input: JoinEventInput) => Promise<Event>;
  hydrateEvent: (eventId: string) => Promise<void>;
  addManualMember: (eventId: string, displayName: string) => Promise<EventMember>;
  createInvite: (
    eventId: string,
    invitedEmail?: string,
  ) => Promise<Invite>;
  addExpense: (input: CreateExpenseInput) => Promise<void>;
  addContribution: (input: CreateContributionInput) => Promise<void>;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({children}: React.PropsWithChildren) {
  const [backend, setBackend] = useState<AppBackend | null>(null);
  const [backendReady, setBackendReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [summaries, setSummaries] = useState<Record<string, EventSummary>>({});
  const [balances, setBalances] = useState<Record<string, MemberBalance[]>>({});
  const [settlements, setSettlements] = useState<
    Record<string, SettlementInstruction[]>
  >({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      try {
        const nextBackend = await getBackend();
        const session = await nextBackend.getSession();

        if (!isMounted) {
          return;
        }

        setBackend(nextBackend);
        setCurrentUser(session?.user ?? null);
      } catch (bootstrapError) {
        if (isMounted) {
          setError(
            bootstrapError instanceof Error
              ? bootstrapError.message
              : 'Unable to start the app.',
          );
        }
      } finally {
        if (isMounted) {
          setBackendReady(true);
        }
      }
    }

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshEvents = useCallback(async () => {
    if (!backend || !currentUser) {
      setEvents([]);
      return;
    }

    const nextEvents = await backend.listEvents(currentUser.id);
    setEvents(nextEvents);
  }, [backend, currentUser]);

  useEffect(() => {
    refreshEvents().catch(nextError => {
      setError(nextError instanceof Error ? nextError.message : 'Unable to load events.');
    });
  }, [refreshEvents]);

  const mutate = useCallback(
    async (work: () => Promise<void>) => {
      try {
        setError(null);
        await work();
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : 'Unexpected error.');
        throw nextError;
      }
    },
    [],
  );

  const signIn = useCallback(
    async (input: AuthFormValues) => {
      if (!backend) {
        return;
      }

      await mutate(async () => {
        const session = await backend.signIn(input);
        setCurrentUser(session.user);
        const nextEvents = await backend.listEvents(session.user.id);
        setEvents(nextEvents);
      });
    },
    [backend, mutate],
  );

  const signUp = useCallback(
    async (input: Required<AuthFormValues>) => {
      if (!backend) {
        return;
      }

      await mutate(async () => {
        const session = await backend.signUp(input);
        setCurrentUser(session.user);
        setEvents([]);
      });
    },
    [backend, mutate],
  );

  const signOut = useCallback(async () => {
    if (!backend) {
      return;
    }

    await mutate(async () => {
      await backend.signOut();
      setCurrentUser(null);
      setEvents([]);
      setSummaries({});
      setBalances({});
      setSettlements({});
    });
  }, [backend, mutate]);

  const hydrateEvent = useCallback(
    async (eventId: string) => {
      if (!backend) {
        return;
      }

      await mutate(async () => {
        const [summary, nextBalances, nextSettlements] = await Promise.all([
          backend.getEventSummary(eventId),
          backend.getBalances(eventId),
          backend.getSettlementPlan(eventId),
        ]);

        setSummaries(current => ({...current, [eventId]: summary}));
        setBalances(current => ({...current, [eventId]: nextBalances}));
        setSettlements(current => ({...current, [eventId]: nextSettlements}));
      });
    },
    [backend, mutate],
  );

  const createEvent = useCallback(
    async (input: CreateEventInput) => {
      if (!backend || !currentUser) {
        throw new Error('You must be signed in.');
      }

      let createdEvent!: Event;
      await mutate(async () => {
        createdEvent = await backend.createEvent(currentUser.id, input);
        await refreshEvents();
        await hydrateEvent(createdEvent.id);
      });
      return createdEvent;
    },
    [backend, currentUser, hydrateEvent, mutate, refreshEvents],
  );

  const joinEvent = useCallback(
    async (input: JoinEventInput) => {
      if (!backend || !currentUser) {
        throw new Error('You must be signed in.');
      }

      let joinedEvent!: Event;
      await mutate(async () => {
        joinedEvent = await backend.joinEvent(currentUser.id, input);
        await refreshEvents();
        await hydrateEvent(joinedEvent.id);
      });
      return joinedEvent;
    },
    [backend, currentUser, hydrateEvent, mutate, refreshEvents],
  );

  const addManualMember = useCallback(
    async (eventId: string, displayName: string) => {
      if (!backend) {
        throw new Error('Backend is not ready.');
      }

      let member!: EventMember;
      await mutate(async () => {
        member = await backend.addManualMember(eventId, displayName);
        await hydrateEvent(eventId);
      });
      return member;
    },
    [backend, hydrateEvent, mutate],
  );

  const createInvite = useCallback(
    async (eventId: string, invitedEmail?: string) => {
      if (!backend || !currentUser) {
        throw new Error('You must be signed in.');
      }

      let invite!: Invite;
      await mutate(async () => {
        invite = await backend.createInvite(eventId, currentUser.id, invitedEmail);
        await hydrateEvent(eventId);
      });
      return invite;
    },
    [backend, currentUser, hydrateEvent, mutate],
  );

  const addExpense = useCallback(
    async (input: CreateExpenseInput) => {
      if (!backend || !currentUser) {
        throw new Error('You must be signed in.');
      }

      await mutate(async () => {
        await backend.createExpense(currentUser.id, input);
        await hydrateEvent(input.eventId);
        await refreshEvents();
      });
    },
    [backend, currentUser, hydrateEvent, mutate, refreshEvents],
  );

  const addContribution = useCallback(
    async (input: CreateContributionInput) => {
      if (!backend || !currentUser) {
        throw new Error('You must be signed in.');
      }

      await mutate(async () => {
        await backend.addCentralFundContribution(currentUser.id, input);
        await hydrateEvent(input.eventId);
      });
    },
    [backend, currentUser, hydrateEvent, mutate],
  );

  const value = useMemo(
    () => ({
      backendReady,
      currentUser,
      events,
      summaries,
      balances,
      settlements,
      error,
      clearError: () => setError(null),
      signIn,
      signUp,
      signOut,
      refreshEvents,
      createEvent,
      joinEvent,
      hydrateEvent,
      addManualMember,
      createInvite,
      addExpense,
      addContribution,
    }),
    [
      addContribution,
      addExpense,
      addManualMember,
      backendReady,
      createEvent,
      createInvite,
      currentUser,
      error,
      events,
      hydrateEvent,
      joinEvent,
      refreshEvents,
      settlements,
      signIn,
      signOut,
      signUp,
      summaries,
      balances,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useApp must be used inside AppProvider.');
  }

  return context;
}
