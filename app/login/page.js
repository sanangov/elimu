'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setError('')
    setLoading(true)

    if (!email || !password) {
      setError('Please enter your email and password.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', minHeight: '100vh' }}>
      {/* LEFT PANEL */}
      <div style={{
        background: 'linear-gradient(160deg, #085041 0%, #1D9E75 100%)',
        padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
      }}>
        <Link href="/" style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 900, color: 'white' }}>
          Elim<span style={{ color: '#5DCAA5' }}>u</span>
        </Link>
        <div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 34, fontWeight: 900, color: 'white', lineHeight: 1.2, marginBottom: '1rem' }}>
            Knowledge is the greatest investment.
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, maxWidth: 320, marginBottom: '2rem' }}>
            Join 85,000+ learners and 2,000+ instructors building the future of African education.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {[['12K+', 'Courses'], ['85K+', 'Students'], ['4.9★', 'Avg Rating']].map(([num, label]) => (
              <div key={label} style={{ borderTop: '1.5px solid rgba(255,255,255,0.2)', paddingTop: 10 }}>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, color: 'white' }}>{num}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '1.25rem' }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, marginBottom: 10, fontStyle: 'italic' }}>
            "Elimu helped me go from zero to landing my first developer job in just 6 months."
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#1D9E75', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#085041' }}>AK</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'white' }}>Ama Kyei</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>Junior Developer, Accra</div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT FORM */}
      <div style={{ background: 'white', padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ maxWidth: 380, margin: '0 auto', width: '100%' }}>

          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Welcome back</h1>
          <p style={{ fontSize: 13, color: '#888', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            Log in to continue your learning journey.
          </p>

          {error && (
            <div style={{ background: '#FCEBEB', border: '0.5px solid #F09595', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#A32D2D', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          {/* EMAIL */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Email address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif' }}
            />
          </div>

          {/* PASSWORD */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 500 }}>Password</label>
              <Link href="/forgot-password" style={{ fontSize: 12, color: '#1D9E75', fontWeight: 500 }}>Forgot password?</Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                style={{ width: '100%', padding: '11px 40px 11px 14px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif' }}
              />
              <button onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* REMEMBER ME */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem' }}>
            <input type="checkbox" id="remember" style={{ accentColor: '#0F6E56', width: 15, height: 15 }} />
            <label htmlFor="remember" style={{ fontSize: 12, color: '#888' }}>Remember me for 30 days</label>
          </div>

          {/* SUBMIT */}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: '100%', padding: 13, background: loading ? '#9FE1CB' : '#0F6E56',
              color: 'white', border: 'none', borderRadius: 10, fontSize: 15,
              fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'DM Sans, sans-serif', marginBottom: '1.25rem'
            }}>
            {loading ? 'Logging in...' : 'Log in to Elimu'}
          </button>

          {/* DIVIDER */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
            <div style={{ flex: 1, height: '0.5px', background: '#e5e5e5' }} />
            <span style={{ fontSize: 12, color: '#888' }}>or continue with</span>
            <div style={{ flex: 1, height: '0.5px', background: '#e5e5e5' }} />
          </div>

          {/* SOCIAL BUTTONS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: '1.5rem' }}>
            {[['G', 'Google', '#E8F0FE', '#185FA5'], ['f', 'Facebook', '#E6F1FB', '#0C447C']].map(([icon, name, bg, color]) => (
              <button key={name} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: 10, border: '0.5px solid #ccc', borderRadius: 8,
                background: 'white', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif'
              }}>
                <div style={{ width: 18, height: 18, borderRadius: 3, background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{icon}</div>
                {name}
              </button>
            ))}
          </div>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#888' }}>
            Don't have an account?{' '}
            <Link href="/signup" style={{ color: '#1D9E75', fontWeight: 500 }}>Sign up free</Link>
          </p>

        </div>
      </div>
    </div>
  )
}