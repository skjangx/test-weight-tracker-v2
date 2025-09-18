import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { supabase } from '@/lib/supabase/client'
import type { User, Session } from './types'

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key'
const SALT_ROUNDS = 10

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateToken(userId: string): string {
  const expiresIn = '48h' // 48 hours as per PRD
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn })
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string }
  } catch {
    return null
  }
}

export function getTokenExpiration(token: string): Date | null {
  try {
    const decoded = jwt.decode(token) as { exp?: number }
    if (decoded?.exp) {
      return new Date(decoded.exp * 1000)
    }
    return null
  } catch {
    return null
  }
}

export async function createSession(userId: string): Promise<string> {
  const token = generateToken(userId)
  const expiresAt = getTokenExpiration(token)
  
  if (!expiresAt) {
    throw new Error('Failed to create session')
  }

  // Store session in database
  const { error } = await supabase
    .from('sessions')
    .insert({
      user_id: userId,
      token,
      expires_at: expiresAt.toISOString()
    })

  if (error) {
    throw new Error('Failed to create session: ' + error.message)
  }

  return token
}

export async function validateSession(token: string): Promise<Session | null> {
  // First verify the JWT token
  const decoded = verifyToken(token)
  if (!decoded) {
    return null
  }

  // Check if session exists in database and is not expired
  const { data: sessionData, error: sessionError } = await supabase
    .from('sessions')
    .select('*')
    .eq('token', token)
    .eq('user_id', decoded.userId)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (sessionError || !sessionData) {
    return null
  }

  // Get user data
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, email, preferences, created_at, updated_at')
    .eq('id', decoded.userId)
    .single()

  if (userError || !userData) {
    return null
  }

  return {
    user: userData as User,
    token,
    expires_at: sessionData.expires_at
  }
}

export async function deleteSession(token: string): Promise<void> {
  await supabase
    .from('sessions')
    .delete()
    .eq('token', token)
}

export async function cleanupExpiredSessions(): Promise<void> {
  await supabase
    .from('sessions')
    .delete()
    .lt('expires_at', new Date().toISOString())
}