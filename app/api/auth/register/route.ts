import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key'

export async function POST(request: NextRequest) {
  try {
    const { username, password, securityQuestion, securityAnswer } = await request.json()

    // Check if username already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      )
    }

    // Hash password and security answer
    const passwordHash = await bcrypt.hash(password, 10)
    const securityAnswerHash = await bcrypt.hash(securityAnswer.toLowerCase().trim(), 10)

    // Create user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        username,
        password_hash: passwordHash,
        security_question: securityQuestion,
        security_answer_hash: securityAnswerHash,
        preferences: { theme: 'light', moving_avg_days: 7 }
      })
      .select()
      .single()

    if (userError) {
      console.error('User creation error:', userError)
      return NextResponse.json(
        { error: 'Registration failed: ' + userError.message },
        { status: 500 }
      )
    }

    // Generate JWT token
    const token = jwt.sign({ userId: userData.id }, JWT_SECRET, { expiresIn: '48h' })
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 48)

    // Store session in database
    const { error: sessionError } = await supabase
      .from('sessions')
      .insert({
        user_id: userData.id,
        token,
        expires_at: expiresAt.toISOString()
      })

    if (sessionError) {
      console.error('Session creation error:', sessionError)
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      )
    }

    // Return session data
    return NextResponse.json({
      user: {
        id: userData.id,
        username: userData.username,
        preferences: userData.preferences,
        created_at: userData.created_at,
        updated_at: userData.updated_at
      },
      token,
      expires_at: expiresAt.toISOString()
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}