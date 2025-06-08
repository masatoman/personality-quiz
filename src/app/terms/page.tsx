import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '利用規約 | ShiftWith',
  description: 'ShiftWithの利用規約をご確認ください。安全で学習効果の高いコミュニティ運営のためのルールです。',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* ヘッダー */}
          <div className="border-b border-gray-200 pb-6 mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">利用規約</h1>
            <div className="flex items-center text-sm text-gray-600">
              <span>最終更新日: 2024年12月30日</span>
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <div className="text-blue-600 mr-3">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-blue-800 text-sm">
                  重要な変更がある場合は、事前にメールまたはサイト内通知でお知らせいたします。
                </p>
              </div>
            </div>
          </div>

          {/* 目次 */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">目次</h2>
            <nav className="space-y-2">
              <a href="#service-overview" className="block text-blue-600 hover:text-blue-800 hover:underline">1. サービス概要</a>
              <a href="#user-responsibility" className="block text-blue-600 hover:text-blue-800 hover:underline">2. ユーザーの責任</a>
              <a href="#content-policy" className="block text-blue-600 hover:text-blue-800 hover:underline">3. コンテンツポリシー</a>
              <a href="#giver-community" className="block text-blue-600 hover:text-blue-800 hover:underline">4. ギバーコミュニティのルール</a>
              <a href="#points-system" className="block text-blue-600 hover:text-blue-800 hover:underline">5. ポイントシステム</a>
              <a href="#intellectual-property" className="block text-blue-600 hover:text-blue-800 hover:underline">6. 知的財産権</a>
              <a href="#privacy" className="block text-blue-600 hover:text-blue-800 hover:underline">7. プライバシー</a>
              <a href="#prohibited-acts" className="block text-blue-600 hover:text-blue-800 hover:underline">8. 禁止事項</a>
              <a href="#disclaimer" className="block text-blue-600 hover:text-blue-800 hover:underline">9. 免責事項</a>
              <a href="#changes" className="block text-blue-600 hover:text-blue-800 hover:underline">10. 規約の変更</a>
            </nav>
          </div>

          {/* 本文 */}
          <div className="prose prose-lg max-w-none">
            <section id="service-overview" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. サービス概要</h2>
              <p className="mb-4">
                ShiftWith（以下「本サービス」）は、「教えることで学ぶ」という原則に基づき、ユーザー同士が英語学習において相互に支援し合うプラットフォームです。
              </p>
              <p className="mb-4">
                本サービスは、ギバー行動（教材作成、フィードバック提供、知識共有等）を促進することで、ユーザーの学習効果と継続率の向上を目指します。
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-green-800 mb-2">本サービスの核心価値</h3>
                <ul className="list-disc list-inside text-green-700 space-y-1">
                  <li>他者を助けることで自己の学習効果を高める</li>
                  <li>学習コミュニティの質的向上</li>
                  <li>継続的な学習モチベーションの維持</li>
                </ul>
              </div>
            </section>

            <section id="user-responsibility" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. ユーザーの責任</h2>
              
              <h3 className="text-xl font-semibold mb-3">2.1 アカウント管理</h3>
              <ul className="list-disc list-inside mb-4 space-y-2">
                <li>正確な情報を提供し、常に最新の状態に保つこと</li>
                <li>アカウント情報を第三者と共有しないこと</li>
                <li>不正アクセスを発見した場合は速やかに報告すること</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">2.2 教材投稿について</h3>
              <ul className="list-disc list-inside mb-4 space-y-2">
                <li>オリジナルコンテンツまたは適切な許可を得たコンテンツのみを投稿すること</li>
                <li>学習者にとって有益で質の高い内容を提供するよう努めること</li>
                <li>誤解を招く情報や不正確な内容を投稿しないこと</li>
                <li>著作権や知的財産権を尊重すること</li>
              </ul>
            </section>

            <section id="content-policy" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. コンテンツポリシー</h2>
              
              <h3 className="text-xl font-semibold mb-3">3.1 推奨コンテンツ</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <ul className="list-disc list-inside text-blue-800 space-y-1">
                  <li>建設的で学習効果の高い教材</li>
                  <li>初心者にも理解しやすい丁寧な説明</li>
                  <li>実践的で応用可能な内容</li>
                  <li>他の学習者への敬意と配慮を示すコメント</li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold mb-3">3.2 品質基準</h3>
              <ul className="list-disc list-inside mb-4 space-y-2">
                <li>文法的に正確で理解しやすい日本語</li>
                <li>適切な構成と論理的な流れ</li>
                <li>出典の明記（引用がある場合）</li>
                <li>学習レベルに応じた適切な難易度設定</li>
              </ul>
            </section>

            <section id="giver-community" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. ギバーコミュニティのルール</h2>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-yellow-800 mb-2">ギバー精神の実践</h3>
                <p className="text-yellow-700">
                  本サービスは「教えることで学ぶ」を重視します。他者の学習を支援することで、自身の理解も深まることを理解し、積極的な貢献をお願いします。
                </p>
              </div>

              <h3 className="text-xl font-semibold mb-3">4.1 フィードバック提供</h3>
              <ul className="list-disc list-inside mb-4 space-y-2">
                <li>建設的で具体的なフィードバックを心がけること</li>
                <li>批判よりも改善提案を重視すること</li>
                <li>他者の努力を認め、敬意を払うこと</li>
                <li>多様な学習スタイルを理解し、配慮すること</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">4.2 質問・回答</h3>
              <ul className="list-disc list-inside mb-4 space-y-2">
                <li>明確で具体的な質問をすること</li>
                <li>回答者への感謝の気持ちを表すこと</li>
                <li>正確で役立つ回答を提供するよう努めること</li>
                <li>不明な点は推測ではなく「分からない」と伝えること</li>
              </ul>
            </section>

            <section id="points-system" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. ポイントシステム</h2>
              
              <h3 className="text-xl font-semibold mb-3">5.1 ポイント獲得</h3>
              <ul className="list-disc list-inside mb-4 space-y-2">
                <li>教材作成、フィードバック提供、質問回答等の貢献活動でポイントを獲得</li>
                <li>ポイントは自動計算され、不正な操作は禁止</li>
                <li>質の高い貢献ほど多くのポイントを獲得可能</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">5.2 ポイント使用</h3>
              <ul className="list-disc list-inside mb-4 space-y-2">
                <li>プレミアム機能の利用</li>
                <li>特別教材へのアクセス</li>
                <li>コミュニティイベントへの参加</li>
              </ul>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-red-800 mb-2">重要事項</h3>
                <p className="text-red-700">
                  ポイントの不正獲得、売買、譲渡は禁止されています。違反が確認された場合、アカウント停止等の措置を講じます。
                </p>
              </div>
            </section>

            <section id="intellectual-property" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. 知的財産権</h2>
              
              <h3 className="text-xl font-semibold mb-3">6.1 ユーザー投稿コンテンツ</h3>
              <ul className="list-disc list-inside mb-4 space-y-2">
                <li>投稿されたコンテンツの著作権は投稿者に帰属</li>
                <li>本サービスでの使用に必要な範囲での利用権を弊社に許諾</li>
                <li>他のユーザーの学習目的での利用を許可</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">6.2 本サービスのコンテンツ</h3>
              <ul className="list-disc list-inside mb-4 space-y-2">
                <li>本サービスのデザイン、システム、機能は弊社の知的財産</li>
                <li>無断での複製、改変、商用利用は禁止</li>
              </ul>
            </section>

            <section id="privacy" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. プライバシー</h2>
              <p className="mb-4">
                個人情報の取り扱いについては、別途定める
                <a href="/privacy" className="text-blue-600 hover:text-blue-800 underline">プライバシーポリシー</a>
                をご確認ください。
              </p>
              <p className="mb-4">
                ギバー診断結果や学習履歴等は、サービス改善および個人向けの学習推薦に使用されます。
              </p>
            </section>

            <section id="prohibited-acts" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. 禁止事項</h2>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-red-800 mb-3">以下の行為は禁止されています</h3>
                <ul className="list-disc list-inside text-red-700 space-y-2">
                  <li>他のユーザーに対する誹謗中傷、嫌がらせ</li>
                  <li>差別的、暴力的、性的なコンテンツの投稿</li>
                  <li>著作権侵害となるコンテンツの投稿</li>
                  <li>スパム行為、商業的宣伝</li>
                  <li>システムの不正利用、攻撃行為</li>
                  <li>虚偽情報の拡散</li>
                  <li>個人情報の無断収集・利用</li>
                  <li>ポイントシステムの不正操作</li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold mb-3">違反時の対応</h3>
              <ul className="list-disc list-inside mb-4 space-y-2">
                <li>警告の発行</li>
                <li>コンテンツの削除</li>
                <li>機能制限</li>
                <li>アカウントの一時停止または永久停止</li>
                <li>必要に応じて法的措置</li>
              </ul>
            </section>

            <section id="disclaimer" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. 免責事項</h2>
              
              <h3 className="text-xl font-semibold mb-3">9.1 サービスの性質</h3>
              <ul className="list-disc list-inside mb-4 space-y-2">
                <li>本サービスは学習支援を目的としており、学習効果を保証するものではありません</li>
                <li>ユーザー投稿コンテンツの正確性について責任を負いません</li>
                <li>サービスの中断・停止による損害について責任を負いません</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">9.2 技術的制限</h3>
              <ul className="list-disc list-inside mb-4 space-y-2">
                <li>システムの不具合、メンテナンス等により一時的にサービスが利用できない場合があります</li>
                <li>インターネット接続環境によってはサービスが正常に動作しない場合があります</li>
              </ul>
            </section>

            <section id="changes" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. 規約の変更</h2>
              <p className="mb-4">
                本規約は、サービスの改善やユーザーの学習体験向上のため、必要に応じて変更される場合があります。
              </p>
              <p className="mb-4">
                重要な変更については、サービス内通知またはメールにて事前にお知らせいたします。変更後も継続してサービスをご利用いただく場合、変更内容に同意いただいたものとみなします。
              </p>
            </section>
          </div>

          {/* お問い合わせ */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-semibold mb-4">お問い合わせ</h2>
            <p className="text-gray-600 mb-2">
              本利用規約に関するご質問やご不明な点がございましたら、以下までお気軽にお問い合わせください。
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium">ShiftWith サポートチーム</p>
              <p className="text-blue-600">support@shiftwith.app</p>
              <p className="text-sm text-gray-600 mt-2">
                通常24時間以内にご返信いたします。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 