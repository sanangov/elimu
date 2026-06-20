'use client'
import MaterialsList from '@/app/components/MaterialsList'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import ReviewForm from '@/app/components/ReviewForm'



export default function LearnPage() {
  const router = useRouter()
  const { slug } = useParams()
  const [user, setUser] = useState(null)
  const [course, setCourse] = useState(null)
  const [sections, setSections] = useState([])
  const [activeLesson, setActiveLesson] = useState(null)
  const [completed, setCompleted] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCurriculum, setShowCurriculum] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [materials, setMaterials] = useState([])
  const [assignment, setAssignment] = useState(null)
  const [submission, setSubmission] = useState(null)
  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const getData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      setUser(session.user)

      const { data: courseData } = await supabase
        .from('courses').select('*').eq('slug', slug).single()
      if (!courseData) { router.push('/'); return }
      setCourse(courseData)

      const { data: enrollment } = await supabase
        .from('enrollments').select('*')
        .eq('user_id', session.user.id).eq('course_slug', slug).single()
      if (!enrollment) {
        console.log('No enrollment found for slug:', slug)
        router.push(`/course/${slug}`)
        return
      }

      const { data: sectionsData } = await supabase
        .from('course_sections').select('*, course_lessons(*)')
        .eq('course_id', courseData.id).order('position')

      setSections(sectionsData || [])
      const firstLesson = sectionsData?.[0]?.course_lessons?.[0]
      if (firstLesson) setActiveLesson(firstLesson)
        const { data: materialsData } = await supabase
          .from('course_materials')
          .select('*')
          .eq('course_id', courseData.id)
          .order('created_at', { ascending: false })
        setMaterials(materialsData || [])
        const { data: assignmentData } = await supabase
        .from('assignments')
        .select('*')
        .eq('course_id', courseData.id)
        .single()

      if (assignmentData) {
        setAssignment(assignmentData)
        const { data: submissionData } = await supabase
          .from('submissions')
          .select('*')
          .eq('assignment_id', assignmentData.id)
          .eq('student_id', session.user.id)
          .single()
        if (submissionData) setSubmission(submissionData)
      }
      setLoading(false)
    }
    getData()
  }, [slug, router])

  const getVideoEmbed = (url) => {
    if (!url) return null
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1`
    return url
  }

  const markComplete = (lessonId) => {
    if (!completed.includes(lessonId)) setCompleted([...completed, lessonId])
  }

      const submitAssignment = async () => {
      if (!answer.trim()) {
        alert('Please write your answer before submitting.')
        return
      }
      setSubmitting(true)
      const { data } = await supabase.from('submissions').insert({
        assignment_id: assignment.id,
        student_id: user.id,
        content: answer,
      }).select().single()
      setSubmission(data)
      setSubmitSuccess(true)
      setSubmitting(false)
    }

  const totalLessons = sections.reduce((acc, s) => acc + (s.course_lessons?.length || 0), 0)
  const progress = totalLessons > 0 ? Math.round((completed.length / totalLessons) * 100) : 0
  const allLessons = sections.flatMap(s => s.course_lessons || [])
  const currentIdx = allLessons.findIndex(l => l.id === activeLesson?.id)

  const CurriculumList = () => (
    <div>
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
                onClick={() => { setActiveLesson(lesson); setShowCurriculum(false) }}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 1rem', cursor: 'pointer', borderBottom: '0.5px solid #2a2a2a', background: isActive ? '#0F6E56' : 'transparent' }}
              >
                <div style={{ width: 22, height: 22, borderRadius: '50%', border: `1.5px solid ${isDone ? '#1D9E75' : isActive ? 'white' : '#555'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, flexShrink: 0, marginTop: 1, background: isDone ? '#1D9E75' : 'transparent', color: isDone ? 'white' : isActive ? 'white' : '#555' }}>
                  {isDone ? '✓' : '▶'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: isActive ? 'white' : '#ccc', lineHeight: 1.4, marginBottom: 2 }}>{lesson.title}</div>
                  <div style={{ fontSize: 11, color: '#666' }}>{lesson.duration || '--'}</div>
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0F0F0F' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 900, color: '#1D9E75', marginBottom: 12 }}>Elimu</div>
        <p style={{ fontSize: 14, color: '#888' }}>Loading your course...</p>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0F0F0F', color: 'white', overflow: 'hidden' }}>

      {/* TOP NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: '#1A1A1A', borderBottom: '0.5px solid #333', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
          <Link href="/" style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 900, color: '#1D9E75', textDecoration: 'none', flexShrink: 0 }}>Elimu</Link>
          <span style={{ color: '#555', flexShrink: 0 }}>›</span>
          <span style={{ fontSize: 12, color: '#ccc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{course?.title}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 60, height: 4, background: '#333', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: 4, background: '#1D9E75', borderRadius: 3, width: `${progress}%`, transition: 'width .3s' }} />
            </div>
            <span style={{ fontSize: 11, color: '#888' }}>{progress}%</span>
          </div>
          <Link href="/dashboard" style={{ fontSize: 12, color: '#888', textDecoration: 'none' }}>← Back</Link>
        </div>
      </nav>

      {/* MOBILE LAYOUT */}
      {isMobile ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* VIDEO — full width on mobile */}
          <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#000', flexShrink: 0 }}>
            {activeLesson?.video_url ? (
              <iframe
                src={getVideoEmbed(activeLesson.video_url)}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={activeLesson?.title}
              />
            ) : (
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: 36 }}>🎥</div>
                <div style={{ fontSize: 13, color: '#888' }}>No video for this lesson</div>
              </div>
            )}
          </div>

          {/* LESSON TITLE + BUTTONS */}
          <div style={{ background: '#1A1A1A', padding: '0.75rem 1rem', borderBottom: '0.5px solid #333', flexShrink: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{activeLesson?.title}</div>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 10 }}>{course?.title}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { if (currentIdx > 0) setActiveLesson(allLessons[currentIdx - 1]) }} disabled={currentIdx <= 0}
                style={{ flex: 1, padding: '9px 8px', background: currentIdx <= 0 ? '#222' : '#333', color: currentIdx <= 0 ? '#555' : 'white', border: 'none', borderRadius: 8, fontSize: 13, cursor: currentIdx <= 0 ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                ← Prev
              </button>
              <button onClick={() => markComplete(activeLesson?.id)}
                style={{ flex: 2, padding: '9px 8px', background: completed.includes(activeLesson?.id) ? '#1D9E75' : '#0F6E56', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                {completed.includes(activeLesson?.id) ? '✓ Completed' : 'Mark complete'}
              </button>
              <button onClick={() => { if (currentIdx < allLessons.length - 1) { markComplete(activeLesson?.id); setActiveLesson(allLessons[currentIdx + 1]) } }} disabled={currentIdx >= allLessons.length - 1}
                style={{ flex: 1, padding: '9px 8px', background: currentIdx >= allLessons.length - 1 ? '#222' : '#0F6E56', color: currentIdx >= allLessons.length - 1 ? '#555' : 'white', border: 'none', borderRadius: 8, fontSize: 13, cursor: currentIdx >= allLessons.length - 1 ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                Next →
              </button>
            </div>
          </div>

          {/* CURRICULUM TOGGLE BUTTON */}
          <button onClick={() => setShowCurriculum(!showCurriculum)}
            style={{ padding: '12px 1rem', background: '#222', border: 'none', borderBottom: '0.5px solid #333', color: '#ccc', fontSize: 13, fontWeight: 500, cursor: 'pointer', textAlign: 'left', fontFamily: 'DM Sans, sans-serif', flexShrink: 0 }}>
            {showCurriculum ? '▲ Hide curriculum' : '▼ Course curriculum'} · {sections.length} sections · {totalLessons} lessons
          </button>

          {/* MATERIALS */}
          {materials.length > 0 && (
            <div style={{ padding: '1rem', background: '#1A1A1A', borderTop: '0.5px solid #333' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#ccc', marginBottom: 10 }}>📚 Study Materials</div>
              <MaterialsList materials={materials} canDelete={false} />
            </div>
          )}

          {/* ASSIGNMENT */}
          {assignment && progress === 100 && (
            <div style={{ padding: '1rem', background: '#1A1A1A', borderTop: '0.5px solid #333' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#ccc', marginBottom: 4 }}>✏️ {assignment.title}</div>
              {assignment.due_date && (
                <div style={{ fontSize: 11, color: '#888', marginBottom: 10 }}>📅 Due: {new Date(assignment.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              )}
              {submission ? (
                <div style={{ background: '#0F6E56', borderRadius: 8, padding: '10px 14px' }}>
                  <div style={{ fontSize: 13, color: 'white', fontWeight: 500 }}>✅ Assignment submitted!</div>
                  {submission.score && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>Score: {submission.score}/100</div>}
                  {submission.feedback && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>Feedback: {submission.feedback}</div>}
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 12, color: '#aaa', lineHeight: 1.7, marginBottom: 10, whiteSpace: 'pre-wrap' }}>{assignment.description}</div>
                  <textarea
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    placeholder="Write your answer here..."
                    rows={5}
                    style={{ width: '100%', padding: '10px 12px', border: '0.5px solid #444', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'DM Sans, sans-serif', background: '#0F0F0F', color: 'white', resize: 'vertical', marginBottom: 10 }}
                  />
                  <button
                    onClick={submitAssignment}
                    disabled={submitting}
                    style={{ width: '100%', padding: 12, background: submitting ? '#0F6E56' : '#1D9E75', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                    {submitting ? 'Submitting...' : 'Submit assignment →'}
                  </button>
                </>
              )}
            </div>
          )}

          {/* CURRICULUM LIST — toggleable */}
          {showCurriculum && (
            <div style={{ flex: 1, overflowY: 'auto', background: '#1A1A1A' }}>
              <CurriculumList />
            </div>
          )}

          {/* REVIEW FORM */}
          {progress === 100 && (
            <div style={{ padding: '1rem', background: '#1A1A1A', borderTop: '0.5px solid #333' }}>
              <ReviewForm
                courseSlug={slug} courseId={course?.id} userId={user?.id}
                firstName={user?.user_metadata?.first_name || 'Student'}
                onReviewSubmitted={(r) => console.log('Review:', r)}
              />
            </div>
          )}
        </div>

      ) : (

        /* DESKTOP LAYOUT */
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        
          {/* SIDEBAR */}
      <div style={{ width: 280, flexShrink: 0, background: '#1A1A1A', borderRight: '0.5px solid #333', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <CurriculumList />
        {materials.length > 0 && (
          <div style={{ padding: '1rem', borderTop: '0.5px solid #333', flexShrink: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#aaa', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>📚 Study Materials</div>
            <MaterialsList materials={materials} canDelete={false} />
          </div>
        )}
      </div>

          {/* VIDEO AREA */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', minWidth: 0 }}>
            {activeLesson ? (
              <>
                <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#000', flexShrink: 0 }}>
                  {activeLesson.video_url ? (
                    <iframe
                      src={getVideoEmbed(activeLesson.video_url)}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen title={activeLesson.title}
                    />
                  ) : (
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
                      <div style={{ fontSize: 48 }}>🎥</div>
                      <div style={{ fontSize: 14, color: '#888' }}>No video for this lesson</div>
                    </div>
                  )}
                </div>

                <div style={{ background: '#1A1A1A', borderTop: '0.5px solid #333', padding: '1rem 1.5rem', flexShrink: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{activeLesson.title}</div>
                  <div style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>{course?.title}</div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => { if (currentIdx > 0) setActiveLesson(allLessons[currentIdx - 1]) }} disabled={currentIdx <= 0}
                      style={{ padding: '8px 16px', background: currentIdx <= 0 ? '#222' : '#333', color: currentIdx <= 0 ? '#555' : 'white', border: 'none', borderRadius: 8, fontSize: 13, cursor: currentIdx <= 0 ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                      ← Previous
                    </button>
                    <button onClick={() => markComplete(activeLesson.id)}
                      style={{ padding: '8px 16px', background: completed.includes(activeLesson.id) ? '#1D9E75' : '#0F6E56', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                      {completed.includes(activeLesson.id) ? '✓ Completed' : 'Mark complete'}
                    </button>
                    <button onClick={() => { if (currentIdx < allLessons.length - 1) { markComplete(activeLesson.id); setActiveLesson(allLessons[currentIdx + 1]) } }} disabled={currentIdx >= allLessons.length - 1}
                      style={{ padding: '8px 16px', background: currentIdx >= allLessons.length - 1 ? '#222' : '#0F6E56', color: currentIdx >= allLessons.length - 1 ? '#555' : 'white', border: 'none', borderRadius: 8, fontSize: 13, cursor: currentIdx >= allLessons.length - 1 ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                      Next →
                    </button>
                  </div>
                </div>

                {/* MATERIALS */}
                
                {progress === 100 && (
                  <div style={{ padding: '1.5rem', background: '#1A1A1A', borderTop: '0.5px solid #333', overflowY: 'auto' }}>
                    <ReviewForm
                      courseSlug={slug} courseId={course?.id} userId={user?.id}
                      firstName={user?.user_metadata?.first_name || 'Student'}
                      onReviewSubmitted={(r) => console.log('Review:', r)}
                    />
                  </div>

                )}
                {/* ASSIGNMENT */}
              {assignment && progress === 100 && (
                <div style={{ padding: '1.5rem', background: '#1A1A1A', borderTop: '0.5px solid #333', overflowY: 'auto' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#ccc', marginBottom: 4 }}>✏️ {assignment.title}</div>
                  {assignment.due_date && (
                    <div style={{ fontSize: 12, color: '#888', marginBottom: 10 }}>📅 Due: {new Date(assignment.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                  )}-
                  {submission ? (
                    <div style={{ background: '#0F6E56', borderRadius: 8, padding: '10px 14px' }}>
                      <div style={{ fontSize: 13, color: 'white', fontWeight: 500 }}>✅ Assignment submitted!</div>
                      {submission.score && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>Score: {submission.score}/100</div>}
                      {submission.feedback && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>Feedback: {submission.feedback}</div>}
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: 13, color: '#aaa', lineHeight: 1.7, marginBottom: 12, whiteSpace: 'pre-wrap' }}>{assignment.description}</div>
                      <textarea
                        value={answer}
                        onChange={e => setAnswer(e.target.value)}
                        placeholder="Write your answer here..."
                        rows={6}
                        style={{ width: '100%', padding: '10px 12px', border: '0.5px solid #444', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'DM Sans, sans-serif', background: '#0F0F0F', color: 'white', resize: 'vertical', marginBottom: 12 }}
                      />
                      <button
                        onClick={submitAssignment}
                        disabled={submitting}
                        style={{ width: '100%', padding: 12, background: submitting ? '#0F6E56' : '#1D9E75', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                        {submitting ? 'Submitting...' : 'Submit assignment →'}
                      </button>
                    </>
                  )}
                </div>
              )}
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
                <div style={{ fontSize: 48 }}>📚</div>
                <div style={{ fontSize: 16, color: '#888' }}>Select a lesson to start learning</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}