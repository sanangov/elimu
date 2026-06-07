'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const MATERIAL_TYPES = [
  { value: 'lecture_notes', label: '📄 Lecture Notes' },
  { value: 'slides', label: '📊 Slides' },
  { value: 'past_questions', label: '📝 Past Exam Questions' },
  { value: 'reading', label: '📚 Reading Material' },
  { value: 'assignment', label: '✏️ Assignment' },
  { value: 'other', label: '📎 Other' },
]

export default function MaterialsUpload({ courseId, onMaterialAdded }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    title: '',
    material_type: 'lecture_notes',
  })
  const [file, setFile] = useState(null)

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleUpload = async () => {
    setError('')
    setSuccess('')

    if (!form.title) { setError('Please enter a title.'); return }
    if (!file) { setError('Please select a file.'); return }

    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) { setError('File too large. Maximum size is 50MB.'); return }

    setUploading(true)

    const fileExt = file.name.split('.').pop()
    const fileName = `${courseId}/${Date.now()}.${fileExt}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('course-materials')
      .upload(fileName, file)

    if (uploadError) {
      setError(uploadError.message)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('course-materials')
      .getPublicUrl(fileName)

    const { data, error: dbError } = await supabase
      .from('course_materials')
      .insert({
        course_id: courseId,
        title: form.title,
        file_url: publicUrl,
        file_type: fileExt,
        material_type: form.material_type,
        file_size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        is_downloadable: true,
      })
      .select()
      .single()

    if (dbError) {
      setError(dbError.message)
      setUploading(false)
      return
    }

    setSuccess('File uploaded successfully!')
    setForm({ title: '', material_type: 'lecture_notes' })
    setFile(null)
    setUploading(false)
    if (onMaterialAdded) onMaterialAdded(data)
  }

  return (
    <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '1.25rem' }}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>📎 Upload study material</div>

      {error && (
        <div style={{ background: '#FCEBEB', border: '0.5px solid #F09595', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#A32D2D', marginBottom: '1rem' }}>{error}</div>
      )}
      {success && (
        <div style={{ background: '#E1F5EE', border: '0.5px solid #9FE1CB', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#085041', marginBottom: '1rem' }}>{success}</div>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Material type</label>
        <select
          value={form.material_type}
          onChange={e => update('material_type', e.target.value)}
          style={{ width: '100%', padding: '10px 14px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'DM Sans, sans-serif', background: 'white' }}
        >
          {MATERIAL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Title</label>
        <input
          value={form.title}
          onChange={e => update('title', e.target.value)}
          placeholder="e.g. Week 3 Lecture Notes — Financial Accounting"
          style={{ width: '100%', padding: '10px 14px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'DM Sans, sans-serif' }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>File</label>
        <div style={{ border: '1.5px dashed #e5e5e5', borderRadius: 8, padding: '1.5rem', textAlign: 'center', background: '#F8F8F6' }}>
          <input
            type="file"
            id="file-upload"
            onChange={e => setFile(e.target.files[0])}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
            style={{ display: 'none' }}
          />
          <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
            {file ? (
              <div>
                <div style={{ fontSize: 24, marginBottom: 6 }}>📄</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#0F6E56', marginBottom: 2 }}>{file.name}</div>
                <div style={{ fontSize: 11, color: '#888' }}>{(file.size / 1024 / 1024).toFixed(1)} MB</div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 24, marginBottom: 6 }}>⬆️</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 4 }}>Click to upload file</div>
                <div style={{ fontSize: 11, color: '#888' }}>PDF, Word, PowerPoint, Excel · Max 50MB</div>
              </div>
            )}
          </label>
        </div>
      </div>

      <button
        onClick={handleUpload}
        disabled={uploading}
        style={{
          width: '100%', padding: 12, background: uploading ? '#9FE1CB' : '#0F6E56',
          color: 'white', border: 'none', borderRadius: 8, fontSize: 14,
          fontWeight: 600, cursor: uploading ? 'not-allowed' : 'pointer',
          fontFamily: 'DM Sans, sans-serif'
        }}>
        {uploading ? 'Uploading...' : 'Upload material'}
      </button>
    </div>
  )
}