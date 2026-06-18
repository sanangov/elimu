'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const ADMIN_EMAILS = [
  'sanangor1234@gmail.com',
]

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session && ADMIN_EMAILS.includes(session.user.email)) {
        const verified = sessionStorage.getItem('admin_pin_verified')
        if (verified === 'true') {
          router.push('/admin')
        }
      }
    }
    checkSession()
  }, [router])

  const handleLogin = async () => {
    setError('')
    setLoading(true)

    if (!email || !password) {
      setError('Please enter your email and password.')
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Invalid email or password.')
      setLoading(false)
      return
    }

    if (!ADMIN_EMAILS.includes(data.user.email)) {
      setError('This account does not have admin access.')
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    setStep(2)
    setLoading(false)
  }

  const handlePinVerify = async () => {
      setError('')
      setLoading(true)

      const res = await fetch('/API/verify-admin-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      })

      const result = await res.json()

      if (result.valid) {
        sessionStorage.setItem('admin_pin_verified', 'true')
        router.push('/admin')
      } else {
        setError('Incorrect PIN. Access denied.')
        setLoading(false)
      }
    }

  return (
    <div style={{ minHeight: '100vh', background: '#0F0F0F', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem' }}>
      <div style={{ background: '#1A1A1A', borderRadius: 16, padding: '2.5rem', maxWidth: 380, width: '100%', border: '0.5px solid #333' }}>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 900, color: '#1D9E75', marginBottom: 6 }}>
            Elim<span style={{ color: '#5DCAA5' }}>u</span>
          </div>
          <div style={{ fontSize: 12, color: '#888', letterSpacing: '1px', textTransform: 'uppercase' }}>Admin Access</div>
        </div>

        {error && (
          <div style={{ background: 'rgba(226,75,74,0.1)', border: '0.5px solid #E24B4A', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#FF8A8A', marginBottom: '1.25rem' }}>{error}</div>
        )}

        {step === 1 ? (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6, color: '#aaa' }}>Admin email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@elimu.com"
                style={{ width: '100%', padding: '11px 14px', border: '0.5px solid #444', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif', background: '#0F0F0F', color: 'white' }}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6, color: '#aaa' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="••••••••"
                style={{ width: '100%', padding: '11px 14px', border: '0.5px solid #444', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif', background: '#0F0F0F', color: 'white' }}
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={loading}
              style={{ width: '100%', padding: 13, background: loading ? '#0F6E56' : '#1D9E75', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              {loading ? 'Verifying...' : 'Continue →'}
            </button>
          </>
        ) : (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6, color: '#aaa' }}>Enter security PIN</label>
              <input
                type="password"
                value={pin}
                onChange={e => setPin(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handlePinVerify()}
                placeholder="• • • • • •"
                maxLength={10}
                style={{ width: '100%', padding: '14px', border: '0.5px solid #444', borderRadius: 8, fontSize: 22, outline: 'none', fontFamily: 'DM Sans, sans-serif', background: '#0F0F0F', color: 'white', textAlign: 'center', letterSpacing: '8px' }}
              />
              <div style={{ fontSize: 11, color: '#666', marginTop: 8, textAlign: 'center' }}>Enter the secret admin PIN to continue</div>
            </div>
            <button
              onClick={handlePinVerify}
              disabled={loading}
              style={{ width: '100%', padding: 13, background: loading ? '#0F6E56' : '#1D9E75', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              {loading ? 'Verifying...' : 'Unlock admin panel 🔓'}
            </button>
          </>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link href="/" style={{ fontSize: 12, color: '#666', textDecoration: 'none' }}>← Back to Elimu</Link>
        </div>
      </div>
    </div>
  )
}