'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { requireAdmin } from '@/lib/adminAuth'

export default function AdminInstructors() {
  const router = useRouter()
  const [instructors, setInstructors] = useState([])
  const [filter, setFilter] = useState('pending')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const init = async () => {
      const ok = await requireAdmin(router)
      if (!ok) return
      loadInstructors()
    }
    init()
  }, [router, filter])

  const loadInstructors = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('instructor_profiles')
      .select('*')
      .eq('status', filter)
      .order('created_at', { ascending: false })
    setInstructors(data || [])
    setLoading(false)
  }

  const handleApprove = async (id) => {
  setProcessing(true)
  const instructor = instructors.find(i => i.id === id)
  await supabase.from('instructor_profiles')
    .update({ status: 'approved', reviewed_at: new Date().toISOString() })
    .eq('id', id)

  await fetch('/api/send-approval-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: instructor.email,
      firstName: instructor.first_name,
      approved: true,
    })
  })

  setInstructors(instructors.filter(i => i.id !== id))
  setSelected(null)
  setProcessing(false)
}

  const handleReject = async (id) => {
  if (!rejectionReason.trim()) {
    alert('Please provide a rejection reason.')
    return
  }
  setProcessing(true)
  const instructor = instructors.find(i => i.id === id)
  await supabase.from('instructor_profiles')
    .update({ status: 'rejected', rejection_reason: rejectionReason, reviewed_at: new Date().toISOString() })
    .eq('id', id)

  await fetch('/api/send-approval-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: instructor.email,
      firstName: instructor.first_name,
      approved: false,
    })
  })

  setInstructors(instructors.filter(i => i.id !== id))
  setSelected(null)
  setRejectionReason('')
  setProcessing(false)
}

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F8F6' }}>

      {/* SIDEBAR */}
      <aside style={{ width: 220, background: '#085041', padding: '1.5rem 0', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 900, color: 'white', padding: '0 1.25rem 2rem' }}>
          Elim<span style={{ color: '#5DCAA5' }}>u</span>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontFamily: 'DM Sans, sans-serif', fontWeight: 400, marginTop: 2 }}>ADMIN PANEL</div>
        </div>
        {[
          ['📧 Email', selected.email],
          ['📱 Phone', selected.phone],
          ['📚 Subject Area', selected.subject_area],
          ['🎓 Qualifications', selected.qualifications],
          ['🏛️ Institution', selected.institution],
          ['📝 Bio', selected.bio],
        ].map(([label, value]) => (
          <Link key={label} href={href} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 1.25rem',
            fontSize: 13, fontWeight: 500, textDecoration: 'none',
            color: label === 'Instructors' ? 'white' : 'rgba(255,255,255,0.65)',
            background: label === 'Instructors' ? 'rgba(255,255,255,0.1)' : 'transparent',
            borderLeft: label === 'Instructors' ? '2px solid #5DCAA5' : '2px solid transparent',
          }}><span>{icon}</span>{label}</Link>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ padding: '1rem 1.25rem', borderTop: '0.5px solid rgba(255,255,255,0.1)' }}>
          <Link href="/" style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>← Back to site</Link>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, padding: '1.5rem', overflow: 'auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Instructor Applications</h1>
          <p style={{ fontSize: 13, color: '#888' }}>Review and approve instructor applications.</p>
        </div>

        {/* FILTER TABS */}
        <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
          {['pending', 'approved', 'rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '8px 20px', borderRadius: 20, fontSize: 13, fontWeight: 500,
              cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', border: 'none',
              background: filter === f ? '#0F6E56' : 'white',
              color: filter === f ? 'white' : '#555',
              border: `0.5px solid ${filter === f ? '#0F6E56' : '#e5e5e5'}`,
              textTransform: 'capitalize'
            }}>{f}</button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: '1rem' }}>

          {/* LIST */}
          <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#888' }}>Loading...</div>
            ) : instructors.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
                <div style={{ fontSize: 14, color: '#888' }}>No {filter} applications</div>
              </div>
            ) : (
              instructors.map((inst, i) => (
                <div
                  key={inst.id}
                  onClick={() => setSelected(inst)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '1rem',
                    borderBottom: i < instructors.length - 1 ? '0.5px solid #e5e5e5' : 'none',
                    cursor: 'pointer', background: selected?.id === inst.id ? '#E1F5EE' : 'white'
                  }}
                >
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 600, color: '#0F6E56', flexShrink: 0 }}>
                    {inst.first_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>{inst.first_name} {inst.last_name}</div>
                    <div style={{ fontSize: 12, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inst.subject_area} · {inst.institution}</div>
                    <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>
                      Applied {new Date(inst.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 4, textTransform: 'uppercase', flexShrink: 0,
                    background: inst.status === 'approved' ? '#E1F5EE' : inst.status === 'rejected' ? '#FCEBEB' : '#FAEEDA',
                    color: inst.status === 'approved' ? '#085041' : inst.status === 'rejected' ? '#A32D2D' : '#633806',
                  }}>{inst.status}</span>
                </div>
              ))
            )}
          </div>

          {/* DETAIL PANEL */}
          {selected && (
            <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>Application Details</div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: 18 }}>✕</button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem', padding: '1rem', background: '#F8F8F6', borderRadius: 8 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 600, color: '#0F6E56' }}>
                  {selected.first_name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>{selected.first_name} {selected.last_name}</div>
                  <div style={{ fontSize: 13, color: '#888' }}>{selected.institution}</div>
                </div>
              </div>

              {[
                ['📚 Subject Area', selected.subject_area],
                ['🎓 Qualifications', selected.qualifications],
                ['🏛️ Institution', selected.institution],
                ['📝 Bio', selected.bio],
              ].map(([label, value]) => (
                <div key={label} style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 13, color: '#2C2C2A', lineHeight: 1.6, background: '#F8F8F6', padding: '8px 12px', borderRadius: 6 }}>{value || 'Not provided'}</div>
                </div>
              ))}

              {selected.id_document_url && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 4 }}>📎 ID Document</div>
                  <a href={selected.id_document_url} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: '#1D9E75', fontWeight: 500 }}>View document →</a>
                </div>
              )}

              {selected.status === 'pending' && (
                <div style={{ marginTop: '1rem', borderTop: '0.5px solid #e5e5e5', paddingTop: '1rem' }}>
                  <button
                    onClick={() => handleApprove(selected.id)}
                    disabled={processing}
                    style={{ width: '100%', padding: 12, background: '#0F6E56', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', marginBottom: 10 }}>
                    {processing ? 'Processing...' : '✅ Approve Instructor'}
                  </button>

                  <div style={{ marginBottom: 8 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6, color: '#888' }}>Rejection reason (required to reject)</label>
                    <textarea
                      value={rejectionReason}
                      onChange={e => setRejectionReason(e.target.value)}
                      placeholder="e.g. Qualifications not sufficient, please reapply with verified credentials..."
                      rows={3}
                      style={{ width: '100%', padding: '10px 12px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'DM Sans, sans-serif', resize: 'none' }}
                    />
                  </div>
                  <button
                    onClick={() => handleReject(selected.id)}
                    disabled={processing}
                    style={{ width: '100%', padding: 12, background: 'white', color: '#E24B4A', border: '1px solid #E24B4A', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                    {processing ? 'Processing...' : '❌ Reject Application'}
                  </button>
                </div>
              )}

              {selected.status === 'rejected' && selected.rejection_reason && (
                <div style={{ background: '#FCEBEB', border: '0.5px solid #F09595', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#A32D2D', marginTop: '1rem' }}>
                  <strong>Rejection reason:</strong> {selected.rejection_reason}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}