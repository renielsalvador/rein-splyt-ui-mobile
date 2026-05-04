/* eslint-env jest */

jest.mock('react-native-config', () => ({
  __esModule: true,
  default: {
    SUPABASE_URL: '',
    SUPABASE_ANON_KEY: '',
  },
}));
