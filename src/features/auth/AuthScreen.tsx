import React, {useState} from 'react';
import {Image, Pressable, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {AppButton, AppInput, InlineError} from '../../components/ui';
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
    <SafeAreaView style={styles.root}>
      <View style={styles.inner}>
        <View style={styles.wordmarkBlock}>
          <Image
            source={require('../../../assets/branding/splyt-app-icon-no-bg.png')}
            style={styles.brandLogo}
            resizeMode="contain"
          />
          <Text style={styles.wordmark}>Splyt</Text>
          <Text style={styles.tagline}>
            {mode === 'login'
              ? 'Track shared expenses without the napkin math.'
              : 'One identity for every trip you split.'}
          </Text>
        </View>

        <View style={styles.formBlock}>
          {mode === 'signup' ? (
            <AppInput
              label="Display name"
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Mark Cruz"
              prefixIcon="person"
            />
          ) : null}
          <AppInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="mark@splyt.app"
            autoCapitalize="none"
            prefixIcon="mail"
            keyboardType="email-address"
          />
          <AppInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder={mode === 'login' ? '••••••••' : 'At least 8 characters'}
            secureTextEntry
            autoCapitalize="none"
            prefixIcon="lock"
          />

          {mode === 'login' ? (
            <View style={styles.forgotRow}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </View>
          ) : null}

          <InlineError message={formError ?? error ?? undefined} />

          <AppButton
            label={mode === 'login' ? 'Sign in' : 'Create account'}
            onPress={() => {
              handleSubmit().catch(() => undefined);
            }}
          />

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.oauthRow}>
            <Pressable style={styles.oauthButton}>
              <Text style={styles.oauthButtonText}>Google</Text>
            </Pressable>
            <Pressable style={styles.oauthButton}>
              <Text style={styles.oauthButtonText}>Apple</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.switchBlock}>
          <Text style={styles.switchText}>
            {mode === 'login' ? 'New to Splyt? ' : 'Already have an account? '}
            <Text
              style={styles.switchLink}
              onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}>
              {mode === 'login' ? 'Create account' : 'Sign in'}
            </Text>
          </Text>
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
  oauthRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  oauthButton: {
    flex: 1,
    height: 48,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.divider,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  oauthButtonText: {
    ...typography.bodyStrong,
    color: palette.ink,
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
});
