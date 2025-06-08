import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'プライバシーポリシー | ShiftWith',
  description: 'ShiftWithにおける個人情報の取り扱いとプライバシー保護方針をご説明します。',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* ヘッダー */}
          <div className="border-b border-gray-200 pb-6 mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">プライバシーポリシー</h1>
            <div className="flex items-center text-sm text-gray-600">
              <span>最終更新日: 2024年12月30日</span>
            </div>
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="text-green-600 mr-3">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-green-800 text-sm">
                  あなたのプライバシーと学習データを大切に保護し、透明性のある運用を心がけています。
                </p>
              </div>
            </div>
          </div>

          {/* 目次 */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">目次</h2>
            <nav className="space-y-2">
              <a href="#basic-policy" className="block text-blue-600 hover:text-blue-800 hover:underline">1. 基本方針</a>
              <a href="#collected-info" className="block text-blue-600 hover:text-blue-800 hover:underline">2. 収集する情報</a>
              <a href="#usage-purpose" className="block text-blue-600 hover:text-blue-800 hover:underline">3. 情報の利用目的</a>
              <a href="#learning-data" className="block text-blue-600 hover:text-blue-800 hover:underline">4. 学習データの活用</a>
              <a href="#data-sharing" className="block text-blue-600 hover:text-blue-800 hover:underline">5. 情報の共有・開示</a>
              <a href="#data-security" className="block text-blue-600 hover:text-blue-800 hover:underline">6. データセキュリティ</a>
              <a href="#user-rights" className="block text-blue-600 hover:text-blue-800 hover:underline">7. ユーザーの権利</a>
              <a href="#cookies" className="block text-blue-600 hover:text-blue-800 hover:underline">8. Cookie・トラッキング</a>
              <a href="#minors" className="block text-blue-600 hover:text-blue-800 hover:underline">9. 未成年者の利用</a>
              <a href="#policy-changes" className="block text-blue-600 hover:text-blue-800 hover:underline">10. プライバシーポリシーの変更</a>
            </nav>
          </div>

          {/* 本文 */}
          <div className="prose prose-lg max-w-none">
            <section id="basic-policy" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. 基本方針</h2>
              <p className="mb-4">
                ShiftWith（以下「本サービス」「当社」）は、「教えることで学ぶ」という理念に基づく学習コミュニティとして、ユーザーの皆様のプライバシーを最重要視しています。
              </p>
              <p className="mb-4">
                個人情報保護法をはじめとする関連法令を遵守し、適切かつ安全に個人情報を取り扱います。
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-blue-800 mb-2">プライバシー保護の3原則</h3>
                <ul className="list-disc list-inside text-blue-700 space-y-1">
                  <li><strong>透明性</strong>: どのような情報を収集し、どう活用するかを明確に説明</li>
                  <li><strong>選択権</strong>: ユーザーが自身のデータについて自由に選択・制御可能</li>
                  <li><strong>セキュリティ</strong>: 最高水準の技術と管理体制でデータを保護</li>
                </ul>
              </div>
            </section>

            <section id="collected-info" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. 収集する情報</h2>
              
              <h3 className="text-xl font-semibold mb-3">2.1 アカウント情報</h3>
              <ul className="list-disc list-inside mb-4 space-y-2">
                <li>メールアドレス</li>
                <li>ユーザー名（任意の表示名）</li>
                <li>プロフィール画像（任意）</li>
                <li>学習目標・興味分野（任意）</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">2.2 学習活動データ</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-yellow-800 mb-2">ギバー診断結果</h4>
                <ul className="list-disc list-inside text-yellow-700 space-y-1">
                  <li>診断テストの回答内容</li>
                  <li>学習タイプ（ギバー・マッチャー・テイカー）の判定結果</li>
                  <li>行動傾向スコア</li>
                </ul>
              </div>

              <ul className="list-disc list-inside mb-4 space-y-2">
                <li>教材閲覧履歴</li>
                <li>学習進捗・完了状況</li>
                <li>投稿した教材・コメント・レビュー</li>
                <li>ポイント獲得・消費履歴</li>
                <li>他のユーザーとの相互作用（いいね、フォロー等）</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">2.3 技術情報</h3>
              <ul className="list-disc list-inside mb-4 space-y-2">
                <li>IPアドレス</li>
                <li>ブラウザ・デバイス情報</li>
                <li>アクセス日時・頻度</li>
                <li>サイト内での行動ログ</li>
                <li>エラーログ・クラッシュレポート</li>
              </ul>
            </section>

            <section id="usage-purpose" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. 情報の利用目的</h2>
              
              <h3 className="text-xl font-semibold mb-3">3.1 学習体験の最適化</h3>
              <ul className="list-disc list-inside mb-4 space-y-2">
                <li>ユーザーの学習タイプに基づくパーソナライズされた教材推薦</li>
                <li>学習進捗の可視化・分析</li>
                <li>効果的な学習パスの提案</li>
                <li>学習継続のためのリマインダー・モチベーション支援</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">3.2 ギバー行動の促進</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-green-800">
                  「教えることで学ぶ」効果を最大化するため、ユーザーの行動パターンを分析し、適切なタイミングでギバー活動への参加を促進します。
                </p>
              </div>
              <ul className="list-disc list-inside mb-4 space-y-2">
                <li>ギバー行動の効果測定・可視化</li>
                <li>他の学習者のサポート機会の提案</li>
                <li>コミュニティ内での貢献度評価</li>
                <li>ポイントシステムの適正運用</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">3.3 サービス改善</h3>
              <ul className="list-disc list-inside mb-4 space-y-2">
                <li>機能の利用状況分析・改善</li>
                <li>ユーザビリティの向上</li>
                <li>新機能の開発・テスト</li>
                <li>セキュリティの強化</li>
                <li>カスタマーサポートの提供</li>
              </ul>
            </section>

            <section id="learning-data" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. 学習データの活用</h2>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-purple-800 mb-2">学習科学研究への貢献</h3>
                <p className="text-purple-700 mb-2">
                  匿名化された学習データを活用し、より効果的な学習方法の発見や教育技術の向上に貢献いたします。
                </p>
                <p className="text-purple-700 text-sm">
                  ※個人を特定できる情報は一切含まれません
                </p>
              </div>

              <h3 className="text-xl font-semibold mb-3">4.1 匿名化データの活用</h3>
              <ul className="list-disc list-inside mb-4 space-y-2">
                <li>学習パターンの統計分析</li>
                <li>効果的な教授法の研究</li>
                <li>AI学習アシスタントの改善</li>
                <li>学習コミュニティの最適化</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">4.2 データの匿名化プロセス</h3>
              <ul className="list-disc list-inside mb-4 space-y-2">
                <li>個人識別情報の完全削除</li>
                <li>行動データの統計処理</li>
                <li>第三者による個人特定可能性の検証</li>
                <li>定期的な匿名化手法の見直し・強化</li>
              </ul>
            </section>

            <section id="data-sharing" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. 情報の共有・開示</h2>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-red-800 mb-2">重要原則</h3>
                <p className="text-red-700">
                  法的義務がある場合を除き、ユーザーの明示的な同意なしに個人情報を第三者と共有することはありません。
                </p>
              </div>

              <h3 className="text-xl font-semibold mb-3">5.1 情報開示が必要な場合</h3>
              <ul className="list-disc list-inside mb-4 space-y-2">
                <li>法令に基づく開示要求があった場合</li>
                <li>ユーザーまたは第三者の安全が脅かされる場合</li>
                <li>サービスの不正利用を防止するため</li>
                <li>緊急時の医療対応（ユーザーの生命に関わる場合）</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">5.2 業務委託先との情報共有</h3>
              <ul className="list-disc list-inside mb-4 space-y-2">
                <li>データホスティング（AWS、Google Cloud等）</li>
                <li>メール配信サービス</li>
                <li>カスタマーサポートツール</li>
                <li>データ分析ツール（匿名化データのみ）</li>
              </ul>
              <p className="text-sm text-gray-600 mb-4">
                ※全ての委託先とは機密保持契約を締結し、厳格な管理基準を要求しています
              </p>
            </section>

            <section id="data-security" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. データセキュリティ</h2>
              
              <h3 className="text-xl font-semibold mb-3">6.1 技術的安全管理措置</h3>
              <ul className="list-disc list-inside mb-4 space-y-2">
                <li>SSL/TLS暗号化による通信保護</li>
                <li>データベースの暗号化</li>
                <li>アクセス制御・認証システム</li>
                <li>定期的なセキュリティ監査・脆弱性診断</li>
                <li>侵入検知システム（IDS）の導入</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">6.2 組織的安全管理措置</h3>
              <ul className="list-disc list-inside mb-4 space-y-2">
                <li>個人情報保護責任者の任命</li>
                <li>従業員への定期的なセキュリティ研修</li>
                <li>アクセス権限の最小権限原則</li>
                <li>インシデント対応手順の整備</li>
                <li>定期的なセキュリティポリシーの見直し</li>
              </ul>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-gray-800 mb-2">セキュリティインシデント時の対応</h3>
                <p className="text-gray-700 text-sm">
                  万が一、セキュリティインシデントが発生した場合は、速やかに影響を最小化し、
                  関係当局への報告および affected ユーザーへの通知を72時間以内に実施いたします。
                </p>
              </div>
            </section>

            <section id="user-rights" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. ユーザーの権利</h2>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-blue-800 mb-2">あなたのデータをコントロール</h3>
                <p className="text-blue-700">
                  ユーザーの皆様が自身のデータについて十分な制御権を持てるよう、以下の権利を保障しています。
                </p>
              </div>

              <h3 className="text-xl font-semibold mb-3">7.1 アクセス権</h3>
              <ul className="list-disc list-inside mb-4 space-y-2">
                <li>保有している個人情報の開示請求</li>
                <li>データの利用目的・処理状況の確認</li>
                <li>第三者提供記録の確認</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">7.2 修正・削除権</h3>
              <ul className="list-disc list-inside mb-4 space-y-2">
                <li>誤った情報の訂正・追加</li>
                <li>不要になった情報の削除</li>
                <li>アカウント削除時の関連データ消去</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">7.3 利用停止権</h3>
              <ul className="list-disc list-inside mb-4 space-y-2">
                <li>特定の情報処理の停止要求</li>
                <li>マーケティング目的での利用拒否</li>
                <li>データの持ち運び（エクスポート）</li>
              </ul>

              <p className="text-sm text-gray-600 mb-4">
                これらの権利を行使される場合は、プロフィール設定画面または
                <a href="/support" className="text-blue-600 hover:text-blue-800 underline">サポート窓口</a>
                からお手続きください。
              </p>
            </section>

            <section id="cookies" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookie・トラッキング</h2>
              
              <h3 className="text-xl font-semibold mb-3">8.1 使用するCookie</h3>
              <div className="overflow-x-auto mb-4">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 border text-left">種類</th>
                      <th className="px-4 py-2 border text-left">目的</th>
                      <th className="px-4 py-2 border text-left">保存期間</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-2 border font-medium">必須Cookie</td>
                      <td className="px-4 py-2 border">ログイン状態の維持、セキュリティ</td>
                      <td className="px-4 py-2 border">セッション終了時</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-4 py-2 border font-medium">機能Cookie</td>
                      <td className="px-4 py-2 border">言語設定、ユーザー設定の記憶</td>
                      <td className="px-4 py-2 border">1年間</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border font-medium">分析Cookie</td>
                      <td className="px-4 py-2 border">サイト利用状況の分析</td>
                      <td className="px-4 py-2 border">2年間</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-semibold mb-3">8.2 Cookie設定の管理</h3>
              <p className="mb-4">
                ブラウザの設定でCookieの受け入れを制御できますが、必須Cookieを無効にするとサービスの一部機能が利用できなくなる場合があります。
              </p>
            </section>

            <section id="minors" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. 未成年者の利用</h2>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-orange-800 mb-2">保護者の方へ</h3>
                <p className="text-orange-700">
                  13歳未満のお子様の個人情報については、保護者の方の同意を得てから収集いたします。
                </p>
              </div>

              <h3 className="text-xl font-semibold mb-3">9.1 未成年者保護措置</h3>
              <ul className="list-disc list-inside mb-4 space-y-2">
                <li>13歳未満：保護者の同意確認後に利用開始</li>
                <li>13-18歳：保護者への利用通知（任意）</li>
                <li>学習履歴の保護者確認機能</li>
                <li>不適切コンテンツへのアクセス制限</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">9.2 保護者の権利</h3>
              <ul className="list-disc list-inside mb-4 space-y-2">
                <li>お子様のアカウント情報へのアクセス</li>
                <li>学習履歴の確認</li>
                <li>アカウント停止・削除の要求</li>
                <li>個人情報利用の制限要求</li>
              </ul>
            </section>

            <section id="policy-changes" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. プライバシーポリシーの変更</h2>
              
              <h3 className="text-xl font-semibold mb-3">10.1 変更手続き</h3>
              <ul className="list-disc list-inside mb-4 space-y-2">
                <li>重要な変更：30日前の事前通知</li>
                <li>軽微な変更：サイト上での告知</li>
                <li>法令改正対応：速やかな対応・通知</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">10.2 通知方法</h3>
              <ul className="list-disc list-inside mb-4 space-y-2">
                <li>登録メールアドレスへの直接通知</li>
                <li>サービス内の重要通知</li>
                <li>当サイトでの告知</li>
              </ul>

              <p className="mb-4">
                変更後のプライバシーポリシーは、通知から30日経過後または継続利用により効力を生じます。
                変更内容に同意いただけない場合は、アカウント削除をお願いいたします。
              </p>
            </section>
          </div>

          {/* お問い合わせ */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-semibold mb-4">お問い合わせ・データ保護責任者</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium mb-2">一般的なお問い合わせ</h3>
                <p className="text-blue-600">support@shiftwith.app</p>
                <p className="text-sm text-gray-600 mt-1">
                  プライバシーに関するご質問・ご相談
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium mb-2">データ保護責任者</h3>
                <p className="text-blue-600">privacy@shiftwith.app</p>
                <p className="text-sm text-gray-600 mt-1">
                  個人情報の取り扱いに関する専門窓口
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              通常24-48時間以内にご返信いたします。お急ぎの場合はその旨をお知らせください。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 