"use client"

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/lib/auth/context'
import { resetPasswordSchema } from '@/lib/auth/validation'
import type { ResetPasswordData } from '@/lib/auth/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export function ResetPasswordForm() {
  const { resetPassword } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema)
  })

  const onSubmit = async (data: ResetPasswordData) => {
    try {
      await resetPassword(data)
      // Navigation will be handled by the auth context
    } catch (error) {
      // Error handling is done in the auth context
      console.error('Password reset error:', error)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
        <CardDescription className="text-center">
          Enter your email address and we&apos;ll send you a password reset link
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...register('email')}
              disabled={isSubmitting}
              className={errors.email ? 'border-red-500' : ''}
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Reset Link...
              </>
            ) : (
              'Send Reset Link'
            )}
          </Button>
        </form>

        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center text-sm text-primary underline-offset-4 hover:underline"
          >
            <ArrowLeft className="mr-1 h-3 w-3" />
            Back to Login
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}