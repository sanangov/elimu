'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function InstructorApply() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [existingProfile, setExistingProfile] = useState(null)
  const [form, setForm] = useState({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  bio: '',
  qualifications: '',
  institution: '',
  subject_area: '',
})

  useEffect(() => {
    const getData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      setUser(session.user)

      setForm(prev => ({
        ...prev,
        first_name: session.user.user_metadata?.first_name || '',
        last_name: session.user.user_metadata?.last_name || '',
        email: session.user.email || '',
      }))

      const { data: profile } = await supabase
        .from('instructor_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single()

      if (profile) setExistingProfile(profile)
      setLoading(false)
    }
    getData()
  }, [router])

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async () => {
    setError('')
    if (!form.email || !form.phone || !form.bio || !form.qualifications || !form.institution || !form.subject_area) {
      setError('Please fill in all fields including email and phone number.')
      return
    }
    setSubmitting(true)

    const { error } = await supabase.from('instructor_profiles').insert({
      user_id: user.id,
      ...form,
      status: 'pending',
    })

    if (error) {
      setError(error.message)
      setSubmitting(false)
    } else {
      setSubmitted(true)
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#888' }}>Loading...</p>
    </div>
  )

  if (existingProfile) return (
    <div style={{ minHeight: '100vh', background: '#F8F8F6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ background: 'white', borderRadius: 16, padding: '3rem', maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>
          {existingProfile.status === 'pending' ? '⏳' : existingProfile.status === 'approved' ? '✅' : '❌'}
        </div>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, marginBottom: 10 }}>
          {existingProfile.status === 'pending' ? 'Application under review' :
           existingProfile.status === 'approved' ? 'Application approved!' : 'Application rejected'}
        </h2>
        <p style={{ fontSize: 14, color: '#888', lineHeight: 1.7, marginBottom: 20 }}>
          {existingProfile.status === 'pending' ? 'Your application is being reviewed. We will notify you by email once a decision has been made.' :
           existingProfile.status === 'approved' ? 'Congratulations! You can now create and publish courses on Elimu.' :
           `Your application was rejected. Reason: ${existingProfile.rejection_reason || 'Not specified'}`}
        </p>
        {existingProfile.status === 'approved' && (
          <Link href="/instructor" style={{ display: 'inline-block', padding: '12px 28px', background: '#0F6E56', color: 'white', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            Go to instructor dashboard →
          </Link>
        )}
        {existingProfile.status === 'rejected' && (
          <Link href="/" style={{ display: 'inline-block', padding: '12px 28px', background: '#0F6E56', color: 'white', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            Back to homepage
          </Link>
        )}
      </div>
    </div>
  )

  if (submitted) return (
    <div style={{ minHeight: '100vh', background: '#F8F8F6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ background: 'white', borderRadius: 16, padding: '3rem', maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, marginBottom: 10 }}>Application submitted!</h2>
        <p style={{ fontSize: 14, color: '#888', lineHeight: 1.7, marginBottom: 20 }}>
          Thank you for applying to teach on Elimu. Your application is now under review. We will notify you by email once a decision has been made — usually within 2–3 business days.
        </p>
        <Link href="/" style={{ display: 'inline-block', padding: '12px 28px', background: '#0F6E56', color: 'white', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
          Back to homepage
        </Link>
      </div>
    </div>
  )

  return (
    <div style={{ background: '#F8F8F6', minHeight: '100vh' }}>
      <nav style={{ background: 'white', borderBottom: '0.5px solid #e5e5e5', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 900, color: '#0F6E56', textDecoration: 'none' }}>
          Elim<span style={{ color: '#1D9E75' }}>u</span>
        </Link>
        <div style={{ fontSize: 13, color: '#888' }}>Instructor Application</div>
      </nav>

      <div style={{ maxWidth: 640, margin: '2rem auto', padding: '0 1.25rem' }}>
        <div style={{ background: '#E1F5EE', border: '0.5px solid #9FE1CB', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#085041', marginBottom: 6 }}>👋 Welcome to Elimu Instructor Program</div>
          <div style={{ fontSize: 13, color: '#0F6E56', lineHeight: 1.7 }}>
            Fill in your details below. Our team will review your application and get back to you within 2–3 business days. Only approved instructors can publish courses.
          </div>
        </div>

        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Instructor Application</h1>
        <p style={{ fontSize: 13, color: '#888', marginBottom: '1.5rem' }}>Tell us about yourself and your teaching expertise.</p>

        {error && (
          <div style={{ background: '#FCEBEB', border: '0.5px solid #F09595', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#A32D2D', marginBottom: '1rem' }}>{error}</div>
        )}

        {/* PERSONAL INFO */}
        <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Personal information</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>First name</label>
              <input value={form.first_name} onChange={e => update('first_name', e.target.value)} placeholder="Kwame" style={{ width: '100%', padding: '10px 14px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Last name</label>
              <input value={form.last_name} onChange={e => update('last_name', e.target.value)} placeholder="Mensah" style={{ width: '100%', padding: '10px 14px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Bio — tell students about yourself</label>
            <textarea value={form.bio} onChange={e => update('bio', e.target.value)} placeholder="e.g. I am a lecturer at UCC with 10 years of experience teaching Financial Accounting. I hold an MSc in Accounting from KNUST..." rows={4} style={{ width: '100%', padding: '10px 14px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif', resize: 'vertical' }} />
          </div>
        </div>
        {/*CONTACT INFORMATION*/}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Email address *</label>
            <input
              type="email"
              value={form.email}
              onChange={e => update('email', e.target.value)}
              placeholder="your@email.com"
              style={{ width: '100%', padding: '10px 14px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Phone number *</label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => update('phone', e.target.value)}
              placeholder="e.g. 0244123456"
              style={{ width: '100%', padding: '10px 14px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif' }}
            />
          </div>
        </div>

        {/* QUALIFICATIONS */}
        <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Qualifications & expertise</div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Your qualifications</label>
            <textarea value={form.qualifications} onChange={e => update('qualifications', e.target.value)} placeholder="e.g. MSc Accounting, KNUST (2015). BSc Business Administration, UCC (2012). ICAG Professional Certificate (2018)." rows={3} style={{ width: '100%', padding: '10px 14px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif', resize: 'vertical' }} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Current institution / employer</label>
            <input value={form.institution} onChange={e => update('institution', e.target.value)} placeholder="e.g. University of Cape Coast, Ghana Education Service, Self-employed" style={{ width: '100%', padding: '10px 14px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Subject area / courses you want to teach</label>
            <input value={form.subject_area} onChange={e => update('subject_area', e.target.value)} placeholder="e.g. Financial Accounting, Business Mathematics, Economics" style={{ width: '100%', padding: '10px 14px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
          </div>
        </div>

        {/* TERMS */}
        <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>By submitting this application you agree that:</div>
          {[
            'All information provided is accurate and truthful',
            'You have the right to teach the subjects you have listed',
            'Your course content will be original and not plagiarised',
            'Elimu reserves the right to remove courses that violate our guidelines',
            'Elimu takes a 30% commission on all course sales',
          ].map(item => (
            <div key={item} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#555', marginBottom: 8, lineHeight: 1.5 }}>
              <span style={{ color: '#1D9E75', flexShrink: 0 }}>✓</span>{item}
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{ width: '100%', padding: 14, background: submitting ? '#9FE1CB' : '#0F6E56', color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
          {submitting ? 'Submitting application...' : 'Submit instructor application →'}
        </button>
      </div>
    </div>
  )
}