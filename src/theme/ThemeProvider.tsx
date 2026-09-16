import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {useColorScheme} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {colorSchemes} from './tokens';
import type {Colors, ColorSchemeName} from './tokens';

export type AppearancePreference = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'splyt.appearance';

const APPEARANCE_LABELS: Record<AppearancePreference, string> = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
};

type ThemeValue = {
  colors: Colors;
  scheme: ColorSchemeName;
  isDark: boolean;
  preference: AppearancePreference;
  preferenceLabel: string;
  setPreference: (next: AppearancePreference) => void;
};

const ThemeContext = createContext<ThemeValue>({
  colors: colorSchemes.light,
  scheme: 'light',
  isDark: false,
  preference: 'system',
  preferenceLabel: 'System',
  setPreference: () => undefined,
});

function isPreference(value: unknown): value is AppearancePreference {
  return value === 'system' || value === 'light' || value === 'dark';
}

export function ThemeProvider({children}: React.PropsWithChildren) {
  const systemScheme = useColorScheme();
  const [preference, setStoredPreference] = useState<AppearancePreference>('system');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(value => {
        if (isPreference(value)) {
          setStoredPreference(value);
        }
      })
      .catch(() => undefined);
  }, []);

  const setPreference = useCallback((next: AppearancePreference) => {
    setStoredPreference(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => undefined);
  }, []);

  const value = useMemo<ThemeValue>(() => {
    const scheme: ColorSchemeName =
      preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;

    return {
      colors: colorSchemes[scheme],
      scheme,
      isDark: scheme === 'dark',
      preference,
      preferenceLabel: APPEARANCE_LABELS[preference],
      setPreference,
    };
  }, [preference, setPreference, systemScheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

/**
 * Rebuilds a stylesheet only when the scheme flips, so themed screens keep the
 * single-object identity that `StyleSheet.create` callers rely on.
 */
export function useStyles<T>(factory: (colors: Colors) => T): T {
  const {colors, scheme} = useTheme();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => factory(colors), [scheme]);
}
