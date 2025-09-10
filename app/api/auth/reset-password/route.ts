import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    const { username, securityAnswer, newPassword } = await request.json()

    // Get user by username
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Verify security answer
    const isValidAnswer = await bcrypt.compare(
      securityAnswer.toLowerCase().trim(),
      userData.security_answer_hash
    )
    
    if (!isValidAnswer) {
      return NextResponse.json(
        { error: 'Incorrect security answer' },
        { status: 401 }
      )
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10)

    // Update password
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString()
      })
      .eq('id', userData.id)

    if (updateError) {
      console.error('Password update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      )
    }

    // Invalidate all sessions for this user
    await supabase
      .from('sessions')
      .delete()
      .eq('user_id', userData.id)

    return NextResponse.json({
      message: 'Password reset successfully'
    })

  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}