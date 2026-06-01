'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const categories = ['Technology', 'Business', 'Design', 'Finance', 'Agriculture', 'Arts & Music', 'Health', 'Languages']
const icons = ['💻', '📈', '🎨', '📊', '🌿', '🎵', '🏥', '🗣️', '🎓', '📚', '🔬', '🏋️']
const colors = ['#E1F5EE', '#FAEEDA', '#FAECE7', '#E6F1FB', '#EAF3DE', '#EEEDFE', '#FBEAF0', '#E8F0FE']

export default function NewCourse() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    category: 'Technology',
    price: '',
    old_price: '',
    icon: '💻',
    bg_color: '#E1F5EE',
  })

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

    const { data, error } = await supabase.from('courses').insert({
      instructor_id: session.user.id,
      title: form.title,
      subtitle: form.subtitle,
      description: form.description,
      category: form.category,
      price: parseInt(form.price),
      old_price: form.old_price ? parseInt(form.old_price) : null,
      slug,
      icon: form.icon,
      bg_color: form.bg_color,
      status: 'draft',
    }).select().single()

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push(`/instructor/course/${data.id}`)
    }
  }

  return (
    <div style={{ background: '#F8F8F6', minHeight: '100vh' }}>

      {/* NAV */}
      <nav style={{ background: 'white', borderBottom: '0.5px solid #e5e5e5', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/instructor" style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 900, color: '#0F6E56', textDecoration: 'none' }}>
          Elim<span style={{ color: '#1D9E75' }}>u</span>
        </Link>
        <div style={{ fontSize: 13, color: '#888' }}>
          <Link href="/instructor" style={{ color: '#1D9E75' }}>Dashboard</Link> › New Course
        </div>
        <Link href="/instructor" style={{ fontSize: 13, color: '#888', textDecoration: 'none' }}>← Back</Link>
      </nav>

      <div style={{ maxWidth: 700, margin: '2rem auto', padding: '0 1.5rem' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Create a new course</h1>
        <p style={{ fontSize: 13, color: '#888', marginBottom: '1.5rem' }}>Fill in the details below. You can add lessons after creating the course.</p>

        {error && (
          <div style={{ background: '#FCEBEB', border: '0.5px solid #F09595', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#A32D2D', marginBottom: '1rem' }}>{error}</div>
        )}

        {/* TITLE */}
        <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Course basics</div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Course title *</label>
            <input value={form.title} onChange={e => update('title', e.target.value)} placeholder="e.g. Full-Stack Web Development Bootcamp" style={{ width: '100%', padding: '11px 14px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Subtitle</label>
            <input value={form.subtitle} onChange={e => update('subtitle', e.target.value)} placeholder="A short description shown under the title" style={{ width: '100%', padding: '11px 14px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Full description</label>
            <textarea value={form.description} onChange={e => update('description', e.target.value)} placeholder="Describe what students will learn, who this course is for, and what makes it special..." rows={4} style={{ width: '100%', padding: '11px 14px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif', resize: 'vertical' }} />
          </div>
        </div>

        {/* CATEGORY & PRICE */}
        <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Category & pricing</div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Category</label>
            <select value={form.category} onChange={e => update('category', e.target.value)} style={{ width: '100%', padding: '11px 14px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif', background: 'white' }}>
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Price (GH₵) *</label>
              <input type="number" value={form.price} onChange={e => update('price', e.target.value)} placeholder="e.g. 120" style={{ width: '100%', padding: '11px 14px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Original price (GH₵)</label>
              <input type="number" value={form.old_price} onChange={e => update('old_price', e.target.value)} placeholder="e.g. 350 (shows as crossed out)" style={{ width: '100%', padding: '11px 14px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
            </div>
          </div>
        </div>

        {/* ICON & COLOR */}
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
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Choose a background color</label>
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
                <div style={{ fontSize: 12, color: '#888' }}>{form.category} · GH₵ {form.price || '0'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* SUBMIT */}
        <button onClick={handleCreate} disabled={loading} style={{ width: '100%', padding: 14, background: loading ? '#9FE1CB' : '#0F6E56', color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
          {loading ? 'Creating course...' : 'Create course & add lessons →'}
        </button>
      </div>
    </div>
  )
}