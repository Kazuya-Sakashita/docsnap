import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              ログイン画面に戻る
            </Button>
          </Link>
        </div>

        <div className="prose prose-slate max-w-none dark:prose-invert">
          <h1 className="text-3xl font-bold">プライバシーポリシー</h1>
          <p className="text-sm text-muted-foreground">最終更新日: 2025年2月1日</p>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold">1. 基本方針</h2>
            <p>
              DocSnap運営者（以下「当社」といいます）は、ユーザーの個人情報の重要性を認識し、個人情報の保護に関する法律（以下「個人情報保護法」といいます）を遵守し、適切に取り扱うとともに、安全管理について適切な措置を講じます。
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold">2. 個人情報の定義</h2>
            <p>
              本プライバシーポリシーにおいて、個人情報とは、個人情報保護法第2条第1項により定義された個人情報、すなわち、生存する個人に関する情報であって、当該情報に含まれる氏名、生年月日その他の記述等により特定の個人を識別することができるもの（他の情報と容易に照合することができ、それにより特定の個人を識別することができることとなるものを含みます）、または個人識別符号が含まれる情報を指します。
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold">3. 収集する情報</h2>
            <p>当社は、ユーザーから以下の情報を収集します：</p>
            <h3 className="text-xl font-semibold">3.1 ユーザーが提供する情報</h3>
            <ul>
              <li>アカウント登録時の情報（メールアドレス、パスワード等）</li>
              <li>プロフィール情報（氏名、会社名等、任意で提供される情報）</li>
              <li>アップロードされたレシート・領収書の画像データ</li>
              <li>入力された支出データ（店舗名、金額、カテゴリ等）</li>
              <li>お問い合わせ内容</li>
            </ul>
            <h3 className="text-xl font-semibold">3.2 自動的に収集される情報</h3>
            <ul>
              <li>IPアドレス</li>
              <li>ブラウザの種類とバージョン</li>
              <li>デバイス情報</li>
              <li>アクセス日時</li>
              <li>利用状況（閲覧ページ、操作履歴等）</li>
              <li>Cookie情報</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold">4. 利用目的</h2>
            <p>当社は、収集した個人情報を以下の目的で利用します：</p>
            <ul>
              <li>当サービスの提供、維持、保護および改善のため</li>
              <li>ユーザー認証およびアカウント管理のため</li>
              <li>レシート・領収書のOCR解析およびデータ管理機能の提供のため</li>
              <li>ユーザーからのお問い合わせへの対応のため</li>
              <li>利用規約違反行為への対応のため</li>
              <li>サービスの利用状況の分析および改善のため</li>
              <li>新機能、更新情報、キャンペーン等の案内のため（ユーザーが希望する場合）</li>
              <li>その他、上記利用目的に付随する目的のため</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold">5. 個人情報の第三者提供</h2>
            <p>当社は、以下の場合を除き、ユーザーの同意なく個人情報を第三者に提供することはありません：</p>
            <ul>
              <li>法令に基づく場合</li>
              <li>
                人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難である場合
              </li>
              <li>
                公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難である場合
              </li>
              <li>
                国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがある場合
              </li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold">6. 個人情報の管理</h2>
            <p>
              当社は、個人情報の正確性を保ち、これを安全に管理します。個人情報への不正アクセス、紛失、破壊、改ざん、漏洩などを防止するため、適切なセキュリティ対策を実施します。
            </p>
            <p>具体的には、以下の対策を講じています：</p>
            <ul>
              <li>SSL/TLS暗号化通信の使用</li>
              <li>パスワードの暗号化保存</li>
              <li>アクセス制限の実施</li>
              <li>定期的なセキュリティ監査</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold">7. Cookieの使用</h2>
            <p>
              当サービスでは、ユーザーの利便性向上およびサービスの改善のため、Cookieを使用しています。Cookieとは、ウェブサイトがユーザーのコンピュータに保存する小さなテキストファイルです。
            </p>
            <p>
              ユーザーは、ブラウザの設定によりCookieの受け取りを拒否することができますが、その場合、当サービスの一部機能が利用できなくなる可能性があります。
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold">8. アクセス解析ツール</h2>
            <p>
              当サービスでは、サービスの利用状況を把握するため、Google
              Analyticsなどのアクセス解析ツールを使用しています。これらのツールは、Cookieを使用してユーザーの情報を収集します。収集される情報は匿名で収集されており、個人を特定するものではありません。
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold">9. 個人情報の開示・訂正・削除</h2>
            <p>
              ユーザーは、当社が保有する自己の個人情報について、開示、訂正、削除を請求することができます。請求があった場合、当社は、本人確認を行った上で、合理的な期間内に対応します。
            </p>
            <p>個人情報に関するお問い合わせは、当サービスの設定画面またはお問い合わせフォームからご連絡ください。</p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold">10. データの保存期間</h2>
            <p>
              当社は、個人情報を利用目的の達成に必要な期間に限り保存します。ユーザーがアカウントを削除した場合、個人情報は合理的な期間内に削除されます。ただし、法令により保存が義務付けられている場合は、その期間保存します。
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold">11. 子どもの個人情報</h2>
            <p>
              当サービスは、13歳未満の子どもを対象としていません。13歳未満の子どもから個人情報を故意に収集することはありません。万が一、13歳未満の子どもの個人情報を収集したことが判明した場合、速やかに削除します。
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold">12. プライバシーポリシーの変更</h2>
            <p>
              当社は、必要に応じて本プライバシーポリシーを変更することがあります。変更後のプライバシーポリシーは、当サービス上に掲載した時点から効力を生じるものとします。重要な変更がある場合は、当サービス上で通知します。
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold">13. お問い合わせ</h2>
            <p>本プライバシーポリシーに関するお問い合わせは、当サービスのお問い合わせフォームからご連絡ください。</p>
          </section>

          <div className="mt-12 text-right text-sm text-muted-foreground">
            <p>以上</p>
          </div>
        </div>
      </div>
    </div>
  )
}
