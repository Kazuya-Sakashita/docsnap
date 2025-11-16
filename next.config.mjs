/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    // Vercel のファイルトレースに Prisma のバイナリを必ず含める
    outputFileTracingIncludes: {
      // app/api 以下で使う場合
      '/api/**': ['./node_modules/.prisma/client/**/*'],
      // 念のためその他ルートでも Prisma を使う可能性がある場合
      '/*': ['./node_modules/.prisma/client/**/*'],
    },
  },
}

export default nextConfig
