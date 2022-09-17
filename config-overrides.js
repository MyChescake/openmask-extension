const { removeModuleScopePlugin } = require("customize-cra");
const webpack = require("webpack");

module.exports = function override(config, env) {
  removeModuleScopePlugin()(config);

  config.resolve.fallback = {
    ...config.resolve.fallback,
    buffer: require.resolve("buffer"),
  };
  config.resolve.extensions = [...config.resolve.extensions, ".ts", ".js"];
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
  ];

  return config;
};
