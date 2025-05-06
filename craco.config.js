const path = require('path');

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@types': path.resolve(__dirname, 'src/types'),
      '@constants': path.resolve(__dirname, 'src/constants'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@styles': path.resolve(__dirname, 'src/styles'),
    },
  },
};
