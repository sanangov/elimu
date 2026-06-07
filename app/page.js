'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const staticCategories = [
  { icon: '💻', name: 'Technology', count: '1,240' },
  { icon: '📈', name: 'Business', count: '860' },
  { icon: '🎨', name: 'Design', count: '540' },
  { icon: '📊', name: 'Finance', count: '430' },
  { icon: '🌿', name: 'Agriculture', count: '310' },
  { icon: '🎵', name: 'Arts & Music', count: '280' },
  { icon: '🏥', name: 'Health', count: '390' },
  { icon: '🗣️', name: 'Languages', count: '195' },
]

export default function Home() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('All')

  const filteredCourses = activeFilter === 'All'
    ? courses
    : activeFilter === 'SHS'
      ? courses.filter(c => c.institution_type === 'shs')
      : activeFilter === 'General'
        ? courses.filter(c => c.institution_type === 'general')
        : courses.filter(c => c.category?.includes(activeFilter))

  useEffect(() => {
    const getCourses = async () => {
      const { data } = await supabase
        .from('courses')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(12)
      setCourses(data || [])
      setLoading(false)
    }
    getCourses()
  }, [])

  return (
    <main>

      {/* NAVBAR */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.75rem 1.25rem', background: 'white',
        borderBottom: '0.5px solid #e5e5e5', position: 'sticky', top: 0, zIndex: 10,
        width: '100%', overflow: 'hidden'
      }}>
        <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 900, color: '#0F6E56' }}>
          Elim<span style={{ color: '#1D9E75' }}>u</span>
        </span>
        <div className="nav-links" style={{ display: 'flex', gap: '1.5rem' }}>
          {['Explore', 'Categories', 'Teach on Elimu', 'About'].map(l => (
            <Link key={l} href={l === 'Teach on Elimu' ? '/instructor/apply' : l === 'Explore' ? '/search' : '#'} style={{ fontSize: 14, color: '#888', fontWeight: 500, textDecoration: 'none' }}>{l}</Link>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/login" style={{ padding: '7px 14px', border: '1.5px solid #1D9E75', borderRadius: 8, color: '#0F6E56', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>Log in</Link>
          <Link href="/signup" style={{ padding: '7px 14px', background: '#0F6E56', borderRadius: 8, color: 'white', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>Sign up</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        background: 'linear-gradient(135deg, #085041 0%, #1D9E75 60%, #5DCAA5 100%)',
        padding: '4rem 1.25rem 3rem', textAlign: 'center', width: '100%'
      }}>
        <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: 12, fontWeight: 600, padding: '6px 16px', borderRadius: 20, marginBottom: '1.5rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          🌍 Africa's Learning Platform
        </div>
        <h1 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 'clamp(32px, 8vw, 52px)',
          fontWeight: 900, color: 'white', lineHeight: 1.1,
          marginBottom: '1.25rem', maxWidth: 600,
          marginLeft: 'auto', marginRight: 'auto'
        }}>
          Learn Anything. Grow Every Day.
        </h1>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.85)', maxWidth: 480, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
          Thousands of courses taught by expert instructors. Start learning today and unlock your potential.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const val = e.target.search.value
            if (val) window.location.href = `/search?q=${encodeURIComponent(val)}`
            else window.location.href = '/search'
          }}
          style={{ display: 'flex', width: '100%', maxWidth: 520, margin: '0 auto 2.5rem', background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}
        >
          <input name="search" placeholder="What do you want to learn today?" style={{ flex: 1, border: 'none', padding: '14px 18px', fontSize: 14, outline: 'none' }} />
          <button type="submit" style={{ padding: '14px 22px', background: '#0F6E56', border: 'none', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Search</button>
        </form>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          {[['12K+', 'Courses'], ['85K+', 'Students'], ['2K+', 'Instructors'], ['4.8★', 'Avg Rating']].map(([num, label]) => (
            <div key={label} style={{ textAlign: 'center', color: 'white' }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700 }}>{num}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section style={{ padding: 'clamp(1.5rem, 4vw, 3.5rem) clamp(1rem, 4vw, 2rem)', background: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.75rem' }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 700 }}>Browse Categories</h2>
          <span style={{ fontSize: 13, color: '#1D9E75', fontWeight: 500, cursor: 'pointer' }}>View all →</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
          {staticCategories.map(cat => (
            <div key={cat.name} style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '1.25rem 1rem', textAlign: 'center', cursor: 'pointer' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{cat.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{cat.name}</div>
              <div style={{ fontSize: 11, color: '#888' }}>{cat.count} courses</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED COURSES */}
      <section style={{ padding: 'clamp(1.5rem, 4vw, 3.5rem) clamp(1rem, 4vw, 2rem)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.25rem' }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 700 }}>Featured Courses</h2>
          <span style={{ fontSize: 13, color: '#1D9E75', fontWeight: 500, cursor: 'pointer' }} onClick={() => window.location.href = '/search'}>See all →</span>
        </div>

        {/* FILTER TABS */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {['All', 'UCC', 'UG', 'KNUST', 'GIMPA', 'SHS', 'General'].map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              style={{
                padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500,
                cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                background: activeFilter === filter ? '#0F6E56' : 'white',
                color: activeFilter === filter ? 'white' : '#555',
                border: `0.5px solid ${activeFilter === filter ? '#0F6E56' : '#e5e5e5'}`,
              }}
            >{filter}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#888', fontSize: 14 }}>Loading courses...</div>
        ) : filteredCourses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: 12, border: '0.5px solid #e5e5e5' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎓</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No courses yet</div>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>Be the first instructor to publish a course on Elimu!</p>
            <Link href="/instructor/apply" style={{ display: 'inline-block', padding: '10px 24px', background: '#0F6E56', color: 'white', borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>Create a course →</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {filteredCourses.map(course => (
              <Link href={`/course/${course.slug}`} key={course.id} style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, overflow: 'hidden', display: 'block', textDecoration: 'none', color: 'inherit' }}>
                <div style={{ height: 120, background: course.bg_color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, position: 'relative' }}>
                  {course.icon}
                  {course.institution_type === 'university' && (
                    <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4 }}>
                      {course.category?.split('—')[0]?.trim() || 'University'}
                    </div>
                  )}
                  {course.institution_type === 'shs' && (
                    <div style={{ position: 'absolute', top: 8, left: 8, background: '#085041', color: 'white', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4 }}>SHS</div>
                  )}
                </div>
                <div style={{ padding: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#0F6E56', marginBottom: 4 }}>{course.category}</div>
                  {course.course_level && (
                    <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>
                      {course.course_level}{course.course_code && ` · ${course.course_code}`}
                    </div>
                  )}
                  <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4, marginBottom: 6 }}>{course.title}</div>
                  <div style={{ fontSize: 12, color: '#888', marginBottom: 8, lineHeight: 1.4 }}>{course.subtitle}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: '#BA7517' }}>★ New</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#0F6E56' }}>
                      {course.price === 0 ? 'Free' : `GH₵ ${course.price}`}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* INSTRUCTOR BANNER */}
      <section style={{ padding: '0 1.25rem 2rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, #085041, #0F6E56)',
          borderRadius: 16, padding: '2rem',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: '1rem'
        }}>
          <div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: 'white', marginBottom: 8 }}>Share your knowledge. Earn income.</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', maxWidth: 340, lineHeight: 1.6 }}>
              Join thousands of instructors on Elimu. Create a course, reach students across Africa, and earn every time someone enrolls.
            </p>
          </div>
          <Link href="/instructor/apply" style={{ padding: '12px 24px', background: 'white', borderRadius: 10, color: '#0F6E56', fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', textDecoration: 'none' }}>
            Become an Instructor →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#085041', color: 'white', padding: '2.5rem 1.25rem 1.5rem', width: '100%', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 900, marginBottom: 10 }}>Elimu</div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, maxWidth: 220 }}>Africa's premier online learning platform. Knowledge for everyone, everywhere.</p>
          </div>
          {[
            ['Learn', ['All Courses', 'Free Courses', 'Certificates', 'Learning Paths']],
            ['Teach', ['Become Instructor', 'How it Works', 'Instructor FAQ', 'Payouts']],
            ['Company', ['About Us', 'Blog', 'Careers', 'Contact']],
          ].map(([title, links]) => (
            <div key={title}>
              <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</h4>
              {links.map(l => (
                <Link key={l} href="#" style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 7, textDecoration: 'none' }}>{l}</Link>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.15)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>© 2026 Elimu. All rights reserved.</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Privacy Policy · Terms of Service</p>
        </div>
      </footer>

    </main>
  )
}