'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function InstructorSubmissionsOverview() {
  const router = useRouter()
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      const { data: courses } = await supabase
        .from('courses')
        .select('id, title, icon, bg_color')
        .eq('instructor_id', session.user.id)

      if (!courses || courses.length === 0) { setLoading(false); return }

      const courseIds = courses.map(c => c.id)

      const { data: assignmentsData } = await supabase
        .from('assignments')
        .select('*')
        .in('course_id', courseIds)

      const withCounts = await Promise.all(
        (assignmentsData || []).map(async (a) => {
          const course = courses.find(c => c.id === a.course_id)
          const { count: total } = await supabase
            .from('submissions')
            .select('*', { count: 'exact', head: true })
            .eq('assignment_id', a.id)
          const { count: pending } = await supabase
            .from('submissions')
            .select('*', { count: 'exact', head: true })
            .eq('assignment_id', a.id)
            .is('score', null)
          return { ...a, course, total: total || 0, pending: pending || 0 }
        })
      )

      setAssignments(withCounts)
      setLoading(false)
    }
    getData()
  }, [router])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#888' }}>Loading submissions...</p>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F8F6' }}>

      <aside style={{ width: 200, background: 'white', borderRight: '0.5px solid #e5e5e5', padding: '1.25rem 0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 900, color: '#0F6E56', padding: '0 1.25rem 1.5rem' }}>
          Elim<span style={{ color: '#1D9E75' }}>u</span>
        </div>
        {[
          ['🏠', 'Dashboard', '/instructor'],
          ['📚', 'My Courses', '/instructor'],
          ['📝', 'Submissions', '/instructor/submissions'],
          ['📊', 'Analytics', '/instructor'],
          ['💰', 'Earnings', '/instructor'],
          ['⭐', 'Reviews', '/instructor'],
          ['👤', 'Profile', '/instructor'],
        ].map(([icon, label, href]) => (
          <Link key={label} href={href} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 1.25rem', fontSize: 13, fontWeight: 500,
            color: label === 'Submissions' ? '#0F6E56' : '#888',
            background: label === 'Submissions' ? '#E1F5EE' : 'transparent',
            borderLeft: label === 'Submissions' ? '2px solid #0F6E56' : '2px solid transparent',
            textDecoration: 'none'
          }}><span>{icon}</span>{label}</Link>
        ))}
        <div style={{ flex: 1 }} />
      </aside>

      <main style={{ flex: 1, padding: '1.5rem' }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Assignment Submissions</h1>
        <p style={{ fontSize: 13, color: '#888', marginBottom: '1.5rem' }}>Review and grade your students' work.</p>

        {assignments.length === 0 ? (
          <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No assignments yet</div>
            <p style={{ fontSize: 13, color: '#888' }}>Create an assignment in one of your courses to start receiving submissions.</p>
          </div>
        ) : (
          <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, overflow: 'hidden' }}>
            {assignments.map((a, i) => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '1rem 1.25rem', borderBottom: i < assignments.length - 1 ? '0.5px solid #e5e5e5' : 'none' }}>
                <div style={{ width: 44, height: 44, borderRadius: 8, background: a.course?.bg_color || '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  {a.course?.icon || '📚'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{a.title}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>{a.course?.title}</div>
                </div>
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#0F6E56' }}>{a.total}</div>
                  <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase' }}>Total</div>
                </div>
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: a.pending > 0 ? '#854F0B' : '#888' }}>{a.pending}</div>
                  <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase' }}>Pending</div>
                </div>
                <Link href={`/instructor/submissions/${a.id}`} style={{ padding: '8px 18px', background: '#0F6E56', color: 'white', borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: 'none', flexShrink: 0 }}>
                  Review →
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}