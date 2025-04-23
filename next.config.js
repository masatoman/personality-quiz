/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  compiler: {
    styledComponents: true,
  },
  experimental: {
    forceSwcTransforms: true // SWCを強制的に使用
  },
  // 開発環境でのソースマップ有効化
  productionBrowserSourceMaps: true,
  // ページの設定
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
  // リライトルールの追加
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/test-ui',
          destination: '/test-ui',
        },
      ],
    };
  },
};

module.exports = nextConfig;