module.exports = function (api) {
  api.cache(true);
  return {
    // valtio (used by Reown AppKit) needs import.meta transformed
    presets: [["babel-preset-expo", { unstable_transformImportMeta: true }]],
  };
};
