import { supabase } from './supabase'

const ADMIN_EMAILS = [
  'sanangor1234@gmail.com',
]

export const isAdmin = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      const { data: { session: refreshed } } = await supabase.auth.refreshSession()
      if (!refreshed) return false
      if (!ADMIN_EMAILS.includes(refreshed.user.email)) return false
    } else {
      if (!ADMIN_EMAILS.includes(session.user.email)) return false
    }

    const pinVerified = sessionStorage.getItem('admin_pin_verified')
    return pinVerified === 'true'
  } catch {
    return false
  }
}

export const requireAdmin = async (router) => {
  const admin = await isAdmin()
  if (!admin) {
    router.push('/admin/login')
    return false
  }
  return true
}