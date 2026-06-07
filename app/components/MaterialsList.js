'use client'

const MATERIAL_ICONS = {
  lecture_notes: '📄',
  slides: '📊',
  past_questions: '📝',
  reading: '📚',
  assignment: '✏️',
  other: '📎',
}

export default function MaterialsList({ materials, canDelete, onDelete }) {
  if (!materials || materials.length === 0) return (
    <div style={{ fontSize: 12, color: '#666', padding: '8px 0' }}>
      No materials yet.
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {materials.map(mat => (
        <div key={mat.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: 6 }}>
          <span style={{ fontSize: 14, flexShrink: 0 }}>{MATERIAL_ICONS[mat.material_type] || '📎'}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: '#ddd', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mat.title}</div>
            <div style={{ fontSize: 10, color: '#666' }}>{mat.file_type?.toUpperCase()} · {mat.file_size}</div>
          </div>
          <a
            href={mat.file_url}
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: 11, color: '#1D9E75', fontWeight: 600, textDecoration: 'none', flexShrink: 0, padding: '3px 8px', border: '0.5px solid #1D9E75', borderRadius: 4 }}
          >
            ↓
          </a>
          {canDelete && (
            <button
              onClick={() => onDelete && onDelete(mat.id)}
              style={{ padding: '3px 6px', border: 'none', borderRadius: 4, fontSize: 11, color: '#E24B4A', cursor: 'pointer', background: 'transparent', flexShrink: 0 }}
            >✕</button>
          )}
        </div>
      ))}
    </div>
  )
}