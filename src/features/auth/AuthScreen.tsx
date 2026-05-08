import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useApp} from '../../app/AppProvider';
import {AppButton, AppInput, AppToast, InlineError} from '../../components/ui';
import {authSchema} from '../../lib/validation/forms';
import {palette, radii, spacing, typography} from '../../theme/tokens';

type AuthMode = 'login' | 'signup' | 'forgot';

type FieldErrors = {
  displayName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

function validateEmail(value: string) {
  const normalizedEmail = value.trim().toLowerCase();

  if (!normalizedEmail.includes('@') || !normalizedEmail.includes('.')) {
    return 'Enter a valid email.';
  }

  return undefined;
}

function AuthHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.wordmarkBlock}>
      <Image
        source={require('../../../assets/branding/splyt-app-icon-no-bg.png')}
        style={styles.brandLogo}
        resizeMode="contain"
      />
      <Text style={styles.wordmark}>{title}</Text>
      <Text style={styles.tagline}>{subtitle}</Text>
    </View>
  );
}

export function AuthScreen() {
  const {
    signIn,
    signUp,
    signInWithGoogle,
    requestPasswordReset,
    error,
    clearError,
  } = useApp();
  const [mode, setMode] = useState<AuthMode>('login');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSubscription = Keyboard.addListener(showEvent, event => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  function showToast(message: string) {
    setToastMessage(message);

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimeoutRef.current = null;
    }, 2500);
  }

  function resetTransientState(nextMode: AuthMode) {
    clearError();
    setFieldErrors({});
    setMode(nextMode);
  }

  async function handleSubmit() {
    clearError();

    const parsed = authSchema.safeParse({
      email,
      password,
      displayName: mode === 'signup' ? displayName : undefined,
    });

    if (!parsed.success) {
      const nextErrors: FieldErrors = {};
      const message = parsed.error.issues[0]?.message;

      if (message === 'Enter a valid email.') {
        nextErrors.email = message;
      } else if (message === 'Use at least 6 characters.') {
        nextErrors.password = message;
      } else if (message === 'Enter a display name.') {
        nextErrors.displayName = message;
      }

      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    setSubmitting(true);

    try {
      if (mode === 'signup') {
        await signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          displayName: parsed.data.displayName ?? '',
        });
        return;
      }

      await signIn({
        email: parsed.data.email,
        password: parsed.data.password,
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePasswordReset() {
    clearError();
    const emailError = validateEmail(forgotEmail);

    if (emailError) {
      setFieldErrors({email: emailError});
      return;
    }

    setFieldErrors({});
    setResetSubmitting(true);

    try {
      await requestPasswordReset(forgotEmail.trim().toLowerCase());
      setForgotEmail('');
      showToast('Reset email sent.');
    } finally {
      setResetSubmitting(false);
    }
  }

  if (mode === 'forgot') {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.inner}>
          <AuthHeader
            title="Forgot password"
            subtitle="Enter your email and we’ll send a reset link."
          />

          <View style={styles.formBlock}>
            <AppInput
              label="Email"
              value={forgotEmail}
              onChangeText={value => {
                setForgotEmail(value);
                setFieldErrors(current => ({...current, email: undefined}));
                clearError();
              }}
              placeholder="mark@splyt.app"
              autoCapitalize="none"
              prefixIcon="mail"
              keyboardType="email-address"
              errorMessage={fieldErrors.email}
              autoFocus
            />

            <InlineError message={error ?? undefined} />

            <AppButton
              label="Send reset link"
              loading={resetSubmitting}
              onPress={() => {
                handlePasswordReset().catch(() => undefined);
              }}
            />
            <AppButton
              label="Back to sign in"
              variant="secondary"
              onPress={() => {
                resetTransientState('login');
              }}
            />
          </View>
        </View>
        {toastMessage ? (
          <View
            style={[
              styles.toastWrap,
              keyboardHeight > 0
                ? {bottom: keyboardHeight + spacing.sm}
                : null,
            ]}>
            <AppToast message={toastMessage} />
          </View>
        ) : null}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.inner}>
        <AuthHeader
          title="Splyt"
          subtitle={
            mode === 'login'
              ? 'Track shared expenses without the napkin math.'
              : 'One identity for every trip you split.'
          }
        />

        <View style={styles.formBlock}>
          {mode === 'signup' ? (
            <AppInput
              label="Display name"
              value={displayName}
              onChangeText={value => {
                setDisplayName(value);
                setFieldErrors(current => ({...current, displayName: undefined}));
                clearError();
              }}
              placeholder="Mark Cruz"
              prefixIcon="person"
              errorMessage={fieldErrors.displayName}
            />
          ) : null}
          <AppInput
            label="Email"
            value={email}
            onChangeText={value => {
              setEmail(value);
              setFieldErrors(current => ({...current, email: undefined}));
              clearError();
            }}
            placeholder="mark@splyt.app"
            autoCapitalize="none"
            prefixIcon="mail"
            keyboardType="email-address"
            errorMessage={fieldErrors.email}
          />
          <AppInput
            label="Password"
            value={password}
            onChangeText={value => {
              setPassword(value);
              setFieldErrors(current => ({...current, password: undefined}));
              clearError();
            }}
            placeholder={mode === 'login' ? '••••••••' : 'At least 8 characters'}
            secureTextEntry
            autoCapitalize="none"
            prefixIcon="lock"
            errorMessage={fieldErrors.password}
          />

          {mode === 'login' ? (
            <View style={styles.forgotRow}>
              <Text
                style={styles.forgotText}
                onPress={() => {
                  setForgotEmail(email);
                  resetTransientState('forgot');
                }}>
                Forgot password?
              </Text>
            </View>
          ) : null}

          <InlineError message={error ?? undefined} />

          <AppButton
            label={mode === 'login' ? 'Sign in' : 'Create account'}
            loading={submitting}
            onPress={() => {
              handleSubmit().catch(() => undefined);
            }}
          />

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityState={{disabled: googleSubmitting, busy: googleSubmitting}}
            disabled={googleSubmitting}
            onPress={() => {
              clearError();
              setGoogleSubmitting(true);
              signInWithGoogle()
                .catch(() => undefined)
                .finally(() => setGoogleSubmitting(false));
            }}
            style={({pressed}) => [
              styles.oauthButton,
              googleSubmitting ? styles.oauthButtonDisabled : null,
              pressed ? styles.oauthButtonPressed : null,
            ]}>
            <View style={styles.oauthButtonContent}>
              {googleSubmitting ? (
                <ActivityIndicator color={palette.ink} size="small" />
              ) : (
                <Image
                  source={require('../../../assets/branding/icon-google.png')}
                  style={styles.oauthLogo}
                  resizeMode="contain"
                />
              )}
              <Text style={styles.oauthButtonText}>
                {googleSubmitting
                  ? mode === 'login'
                    ? 'Signing in with Google...'
                    : 'Signing up with Google...'
                  : mode === 'login'
                    ? 'Continue with Google'
                    : 'Sign up with Google'}
              </Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.switchBlock}>
          <Text style={styles.switchText}>
            {mode === 'login' ? 'New to Splyt? ' : 'Already have an account? '}
            <Text
              style={styles.switchLink}
              onPress={() => {
                resetTransientState(mode === 'login' ? 'signup' : 'login');
              }}>
              {mode === 'login' ? 'Create account' : 'Sign in'}
            </Text>
          </Text>
        </View>
      </View>
      {toastMessage ? (
        <View
          style={[
            styles.toastWrap,
            keyboardHeight > 0
              ? {bottom: keyboardHeight + spacing.sm}
              : null,
          ]}>
          <AppToast message={toastMessage} />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

export function ResetPasswordScreen() {
  const {recoveryUser, updatePassword, error, clearError} = useApp();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    clearError();
    const nextErrors: FieldErrors = {};

    if (password.length < 6) {
      nextErrors.password = 'Use at least 6 characters.';
    }

    if (confirmPassword !== password) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    if (nextErrors.password || nextErrors.confirmPassword) {
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    setSaving(true);

    try {
      await updatePassword(password);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.inner}>
        <AuthHeader
          title="Reset password"
          subtitle={
            recoveryUser
              ? `Set a new password for ${recoveryUser.email}.`
              : 'Set a new password to finish recovering your account.'
          }
        />

        <View style={styles.formBlock}>
          <AppInput
            label="New password"
            value={password}
            onChangeText={value => {
              setPassword(value);
              setFieldErrors(current => ({...current, password: undefined}));
              clearError();
            }}
            placeholder="At least 6 characters"
            secureTextEntry
            autoCapitalize="none"
            prefixIcon="lock"
            errorMessage={fieldErrors.password}
          />
          <AppInput
            label="Confirm password"
            value={confirmPassword}
            onChangeText={value => {
              setConfirmPassword(value);
              setFieldErrors(current => ({...current, confirmPassword: undefined}));
              clearError();
            }}
            placeholder="Repeat new password"
            secureTextEntry
            autoCapitalize="none"
            prefixIcon="lock"
            errorMessage={fieldErrors.confirmPassword}
          />

          <InlineError message={error ?? undefined} />

          <AppButton
            label="Update password"
            loading={saving}
            onPress={() => {
              handleSubmit().catch(() => undefined);
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.surface,
  },
  inner: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.xl,
  },
  wordmarkBlock: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  brandLogo: {
    width: 60,
    height: 60,
    marginBottom: spacing.sm,
  },
  wordmark: {
    ...typography.display,
    color: palette.primary,
    textAlign: 'center',
  },
  tagline: {
    ...typography.body,
    color: palette.inkMuted,
    textAlign: 'center',
  },
  formBlock: {
    gap: spacing.md,
  },
  forgotRow: {
    alignItems: 'flex-end',
    marginTop: -spacing.sm,
  },
  forgotText: {
    ...typography.label,
    color: palette.primary,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: palette.divider,
  },
  dividerText: {
    ...typography.caption,
    color: palette.inkMuted,
  },
  oauthButton: {
    height: 48,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: palette.divider,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  oauthButtonPressed: {
    opacity: 0.82,
  },
  oauthButtonDisabled: {
    opacity: 0.55,
  },
  oauthButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  oauthButtonText: {
    ...typography.bodyStrong,
    color: palette.ink,
  },
  oauthLogo: {
    width: 18,
    height: 18,
  },
  switchBlock: {
    alignItems: 'center',
    marginTop: 'auto',
  },
  switchText: {
    ...typography.body,
    color: palette.inkMuted,
  },
  switchLink: {
    ...typography.bodyStrong,
    color: palette.ink,
  },
  toastWrap: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.lg,
    alignItems: 'center',
  },
});
