'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function LearnPage() {
  const router = useRouter()
  const { slug } = useParams()
  const [user, setUser] = useState(null)
  const [course, setCourse] = useState(null)
  const [sections, setSections] = useState([])
  const [activeLesson, setActiveLesson] = useState(null)
  const [completed, setCompleted] = useState([])
  const [loading, setLoading] = useState(true)
  const [enrolled, setEnrolled] = useState(false)

  useEffect(() => {
    const getData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      setUser(session.user)

      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', slug)
        .single()

      if (!courseData) { router.push('/'); return }
      setCourse(courseData)

      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('course_slug', slug)
        .single()

      if (!enrollment) { router.push(`/course/${slug}`); return }
      setEnrolled(true)

      const { data: sectionsData } = await supabase
        .from('course_sections')
        .select('*, course_lessons(*)')
        .eq('course_id', courseData.id)
        .order('position')

      setSections(sectionsData || [])

      const firstLesson = sectionsData?.[0]?.course_lessons?.[0]
      if (firstLesson) setActiveLesson(firstLesson)

      setLoading(false)
    }
    getData()
  }, [slug, router])

  const getVideoEmbed = (url) => {
    if (!url) return null
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1`
    }
    return url
  }

  const markComplete = async (lessonId) => {
    if (completed.includes(lessonId)) return
    setCompleted([...completed, lessonId])
  }

  const totalLessons = sections.reduce((acc, s) => acc + (s.course_lessons?.length || 0), 0)
  const progress = totalLessons > 0 ? Math.round((completed.length / totalLessons) * 100) : 0

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0F0F0F' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 900, color: '#1D9E75', marginBottom: 12 }}>Elimu</div>
        <p style={{ fontSize: 14, color: '#888' }}>Loading your course...</p>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0F0F0F', color: 'white' }}>

      {/* TOP NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.5rem', background: '#1A1A1A', borderBottom: '0.5px solid #333', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/" style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 900, color: '#1D9E75', textDecoration: 'none' }}>
            Elimu
          </Link>
          <span style={{ color: '#555' }}>›</span>
          <span style={{ fontSize: 13, color: '#ccc', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{course?.title}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 120, height: 5, background: '#333', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: 5, background: '#1D9E75', borderRadius: 3, width: `${progress}%`, transition: 'width .3s' }} />
            </div>
            <span style={{ fontSize: 12, color: '#888' }}>{progress}% complete</span>
          </div>
          <Link href="/dashboard" style={{ fontSize: 13, color: '#888', textDecoration: 'none' }}>← Dashboard</Link>
        </div>
      </nav>

      {/* MAIN */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* SIDEBAR — CURRICULUM */}
        <div style={{ width: 280, flexShrink: 0, background: '#1A1A1A', borderRight: '0.5px solid #333', overflowY: 'auto' }}>
          <div style={{ padding: '1rem', borderBottom: '0.5px solid #333' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#ccc', marginBottom: 4 }}>Course content</div>
            <div style={{ fontSize: 11, color: '#666' }}>{sections.length} sections · {totalLessons} lessons</div>
          </div>

          {sections.map((section, si) => (
            <div key={section.id}>
              <div style={{ padding: '10px 1rem', background: '#222', fontSize: 12, fontWeight: 600, color: '#aaa', borderBottom: '0.5px solid #2a2a2a' }}>
                Section {si + 1}: {section.title}
              </div>
              {(section.course_lessons || []).map((lesson) => {
                const isActive = activeLesson?.id === lesson.id
                const isDone = completed.includes(lesson.id)
                return (
                  <div
                    key={lesson.id}
                    onClick={() => setActiveLesson(lesson)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      padding: '10px 1rem', cursor: 'pointer', borderBottom: '0.5px solid #2a2a2a',
                      background: isActive ? '#0F6E56' : 'transparent',
                      transition: 'background .15s'
                    }}
                  >
                    <div style={{ width: 20, height: 20, borderRadius: '50%', border: `1.5px solid ${isDone ? '#1D9E75' : isActive ? 'white' : '#555'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, flexShrink: 0, marginTop: 1, background: isDone ? '#1D9E75' : 'transparent', color: isDone ? 'white' : isActive ? 'white' : '#555' }}>
                      {isDone ? '✓' : '▶'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: isActive ? 'white' : '#ccc', lineHeight: 1.4, marginBottom: 3 }}>{lesson.title}</div>
                      <div style={{ fontSize: 11, color: isActive ? 'rgba(255,255,255,0.6)' : '#666' }}>{lesson.duration || '--'}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* VIDEO AREA */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {activeLesson ? (
            <>
              {/* VIDEO PLAYER */}
              <div style={{ flex: 1, background: '#000', position: 'relative' }}>
                {activeLesson.video_url ? (
                  <iframe
                    src={getVideoEmbed(activeLesson.video_url)}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={activeLesson.title}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
                    <div style={{ fontSize: 48 }}>🎥</div>
                    <div style={{ fontSize: 16, color: '#888' }}>No video URL for this lesson</div>
                    <div style={{ fontSize: 13, color: '#555' }}>The instructor has not added a video yet</div>
                  </div>
                )}
              </div>

              {/* LESSON INFO BAR */}
              <div style={{ background: '#1A1A1A', borderTop: '0.5px solid #333', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{activeLesson.title}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>{course?.title}</div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {/* PREV */}
                  <button
                    onClick={() => {
                      const allLessons = sections.flatMap(s => s.course_lessons || [])
                      const idx = allLessons.findIndex(l => l.id === activeLesson.id)
                      if (idx > 0) setActiveLesson(allLessons[idx - 1])
                    }}
                    style={{ padding: '8px 16px', background: '#333', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                    ← Previous
                  </button>
                  {/* MARK COMPLETE */}
                  <button
                    onClick={() => markComplete(activeLesson.id)}
                    style={{ padding: '8px 16px', background: completed.includes(activeLesson.id) ? '#1D9E75' : '#0F6E56', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                    {completed.includes(activeLesson.id) ? '✓ Completed' : 'Mark complete'}
                  </button>
                  {/* NEXT */}
                  <button
                    onClick={() => {
                      const allLessons = sections.flatMap(s => s.course_lessons || [])
                      const idx = allLessons.findIndex(l => l.id === activeLesson.id)
                      if (idx < allLessons.length - 1) {
                        markComplete(activeLesson.id)
                        setActiveLesson(allLessons[idx + 1])
                      }
                    }}
                    style={{ padding: '8px 16px', background: '#0F6E56', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                    Next →
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontSize: 48 }}>📚</div>
              <div style={{ fontSize: 16, color: '#888' }}>Select a lesson to start learning</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}