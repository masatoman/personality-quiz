import { ReactNode } from 'react';
import Navbar from './Navbar';
import { FaTwitter, FaGithub } from 'react-icons/fa';

interface RootLayoutProps {
  children: ReactNode;
}

export const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ヘッダー - スティッキーポジションと影を追加 */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Navbar />
        </div>
      </header>

      {/* メインコンテンツ - フレックスグロー適用で最小高さを確保 */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* フッター - レスポンシブグリッドとホバーエフェクト */}
      <footer className="bg-gray-800 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* ブランドセクション */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">ShiftWith</h2>
              <p className="text-sm text-gray-400">
                ギバーの成長をサポートするプラットフォーム
              </p>
            </div>

            {/* リンクセクション */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">リンク</h3>
              <ul className="space-y-2">
                {['About', 'Contact', 'Terms', 'Privacy Policy'].map((link) => (
                  <li key={link}>
                    <a
                      href={`/${link.toLowerCase().replace(' ', '-')}`}
                      className="hover:text-white transition-colors duration-200 text-sm"
                      aria-label={`${link}ページへ移動`}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* ソーシャルメディアセクション */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">フォロー</h3>
              <div className="flex space-x-4">
                <a
                  href="https://twitter.com/shiftwith"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors duration-200"
                  aria-label="Twitter"
                >
                  <FaTwitter className="w-6 h-6" />
                  <span className="sr-only">Twitterでフォロー</span>
                </a>
                <a
                  href="https://github.com/shiftwith"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors duration-200"
                  aria-label="GitHub"
                >
                  <FaGithub className="w-6 h-6" />
                  <span className="sr-only">GitHubでフォロー</span>
                </a>
              </div>
            </div>
          </div>

          {/* コピーライト */}
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-400">
            <p>© 2024 ShiftWith. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}; 