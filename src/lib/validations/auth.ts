import { z } from "zod"

// ログインフォームのスキーマ
export const loginSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(1, "パスワードを入力してください"),
})

export type LoginFormData = z.infer<typeof loginSchema>

// 新規登録フォームのスキーマ（個人）
export const signupPersonalSchema = z
  .object({
    name: z.string().min(1, "お名前を入力してください"),
    email: z.string().email("有効なメールアドレスを入力してください"),
    password: z
      .string()
      .min(8, "パスワードは8文字以上で入力してください")
      .regex(/^(?=.*[A-Za-z])(?=.*\d)/, "英数字を含む必要があります"),
    confirmPassword: z.string(),
    agreedToTerms: z.boolean().refine((val) => val === true, {
      message: "利用規約とプライバシーポリシーに同意してください",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "パスワードが一致しません",
    path: ["confirmPassword"],
  })

export type SignupPersonalFormData = z.infer<typeof signupPersonalSchema>

// 新規登録フォームのスキーマ（法人）
export const signupBusinessSchema = z
  .object({
    companyName: z.string().min(1, "会社名を入力してください"),
    name: z.string().min(1, "担当者名を入力してください"),
    email: z.string().email("有効なメールアドレスを入力してください"),
    password: z
      .string()
      .min(8, "パスワードは8文字以上で入力してください")
      .regex(/^(?=.*[A-Za-z])(?=.*\d)/, "英数字を含む必要があります"),
    confirmPassword: z.string(),
    agreedToTerms: z.boolean().refine((val) => val === true, {
      message: "利用規約とプライバシーポリシーに同意してください",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "パスワードが一致しません",
    path: ["confirmPassword"],
  })

export type SignupBusinessFormData = z.infer<typeof signupBusinessSchema>
