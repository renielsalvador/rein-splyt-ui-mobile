module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['./jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native|react-native|react-native-url-polyfill|react-native-linear-gradient|@supabase)/)',
  ],
};
