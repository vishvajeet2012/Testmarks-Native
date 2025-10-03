const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add any custom configuration here
config.resolver.alias = {
  ...config.resolver.alias,
  'socket.io-client': require.resolve('socket.io-client'),
};

module.exports = config;
