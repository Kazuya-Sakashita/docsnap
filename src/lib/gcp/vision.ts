import { ImageAnnotatorClient } from "@google-cloud/vision"

function assertEnv(name: string, value?: string) {
  if (!value) throw new Error(`Missing env: ${name}`)
  return value
}

export function createVisionClient() {
  const projectId = process.env.GOOGLE_PROJECT_ID
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL
  let privateKey = process.env.GOOGLE_PRIVATE_KEY

  // A: GOOGLE_APPLICATION_CREDENTIALS を使う場合 → 何も指定せず new するだけ
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return new ImageAnnotatorClient()
  }

  // B: 3変数から生成する場合
  assertEnv("GOOGLE_PROJECT_ID", projectId)
  assertEnv("GOOGLE_CLIENT_EMAIL", clientEmail)
  privateKey = assertEnv("GOOGLE_PRIVATE_KEY", privateKey).replace(/\\n/g, "\n")

  return new ImageAnnotatorClient({
    projectId,
    credentials: {
      client_email: clientEmail!,
      private_key: privateKey!,
    },
  })
}
