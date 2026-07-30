// https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-sqlite's web implementation loads its wa-sqlite engine as a .wasm
// asset (see node_modules/expo-sqlite/web/worker.ts) — Metro's default
// asset extensions don't include it, so without this it fails to resolve
// on web only (native platforms are unaffected).
config.resolver.assetExts.push('wasm');

module.exports = config;
