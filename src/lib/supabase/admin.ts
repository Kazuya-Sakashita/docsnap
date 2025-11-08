// src/lib/supabase/admin.ts
import "server-only" // クライアント/Edge から誤って import されるのを防ぐ
import { createClient } from "@supabase/supabase-js"

/**
 * 管理用途（Auth Admin API など）で使用する Service Role クライアント
 * - 必ず Node.js ランタイムの API でのみ使用
 * - anon key は絶対に使わない
 */
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  // ここで止めておくと 403 の“取り違え”デバッグが楽
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
}

export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})
