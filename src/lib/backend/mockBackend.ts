import type {
  AppSession,
  AppBackend,
} from './types';
import type {
  AuthFormValues,
  CentralFund,
  CentralFundContribution,
  Contact,
  CreateContributionInput,
  CreateEventInput,
  CreateExpenseInput,
  Event,
  EventMember,
  EventSummary,
  Expense,
  ExpenseSplit,
  Invite,
  JoinEventInput,
  MemberBalance,
  PendingInvite,
  RespondToInviteInput,
  SettlementInstruction,
  UpdateExpenseInput,
  UserProfile,
} from '../../types/domain';

type PersistedState = {
  users: UserProfile[];
  credentials: Array<{userId: string; email: string; password: string}>;
  sessionUserId?: string;
  contacts: Contact[];
  events: Event[];
  eventMembers: EventMember[];
  invites: Invite[];
  expenses: Expense[];
  expenseSplits: ExpenseSplit[];
  centralFunds: CentralFund[];
  contributions: CentralFundContribution[];
};

const defaultState: PersistedState = {
  users: [],
  credentials: [],
  sessionUserId: undefined,
  contacts: [],
  events: [],
  eventMembers: [],
  invites: [],
  expenses: [],
  expenseSplits: [],
  centralFunds: [],
  contributions: [],
};

