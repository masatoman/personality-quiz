/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  // basePath: '/quiz',
  // assetPrefix: '/quiz/',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // VSCodeが追加するクラスによるhydrationの警告を抑制
  onDemandEntries: {
    // SSRとCSRの不一致を許容する
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  webpack: (config) => {
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
  // フォントの設定を追加
  optimizeFonts: true,
  fonts: {
    google: {
      families: ['M PLUS Rounded 1c:400,500,700']
    }
  },
};

module.exports = nextConfig; 