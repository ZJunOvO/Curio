/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用实验性功能
  experimental: {
    // 优化代码分割
    optimizeCss: true,
    // 启用并发特性
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
  
  // 性能优化配置
  compiler: {
    // 移除console.log (生产环境)
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },
  
  // 启用Bundle Analyzer（可选）
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config, { dev, isServer }) => {
      // 只在客户端构建时启用Bundle Analyzer
      if (!dev && !isServer) {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'server',
            analyzerPort: 8888,
            openAnalyzer: true,
          })
        );
      }
      return config;
    },
  }),
  
  // 图片优化
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1年缓存
  },
  
  // 静态资源压缩
  compress: true,
  
  // 性能监控
  poweredByHeader: false,
  
  // 启用SWC minification（更快的构建）
  swcMinify: true,
};

module.exports = nextConfig;