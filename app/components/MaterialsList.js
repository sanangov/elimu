'use client'

const MATERIAL_ICONS = {
  lecture_notes: '📄',
  slides: '📊',
  past_questions: '📝',
  reading: '📚',
  assignment: '✏️',
  other: '📎',
}

const MATERIAL_LABELS = {
  lecture_notes: 'Lecture Notes',
  slides: 'Slides',
  past_questions: 'Past Questions',
  reading: 'Reading Material',
  assignment: 'Assignment',
  other: 'Other',
}

export default function MaterialsList({ materials, canDelete, onDelete }) {
  if (!materials || materials.length === 0) return (
    <div style={{ textAlign: 'center', padding: '2rem', color: '#888', fontSize: 13 }}>
      No study materials uploaded yet.
    </div>
  )

  const grouped = materials.reduce((acc, mat) => {
    const type = mat.material_type || 'other'
    if (!acc[type]) acc[type] = []
    acc[type].push(mat)
    return acc
  }, {})

  return (
    <div>
      {Object.entries(grouped).map(([type, items]) => (
        <div key={type} style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
            {MATERIAL_ICONS[type]} {MATERIAL_LABELS[type]}
          </div>
          {items.map(mat => (
            <div key={mat.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#F8F8F6', borderRadius: 8, marginBottom: 6 }}>
              <div style={{ fontSize: 20, flexShrink: 0 }}>{MATERIAL_ICONS[mat.material_type] || '📎'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{mat.title}</div>
                <div style={{ fontSize: 11, color: '#888' }}>
                  {mat.file_type?.toUpperCase()} {mat.file_size && `· ${mat.file_size}`}
                </div>
              </div>
              <a
               href={mat.file_url}
                target="_blank"
                rel="noreferrer"
                style={{ padding: '6px 14px', background: '#0F6E56', color: 'white', borderRadius: 6, fontSize: 12, fontWeight: 500, textDecoration: 'none', flexShrink: 0, display: 'inline-block' }}
              >
                ⬇️ Download
              </a>
              {canDelete && (
                <button
                  onClick={() => onDelete && onDelete(mat.id)}
                  style={{ padding: '6px 10px', border: '0.5px solid #e5e5e5', borderRadius: 6, fontSize: 12, color: '#E24B4A', cursor: 'pointer', background: 'white', fontFamily: 'DM Sans, sans-serif', flexShrink: 0 }}
                >✕</button>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}