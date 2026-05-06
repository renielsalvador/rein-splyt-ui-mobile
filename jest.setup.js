/* eslint-env jest */

jest.mock('react-native-config', () => ({
  __esModule: true,
  default: {
    SUPABASE_URL: '',
    SUPABASE_ANON_KEY: '',
  },
}));

jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'MaterialCommunityIcons');

jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(),
  launchImageLibrary: jest.fn(),
}));

jest.mock('react-native-calendars', () => ({
  Calendar: 'Calendar',
}));
