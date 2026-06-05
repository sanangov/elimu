import { supabase } from './supabase'

const ADMIN_EMAILS = [
  'sanangor1234@gmail.com',
]

export const isAdmin = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return false
  return ADMIN_EMAILS.includes(session.user.email)
}

export const requireAdmin = async (router) => {
  const admin = await isAdmin()
  if (!admin) {
    router.push('/')
    return false
  }
  return true
}