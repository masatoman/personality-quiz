/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  productionBrowserSourceMaps: true, // 本番環境でのソースマップを有効化
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  // basePath: '/quiz',
  // assetPrefix: '/quiz/',
  trailingSlash: true,
  images: {
    domains: ['localhost'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // VSCodeが追加するクラスによるhydrationの警告を抑制
  onDemandEntries: {
    // SSRとCSRの不一致を許容する
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  webpack: (config) => {
    // ソースマップの設定を追加
    if (process.env.NODE_ENV === 'production') {
      config.devtool = 'source-map';
    } else {
      config.devtool = 'eval-source-map'; // 開発環境では高品質なソースマップを使用
    }
    
    config.module.rules.push({
      test: /\.(test|story)\.(js|jsx|ts|tsx)$/,
      loader: 'ignore-loader'
    });
    return config;
  },
  // CSS関連の設定を追加
  experimental: {
    optimizeCss: true, // CSSの最適化を有効化
  },
  compiler: {
    // スタイルの削除を防ぐ
    removeConsole: false,
  },
  // fontsの設定を削除
  optimizeFonts: true,
};

module.exports = nextConfig; 