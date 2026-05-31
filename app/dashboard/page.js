'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const [enrollments, setEnrollments] = useState([])

useEffect(() => {
  const getUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
    } else {
      setUser(session.user)

      const { data } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', session.user.id)
        .order('enrolled_at', { ascending: false })

      setEnrollments(data || [])
      setLoading(false)
    }
  }
  getUser()
}, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const firstName = user?.user_metadata?.first_name || 'Student'
  const lastName = user?.user_metadata?.last_name || ''
  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F8F6' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 900, color: '#0F6E56', marginBottom: 12 }}>Elimu</div>
          <p style={{ fontSize: 14, color: '#888' }}>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F8F6' }}>

      {/* SIDEBAR */}
      <aside style={{ width: 200, background: 'white', borderRight: '0.5px solid #e5e5e5', padding: '1.25rem 0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 900, color: '#0F6E56', padding: '0 1.25rem 1.5rem' }}>
          Elim<span style={{ color: '#1D9E75' }}>u</span>
        </div>

        {[
          ['🏠', 'Dashboard', '/dashboard'],
          ['📚', 'My Courses', '/dashboard/courses'],
          ['🏆', 'Certificates', '/dashboard/certificates'],
          ['❤️', 'Wishlist', '/dashboard/wishlist'],
          ['🔍', 'Browse All', '/'],
        ].map(([icon, label, href]) => (
          <Link key={label} href={href} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 1.25rem', fontSize: 13, fontWeight: 500,
            color: label === 'Dashboard' ? '#0F6E56' : '#888',
            background: label === 'Dashboard' ? '#E1F5EE' : 'transparent',
            borderLeft: label === 'Dashboard' ? '2px solid #0F6E56' : '2px solid transparent',
            textDecoration: 'none'
          }}>
            <span>{icon}</span>{label}
          </Link>
        ))}

        <div style={{ flex: 1 }} />

        {/* USER + LOGOUT */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '0.5px solid #e5e5e5' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#0F6E56' }}>
              {initials}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{firstName} {lastName}</div>
              <div style={{ fontSize: 11, color: '#888' }}>Student</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            width: '100%', padding: '7px', border: '0.5px solid #e5e5e5',
            borderRadius: 8, background: 'white', fontSize: 12, color: '#888',
            cursor: 'pointer', fontFamily: 'DM Sans, sans-serif'
          }}>Log out</button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, padding: '1.5rem' }}>

        {/* TOP BAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 600, marginBottom: 2 }}>Welcome back, {firstName} 👋</h1>
            <p style={{ fontSize: 13, color: '#888' }}>Continue your learning journey today.</p>
          </div>
          <Link href="/" style={{
            padding: '8px 16px', background: '#0F6E56', color: 'white',
            borderRadius: 8, fontSize: 13, fontWeight: 500
          }}>Browse courses</Link>
        </div>

        {/* STATS */}
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: '1.5rem' }}>
  {[
    ['Courses enrolled', enrollments.length, enrollments.length > 0 ? 'Keep learning!' : 'Start today'],
    ['Hours learned', `${enrollments.length * 2}h`, 'Keep going!'],
    ['Certificates', '0', 'Complete a course'],
    ['Day streak', '1 🔥', 'You logged in!'],
  ].map(([label, val, sub]) => (
    <div key={label} style={{ background: '#F1EFE8', borderRadius: 8, padding: '1rem' }}>
      <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 500 }}>{val}</div>
      <div style={{ fontSize: 11, color: '#888', marginTop: 3 }}>{sub}</div>
    </div>
  ))}
</div>

        {/* COURSES */}
{enrollments.length === 0 ? (
  <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '3rem', textAlign: 'center' }}>
    <div style={{ fontSize: 48, marginBottom: '1rem' }}>📚</div>
    <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
      You haven't enrolled in any courses yet
    </h2>
    <p style={{ fontSize: 14, color: '#888', lineHeight: 1.7, maxWidth: 400, margin: '0 auto 1.5rem' }}>
      Browse thousands of courses taught by Africa's best instructors and start learning today.
    </p>
    <Link href="/" style={{
      display: 'inline-block', padding: '12px 28px', background: '#0F6E56',
      color: 'white', borderRadius: 10, fontSize: 14, fontWeight: 600
    }}>Explore courses →</Link>
  </div>
) : (
  <div>
    <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: '1rem' }}>My courses</h2>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
      {enrollments.map((enrollment) => (
        <div key={enrollment.id} style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ height: 100, background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>💻</div>
          <div style={{ padding: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, lineHeight: 1.4 }}>{enrollment.course_title}</div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>
              Enrolled {new Date(enrollment.enrolled_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            <div style={{ height: 5, background: '#eee', borderRadius: 3, marginBottom: 6, overflow: 'hidden' }}>
              <div style={{ height: 5, background: '#1D9E75', borderRadius: 3, width: '0%' }} />
            </div>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 12 }}>0% complete</div>
            <Link href={`/course/${enrollment.course_slug}`} style={{
              display: 'block', padding: '9px', background: '#0F6E56', color: 'white',
              borderRadius: 8, fontSize: 13, fontWeight: 500, textAlign: 'center'
            }}>Continue learning →</Link>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

      </main>
    </div>
  )
}