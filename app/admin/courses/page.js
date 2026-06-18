'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { requireAdmin } from '@/lib/adminAuth'

export default function AdminCourses() {
  const router = useRouter()
  const [courses, setCourses] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const ok = await requireAdmin(router)
      if (!ok) return
      loadCourses()
    }
    init()
  }, [router, filter])

  const loadCourses = async () => {
    setLoading(true)
    let query = supabase.from('courses').select('*').order('created_at', { ascending: false })
    if (filter !== 'all') query = query.eq('status', filter)
    const { data } = await query
    setCourses(data || [])
    setLoading(false)
  }

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published'
    await supabase.from('courses').update({ status: newStatus }).eq('id', id)
    setCourses(courses.map(c => c.id === id ? { ...c, status: newStatus } : c))
  }

  const deleteCourse = async (id) => {
    if (!confirm('Delete this course permanently?')) return
    await supabase.from('courses').delete().eq('id', id)
    setCourses(courses.filter(c => c.id !== id))
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F8F6' }}>
      <aside style={{ width: 220, background: '#085041', padding: '1.5rem 0', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 900, color: 'white', padding: '0 1.25rem 2rem' }}>
          Elim<span style={{ color: '#5DCAA5' }}>u</span>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontFamily: 'DM Sans, sans-serif', fontWeight: 400, marginTop: 2 }}>ADMIN PANEL</div>
        </div>
        {[
          ['🏠', 'Dashboard', '/admin'],
          ['👨‍🏫', 'Instructors', '/admin/instructors'],
          ['🏛️', 'Universities', '/admin/universities'],
          ['📚', 'Courses', '/admin/courses'],
        ].map(([icon, label, href]) => (
          <Link key={label} href={href} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 1.25rem',
            fontSize: 13, fontWeight: 500, textDecoration: 'none',
            color: label === 'Courses' ? 'white' : 'rgba(255,255,255,0.65)',
            background: label === 'Courses' ? 'rgba(255,255,255,0.1)' : 'transparent',
            borderLeft: label === 'Courses' ? '2px solid #5DCAA5' : '2px solid transparent',
          }}><span>{icon}</span>{label}</Link>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ padding: '1rem 1.25rem', borderTop: '0.5px solid rgba(255,255,255,0.1)' }}>
        <button
          onClick={async () => {
            sessionStorage.removeItem('admin_pin_verified')
            await supabase.auth.signOut()
            window.location.href = '/admin/login'
          }}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', padding: 0, marginBottom: 8, display: 'block' }}
        >🚪 Admin logout</button>
        <Link href="/" style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>← Back to site</Link>
      </div>
      </aside>

      <main style={{ flex: 1, padding: '1.5rem', overflow: 'auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>All Courses</h1>
          <p style={{ fontSize: 13, color: '#888' }}>Manage all courses on the platform.</p>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
          {['all', 'published', 'draft'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '8px 20px', borderRadius: 20, fontSize: 13, fontWeight: 500,
              cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
              background: filter === f ? '#0F6E56' : 'white',
              color: filter === f ? 'white' : '#555',
              border: `0.5px solid ${filter === f ? '#0F6E56' : '#e5e5e5'}`,
              textTransform: 'capitalize'
            }}>{f}</button>
          ))}
        </div>

        <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#888' }}>Loading courses...</div>
          ) : courses.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#888' }}>No courses found.</div>
          ) : (
            courses.map((course, i) => (
              <div key={course.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '1rem', borderBottom: i < courses.length - 1 ? '0.5px solid #e5e5e5' : 'none' }}>
                <div style={{ width: 46, height: 46, borderRadius: 8, background: course.bg_color || '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{course.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>{course.title}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>{course.category} · GH₵ {course.price}</div>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 4, textTransform: 'uppercase', flexShrink: 0,
                  background: course.status === 'published' ? '#E1F5EE' : '#FAEEDA',
                  color: course.status === 'published' ? '#085041' : '#633806',
                }}>{course.status}</span>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => toggleStatus(course.id, course.status)} style={{ padding: '6px 12px', border: '0.5px solid #e5e5e5', borderRadius: 6, fontSize: 12, color: '#0F6E56', cursor: 'pointer', background: 'white', fontFamily: 'DM Sans, sans-serif' }}>
                    {course.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>
                  <button onClick={() => deleteCourse(course.id)} style={{ padding: '6px 12px', border: '0.5px solid #e5e5e5', borderRadius: 6, fontSize: 12, color: '#E24B4A', cursor: 'pointer', background: 'white', fontFamily: 'DM Sans, sans-serif' }}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}