import { LoginForm } from '@/components/auth/login-form'
import { ThemeToggle } from '@/components/theme-toggle'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background to-muted/20">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Weight Tracker</h1>
          <p className="text-muted-foreground">
            Track progress, reach your goals 🏋️‍♀️
          </p>
        </div>
        
        <LoginForm />
      </div>
    </div>
  )
}