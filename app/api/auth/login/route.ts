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
    const { username, password } = await request.json()

    // Get user by username
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, userData.password_hash)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
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
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}