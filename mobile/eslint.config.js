// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintConfigPrettier = require('eslint-config-prettier');

// Raw React Native imports that already have a design-system equivalent —
// screens and features should build with `Text`, `Button`, `Input`, etc.
// from `@/components` instead, so the app stays visually consistent as it
// grows. `src/components/**` and `src/core/**` are exempt since that's
// exactly where these primitives get wrapped in the first place.
const RESTRICTED_REACT_NATIVE_IMPORTS = {
  name: 'react-native',
  importNames: [
    'Text',
    'Pressable',
    'TouchableOpacity',
    'TouchableHighlight',
    'TouchableWithoutFeedback',
    'ActivityIndicator',
    'TextInput',
    'ScrollView',
  ],
  message: 'Use the design-system equivalent from "@/components" instead (Text, Button/Card, Input, LoadingSpinner, or ScrollScreen).',
};

module.exports = defineConfig([
  expoConfig,
  eslintConfigPrettier,
  {
    ignores: ['dist/*'],
  },
  {
    files: ['src/app/**/*.{ts,tsx}', 'src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { paths: [RESTRICTED_REACT_NATIVE_IMPORTS] }],
    },
  },
]);
