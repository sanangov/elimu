'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import MaterialsUpload from '@/app/components/MaterialsUpload'
import MaterialsList from '@/app/components/MaterialsList'

export default function EditCourse() {
  const router = useRouter()
  const { id } = useParams()
  const [course, setCourse] = useState(null)
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [newSection, setNewSection] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [materials, setMaterials] = useState([])
  const [assignments, setAssignments] = useState([])
  const [showAssignmentForm, setShowAssignmentForm] = useState(false)
  const [newAssignment, setNewAssignment] = useState({ title: '', description: '', due_date: '' })
  const [savingAssignment, setSavingAssignment] = useState(false)
  const [whatYouLearn, setWhatYouLearn] = useState('')
  const [requirements, setRequirements] = useState('')
  const [includes, setIncludes] = useState('')
  const [savingDetails, setSavingDetails] = useState(false)

  useEffect(() => {
    const getData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      const { data: courseData } = await supabase
        .from('courses').select('*').eq('id', id).single()
      setCourse(courseData)

      setWhatYouLearn((courseData.what_you_learn || []).join('\n'))
      setRequirements((courseData.requirements || []).join('\n'))
      setIncludes((courseData.includes || []).join('\n'))

      const { data: sectionsData } = await supabase
        .from('course_sections').select('*, course_lessons(*)')
        .eq('course_id', id).order('position')
      setSections(sectionsData || [])

      const { data: materialsData } = await supabase
        .from('course_materials')
        .select('*')
        .eq('course_id', id)
        .order('created_at', { ascending: false })
      setMaterials(materialsData || [])
      const { data: assignmentsData } = await supabase
        .from('assignments')
        .select('*')
        .eq('course_id', id)
        .order('created_at', { ascending: false })
      setAssignments(assignmentsData || [])
      setLoading(false)
    }
    getData()
  }, [id, router])

  const addSection = async () => {
    if (!newSection.trim()) return
    const { data } = await supabase.from('course_sections').insert({
      course_id: id, title: newSection, position: sections.length
    }).select().single()
    setSections([...sections, { ...data, course_lessons: [] }])
    setNewSection('')
  }

  const deleteSection = async (sectionId) => {
    if (!confirm('Delete this section and all its lessons?')) return
    await supabase.from('course_sections').delete().eq('id', sectionId)
    setSections(sections.filter(s => s.id !== sectionId))
  }

  const addLesson = async (sectionId) => {
    const title = prompt('Lesson title:')
    if (!title) return
    const videoUrl = prompt('Video URL (YouTube or any link):')
    const duration = prompt('Duration (e.g. 12:30):')
    const isFree = confirm('Is this a free preview lesson?')

    const { data } = await supabase.from('course_lessons').insert({
      section_id: sectionId, title, video_url: videoUrl,
      duration, is_free: isFree,
      position: sections.find(s => s.id === sectionId)?.course_lessons?.length || 0
    }).select().single()

    setSections(sections.map(s =>
      s.id === sectionId
        ? { ...s, course_lessons: [...(s.course_lessons || []), data] }
        : s
    ))
  }

  const deleteLesson = async (sectionId, lessonId) => {
    await supabase.from('course_lessons').delete().eq('id', lessonId)
    setSections(sections.map(s =>
      s.id === sectionId
        ? { ...s, course_lessons: s.course_lessons.filter(l => l.id !== lessonId) }
        : s
    ))
  }

  const publishCourse = async () => {
    setPublishing(true)
    await supabase.from('courses').update({ status: 'published' }).eq('id', id)
    setCourse({ ...course, status: 'published' })
    setPublishing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const unpublishCourse = async () => {
    await supabase.from('courses').update({ status: 'draft' }).eq('id', id)
    setCourse({ ...course, status: 'draft' })
  }

      const saveDetails = async () => {
      setSavingDetails(true)
      const what_you_learn = whatYouLearn.split('\n').map(s => s.trim()).filter(Boolean)
      const reqs = requirements.split('\n').map(s => s.trim()).filter(Boolean)
      const inc = includes.split('\n').map(s => s.trim()).filter(Boolean)

      await supabase.from('courses').update({
        what_you_learn,
        requirements: reqs,
        includes: inc,
      }).eq('id', id)

      setSavingDetails(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }

      const addAssignment = async () => {
      if (!newAssignment.title || !newAssignment.description) {
        alert('Please fill in title and description.')
        return
      }
      setSavingAssignment(true)
      const { data } = await supabase.from('assignments').insert({
        course_id: id,
        title: newAssignment.title,
        description: newAssignment.description,
        due_date: newAssignment.due_date || null,
      }).select().single()
      setAssignments([data, ...assignments])
      setNewAssignment({ title: '', description: '', due_date: '' })
      setShowAssignmentForm(false)
      setSavingAssignment(false)
    }

    const deleteAssignment = async (assignmentId) => {
      if (!confirm('Delete this assignment?')) return
      await supabase.from('assignments').delete().eq('id', assignmentId)
      setAssignments(assignments.filter(a => a.id !== assignmentId))
    }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#888' }}>Loading course...</p>
    </div>
  )

  const totalLessons = sections.reduce((acc, s) => acc + (s.course_lessons?.length || 0), 0)

  return (
    <div style={{ background: '#F8F8F6', minHeight: '100vh' }}>

      {/* NAV */}
      <nav style={{ background: 'white', borderBottom: '0.5px solid #e5e5e5', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <Link href="/instructor" style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 900, color: '#0F6E56', textDecoration: 'none' }}>
          Elim<span style={{ color: '#1D9E75' }}>u</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {saved && <span style={{ fontSize: 13, color: '#1D9E75', fontWeight: 500 }}>✓ Changes saved</span>}
          <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 4, textTransform: 'uppercase', fontWeight: 600, background: course?.status === 'published' ? '#E1F5EE' : '#FAEEDA', color: course?.status === 'published' ? '#085041' : '#633806' }}>{course?.status}</span>
          {course?.status === 'draft' ? (
            <button onClick={publishCourse} disabled={publishing || totalLessons === 0} style={{ padding: '8px 18px', background: totalLessons === 0 ? '#ccc' : '#0F6E56', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: totalLessons === 0 ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              {publishing ? 'Publishing...' : totalLessons === 0 ? 'Add lessons first' : '🚀 Publish course'}
            </button>
          ) : (
            <button onClick={unpublishCourse} style={{ padding: '8px 18px', background: 'white', color: '#888', border: '0.5px solid #e5e5e5', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Unpublish</button>
          )}
        </div>
      </nav>

      <div style={{ maxWidth: 750, margin: '2rem auto', padding: '0 1.5rem' }}>

        {/* COURSE HEADER */}
        <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem', display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 10, background: course?.bg_color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>{course?.icon}</div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{course?.title}</h1>
            <div style={{ fontSize: 13, color: '#888' }}>{course?.category} · GH₵ {course?.price} · {sections.length} sections · {totalLessons} lessons</div>
          </div>
          <Link href={`/course/${course?.slug}`} target="_blank" style={{ fontSize: 12, color: '#1D9E75', fontWeight: 500, textDecoration: 'none' }}>Preview →</Link>
        </div>

        {/* COURSE SALES PAGE DETAILS */}
        <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>📝 Course sales page content</div>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 14 }}>One item per line. This appears on your public course page.</div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>What students will learn</label>
            <textarea
              value={whatYouLearn}
              onChange={e => setWhatYouLearn(e.target.value)}
              placeholder={'Build full-stack apps\nDesign databases\nDeploy to the cloud'}
              rows={5}
              style={{ width: '100%', padding: '10px 14px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'DM Sans, sans-serif', resize: 'vertical' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Requirements</label>
            <textarea
              value={requirements}
              onChange={e => setRequirements(e.target.value)}
              placeholder={'No prior experience needed\nA computer with internet access'}
              rows={3}
              style={{ width: '100%', padding: '10px 14px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'DM Sans, sans-serif', resize: 'vertical' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>This course includes</label>
            <textarea
              value={includes}
              onChange={e => setIncludes(e.target.value)}
              placeholder={'10 hours on-demand video\nDownloadable resources\nCertificate of completion'}
              rows={4}
              style={{ width: '100%', padding: '10px 14px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'DM Sans, sans-serif', resize: 'vertical' }}
            />
          </div>

          <button onClick={saveDetails} disabled={savingDetails} style={{ padding: '9px 20px', background: savingDetails ? '#9FE1CB' : '#0F6E56', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: savingDetails ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
            {savingDetails ? 'Saving...' : 'Save sales page content'}
          </button>
        </div>

        {/* SECTIONS */}
        <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Course curriculum</div>

          {sections.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#888', fontSize: 14 }}>
              No sections yet. Add your first section below.
            </div>
          )}

          {sections.map((section, si) => (
            <div key={section.id} style={{ border: '0.5px solid #e5e5e5', borderRadius: 10, marginBottom: 10, overflow: 'hidden' }}>
              {/* SECTION HEADER */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#F8F8F6' }}>
                <span style={{ fontSize: 13, color: '#888' }}>Section {si + 1}</span>
                <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{section.title}</div>
                <span style={{ fontSize: 12, color: '#888' }}>{section.course_lessons?.length || 0} lessons</span>
                <button onClick={() => addLesson(section.id)} style={{ padding: '5px 12px', background: '#0F6E56', color: 'white', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>+ Add lesson</button>
                <button onClick={() => deleteSection(section.id)} style={{ padding: '5px 10px', border: '0.5px solid #e5e5e5', borderRadius: 6, fontSize: 12, color: '#E24B4A', cursor: 'pointer', background: 'white', fontFamily: 'DM Sans, sans-serif' }}>Delete</button>
              </div>

              {/* LESSONS */}
              {(section.course_lessons || []).map((lesson, li) => (
                <div key={lesson.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderTop: '0.5px solid #e5e5e5', fontSize: 13 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 5, background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>
                    {lesson.is_free ? '▶' : '🔒'}
                  </div>
                  <div style={{ flex: 1 }}>{lesson.title}</div>
                  {lesson.is_free && <span style={{ fontSize: 11, color: '#1D9E75', fontWeight: 500 }}>Free preview</span>}
                  <span style={{ fontSize: 12, color: '#888' }}>{lesson.duration || '--'}</span>
                  {lesson.video_url && (
                    <a href={lesson.video_url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: '#1D9E75' }}>View video</a>
                  )}
                  <button onClick={() => deleteLesson(section.id, lesson.id)} style={{ padding: '3px 8px', border: '0.5px solid #e5e5e5', borderRadius: 4, fontSize: 11, color: '#E24B4A', cursor: 'pointer', background: 'white', fontFamily: 'DM Sans, sans-serif' }}>✕</button>
                </div>
              ))}
            </div>
          ))}

          {/* ADD SECTION */}
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <input value={newSection} onChange={e => setNewSection(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSection()} placeholder="New section title e.g. Getting Started" style={{ flex: 1, padding: '10px 14px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
            <button onClick={addSection} style={{ padding: '10px 20px', background: '#0F6E56', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>+ Add section</button>
          </div>
        </div>

        
        {/* TIPS */}
        <div style={{ background: '#E1F5EE', border: '0.5px solid #9FE1CB', borderRadius: 12, padding: '1.25rem' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#085041', marginBottom: 10 }}>💡 Tips for a great course</div>
          {[
            'Add at least 1 free preview lesson so students can sample your content',
            'Keep lessons between 5-20 minutes for best completion rates',
            'You need at least 1 lesson before you can publish',
            'Use YouTube or any video hosting service for your videos',
          ].map(tip => (
            <div key={tip} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#0F6E56', marginBottom: 6 }}>
              <span>✓</span>{tip}
            </div>
          ))}
        </div>

        {/* STUDY MATERIALS */}
        <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '1.25rem', marginTop: '1rem' }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>📚 Study materials</div>
          <div style={{ fontSize: 13, color: '#888', marginBottom: '1rem', lineHeight: 1.6 }}>
            Upload lecture notes, slides, past questions and reading materials. Students can download these after enrolling.
          </div>
          <MaterialsList
            materials={materials}
            canDelete={true}
            onDelete={async (materialId) => {
              await supabase.from('course_materials').delete().eq('id', materialId)
              setMaterials(materials.filter(m => m.id !== materialId))
            }}
          />
          <div style={{ marginTop: '1rem' }}>
            <MaterialsUpload
              courseId={id}
              onMaterialAdded={(mat) => setMaterials([mat, ...materials])}
            />
          </div>
        </div>

        {/* ASSIGNMENTS */}
        <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '1.25rem', marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>✏️ End-of-course assignment</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Students submit this after completing all lessons</div>
            </div>
            {assignments.length === 0 && (
              <button
                onClick={() => setShowAssignmentForm(!showAssignmentForm)}
                style={{ padding: '7px 16px', background: '#0F6E56', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                + Add assignment
              </button>
            )}
          </div>

          {showAssignmentForm && (
            <div style={{ background: '#F8F8F6', borderRadius: 10, padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Assignment title *</label>
                <input
                  value={newAssignment.title}
                  onChange={e => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  placeholder="e.g. Final Assessment — Financial Accounting"
                  style={{ width: '100%', padding: '10px 14px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'DM Sans, sans-serif' }}
                />
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Instructions / Questions *</label>
                <textarea
                  value={newAssignment.description}
                  onChange={e => setNewAssignment({ ...newAssignment, description: e.target.value })}
                  placeholder="Write your assignment questions or instructions here..."
                  rows={6}
                  style={{ width: '100%', padding: '10px 14px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'DM Sans, sans-serif', resize: 'vertical' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Due date (optional)</label>
                <input
                  type="date"
                  value={newAssignment.due_date}
                  onChange={e => setNewAssignment({ ...newAssignment, due_date: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'DM Sans, sans-serif' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={addAssignment} disabled={savingAssignment} style={{ padding: '9px 20px', background: '#0F6E56', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                  {savingAssignment ? 'Saving...' : 'Save assignment'}
                </button>
                <button onClick={() => setShowAssignmentForm(false)} style={{ padding: '9px 16px', background: 'white', color: '#888', border: '0.5px solid #e5e5e5', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Cancel</button>
              </div>
            </div>
          )}

          {assignments.length === 0 && !showAssignmentForm ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#888', fontSize: 13 }}>
              No assignment yet. Add one to challenge your students at the end of the course.
            </div>
          ) : (
            assignments.map(assignment => (
              <div key={assignment.id} style={{ background: '#F8F8F6', borderRadius: 10, padding: '1rem', marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{assignment.title}</div>
                  <button onClick={() => deleteAssignment(assignment.id)} style={{ padding: '4px 10px', border: '0.5px solid #e5e5e5', borderRadius: 6, fontSize: 12, color: '#E24B4A', cursor: 'pointer', background: 'white', fontFamily: 'DM Sans, sans-serif', flexShrink: 0 }}>Delete</button>
                </div>
                <div style={{ fontSize: 13, color: '#555', lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: 8 }}>{assignment.description}</div>
                {assignment.due_date && (
                  <div style={{ fontSize: 12, color: '#888' }}>📅 Due: {new Date(assignment.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}
      