import { z } from 'zod'

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')

export const emailSchema = z
  .string()
  .email('Please enter a valid email address')

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
})

export const resetPasswordSchema = z.object({
  email: emailSchema
})

export const validateWeight = (weight: string): number => {
  const parsed = parseFloat(weight)
  if (isNaN(parsed) || parsed < 30 || parsed > 300) {
    throw new Error('Weight must be between 30 and 300 kg')
  }
  return parsed
}