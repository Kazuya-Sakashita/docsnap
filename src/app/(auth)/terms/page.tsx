import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold">利用規約</h1>
          <p className="text-sm text-muted-foreground">最終更新日: 2025年2月1日</p>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold">第1条（適用）</h2>
            <p>
              本規約は、DocSnap（以下「当サービス」といいます）の利用に関する条件を、当サービスを利用するすべてのユーザー（以下「ユーザー」といいます）と当サービス運営者（以下「当社」といいます）との間で定めるものです。
            </p>
            <p>ユーザーは、本規約に同意した上で、当サービスを利用するものとします。</p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold">第2条（アカウント登録）</h2>
            <p>ユーザーは、当サービスの利用にあたり、正確かつ最新の情報を提供し、アカウントを登録するものとします。</p>
            <p>
              ユーザーは、自己の責任においてアカウント情報（メールアドレス、パスワード等）を管理し、第三者に開示または貸与してはならないものとします。
            </p>
            <p>
              アカウント情報の管理不十分、使用上の過誤、第三者の使用等による損害の責任は、ユーザーが負うものとします。
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold">第3条（サービスの内容）</h2>
            <p>当サービスは、以下の機能を提供します：</p>
            <ul>
              <li>レシート・領収書の画像アップロードおよびOCR解析機能</li>
              <li>支出データの管理・集計機能</li>
              <li>カテゴリ別の支出分析機能</li>
              <li>データのエクスポート機能</li>
              <li>その他、当社が随時提供する機能</li>
            </ul>
            <p>当社は、ユーザーへの事前の通知なく、サービスの内容を変更または追加することができるものとします。</p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold">第4条（禁止事項）</h2>
            <p>ユーザーは、当サービスの利用にあたり、以下の行為を行ってはならないものとします：</p>
            <ul>
              <li>法令または公序良俗に違反する行為</li>
              <li>犯罪行為に関連する行為</li>
              <li>当社または第三者の知的財産権、肖像権、プライバシー、名誉その他の権利または利益を侵害する行為</li>
              <li>当サービスのネットワークまたはシステム等に過度な負荷をかける行為</li>
              <li>当社のサービスの運営を妨害するおそれのある行為</li>
              <li>不正アクセスをし、またはこれを試みる行為</li>
              <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
              <li>他のユーザーに成りすます行為</li>
              <li>当社が許諾しない方法で営利を目的とする行為</li>
              <li>その他、当社が不適切と判断する行為</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold">第5条（サービスの停止等）</h2>
            <p>
              当社は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく、当サービスの全部または一部の提供を停止または中断することができるものとします：
            </p>
            <ul>
              <li>当サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
              <li>地震、落雷、火災、停電または天災などの不可抗力により、当サービスの提供が困難となった場合</li>
              <li>コンピュータまたは通信回線等が事故により停止した場合</li>
              <li>その他、当社が当サービスの提供が困難と判断した場合</li>
            </ul>
            <p>
              当社は、当サービスの提供の停止または中断により、ユーザーまたは第三者が被ったいかなる不利益または損害についても、一切の責任を負わないものとします。
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold">第6条（知的財産権）</h2>
            <p>当サービスに関する知的財産権は、すべて当社または当社にライセンスを許諾している者に帰属します。</p>
            <p>
              ユーザーは、当サービスを利用することにより、当社または当社にライセンスを許諾している者の知的財産権を侵害する行為を行ってはならないものとします。
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold">第7条（免責事項）</h2>
            <p>
              当社は、当サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます）がないことを保証するものではありません。
            </p>
            <p>
              当社は、当サービスに起因してユーザーに生じたあらゆる損害について、一切の責任を負いません。ただし、当サービスに関する当社とユーザーとの間の契約が消費者契約法に定める消費者契約となる場合、この免責規定は適用されません。
            </p>
            <p>
              当社は、当サービスのOCR解析結果の正確性を保証するものではありません。ユーザーは、解析結果を確認し、必要に応じて修正する責任を負うものとします。
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold">第8条（サービス内容の変更等）</h2>
            <p>
              当社は、ユーザーに通知することなく、当サービスの内容を変更し、または当サービスの提供を中止することができるものとし、これによってユーザーに生じた損害について一切の責任を負いません。
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold">第9条（利用規約の変更）</h2>
            <p>
              当社は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。変更後の本規約は、当サービス上に表示した時点より効力を生じるものとします。
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold">第10条（個人情報の取扱い）</h2>
            <p>
              当社は、当サービスの利用によって取得する個人情報については、当社「プライバシーポリシー」に従い適切に取り扱うものとします。
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold">第11条（準拠法・裁判管轄）</h2>
            <p>本規約の解釈にあたっては、日本法を準拠法とします。</p>
            <p>当サービスに関して紛争が生じた場合には、当社の本店所在地を管轄する裁判所を専属的合意管轄とします。</p>
          </section>

          <div className="mt-12 text-right text-sm text-muted-foreground">
            <p>以上</p>
          </div>
        </div>
      </div>
    </div>
  )
}
