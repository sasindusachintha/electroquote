// babel.config.js
// Required for: react-native-reanimated (worklets), SQL file imports, path aliases

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // react-native-reanimated MUST be last
      'react-native-reanimated/plugin',
    ],
  };
};
