import type { ReactNode } from "react"
import type { FieldError } from "react-hook-form"
import { Label } from "@/components/ui/label"

interface FormFieldProps {
  label: string
  htmlFor: string
  error?: FieldError
  hint?: string
  required?: boolean
  children: ReactNode
}

export function FormField({ label, htmlFor, error, hint, required, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-sm text-destructive">{error.message}</p>}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}
