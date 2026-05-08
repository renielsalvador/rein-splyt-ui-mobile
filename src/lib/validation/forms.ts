type ValidationIssue = {
  message: string;
};

type ValidationSuccess<T> = {
  success: true;
  data: T;
};

type ValidationFailure = {
  success: false;
  error: {
    issues: ValidationIssue[];
  };
};

type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

type Validator<TInput, TOutput> = {
  safeParse: (input: TInput) => ValidationResult<TOutput>;
};

function fail(message: string): ValidationFailure {
  return {
    success: false,
    error: {
      issues: [{message}],
    },
  };
}

function pass<T>(data: T): ValidationSuccess<T> {
  return {
    success: true,
    data,
  };
}

export const authSchema: Validator<
  {email: string; password: string; displayName?: string},
  {email: string; password: string; displayName?: string}
> = {
  safeParse(input) {
    const email = input.email.trim().toLowerCase();
    const password = input.password;
    const displayName = input.displayName?.trim();

    if (!email.includes('@') || !email.includes('.')) {
      return fail('Enter a valid email.');
    }

    if (password.length < 6) {
      return fail('Use at least 6 characters.');
    }

    if (input.displayName !== undefined && (!displayName || displayName.length < 2)) {
      return fail('Enter a display name.');
    }

    return pass({
      email,
      password,
      displayName,
    });
  },
};

export const eventSchema: Validator<
  {
    name: string;
    description?: string;
    currency: 'USD' | 'PHP';
    startDate?: string;
    endDate?: string;
  },
  {
    name: string;
    description?: string;
    currency: 'USD' | 'PHP';
    startDate?: string;
    endDate?: string;
  }
> = {
  safeParse(input) {
    const name = input.name.trim();
    const description = input.description?.trim();
    const startDate = input.startDate?.trim() || undefined;
    const endDate = input.endDate?.trim() || undefined;

    if (name.length < 2) {
      return fail('Event name is required.');
    }

    if (input.currency !== 'USD' && input.currency !== 'PHP') {
      return fail('Select a supported currency.');
    }

    if (!startDate && !endDate) {
      return pass({
        name,
        description,
        currency: input.currency,
        startDate: undefined,
        endDate: undefined,
      });
    }

    if (!startDate || !endDate) {
      return fail('Select an event date range.');
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      return fail('Select an event date range.');
    }

    if (startDate > endDate) {
      return fail('Event end date must be after the start date.');
    }

    return pass({
      name,
      description,
      currency: input.currency,
      startDate,
      endDate,
    });
  },
};

export const joinSchema: Validator<
  {inviteCode: string},
  {inviteCode: string}
> = {
  safeParse(input) {
    const inviteCode = input.inviteCode.trim().toUpperCase();

    if (inviteCode.length < 4) {
      return fail('Invite code is required.');
    }

    return pass({inviteCode});
  },
};

export const expenseSchema: Validator<
  {title: string; amount: number; note?: string},
  {title: string; amount: number; note?: string}
> = {
  safeParse(input) {
    const title = input.title.trim();
    const note = input.note?.trim();

    if (title.length < 2) {
      return fail('Expense title is required.');
    }

    if (!Number.isFinite(input.amount) || input.amount <= 0) {
      return fail('Enter an amount greater than zero.');
    }

    return pass({
      title,
      amount: input.amount,
      note,
    });
  },
};

export const contributionSchema: Validator<
  {amount: number},
  {amount: number}
> = {
  safeParse(input) {
    if (!Number.isFinite(input.amount) || input.amount <= 0) {
      return fail('Enter an amount greater than zero.');
    }

    return pass({amount: input.amount});
  },
};