function createId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now()
    .toString(36)
    .slice(-5)}`;
}

function createInviteCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function normalizeDisplayName(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function buildContactKey(userId?: string, displayName?: string) {
  if (userId) {
    return `user:${userId}`;
  }

  return `name:${normalizeDisplayName(displayName ?? '').toLowerCase()}`;
}

export class MockBackend implements AppBackend {
  private state: PersistedState = defaultState;

  async initialize() {
    this.state = defaultState;
  }

  async getSession(): Promise<AppSession | null> {
    if (!this.state.sessionUserId) {
      return null;
    }

    const user = this.getUser(this.state.sessionUserId);
    return {user};
  }

  async signIn(input: AuthFormValues): Promise<AppSession> {
    const credential = this.state.credentials.find(
      item => item.email.toLowerCase() === input.email.trim().toLowerCase(),
    );

    if (!credential || credential.password !== input.password) {
      throw new Error('Invalid email or password.');
    }

    this.state.sessionUserId = credential.userId;
    return {user: this.getUser(credential.userId)};
  }

  async signUp(input: Required<AuthFormValues>): Promise<AppSession> {
    const email = input.email.trim().toLowerCase();
    const existing = this.state.credentials.find(item => item.email === email);

    if (existing) {
      throw new Error('An account already exists for that email.');
    }

    const now = new Date().toISOString();
    const user: UserProfile = {
      id: createId('user'),
      email,
      displayName: input.displayName.trim(),
      createdAt: now,
    };

    this.state.users.push(user);
    this.state.credentials.push({
      userId: user.id,
      email,
      password: input.password,
    });
    this.state.sessionUserId = user.id;

    return {user};
  }

  async signOut() {
    this.state.sessionUserId = undefined;
  }

  async listPendingInvites(email: string) {
    const normalizedEmail = normalizeEmail(email);

    return this.state.invites
      .filter(
        invite =>
          invite.status === 'pending' &&
          invite.invitedEmail?.toLowerCase() === normalizedEmail,
      )
      .map(invite => {
        const event = this.state.events.find(item => item.id === invite.eventId);
        const invitedByUser = this.state.users.find(item => item.id === invite.invitedBy);

        if (!event || !invitedByUser) {
          throw new Error('Invite references missing event or user.');
        }

        const pendingInvite: PendingInvite = {
          invite,
          event,
          invitedByUser: {
            id: invitedByUser.id,
            displayName: invitedByUser.displayName,
            email: invitedByUser.email,
          },
        };

        return pendingInvite;
      })
      .sort(
        (left, right) =>
          new Date(right.invite.createdAt).getTime() -
          new Date(left.invite.createdAt).getTime(),
      );
  }

  async respondToInvite(userId: string, input: RespondToInviteInput) {
    const invite = this.state.invites.find(item => item.id === input.inviteId);

    if (!invite || invite.status !== 'pending') {
      throw new Error('Invite is no longer available.');
    }

    const user = this.getUser(userId);

    if (normalizeEmail(invite.invitedEmail ?? '') !== normalizeEmail(user.email)) {
      throw new Error('This invite was sent to a different email address.');
    }

    if (input.action === 'decline') {
      invite.status = 'declined';
      return null;
    }

    const existing = this.state.eventMembers.find(
      member => member.eventId === invite.eventId && member.userId === user.id,
    );

    if (existing) {
      existing.status = 'joined';
      existing.displayName = user.displayName;
    } else {
      this.state.eventMembers.push({
        id: createId('member'),
        eventId: invite.eventId,
        userId: user.id,
        displayName: user.displayName,
        role: 'member',
        status: 'joined',
        joinedAt: new Date().toISOString(),
      });
    }

    invite.status = 'accepted';

    const event = this.state.events.find(item => item.id === invite.eventId);

    if (!event) {
      throw new Error('Event not found.');
    }

    return event;
  }

  async listEvents(userId: string) {
    const eventIds = new Set(
      this.state.eventMembers
        .filter(member => member.userId === userId && member.status === 'joined')
        .map(member => member.eventId),
    );

    return this.state.events
      .filter(event => eventIds.has(event.id))
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  }

  async listContacts(userId: string) {
    return this.state.contacts
      .filter(contact => contact.ownerUserId === userId)
      .slice()
      .sort((left, right) => left.displayName.localeCompare(right.displayName));
  }

  async upsertContacts(
    userId: string,
    contacts: Array<{displayName: string; userId?: string}>,
  ) {
    const now = new Date().toISOString();

    contacts.forEach(contact => {
      const displayName = normalizeDisplayName(contact.displayName);
      if (!displayName) {
        return;
      }

      const key = buildContactKey(contact.userId, displayName);
      const existing = this.state.contacts.find(
        item =>
          item.ownerUserId === userId &&
          buildContactKey(item.userId, item.displayName) === key,
      );

      if (existing) {
        existing.displayName = displayName;
        existing.userId = contact.userId ?? existing.userId;
        existing.updatedAt = now;
        return;
      }

      this.state.contacts.push({
        id: createId('contact'),
        ownerUserId: userId,
        userId: contact.userId,
        displayName,
        createdAt: now,
        updatedAt: now,
      });
    });

    return this.listContacts(userId);
  }

  async createEvent(userId: string, input: CreateEventInput) {
    const now = new Date().toISOString();
    const event: Event = {
      id: createId('event'),
      name: input.name.trim(),
      description: input.description?.trim(),
      currency: input.currency,
      icon: input.icon ?? 'event',
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    };
    const user = this.getUser(userId);

    const member: EventMember = {
      id: createId('member'),
      eventId: event.id,
      userId: user.id,
      displayName: user.displayName,
      role: 'owner',
      status: 'joined',
      joinedAt: now,
    };

    const fund: CentralFund = {
      id: createId('fund'),
      eventId: event.id,
      name: `${event.name} Fund`,
      currency: input.currency,
      createdAt: now,
    };

    this.state.events.push(event);
    this.state.eventMembers.push(member);
    this.state.centralFunds.push(fund);

    return event;
  }

  async joinEvent(userId: string, input: JoinEventInput) {
    const invite = this.state.invites.find(
      item =>
        item.inviteCode === input.inviteCode.trim().toUpperCase() &&
        item.status === 'pending',
    );

    if (!invite) {
      throw new Error('Invite code not found.');
    }

    const user = this.getUser(userId);
    const existing = this.state.eventMembers.find(
      member => member.eventId === invite.eventId && member.userId === user.id,
    );

    if (!existing) {
      this.state.eventMembers.push({
        id: createId('member'),
        eventId: invite.eventId,
        userId: user.id,
        displayName: user.displayName,
        role: 'member',
        status: 'joined',
        joinedAt: new Date().toISOString(),
      });
    }

    const event = this.state.events.find(item => item.id === invite.eventId);

    if (!event) {
      throw new Error('Event not found.');
    }

    return event;
  }

  async getEventSummary(eventId: string): Promise<EventSummary> {
    const event = this.state.events.find(item => item.id === eventId);
    const fund = this.state.centralFunds.find(item => item.eventId === eventId);

    if (!event || !fund) {
      throw new Error('Event not found.');
    }

    return {
      event,
      members: this.state.eventMembers.filter(member => member.eventId === eventId),
      expenses: this.state.expenses.filter(expense => expense.eventId === eventId),
      expenseSplits: this.state.expenseSplits.filter(split =>
        this.state.expenses.some(
          expense => expense.id === split.expenseId && expense.eventId === eventId,
        ),
      ),
      invites: this.state.invites.filter(invite => invite.eventId === eventId),
      fund,
      contributions: this.state.contributions.filter(
        contribution => contribution.fundId === fund.id,
      ),
    };
  }

  async addManualMember(eventId: string, displayName: string) {
    const member: EventMember = {
      id: createId('member'),
      eventId,
      displayName: normalizeDisplayName(displayName),
      role: 'member',
      status: 'invited',
      joinedAt: new Date().toISOString(),
    };
    this.state.eventMembers.push(member);
    return member;
  }

  async createInvite(eventId: string, invitedBy: string, invitedEmail?: string) {
    const invite: Invite = {
      id: createId('invite'),
      eventId,
      invitedBy,
      inviteCode: createInviteCode(),
      invitedEmail: invitedEmail ? normalizeEmail(invitedEmail) : undefined,
      status: 'pending',
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
      createdAt: new Date().toISOString(),
    };
    this.state.invites.push(invite);
    return invite;
  }

  async createExpense(userId: string, input: CreateExpenseInput) {
    const event = this.state.events.find(item => item.id === input.eventId);

    if (!event) {
      throw new Error('Event not found.');
    }

    const now = new Date().toISOString();
    const expense: Expense = {
      id: createId('expense'),
      eventId: input.eventId,
      amount: roundCurrency(input.amount),
      currency: input.currency,
      title: input.title.trim(),
      note: input.note?.trim(),
      paidByMemberId: input.paidByMemberId,
      paymentSource: input.paymentSource,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    };

    const share = roundCurrency(expense.amount / input.participantMemberIds.length);
    const splits: ExpenseSplit[] = input.participantMemberIds.map((memberId, index) => ({
      id: createId('split'),
      expenseId: expense.id,
      memberId,
      splitType: 'equal',
      shareAmount:
        index === input.participantMemberIds.length - 1
          ? roundCurrency(expense.amount - share * index)
          : share,
    }));

    event.updatedAt = now;
    this.state.expenses.push(expense);
    this.state.expenseSplits.push(...splits);
  }

  async updateExpense(_userId: string, input: UpdateExpenseInput) {
    const expense = this.state.expenses.find(item => item.id === input.expenseId);

    if (!expense) {
      throw new Error('Expense not found.');
    }

    const now = new Date().toISOString();
    expense.title = input.title.trim();
    expense.amount = roundCurrency(input.amount);
    expense.note = input.note?.trim();
    expense.paidByMemberId = input.paidByMemberId;
    expense.paymentSource = input.paymentSource;
    expense.updatedAt = now;

    this.state.expenseSplits = this.state.expenseSplits.filter(
      split => split.expenseId !== expense.id,
    );

    const share = roundCurrency(expense.amount / input.participantMemberIds.length);
    const splits: ExpenseSplit[] = input.participantMemberIds.map((memberId, index) => ({
      id: createId('split'),
      expenseId: expense.id,
      memberId,
      splitType: 'equal',
      shareAmount:
        index === input.participantMemberIds.length - 1
          ? roundCurrency(expense.amount - share * index)
          : share,
    }));

    this.state.expenseSplits.push(...splits);
  }

  async addCentralFundContribution(
    _userId: string,
    input: CreateContributionInput,
  ) {
    const fund = this.state.centralFunds.find(item => item.eventId === input.eventId);

    if (!fund) {
      throw new Error('Fund not found.');
    }

    this.state.contributions.push({
      id: createId('contribution'),
      fundId: fund.id,
      memberId: input.memberId,
      amount: roundCurrency(input.amount),
      createdAt: new Date().toISOString(),
    });
  }

  async getBalances(eventId: string) {
    const summary = await this.getEventSummary(eventId);
    const balances = new Map<string, MemberBalance>();

    summary.members.forEach(member => {
      balances.set(member.id, {
        memberId: member.id,
        displayName: member.displayName,
        paid: 0,
        owed: 0,
        net: 0,
      });
    });

    summary.contributions.forEach(contribution => {
      const balance = balances.get(contribution.memberId);

      if (balance) {
        balance.paid = roundCurrency(balance.paid + contribution.amount);
      }
    });

    summary.expenses.forEach(expense => {
      if (expense.paymentSource === 'personal') {
        const payer = balances.get(expense.paidByMemberId);

        if (payer) {
          payer.paid = roundCurrency(payer.paid + expense.amount);
        }
      }

      this.state.expenseSplits
        .filter(split => split.expenseId === expense.id)
        .forEach(split => {
          const member = balances.get(split.memberId);

          if (member) {
            member.owed = roundCurrency(member.owed + split.shareAmount);
          }
        });
    });

    return Array.from(balances.values())
      .map(balance => ({
        ...balance,
        net: roundCurrency(balance.paid - balance.owed),
      }))
      .sort((left, right) => right.net - left.net);
  }

  async getSettlementPlan(eventId: string) {
    const balances = await this.getBalances(eventId);
    const creditors = balances
      .filter(balance => balance.net > 0)
      .map(balance => ({...balance}));
    const debtors = balances
      .filter(balance => balance.net < 0)
      .map(balance => ({...balance, net: Math.abs(balance.net)}));
    const instructions: SettlementInstruction[] = [];

    let creditorIndex = 0;
    let debtorIndex = 0;

    while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
      const creditor = creditors[creditorIndex];
      const debtor = debtors[debtorIndex];
      const amount = roundCurrency(Math.min(creditor.net, debtor.net));

      instructions.push({
        fromMemberId: debtor.memberId,
        fromDisplayName: debtor.displayName,
        toMemberId: creditor.memberId,
        toDisplayName: creditor.displayName,
        amount,
      });

      creditor.net = roundCurrency(creditor.net - amount);
      debtor.net = roundCurrency(debtor.net - amount);

      if (creditor.net === 0) {
        creditorIndex += 1;
      }

      if (debtor.net === 0) {
        debtorIndex += 1;
      }
    }

    return instructions;
  }

  private getUser(userId: string) {
    const user = this.state.users.find(item => item.id === userId);

    if (!user) {
      throw new Error('User not found.');
    }

    return user;
  }
}
