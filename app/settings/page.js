'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')

  // Profile form
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileError, setProfileError] = useState('')

  // Password form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    const getData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      setFirstName(session.user.user_metadata?.first_name || '')
      setLastName(session.user.user_metadata?.last_name || '')
      setLoading(false)
    }
    getData()
  }, [router])

  const updateProfile = async () => {
    setProfileError('')
    setProfileSuccess('')
    if (!firstName || !lastName) {
      setProfileError('Please fill in both first and last name.')
      return
    }
    setSavingProfile(true)
    const { error } = await supabase.auth.updateUser({
      data: { first_name: firstName, last_name: lastName }
    })
    if (error) {
      setProfileError(error.message)
    } else {
      setProfileSuccess('Profile updated successfully!')
      setTimeout(() => setProfileSuccess(''), 3000)
    }
    setSavingProfile(false)
  }

  const updatePassword = async () => {
    setPasswordError('')
    setPasswordSuccess('')

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all password fields.')
      return
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.')
      return
    }

    setSavingPassword(true)

    // Verify current password by trying to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword
    })

    if (signInError) {
      setPasswordError('Current password is incorrect.')
      setSavingPassword(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setPasswordError(error.message)
    } else {
      setPasswordSuccess('Password updated successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordSuccess(''), 3000)
    }
    setSavingPassword(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F8F6' }}>
      <p style={{ color: '#888' }}>Loading settings...</p>
    </div>
  )

  return (
    <div style={{ background: '#F8F8F6', minHeight: '100vh' }}>

      {/* NAV */}
      <nav style={{ background: 'white', borderBottom: '0.5px solid #e5e5e5', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 900, color: '#0F6E56', textDecoration: 'none' }}>
          Elim<span style={{ color: '#1D9E75' }}>u</span>
        </Link>
        <Link href="/dashboard" style={{ fontSize: 13, color: '#888', textDecoration: 'none' }}>← Back to Dashboard</Link>
      </nav>

      <div style={{ maxWidth: 640, margin: '2rem auto', padding: '0 1.25rem' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Settings</h1>
        <p style={{ fontSize: 13, color: '#888', marginBottom: '1.5rem' }}>Manage your account and preferences.</p>

        {/* TABS */}
        <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
          {[['profile', '👤 Profile'], ['password', '🔒 Password']].map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 20px', borderRadius: 20, fontSize: 13, fontWeight: 500,
                cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                background: activeTab === tab ? '#0F6E56' : 'white',
                color: activeTab === tab ? 'white' : '#555',
                border: `0.5px solid ${activeTab === tab ? '#0F6E56' : '#e5e5e5'}`,
              }}>{label}</button>
          ))}
        </div>

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '1.25rem' }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Personal information</div>

            {profileError && (
              <div style={{ background: '#FCEBEB', border: '0.5px solid #F09595', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#A32D2D', marginBottom: '1rem' }}>{profileError}</div>
            )}
            {profileSuccess && (
              <div style={{ background: '#E1F5EE', border: '0.5px solid #9FE1CB', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#085041', marginBottom: '1rem' }}>{profileSuccess}</div>
            )}

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Email address</label>
              <input value={user?.email} disabled style={{ width: '100%', padding: '10px 14px', border: '0.5px solid #e5e5e5', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif', background: '#F8F8F6', color: '#888' }} />
              <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>Email cannot be changed</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>First name</label>
                <input value={firstName} onChange={e => setFirstName(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Last name</label>
                <input value={lastName} onChange={e => setLastName(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
              </div>
            </div>

            <button
              onClick={updateProfile}
              disabled={savingProfile}
              style={{ padding: '10px 24px', background: savingProfile ? '#9FE1CB' : '#0F6E56', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: savingProfile ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              {savingProfile ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        )}

        {/* PASSWORD TAB */}
        {activeTab === 'password' && (
          <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '1.25rem' }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Change password</div>

            {passwordError && (
              <div style={{ background: '#FCEBEB', border: '0.5px solid #F09595', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#A32D2D', marginBottom: '1rem' }}>{passwordError}</div>
            )}
            {passwordSuccess && (
              <div style={{ background: '#E1F5EE', border: '0.5px solid #9FE1CB', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#085041', marginBottom: '1rem' }}>{passwordSuccess}</div>
            )}

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Current password</label>
              <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Enter your current password" style={{ width: '100%', padding: '10px 14px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>New password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="At least 6 characters" style={{ width: '100%', padding: '10px 14px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Confirm new password</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" style={{ width: '100%', padding: '10px 14px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
            </div>

            <button
              onClick={updatePassword}
              disabled={savingPassword}
              style={{ padding: '10px 24px', background: savingPassword ? '#9FE1CB' : '#0F6E56', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: savingPassword ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              {savingPassword ? 'Updating...' : 'Update password'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}