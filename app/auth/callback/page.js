'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      const hash = window.location.hash
      if (hash.includes('error=access_denied') || hash.includes('otp_expired')) {
        router.push('/login?error=link_expired')
        return
      }
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const role = session.user.user_metadata?.role
        if (role === 'instructor') {
          router.push('/instructor/apply')
        } else {
          router.push('/dashboard')
        }
      } else {
        router.push('/login')
      }
    }
    handleCallback()
  }, [router])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F8F6' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 900, color: '#0F6E56', marginBottom: 12 }}>Elimu</div>
        <p style={{ fontSize: 14, color: '#888' }}>Redirecting you...</p>
      </div>
    </div>
  )
}