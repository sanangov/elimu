'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const icons = ['💻', '📈', '🎨', '📊', '🌿', '🎵', '🏥', '🗣️', '🎓', '📚', '🔬', '🏋️', '⚖️', '🧮', '🔭', '📐', '🧪', '📝']
const colors = ['#E1F5EE', '#FAEEDA', '#FAECE7', '#E6F1FB', '#EAF3DE', '#EEEDFE', '#FBEAF0', '#E8F0FE']
const levels = ['Level 100', 'Level 200', 'Level 300', 'Level 400', 'Level 500', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Form 1', 'Form 2', 'Form 3', 'Diploma Year 1', 'Diploma Year 2', 'Postgraduate']

export default function NewCourse() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [universities, setUniversities] = useState([])
  const [programs, setPrograms] = useState([])
  const [institutionType, setInstitutionType] = useState('university')
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    category: 'General',
    price: '',
    old_price: '',
    icon: '📚',
    bg_color: '#E1F5EE',
    university_id: '',
    program_id: '',
    course_level: '',
    course_code: '',
    institution_type: 'university',
  })

  useEffect(() => {
    const getData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      const { data: unis } = await supabase
        .from('universities')
        .select('*')
        .order('name')
      setUniversities(unis || [])
    }
    getData()
  }, [router])

  useEffect(() => {
    if (form.university_id) {
      loadPrograms(form.university_id)
    }
  }, [form.university_id])

  useEffect(() => {
  if (institutionType === 'shs' && shsOptions.length > 0) {
    const shsUni = shsOptions[0]
    update('university_id', shsUni.id)
    loadPrograms(shsUni.id)
  }
}, [institutionType])

  const loadPrograms = async (uniId) => {
    const { data } = await supabase
      .from('programs')
      .select('*')
      .eq('university_id', uniId)
      .order('name')
    setPrograms(data || [])
  }

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const generateSlug = (title) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const handleCreate = async () => {
    setError('')
    if (!form.title || !form.price) {
      setError('Please fill in the course title and price.')
      return
    }
    setLoading(true)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }

    const slug = generateSlug(form.title) + '-' + Date.now()
    const selectedUni = universities.find(u => u.id === form.university_id)
    const selectedProg = programs.find(p => p.id === form.program_id)

    const category = institutionType === 'general'
      ? form.category
      : institutionType === 'shs'
        ? `SHS — ${selectedProg?.name || ''}`
        : `${selectedUni?.short_name || ''} — ${selectedProg?.name || ''}`

    const { data, error } = await supabase.from('courses').insert({
      instructor_id: session.user.id,
      title: form.title,
      subtitle: form.subtitle,
      description: form.description,
      category,
      price: parseInt(form.price),
      old_price: form.old_price ? parseInt(form.old_price) : null,
      slug,
      icon: form.icon,
      bg_color: form.bg_color,
      status: 'draft',
      university_id: form.university_id || null,
      program_id: form.program_id || null,
      course_level: form.course_level || null,
      course_code: form.course_code || null,
      institution_type: institutionType,
    }).select().single()

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push(`/instructor/course/${data.id}`)
    }
  }

  const universityOptions = universities.filter(u => u.type === 'university')
  const shsOptions = universities.filter(u => u.type === 'shs')

  return (
    <div style={{ background: '#F8F8F6', minHeight: '100vh' }}>
      <nav style={{ background: 'white', borderBottom: '0.5px solid #e5e5e5', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/instructor" style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 900, color: '#0F6E56', textDecoration: 'none' }}>
          Elim<span style={{ color: '#1D9E75' }}>u</span>
        </Link>
        <div style={{ fontSize: 13, color: '#888' }}>
          <Link href="/instructor" style={{ color: '#1D9E75' }}>Dashboard</Link> › New Course
        </div>
        <Link href="/instructor" style={{ fontSize: 13, color: '#888', textDecoration: 'none' }}>← Back</Link>
      </nav>

      <div style={{ maxWidth: 700, margin: '2rem auto', padding: '0 1.25rem' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Create a new course</h1>
        <p style={{ fontSize: 13, color: '#888', marginBottom: '1.5rem' }}>Fill in the details below. You can add lessons after creating the course.</p>

        {error && (
          <div style={{ background: '#FCEBEB', border: '0.5px solid #F09595', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#A32D2D', marginBottom: '1rem' }}>{error}</div>
        )}

        {/* COURSE TYPE */}
        <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>What type of course is this?</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {[
              ['university', '🏛️', 'University Course', 'UCC, UG, KNUST, GIMPA'],
              ['shs', '🏫', 'SHS Course', 'WASSCE preparation'],
              ['general', '🌍', 'General Course', 'Open to everyone'],
            ].map(([val, icon, title, sub]) => (
              <div key={val} onClick={() => { setInstitutionType(val); update('institution_type', val) }} style={{
                border: `1.5px solid ${institutionType === val ? '#1D9E75' : '#e5e5e5'}`,
                background: institutionType === val ? '#E1F5EE' : 'white',
                borderRadius: 10, padding: '12px 10px', cursor: 'pointer', textAlign: 'center'
              }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: institutionType === val ? '#0F6E56' : '#2C2C2A', marginBottom: 2 }}>{title}</div>
                <div style={{ fontSize: 11, color: '#888' }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* UNIVERSITY FIELDS */}
        {institutionType === 'university' && (
          <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>University details</div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>University *</label>
              <select value={form.university_id} onChange={e => update('university_id', e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif', background: 'white' }}>
                <option value="">Select university</option>
                {universityOptions.map(u => <option key={u.id} value={u.id}>{u.name} ({u.short_name})</option>)}
              </select>
            </div>
            {programs.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Program *</label>
                <select value={form.program_id} onChange={e => update('program_id', e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif', background: 'white' }}>
                  <option value="">Select program</option>
                  {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Level</label>
                <select value={form.course_level} onChange={e => update('course_level', e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif', background: 'white' }}>
                  <option value="">Select level</option>
                  {levels.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Course code</label>
                <input value={form.course_code} onChange={e => update('course_code', e.target.value)} placeholder="e.g. ACCT 201" style={{ width: '100%', padding: '10px 14px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
              </div>
            </div>
          </div>
        )}

        {/* SHS FIELDS */}
        {institutionType === 'shs' && (
          <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>SHS details</div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Subject *</label>
              <select value={form.program_id} onChange={e => update('program_id', e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif', background: 'white' }}
                onClick={() => {
                  if (!form.university_id && shsOptions.length > 0) {
                    update('university_id', shsOptions[0].id)
                    loadPrograms(shsOptions[0].id)
                  }
                }}>
                <option value="">Select subject</option>
                {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Year / Form</label>
              <select value={form.course_level} onChange={e => update('course_level', e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif', background: 'white' }}>
                <option value="">Select year</option>
                <option value="Form 1">Form 1 (Year 1)</option>
                <option value="Form 2">Form 2 (Year 2)</option>
                <option value="Form 3">Form 3 — WASSCE Prep</option>
              </select>
            </div>
          </div>
        )}

        {/* GENERAL CATEGORY */}
        {institutionType === 'general' && (
          <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Course category</div>
            <select value={form.category} onChange={e => update('category', e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif', background: 'white' }}>
              {['Technology', 'Business', 'Design', 'Finance', 'Agriculture', 'Arts & Music', 'Health', 'Languages', 'Personal Development', 'Other'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        )}

        {/* COURSE BASICS */}
        <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Course details</div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Course title *</label>
            <input value={form.title} onChange={e => update('title', e.target.value)} placeholder="e.g. Financial Accounting — UCC BBA Level 200" style={{ width: '100%', padding: '10px 14px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Subtitle</label>
            <input value={form.subtitle} onChange={e => update('subtitle', e.target.value)} placeholder="A short description shown under the title" style={{ width: '100%', padding: '10px 14px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Full description</label>
            <textarea value={form.description} onChange={e => update('description', e.target.value)} placeholder="Describe what students will learn, which semester this covers, and what makes your teaching approach effective..." rows={4} style={{ width: '100%', padding: '10px 14px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif', resize: 'vertical' }} />
          </div>
        </div>

        {/* PRICING */}
        <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Pricing</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Price (GH₵) *</label>
              <input type="number" value={form.price} onChange={e => update('price', e.target.value)} placeholder="e.g. 35" style={{ width: '100%', padding: '10px 14px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
              <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>Suggested: GH₵ 20–80 for university courses</div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Original price (GH₵)</label>
              <input type="number" value={form.old_price} onChange={e => update('old_price', e.target.value)} placeholder="e.g. 80 (shows as crossed out)" style={{ width: '100%', padding: '10px 14px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
            </div>
          </div>
        </div>

        {/* APPEARANCE */}
        <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Course appearance</div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Choose an icon</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {icons.map(icon => (
                <div key={icon} onClick={() => update('icon', icon)} style={{ width: 42, height: 42, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, cursor: 'pointer', border: `2px solid ${form.icon === icon ? '#0F6E56' : '#e5e5e5'}`, background: form.icon === icon ? '#E1F5EE' : 'white' }}>{icon}</div>
              ))}
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Choose a color</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {colors.map(color => (
                <div key={color} onClick={() => update('bg_color', color)} style={{ width: 34, height: 34, borderRadius: 6, background: color, cursor: 'pointer', border: `2px solid ${form.bg_color === color ? '#0F6E56' : 'transparent'}` }} />
              ))}
            </div>
          </div>

          {/* PREVIEW */}
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#F8F8F6', borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>Preview:</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 56, height: 56, borderRadius: 10, background: form.bg_color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>{form.icon}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{form.title || 'Your course title'}</div>
                <div style={{ fontSize: 12, color: '#888' }}>
                  {institutionType === 'university' && form.course_level && <span>{form.course_level} · </span>}
                  {form.course_code && <span>{form.course_code} · </span>}
                  GH₵ {form.price || '0'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <button onClick={handleCreate} disabled={loading} style={{ width: '100%', padding: 14, background: loading ? '#9FE1CB' : '#0F6E56', color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
          {loading ? 'Creating course...' : 'Create course & add lessons →'}
        </button>
      </div>
    </div>
  )
}