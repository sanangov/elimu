'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { requireAdmin } from '@/lib/adminAuth'

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState({
    pending: 0, instructors: 0, students: 0,
    courses: 0, universities: 0, revenue: 0
  })
  const [recentInstructors, setRecentInstructors] = useState([])
  const [loading, setLoading] = useState(true)
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    const init = async () => {
      await new Promise(resolve => setTimeout(resolve, 500))
      const ok = await requireAdmin(router)
      if (!ok) return

      const [
        { count: pending },
        { count: instructors },
        { count: courses },
        { count: universities },
        { data: recentI },
        { data: enrollments },
      ] = await Promise.all([
        supabase.from('instructor_profiles').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('instructor_profiles').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase.from('universities').select('*', { count: 'exact', head: true }),
        supabase.from('instructor_profiles').select('*').eq('status', 'pending').order('created_at', { ascending: false }).limit(5),
        supabase.from('enrollments').select('course_price'),
      ])

      const revenue = enrollments?.reduce((acc, e) => acc + (e.course_price || 0), 0) || 0
      setStats({ pending: pending || 0, instructors: instructors || 0, courses: courses || 0, universities: universities || 0, revenue })
      setRecentInstructors(recentI || [])
      setLoading(false)
    }
    init()
  }, [router, refresh])

  useEffect(() => {
    const interval = setInterval(() => {
      setRefresh(r => r + 1)
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F8F6' }}>
      <p style={{ color: '#888' }}>Loading admin dashboard...</p>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F8F6' }}>

      {/* SIDEBAR */}
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
          ['👥', 'Students', '/admin'],
          ['💰', 'Revenue', '/admin'],
          ['⚙️', 'Settings', '/admin'],
        ].map(([icon, label, href]) => (
          <Link key={label} href={href} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 1.25rem',
            fontSize: 13, fontWeight: 500, textDecoration: 'none',
            color: label === 'Dashboard' ? 'white' : 'rgba(255,255,255,0.65)',
            background: label === 'Dashboard' ? 'rgba(255,255,255,0.1)' : 'transparent',
            borderLeft: label === 'Dashboard' ? '2px solid #5DCAA5' : '2px solid transparent',
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

      {/* MAIN */}
      <main style={{ flex: 1, padding: '1.5rem', overflow: 'auto' }}>

        {/* TOP BAR WITH REFRESH */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Admin Dashboard</h1>
            <p style={{ fontSize: 13, color: '#888' }}>Manage your entire Elimu platform from here.</p>
          </div>
          <button
            onClick={() => { setLoading(true); setRefresh(r => r + 1) }}
            style={{ padding: '8px 16px', background: '#0F6E56', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
            🔄 Refresh
          </button>
        </div>

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: '1.5rem' }}>
          {[
            ['⏳', 'Pending Instructors', stats.pending, stats.pending > 0 ? '#FAEEDA' : '#F1EFE8', stats.pending > 0 ? '#854F0B' : '#888'],
            ['👨‍🏫', 'Active Instructors', stats.instructors, '#E1F5EE', '#085041'],
            ['📚', 'Total Courses', stats.courses, '#F1EFE8', '#888'],
            ['🏛️', 'Universities', stats.universities, '#F1EFE8', '#888'],
            ['💰', 'Total Revenue', `GH₵ ${stats.revenue.toLocaleString()}`, '#E1F5EE', '#085041'],
          ].map(([icon, label, val, bg, color]) => (
            <div key={label} style={{ background: bg, borderRadius: 10, padding: '1rem' }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 22, fontWeight: 600, color }}>{val}</div>
            </div>
          ))}
        </div>

        {/* PENDING INSTRUCTORS */}
        <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>⏳ Pending instructor approvals</div>
            <Link href="/admin/instructors" style={{ fontSize: 13, color: '#1D9E75', fontWeight: 500 }}>View all →</Link>
          </div>
          {recentInstructors.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#888', fontSize: 14 }}>
              No pending instructor applications. ✅
            </div>
          ) : (
            recentInstructors.map((inst, i) => (
              <div key={inst.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < recentInstructors.length - 1 ? '0.5px solid #e5e5e5' : 'none' }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: '#0F6E56', flexShrink: 0 }}>
                  {inst.first_name?.[0]?.toUpperCase() || '?'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{inst.first_name} {inst.last_name}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>{inst.subject_area} · {inst.institution}</div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 4, background: '#FAEEDA', color: '#633806', textTransform: 'uppercase' }}>Pending</span>
                <Link href="/admin/instructors" style={{ padding: '6px 14px', background: '#0F6E56', color: 'white', borderRadius: 6, fontSize: 12, fontWeight: 500, textDecoration: 'none' }}>Review</Link>
              </div>
            ))
          )}
        </div>

        {/* QUICK ACTIONS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {[
            ['👨‍🏫', 'Review Instructors', 'Approve or reject applications', '/admin/instructors', '#0F6E56'],
            ['🏛️', 'Manage Universities', 'Add or edit universities & programs', '/admin/universities', '#085041'],
            ['📚', 'Manage Courses', 'View and manage all courses', '/admin/courses', '#1D9E75'],
          ].map(([icon, title, desc, href, color]) => (
            <Link key={title} href={href} style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '1.25rem', textDecoration: 'none', display: 'block' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color, marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: 12, color: '#888', lineHeight: 1.5 }}>{desc}</div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}