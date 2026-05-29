const path = require('path');

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    // 让 Metro 能解析 @/ 路径别名
    extraNodeModules: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  // 监听 src 目录
  watchFolders: [path.resolve(__dirname, 'src')],
};
