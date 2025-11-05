# DocSnap

レシート・領収書を一元管理するアプリケーション。個人の家計管理から法人の経費精算まで対応。

## 機能

- レシート・領収書のスキャンとOCR解析
- 自動カテゴリ分類
- 詳細編集と明細管理
- 重複検出
- CSVエクスポート
- カテゴリ管理
- ダッシュボードでの支出分析

## 技術スタック

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- React Hook Form + Zod
- Recharts
- PostgreSQL + Prisma

## セットアップ

### 必要要件

- Node.js 18以上
- npm
- PostgreSQL

### インストール

\`\`\`bash
# 依存関係のインストール
npm install
\`\`\`

### 環境変数の設定

`.env.example`を`.env`にコピーして、データベース接続情報を設定してください。

\`\`\`bash
cp .env.example .env
\`\`\`

### データベースのセットアップ

\`\`\`bash
# Prisma Clientの生成
npm run db:generate

# データベースのマイグレーション
npm run db:migrate

# シードデータの投入（オプション）
npm run db:seed
\`\`\`

### 開発サーバーの起動

\`\`\`bash
npm run dev
\`\`\`

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションを確認できます。

### ビルド

\`\`\`bash
# プロダクションビルド
npm run build

# プロダクションサーバーの起動
npm start
\`\`\`

## Prismaコマンド

\`\`\`bash
# Prisma Clientの生成
npm run db:generate

# データベースにスキーマを反映（開発環境）
npm run db:push

# マイグレーションの作成と実行
npm run db:migrate

# Prisma Studioの起動（データベースGUI）
npm run db:studio

# シードデータの投入
npm run db:seed
\`\`\`

## プロジェクト構造

\`\`\`
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # 認証関連ページ
│   │   ├── receipts/          # レシート管理ページ
│   │   ├── categories/        # カテゴリ管理ページ
│   │   ├── export/            # エクスポートページ
│   │   └── settings/          # 設定ページ
│   ├── components/            # Reactコンポーネント
│   │   ├── forms/            # フォームコンポーネント
│   │   ├── dashboard/        # ダッシュボードコンポーネント
│   │   ├── receipts/         # レシート関連コンポーネント
│   │   └── scan/             # スキャン関連コンポーネント
│   ├── lib/                   # ユーティリティ関数
│   │   ├── prisma.ts         # Prismaクライアント
│   │   └── validations/      # Zodスキーマ
│   └── types/                 # TypeScript型定義
├── components/                # shadcn/ui コンポーネント
│   └── ui/                   # UIコンポーネント
├── prisma/                    # Prismaスキーマ
│   ├── schema.prisma         # データベーススキーマ
│   └── seed.ts               # シードデータ
└── public/                    # 静的ファイル
\`\`\`

## ライセンス

MIT
