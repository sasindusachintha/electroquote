// metro.config.js
// Configures Metro bundler for ElectroQuote.
// Key fix: treat .wasm as a binary asset (not a JS module) so expo-sqlite
// web worker can load it without a parse error.

const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Remove 'wasm' from sourceExts if Metro added it, then add to assetExts.
// This prevents Metro from trying to parse the WASM binary as JavaScript.
config.resolver.sourceExts = config.resolver.sourceExts.filter(
  (ext) => ext !== 'wasm'
);
config.resolver.assetExts = [
  ...config.resolver.assetExts.filter((ext) => ext !== 'wasm'),
  'wasm',
  'sql',
];

module.exports = config;
