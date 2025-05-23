/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
  // srcディレクトリのサポートを追加
  distDir: '.next',
  // 開発環境の設定
  webpack: (config, { dev, isServer }) => {
    // 開発環境でのホットリロードを最適化
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    
    // React-Beautiful-DND関連の警告を抑制
    config.resolve.alias = {
      ...config.resolve.alias,
      'react/jsx-runtime': require.resolve('react/jsx-runtime'),
    };
    
    return config
  },
  // React 18の厳格モードで特定の警告を抑制
  reactProductionProfiling: false,
  // 開発環境でのエラー表示を詳細に
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Next.js 14の新機能を有効化
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  // エラーハンドリングの改善
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig; 