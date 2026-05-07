import {completeAuthRedirect} from '../src/lib/backend/supabase/authService';

describe('completeAuthRedirect', () => {
  test('accepts recovery links that contain a token hash', async () => {
    const verifyOtp = jest.fn().mockResolvedValue({
      data: {
        user: {
          id: 'user-1',
        },
      },
      error: null,
    });
    const from = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({
            data: {
              id: 'user-1',
              email: 'person@example.com',
              display_name: 'Person',
              avatar_url: null,
            },
            error: null,
          }),
        }),
      }),
    });
    const client = {
      auth: {
        setSession: jest.fn(),
        exchangeCodeForSession: jest.fn(),
        verifyOtp,
      },
      from,
    } as any;

    const result = await completeAuthRedirect(
      client,
      'splytuimobile://auth/callback?token_hash=abc123&type=recovery',
    );

    expect(verifyOtp).toHaveBeenCalledWith({
      token_hash: 'abc123',
      type: 'recovery',
    });
    expect(result).toMatchObject({
      flow: 'recovery',
      session: {
        user: {
          id: 'user-1',
          email: 'person@example.com',
        },
      },
    });
  });

  test('accepts code-based redirects', async () => {
    const exchangeCodeForSession = jest.fn().mockResolvedValue({
      data: {
        user: {
          id: 'user-2',
        },
      },
      error: null,
    });
    const from = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({
            data: {
              id: 'user-2',
              email: 'code@example.com',
              display_name: 'Code User',
              avatar_url: null,
            },
            error: null,
          }),
        }),
      }),
    });
    const client = {
      auth: {
        setSession: jest.fn(),
        exchangeCodeForSession,
        verifyOtp: jest.fn(),
      },
      from,
    } as any;

    const result = await completeAuthRedirect(
      client,
      'splytuimobile://auth/callback?code=recovery-code&type=recovery',
    );

    expect(exchangeCodeForSession).toHaveBeenCalledWith('recovery-code');
    expect(result).toMatchObject({
      flow: 'recovery',
      session: {
        user: {
          id: 'user-2',
          email: 'code@example.com',
        },
      },
    });
  });
});
