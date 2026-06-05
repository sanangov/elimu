'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function InstructorDashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      setUser(session.user)
       // ← ADD THIS BLOCK HERE
       const { data: profile } = await supabase
        .from('instructor_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single()

      if (!profile) {
        router.push('/instructor/apply')
        return
      }

      if (profile.status === 'pending') {
        router.push('/instructor/apply')
        return
      }

      if (profile.status === 'rejected') {
        router.push('/instructor/apply')
        return
      }

      const { data } = await supabase
        .from('courses')
        .select('*')
        .eq('instructor_id', session.user.id)
        .order('created_at', { ascending: false })

      setCourses(data || [])
      setLoading(false)
    }
    getData()
  }, [router])

  const handleDelete = async (id) => {
    if (!confirm('Delete this course?')) return
    await supabase.from('courses').delete().eq('id', id)
    setCourses(courses.filter(c => c.id !== id))
  }

  const firstName = user?.user_metadata?.first_name || 'Instructor'
  const initials = firstName[0]?.toUpperCase() || 'I'

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#888' }}>Loading...</p>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F8F6' }}>

      {/* SIDEBAR */}
      <aside style={{ width: 200, background: 'white', borderRight: '0.5px solid #e5e5e5', padding: '1.25rem 0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 900, color: '#0F6E56', padding: '0 1.25rem 1.5rem' }}>
          Elim<span style={{ color: '#1D9E75' }}>u</span>
        </div>
        {[
          ['🏠', 'Dashboard', '/instructor'],
          ['📚', 'My Courses', '/instructor'],
          ['📊', 'Analytics', '/instructor'],
          ['💰', 'Earnings', '/instructor'],
          ['⭐', 'Reviews', '/instructor'],
          ['👤', 'Profile', '/instructor'],
        ].map(([icon, label, href]) => (
          <Link key={label} href={href} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 1.25rem', fontSize: 13, fontWeight: 500,
            color: label === 'Dashboard' ? '#0F6E56' : '#888',
            background: label === 'Dashboard' ? '#E1F5EE' : 'transparent',
            borderLeft: label === 'Dashboard' ? '2px solid #0F6E56' : '2px solid transparent',
            textDecoration: 'none'
          }}><span>{icon}</span>{label}</Link>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ padding: '1rem 1.25rem', borderTop: '0.5px solid #e5e5e5' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#0F6E56' }}>{initials}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{firstName}</div>
              <div style={{ fontSize: 11, color: '#888' }}>Instructor</div>
            </div>
          </div>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/') }} style={{ width: '100%', padding: 7, border: '0.5px solid #e5e5e5', borderRadius: 8, background: 'white', fontSize: 12, color: '#888', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Log out</button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 600, marginBottom: 2 }}>Instructor Dashboard</h1>
            <p style={{ fontSize: 13, color: '#888' }}>Manage your courses and track performance.</p>
          </div>
          <Link href="/instructor/new-course" style={{ padding: '9px 18px', background: '#0F6E56', color: 'white', borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
            + Create new course
          </Link>
        </div>

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: '1.5rem' }}>
          {[
            ['Total courses', courses.length],
            ['Published', courses.filter(c => c.status === 'published').length],
            ['Drafts', courses.filter(c => c.status === 'draft').length],
            ['Total students', '0'],
          ].map(([label, val]) => (
            <div key={label} style={{ background: '#F1EFE8', borderRadius: 8, padding: '1rem' }}>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>{label}</div>
              <div style={{ fontSize: 22, fontWeight: 500 }}>{val}</div>
            </div>
          ))}
        </div>

        {/* COURSES LIST */}
        {courses.length === 0 ? (
          <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: '1rem' }}>🎓</div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>No courses yet</h2>
            <p style={{ fontSize: 14, color: '#888', lineHeight: 1.7, maxWidth: 380, margin: '0 auto 1.5rem' }}>
              Create your first course and start earning. It only takes a few minutes to get started.
            </p>
            <Link href="/instructor/new-course" style={{ display: 'inline-block', padding: '12px 28px', background: '#0F6E56', color: 'white', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              Create first course →
            </Link>
          </div>
        ) : (
          <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '0.5px solid #e5e5e5', fontSize: 14, fontWeight: 600 }}>My Courses</div>
            {courses.map((course, i) => (
              <div key={course.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '1rem 1.25rem', borderBottom: i < courses.length - 1 ? '0.5px solid #e5e5e5' : 'none' }}>
                <div style={{ width: 48, height: 48, borderRadius: 8, background: course.bg_color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{course.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 3 }}>{course.title}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>{course.category} · GH₵ {course.price}</div>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 4, textTransform: 'uppercase',
                  background: course.status === 'published' ? '#E1F5EE' : '#FAEEDA',
                  color: course.status === 'published' ? '#085041' : '#633806'
                }}>{course.status}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link href={`/instructor/course/${course.id}`} style={{ padding: '6px 14px', background: '#0F6E56', color: 'white', borderRadius: 6, fontSize: 12, fontWeight: 500, textDecoration: 'none' }}>Edit</Link>
                  <button onClick={() => handleDelete(course.id)} style={{ padding: '6px 14px', border: '0.5px solid #e5e5e5', borderRadius: 6, fontSize: 12, color: '#888', cursor: 'pointer', background: 'white', fontFamily: 'DM Sans, sans-serif' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}