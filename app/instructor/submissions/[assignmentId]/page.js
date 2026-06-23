'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ReviewSubmissions() {
  const router = useRouter()
  const { assignmentId } = useParams()
  const [assignment, setAssignment] = useState(null)
  const [course, setCourse] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState('')
  const [feedback, setFeedback] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const getData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      const { data: assignmentData } = await supabase
        .from('assignments')
        .select('*')
        .eq('id', assignmentId)
        .single()
      setAssignment(assignmentData)

      if (assignmentData) {
        const { data: courseData } = await supabase
          .from('courses')
          .select('*')
          .eq('id', assignmentData.course_id)
          .single()
        setCourse(courseData)

        const { data: subsData } = await supabase
          .from('submissions')
          .select('*')
          .eq('assignment_id', assignmentId)
          .order('submitted_at', { ascending: false })
        setSubmissions(subsData || [])
      }
      setLoading(false)
    }
    getData()
  }, [assignmentId, router])

  const selectSubmission = (sub) => {
    setSelected(sub)
    setScore(sub.score || '')
    setFeedback(sub.feedback || '')
  }

  const saveGrade = async () => {
    if (!score) {
      alert('Please enter a score.')
      return
    }
    setSaving(true)
    await supabase
      .from('submissions')
      .update({ score: parseInt(score), feedback })
      .eq('id', selected.id)

    setSubmissions(submissions.map(s =>
      s.id === selected.id ? { ...s, score: parseInt(score), feedback } : s
    ))
    setSelected({ ...selected, score: parseInt(score), feedback })
    setSaving(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#888' }}>Loading submissions...</p>
    </div>
  )

  return (
    <div style={{ background: '#F8F8F6', minHeight: '100vh' }}>
      <nav style={{ background: 'white', borderBottom: '0.5px solid #e5e5e5', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/instructor" style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 900, color: '#0F6E56', textDecoration: 'none' }}>
          Elim<span style={{ color: '#1D9E75' }}>u</span>
        </Link>
        <Link href={`/instructor/course/${course?.id}`} style={{ fontSize: 13, color: '#888', textDecoration: 'none' }}>← Back to course</Link>
      </nav>

      <div style={{ maxWidth: 1000, margin: '2rem auto', padding: '0 1.25rem' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, marginBottom: 6 }}>{assignment?.title}</h1>
        <p style={{ fontSize: 13, color: '#888', marginBottom: '1.5rem' }}>{course?.title} · {submissions.length} submission{submissions.length !== 1 ? 's' : ''}</p>

        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1.5fr' : '1fr', gap: '1rem' }}>

          {/* SUBMISSIONS LIST */}
          <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, overflow: 'hidden' }}>
            {submissions.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
                <div style={{ fontSize: 14, color: '#888' }}>No submissions yet</div>
              </div>
            ) : (
              submissions.map((sub, i) => (
                <div
                  key={sub.id}
                  onClick={() => selectSubmission(sub)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '1rem',
                    borderBottom: i < submissions.length - 1 ? '0.5px solid #e5e5e5' : 'none',
                    cursor: 'pointer', background: selected?.id === sub.id ? '#E1F5EE' : 'white'
                  }}
                >
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: '#0F6E56', flexShrink: 0 }}>
                    ?
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: '#888' }}>
                      Submitted {new Date(sub.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  {sub.score != null ? (
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 4, background: '#E1F5EE', color: '#085041', textTransform: 'uppercase' }}>
                      Graded · {sub.score}/100
                    </span>
                  ) : (
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 4, background: '#FAEEDA', color: '#633806', textTransform: 'uppercase' }}>
                      Pending
                    </span>
                  )}
                </div>
              ))
            )}
          </div>

          {/* DETAIL PANEL */}
          {selected && (
            <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>Student Submission</div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: 18 }}>✕</button>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 6 }}>Submitted answer</div>
                <div style={{ fontSize: 13, color: '#2C2C2A', lineHeight: 1.7, background: '#F8F8F6', padding: '12px 14px', borderRadius: 8, whiteSpace: 'pre-wrap', maxHeight: 300, overflowY: 'auto' }}>
                  {selected.content}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Score (out of 100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={score}
                    onChange={e => setScore(e.target.value)}
                    placeholder="85"
                    style={{ width: '100%', padding: '10px 14px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Feedback</label>
                  <input
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                    placeholder="Great work! Consider..."
                    style={{ width: '100%', padding: '10px 14px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif' }}
                  />
                </div>
              </div>

              <button
                onClick={saveGrade}
                disabled={saving}
                style={{ width: '100%', padding: 12, background: saving ? '#9FE1CB' : '#0F6E56', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                {saving ? 'Saving...' : '✓ Save grade & feedback'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}