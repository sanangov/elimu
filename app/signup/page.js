'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function SignupPage() {
  const router = useRouter()
  const [role, setRole] = useState('student')
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const getStrength = (val) => {
    let score = 0
    if (val.length >= 8) score++
    if (/[A-Z]/.test(val)) score++
    if (/[0-9]/.test(val)) score++
    if (/[^A-Za-z0-9]/.test(val)) score++
    return score
  }

  const strengthConfig = [
    { label: 'Weak', color: '#E24B4A', width: '25%' },
    { label: 'Fair', color: '#EF9F27', width: '50%' },
    { label: 'Good', color: '#BA7517', width: '75%' },
    { label: 'Strong', color: '#1D9E75', width: '100%' },
  ]

  const strength = getStrength(password)
  const sc = strengthConfig[strength - 1]

  const handleSignup = async () => {
    setError('')
    setLoading(true)

    if (!firstName || !lastName || !email || !password) {
      setError('Please fill in all fields.')
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: role,
        }
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      if (role === 'instructor') {
        router.push('/instructor/apply')
      } else {
        router.push('/dashboard')
      }
      setLoading(false)
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
            Start your learning journey today.
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, maxWidth: 320, marginBottom: '2rem' }}>
            Free to join. Access thousands of courses taught by Africa's best instructors.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {[['Free', 'To join'], ['12K+', 'Courses'], ['85K+', 'Students']].map(([num, label]) => (
              <div key={label} style={{ borderTop: '1.5px solid rgba(255,255,255,0.2)', paddingTop: 10 }}>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, color: 'white' }}>{num}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '1.25rem' }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, marginBottom: 10, fontStyle: 'italic' }}>
            "I earned GH₵ 8,000 in my first month teaching on Elimu. The platform is incredible."
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#1D9E75', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#085041' }}>KM</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'white' }}>Kwame Mensah</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>Instructor, Kumasi</div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT FORM */}
      <div style={{ background: 'white', padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflowY: 'auto' }}>
        <div style={{ maxWidth: 380, margin: '0 auto', width: '100%' }}>

          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Create your account</h1>
          <p style={{ fontSize: 13, color: '#888', marginBottom: '1.5rem' }}>Join Elimu free. No credit card required.</p>

          {error && (
            <div style={{ background: '#FCEBEB', border: '0.5px solid #F09595', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#A32D2D', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          {/* ROLE */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>I want to join as</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[['student', '📖', 'Student', 'Learn new skills'], ['instructor', '🎓', 'Instructor', 'Teach & earn']].map(([val, icon, title, sub]) => (
                <div key={val} onClick={() => setRole(val)} style={{
                  border: `1.5px solid ${role === val ? '#1D9E75' : '#e5e5e5'}`,
                  background: role === val ? '#E1F5EE' : 'white',
                  borderRadius: 10, padding: 12, cursor: 'pointer', textAlign: 'center'
                }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: role === val ? '#0F6E56' : '#2C2C2A' }}>{title}</div>
                  <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* NAME */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>First name</label>
              <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Kwame" style={{ width: '100%', padding: '11px 14px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Last name</label>
              <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Mensah" style={{ width: '100%', padding: '11px 14px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
            </div>
          </div>

          {/* EMAIL */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Email address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={{ width: '100%', padding: '11px 14px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
          </div>

          {/* PASSWORD */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ width: '100%', padding: '11px 40px 11px 14px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif' }}
              />
              <button onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {password.length > 0 && (
              <div>
                <div style={{ height: 3, borderRadius: 2, background: '#eee', marginTop: 6, overflow: 'hidden' }}>
                  <div style={{ height: 3, borderRadius: 2, background: sc?.color, width: sc?.width, transition: 'all .3s' }} />
                </div>
                <div style={{ fontSize: 11, color: sc?.color, marginTop: 3 }}>{sc?.label}</div>
              </div>
            )}
          </div>

          {/* TERMS */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: '1.25rem' }}>
            <input type="checkbox" id="terms" style={{ accentColor: '#0F6E56', width: 15, height: 15, marginTop: 2, flexShrink: 0 }} />
            <label htmlFor="terms" style={{ fontSize: 12, color: '#888', lineHeight: 1.5 }}>
              I agree to Elimu's <Link href="/terms" style={{ color: '#1D9E75' }}>Terms of Service</Link> and <Link href="/privacy" style={{ color: '#1D9E75' }}>Privacy Policy</Link>
            </label>
          </div>

          {/* SUBMIT */}
          <button
            onClick={handleSignup}
            disabled={loading}
            style={{
              width: '100%', padding: 13, background: loading ? '#9FE1CB' : '#0F6E56',
              color: 'white', border: 'none', borderRadius: 10, fontSize: 15,
              fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'DM Sans, sans-serif', marginBottom: '1.25rem'
            }}>
            {loading ? 'Creating account...' : 'Create free account'}
          </button>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#888' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#1D9E75', fontWeight: 500 }}>Log in</Link>
          </p>

        </div>
      </div>
    </div>
  )
}