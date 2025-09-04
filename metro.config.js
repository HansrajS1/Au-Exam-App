const path = require('path');
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

config.resolver = config.resolver || {};
config.resolver.alias = {
	...(config.resolver.alias || {}),
	'@': path.resolve(__dirname)
};

module.exports = withNativeWind(config, { input: './app/globals.css' });