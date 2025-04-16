import { redirect } from 'next/navigation'
import { createClient } from '@/lib/session'
import { type AuthError } from '@supabase/supabase-js'
import LoginForm from '@/components/features/auth/LoginForm'

export default async function LoginPage() {
  const supabase = createClient()

  try {
    const { data: { session } } = await supabase.auth.getSession()

    if (session) {
      return redirect('/dashboard')
    }
  } catch (error) {
    const authError = error as AuthError
    console.error('認証エラー:', authError.message)
    return redirect('/auth/error?message=' + encodeURIComponent(authError.message))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <LoginForm />
      </div>
    </div>
  )
} 