import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {Linking} from 'react-native';
import {getBackend} from '../lib/backend';
import type {AppBackend} from '../lib/backend/types';
import type {InviteRecipient} from '../lib/backend/types';
import type {
  AuthFormValues,
  Contact,
  CreateContributionInput,
  CreateEventInput,
  CreateExpenseInput,
  Event,
  EventMember,
  EventSummary,
  Invite,
  JoinEventInput,
  MemberBalance,
  PendingInvite,
  RespondToInviteInput,
  SettlementInstruction,
  UpdateEventInput,
  UpdateExpenseInput,
  UpdateUserProfileInput,
  UserProfile,
} from '../types/domain';

type AppContextValue = {
  backendReady: boolean;
  currentUser: UserProfile | null;
  events: Event[];
  contacts: Contact[];
  pendingInvites: PendingInvite[];
  summaries: Record<string, EventSummary>;
  balances: Record<string, MemberBalance[]>;
  settlements: Record<string, SettlementInstruction[]>;
  error: string | null;
  clearError: () => void;
  signIn: (input: AuthFormValues) => Promise<void>;
  signUp: (input: Required<AuthFormValues>) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (input: UpdateUserProfileInput) => Promise<void>;
  refreshEvents: () => Promise<void>;
  refreshContacts: () => Promise<void>;
  refreshPendingInvites: () => Promise<void>;
  createEvent: (input: CreateEventInput) => Promise<Event>;
  updateEvent: (input: UpdateEventInput) => Promise<Event>;
  deleteEvent: (eventId: string) => Promise<void>;
  joinEvent: (input: JoinEventInput) => Promise<Event>;
  hydrateEvent: (eventId: string) => Promise<void>;
  addManualMember: (eventId: string, displayName: string) => Promise<EventMember>;
  createInvite: (eventId: string, recipient?: InviteRecipient) => Promise<Invite>;
  respondToInvite: (input: RespondToInviteInput) => Promise<Event | null>;
  addExpense: (input: CreateExpenseInput) => Promise<void>;
  updateExpense: (input: UpdateExpenseInput) => Promise<void>;
  addContribution: (input: CreateContributionInput) => Promise<void>;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({children}: React.PropsWithChildren) {
  const [backend, setBackend] = useState<AppBackend | null>(null);
  const [backendReady, setBackendReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [summaries, setSummaries] = useState<Record<string, EventSummary>>({});
  const [balances, setBalances] = useState<Record<string, MemberBalance[]>>({});
  const [settlements, setSettlements] = useState<
    Record<string, SettlementInstruction[]>
  >({});
  const [error, setError] = useState<string | null>(null);

  const applySession = useCallback(async (nextBackend: AppBackend, user: UserProfile) => {
    const [nextEvents, nextContacts, nextPendingInvites] = await Promise.all([
      nextBackend.listEvents(user.id),
      nextBackend.listContacts(user.id),
      nextBackend.listPendingInvites(user.email),
    ]);

    setCurrentUser(user);
    setEvents(nextEvents);
    setContacts(nextContacts);
    setPendingInvites(nextPendingInvites);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      try {
        const nextBackend = await getBackend();
        const initialUrl = await Linking.getInitialURL();
        const redirectedSession = initialUrl
          ? await nextBackend.completeAuthRedirect(initialUrl)
          : null;
        const session = redirectedSession ?? (await nextBackend.getSession());

        if (!isMounted) {
          return;
        }

        setBackend(nextBackend);
        if (session?.user) {
          await applySession(nextBackend, session.user);
        }
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
  }, [applySession]);

  useEffect(() => {
    if (!backend) {
      return;
    }

    const subscription = Linking.addEventListener('url', event => {
      backend
        .completeAuthRedirect(event.url)
        .then(session => {
          if (!session) {
            return;
          }

          setError(null);
          return applySession(backend, session.user);
        })
        .catch(nextError => {
          setError(nextError instanceof Error ? nextError.message : 'Unable to sign in.');
        });
    });

    return () => {
      subscription.remove();
    };
  }, [applySession, backend]);

  const refreshEvents = useCallback(async () => {
    if (!backend || !currentUser) {
      setEvents([]);
      return;
    }

    const nextEvents = await backend.listEvents(currentUser.id);
    setEvents(nextEvents);
  }, [backend, currentUser]);

  const refreshContacts = useCallback(async () => {
    if (!backend || !currentUser) {
      setContacts([]);
      return;
    }

    const nextContacts = await backend.listContacts(currentUser.id);
    setContacts(nextContacts);
  }, [backend, currentUser]);

  const refreshPendingInvites = useCallback(async () => {
    if (!backend || !currentUser) {
      setPendingInvites([]);
      return;
    }

    const nextPendingInvites = await backend.listPendingInvites(currentUser.email);
    setPendingInvites(nextPendingInvites);
  }, [backend, currentUser]);

  const syncContactsFromMembers = useCallback(
    async (members: EventSummary['members']) => {
      if (!backend || !currentUser) {
        return;
      }

      const contactCandidates = members
        .filter(member => !!member.userId && member.userId !== currentUser.id)
        .map(member => ({
          userId: member.userId as string,
        }));

      if (contactCandidates.length === 0) {
        return;
      }

      const nextContacts = await backend.upsertContacts(currentUser.id, contactCandidates);
      setContacts(nextContacts);
    },
    [backend, currentUser],
  );

  useEffect(() => {
    refreshEvents().catch(nextError => {
      setError(nextError instanceof Error ? nextError.message : 'Unable to load events.');
    });
  }, [refreshEvents]);

  useEffect(() => {
    refreshContacts().catch(nextError => {
      setError(nextError instanceof Error ? nextError.message : 'Unable to load contacts.');
    });
  }, [refreshContacts]);

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
        await applySession(backend, session.user);
      });
    },
    [applySession, backend, mutate],
  );

  const signUp = useCallback(
    async (input: Required<AuthFormValues>) => {
      if (!backend) {
        return;
      }

      await mutate(async () => {
        const session = await backend.signUp(input);
        await applySession(backend, session.user);
      });
    },
    [applySession, backend, mutate],
  );

  const signInWithGoogle = useCallback(async () => {
    if (!backend) {
      return;
    }

    await mutate(async () => {
      await backend.signInWithGoogle();
    });
  }, [backend, mutate]);

  const signOut = useCallback(async () => {
    if (!backend) {
      return;
    }

    await mutate(async () => {
      await backend.signOut();
      setCurrentUser(null);
      setEvents([]);
      setContacts([]);
      setPendingInvites([]);
      setSummaries({});
      setBalances({});
      setSettlements({});
    });
  }, [backend, mutate]);

  const updateProfile = useCallback(
    async (input: UpdateUserProfileInput) => {
      if (!backend || !currentUser) {
        throw new Error('You must be signed in.');
      }

      await mutate(async () => {
        const nextUser = await backend.updateProfile(currentUser.id, input);
        setCurrentUser(nextUser);
        await refreshContacts();
        await refreshEvents();
        await refreshPendingInvites();
      });
    },
    [backend, currentUser, mutate, refreshContacts, refreshEvents, refreshPendingInvites],
  );

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
        await syncContactsFromMembers(summary.members);
      });
    },
    [backend, mutate, syncContactsFromMembers],
  );

  const createEvent = useCallback(
    async (input: CreateEventInput) => {
      if (!backend || !currentUser) {
        throw new Error('You must be signed in.');
      }

      let createdEvent!: Event;
      await mutate(async () => {
        createdEvent = await backend.createEvent(currentUser.id, input);
        const initialMembers = input.members ?? [];

        for (const member of initialMembers) {
          if (member.kind === 'contact') {
            if (member.userId) {
              await backend.createInvite(createdEvent.id, currentUser.id, {
                userId: member.userId,
              });
            } else if (member.displayName.trim().length > 0) {
              await backend.addManualMember(createdEvent.id, member.displayName);
            }
            continue;
          }

          await backend.createInvite(createdEvent.id, currentUser.id, {
            email: member.email,
          });
        }

        await refreshEvents();
        await refreshPendingInvites();
        await hydrateEvent(createdEvent.id);
      });
      return createdEvent;
    },
    [backend, currentUser, hydrateEvent, mutate, refreshEvents, refreshPendingInvites],
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

  const updateEvent = useCallback(
    async (input: UpdateEventInput) => {
      if (!backend || !currentUser) {
        throw new Error('You must be signed in.');
      }

      let updatedEvent!: Event;
      await mutate(async () => {
        updatedEvent = await backend.updateEvent(currentUser.id, input);
        await refreshEvents();
        await hydrateEvent(input.eventId);
      });
      return updatedEvent;
    },
    [backend, currentUser, hydrateEvent, mutate, refreshEvents],
  );

  const deleteEvent = useCallback(
    async (eventId: string) => {
      if (!backend || !currentUser) {
        throw new Error('You must be signed in.');
      }

      await mutate(async () => {
        await backend.deleteEvent(currentUser.id, eventId);
        setSummaries(current => {
          const next = {...current};
          delete next[eventId];
          return next;
        });
        setBalances(current => {
          const next = {...current};
          delete next[eventId];
          return next;
        });
        setSettlements(current => {
          const next = {...current};
          delete next[eventId];
          return next;
        });
        await refreshEvents();
        await refreshPendingInvites();
      });
    },
    [backend, currentUser, mutate, refreshEvents, refreshPendingInvites],
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
    async (eventId: string, recipient?: InviteRecipient) => {
      if (!backend || !currentUser) {
        throw new Error('You must be signed in.');
      }

      let invite!: Invite;
      await mutate(async () => {
        invite = await backend.createInvite(eventId, currentUser.id, recipient);
        await hydrateEvent(eventId);
        await refreshPendingInvites();
      });
      return invite;
    },
    [backend, currentUser, hydrateEvent, mutate, refreshPendingInvites],
  );

  const respondToInvite = useCallback(
    async (input: RespondToInviteInput) => {
      if (!backend || !currentUser) {
        throw new Error('You must be signed in.');
      }

      let event: Event | null = null;
      await mutate(async () => {
        event = await backend.respondToInvite(currentUser.id, input);
        await refreshPendingInvites();
        await refreshEvents();
        if (event) {
          await hydrateEvent(event.id);
        }
      });
      return event;
    },
    [backend, currentUser, hydrateEvent, mutate, refreshEvents, refreshPendingInvites],
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

  const updateExpense = useCallback(
    async (input: UpdateExpenseInput) => {
      if (!backend || !currentUser) {
        throw new Error('You must be signed in.');
      }

      await mutate(async () => {
        await backend.updateExpense(currentUser.id, input);
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
      contacts,
      pendingInvites,
      summaries,
      balances,
      settlements,
      error,
      clearError: () => setError(null),
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      updateProfile,
      refreshEvents,
      refreshContacts,
      refreshPendingInvites,
      createEvent,
      updateEvent,
      deleteEvent,
      joinEvent,
      hydrateEvent,
      addManualMember,
      createInvite,
      respondToInvite,
      addExpense,
      updateExpense,
      addContribution,
    }),
    [
      addContribution,
      addExpense,
      updateExpense,
      addManualMember,
      backendReady,
      createEvent,
      updateEvent,
      deleteEvent,
      createInvite,
      currentUser,
      contacts,
      pendingInvites,
      error,
      events,
      hydrateEvent,
      joinEvent,
      refreshEvents,
      refreshContacts,
      refreshPendingInvites,
      respondToInvite,
      settlements,
      signIn,
      signInWithGoogle,
      signOut,
      signUp,
      updateProfile,
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
