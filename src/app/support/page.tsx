import { Metadata } from 'next';
import { 
  FaQuestionCircle, 
  FaEnvelope, 
  FaBook, 
  FaComments,
  FaLightbulb,
  FaTools,
  FaCog,
  FaShieldAlt,
  FaSearch,
  FaExternalLinkAlt
} from 'react-icons/fa';

export const metadata: Metadata = {
  title: 'サポート・ヘルプセンター | ShiftWith',
  description: 'ShiftWithの使い方やよくある質問、お問い合わせ方法をご案内します。学習をより効果的に進めるためのサポート情報満載。',
};

export default function SupportPage() {
  const faqs = [
    {
      category: '診断・学習タイプ',
      questions: [
        {
          q: 'ギバー診断の結果は変更できますか？',
          a: '診断結果は行動の変化により自然に変わることがあります。3ヶ月に1度程度、再診断することをお勧めします。プロフィール設定から再診断が可能です。'
        },
        {
          q: '学習タイプが複数該当する場合はどうすればいいですか？',
          a: 'すべての人が複数の要素を持っています。メインタイプを基盤に、サブタイプの特徴も活用して学習プランを組み立ててください。バランス型（マッチャー）の場合は特に柔軟なアプローチが効果的です。'
        },
        {
          q: '診断結果が正確でないと感じます。',
          a: '診断は傾向を把握するためのツールです。日々の行動や気持ちの変化により結果が変わることは自然です。より正確な結果のため、リラックスした状態で素直に回答することをお勧めします。'
        }
      ]
    },
    {
      category: '教材・学習',
      questions: [
        {
          q: '教材を作成したいのですが、何から始めればいいですか？',
          a: '「教材作成」ページから始められます。まず小さなトピック（単語の覚え方、簡単な文法など）から始めて、他の学習者からのフィードバックを受けて改善していくことをお勧めします。'
        },
        {
          q: '教材の品質基準はありますか？',
          a: '明確な学習目標、正確な情報、分かりやすい説明が基本です。コミュニティガイドラインに詳細な基準を記載していますので、ご確認ください。'
        },
        {
          q: '他の人の教材にコメントする際の注意点は？',
          a: '建設的で具体的なフィードバックを心がけてください。良い点を認めつつ、改善提案があれば優しく伝えることで、お互いの学習効果が高まります。'
        }
      ]
    },
    {
      category: 'ポイント・システム',
      questions: [
        {
          q: 'ポイントはどのように獲得できますか？',
          a: '教材作成（5-20pt）、他者へのフィードバック（2-5pt）、質問への回答（3-10pt）、学習完了（1-3pt）などの活動で獲得できます。質の高い貢献ほど多くのポイントが得られます。'
        },
        {
          q: 'ポイントの使い道を教えてください。',
          a: 'プレミアム教材へのアクセス、個別学習コンサルテーション、特別イベントへの参加などに使用できます。今後も利用先を拡充予定です。'
        },
        {
          q: 'ポイントに有効期限はありますか？',
          a: '基本的に有効期限はありませんが、6ヶ月間全く活動がない場合は一部ポイントが減算される場合があります。継続的な学習活動をお勧めします。'
        }
      ]
    },
    {
      category: 'アカウント・設定',
      questions: [
        {
          q: 'プロフィール情報を変更したいです。',
          a: 'ログイン後、右上のプロフィールアイコンから「設定」にアクセスして変更できます。メールアドレス変更の場合は確認メールでの認証が必要です。'
        },
        {
          q: 'アカウントを削除したい場合は？',
          a: '設定ページの下部「アカウント削除」から手続きできます。削除前にデータのエクスポートが可能です。削除後の復旧はできませんのでご注意ください。'
        },
        {
          q: 'パスワードを忘れてしまいました。',
          a: 'ログインページの「パスワードを忘れた方」から、登録メールアドレスを入力してパスワードリセットメールを受信してください。'
        }
      ]
    }
  ];

  const supportCategories = [
    {
      icon: FaBook,
      title: '学習ガイド',
      description: '効果的な学習方法と教材活用のコツ',
      links: [
        { title: 'ギバー型学習法', url: '/resources#giver-guide' },
        { title: 'マッチャー型学習法', url: '/resources#matcher-guide' },
        { title: 'テイカー型学習法', url: '/resources#taker-guide' },
        { title: '教材作成ガイド', url: '/resources#material-creation' }
      ]
    },
    {
      icon: FaComments,
      title: 'コミュニティ',
      description: 'ユーザー同士で質問・回答・相談',
      links: [
        { title: 'Q&Aフォーラム', url: '/community#qa' },
        { title: '学習グループ', url: '/community#groups' },
        { title: '成功体験シェア', url: '/community#success' },
        { title: 'フィードバック交換', url: '/community#feedback' }
      ]
    },
    {
      icon: FaTools,
      title: '機能・操作',
      description: 'サイトの使い方と機能説明',
      links: [
        { title: '基本的な使い方', url: '/resources#basic-usage' },
        { title: '診断テストについて', url: '/resources#quiz-guide' },
        { title: 'ポイントシステム', url: '/resources#points' },
        { title: 'プロフィール設定', url: '/resources#profile' }
      ]
    },
    {
      icon: FaShieldAlt,
      title: 'セキュリティ・プライバシー',
      description: '安全な利用のための情報',
      links: [
        { title: 'プライバシーポリシー', url: '/privacy' },
        { title: '利用規約', url: '/terms' },
        { title: 'セキュリティ設定', url: '/resources#security' },
        { title: 'データ管理', url: '/resources#data-management' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            サポート・ヘルプセンター
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            ShiftWithをより効果的にご利用いただくためのサポート情報
          </p>
          
          {/* 検索バー */}
          <div className="max-w-2xl mx-auto relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="よくある質問を検索..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button className="absolute right-2 top-2 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
              検索
            </button>
          </div>
        </div>

        {/* 緊急時連絡先 */}
        <div className="mb-12 p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center mb-4">
            <FaShieldAlt className="text-red-600 mr-3" size={24} />
            <h2 className="text-xl font-semibold text-red-800">緊急時・重要な問題</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-red-800 mb-2">セキュリティ問題</h3>
              <p className="text-red-700 text-sm mb-2">アカウントの不正アクセス、セキュリティ脆弱性など</p>
              <a href="mailto:security@shiftwith.app" className="text-red-600 hover:text-red-800 underline">
                security@shiftwith.app
              </a>
            </div>
            <div>
              <h3 className="font-medium text-red-800 mb-2">重大なバグ・障害</h3>
              <p className="text-red-700 text-sm mb-2">サービス利用に支障をきたす問題</p>
              <a href="mailto:urgent@shiftwith.app" className="text-red-600 hover:text-red-800 underline">
                urgent@shiftwith.app
              </a>
            </div>
          </div>
        </div>

        {/* サポートカテゴリ */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            カテゴリ別サポート
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportCategories.map((category, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <category.icon className="text-blue-600 mr-3" size={24} />
                  <h3 className="text-lg font-semibold text-gray-900">{category.title}</h3>
                </div>
                <p className="text-gray-600 mb-4 text-sm">{category.description}</p>
                <ul className="space-y-2">
                  {category.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a
                        href={link.url}
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center group"
                      >
                        {link.title}
                        <FaExternalLinkAlt className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" size={10} />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* よくある質問 */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            よくある質問（FAQ）
          </h2>
          <div className="space-y-8">
            {faqs.map((category, categoryIndex) => (
              <div key={categoryIndex} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-2">
                  {category.category}
                </h3>
                <div className="space-y-6">
                  {category.questions.map((faq, faqIndex) => (
                    <details key={faqIndex} className="group">
                      <summary className="flex items-center justify-between cursor-pointer list-none">
                        <h4 className="text-lg font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                          {faq.q}
                        </h4>
                        <FaQuestionCircle className="text-blue-600 group-open:rotate-180 transition-transform" />
                      </summary>
                      <div className="mt-4 pl-4 border-l-4 border-blue-100">
                        <p className="text-gray-700 leading-relaxed">{faq.a}</p>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* お問い合わせフォーム */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <FaEnvelope className="mx-auto text-blue-600 mb-4" size={48} />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">お問い合わせ</h2>
            <p className="text-gray-600">
              FAQで解決しない問題がございましたら、お気軽にお問い合わせください。
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* お問い合わせフォーム */}
            <div>
              <h3 className="text-lg font-semibold mb-6">お問い合わせフォーム</h3>
              <form className="space-y-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    お問い合わせカテゴリ
                  </label>
                  <select
                    id="category"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">カテゴリを選択してください</option>
                    <option value="technical">技術的な問題・バグ報告</option>
                    <option value="account">アカウント・ログイン問題</option>
                    <option value="learning">学習・教材に関する質問</option>
                    <option value="community">コミュニティ・マナーについて</option>
                    <option value="points">ポイント・システムについて</option>
                    <option value="feedback">機能改善の提案</option>
                    <option value="other">その他</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                    優先度
                  </label>
                  <select
                    id="priority"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">低（一般的な質問）</option>
                    <option value="medium">中（不便を感じている）</option>
                    <option value="high">高（サービス利用に支障）</option>
                    <option value="urgent">緊急（重大な問題）</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    件名
                  </label>
                  <input
                    type="text"
                    id="subject"
                    placeholder="問題の要約を簡潔にお書きください"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    詳細内容
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    placeholder="詳細な内容をお書きください。エラーメッセージ、発生状況、試した解決方法などもご記載いただけると迅速な対応が可能です。"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  ></textarea>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    返信用メールアドレス
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="your@email.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  送信する
                </button>
              </form>
            </div>

            {/* 直接連絡先・対応時間 */}
            <div>
              <h3 className="text-lg font-semibold mb-6">直接連絡・対応時間</h3>
              
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">一般サポート</h4>
                  <p className="text-blue-700 mb-2">support@shiftwith.app</p>
                  <p className="text-sm text-blue-600">通常24時間以内に返信</p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">学習・教材相談</h4>
                  <p className="text-green-700 mb-2">learning@shiftwith.app</p>
                  <p className="text-sm text-green-600">学習効果を高めるアドバイス</p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-800 mb-2">技術的問題</h4>
                  <p className="text-purple-700 mb-2">tech@shiftwith.app</p>
                  <p className="text-sm text-purple-600">バグ報告・機能改善提案</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-3">対応時間</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>平日: 9:00-18:00（JST）</li>
                    <li>土日祝: 限定対応</li>
                    <li>緊急時: 24時間対応</li>
                    <li>返信目安: 24-48時間以内</li>
                  </ul>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="font-medium text-yellow-800 mb-2">💡 より早い解決のために</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• 具体的なエラーメッセージを記載</li>
                    <li>• 問題が発生する手順を詳しく説明</li>
                    <li>• 使用ブラウザ・デバイス情報を記載</li>
                    <li>• スクリーンショットがあれば添付</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* フィードバック・改善提案 */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
          <div className="text-center">
            <FaLightbulb className="mx-auto text-yellow-500 mb-4" size={48} />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              サービス改善にご協力ください
            </h2>
            <p className="text-gray-600 mb-6">
              あなたのご意見がShiftWithをより良いサービスにします。<br />
              機能改善のアイデアやユーザビリティの問題など、どんなことでもお聞かせください。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:feedback@shiftwith.app"
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                改善提案を送る
              </a>
              <a
                href="/community#feedback"
                className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-md hover:bg-blue-50 transition-colors font-medium"
              >
                コミュニティで議論
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 