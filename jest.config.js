module.exports = {
  preset: '@react-native/jest-preset',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|@reduxjs/toolkit|redux-persist|react-redux|immer|@shopify/flash-list|react-native-vector-icons|react-native-tts|react-native-sqlite-storage|react-native-image-picker|react-native-safe-area-context)/)',
  ],
  moduleNameMapper: {
    '@react-native-async-storage/async-storage': '<rootDir>/__mocks__/@react-native-async-storage/async-storage.js',
    'react-native-tts': '<rootDir>/__mocks__/react-native-tts.js',
  },
};
