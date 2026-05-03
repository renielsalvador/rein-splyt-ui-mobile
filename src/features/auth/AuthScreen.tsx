import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {AppButton, AppCard, AppInput, AppScreen, InlineError} from '../../components/ui';
import {authSchema} from '../../lib/validation/forms';
import {useApp} from '../../app/AppProvider';
import {palette, spacing, typography} from '../../theme/tokens';

export function AuthScreen() {
  const {signIn, signUp, error} = useApp();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | undefined>();

  async function handleSubmit() {
    const parsed = authSchema.safeParse({
      email,
      password,
      displayName: mode === 'signup' ? displayName : undefined,
    });

    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message);
      return;
    }

    setFormError(undefined);

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
  }

  return (
    <AppScreen
      title="Splyt"
      subtitle="Group expenses, balances, invites, and settlement summaries in one flow.">
      <AppCard tone="warm">
        <Text style={styles.heading}>{mode === 'login' ? 'Sign in' : 'Create account'}</Text>
        {mode === 'signup' ? (
          <AppInput
            label="Display name"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Diane Cruz"
          />
        ) : null}
        <AppInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          autoCapitalize="none"
        />
        <AppInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
          autoCapitalize="none"
        />
        <InlineError message={formError ?? error ?? undefined} />
        <AppButton
          label={mode === 'login' ? 'Sign in' : 'Create account'}
          onPress={() => {
            handleSubmit().catch(() => undefined);
          }}
        />
        <View style={{gap: spacing.xs}}>
          <Text style={{...typography.eyebrow, color: palette.inkMuted}}>
            {mode === 'login'
              ? 'Need an account?'
              : 'Already created one?'}
          </Text>
          <AppButton
            label={mode === 'login' ? 'Switch to sign up' : 'Switch to sign in'}
            variant="secondary"
            onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}
          />
        </View>
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  heading: {
    ...typography.title,
    fontSize: 22,
    lineHeight: 26,
  },
});
