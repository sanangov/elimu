'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { requireAdmin } from '@/lib/adminAuth'

export default function AdminUniversities() {
  const router = useRouter()
  const [universities, setUniversities] = useState([])
  const [programs, setPrograms] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAddUni, setShowAddUni] = useState(false)
  const [showAddProg, setShowAddProg] = useState(false)
  const [newUni, setNewUni] = useState({ name: '', short_name: '', description: '', type: 'university' })
  const [newProg, setNewProg] = useState({ name: '', short_name: '', level: 'undergraduate' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const init = async () => {
      await new Promise(resolve => setTimeout(resolve, 500))
      const ok = await requireAdmin(router)
      if (!ok) return
      loadData()
    }
    init()
  }, [router])

  const loadData = async () => {
    setLoading(true)
    const { data: unis } = await supabase.from('universities').select('*').order('name')
    setUniversities(unis || [])
    setLoading(false)
  }

  const loadPrograms = async (uniId) => {
    const { data } = await supabase.from('programs').select('*').eq('university_id', uniId).order('name')
    setPrograms(data || [])
  }

  const selectUniversity = (uni) => {
    setSelected(uni)
    loadPrograms(uni.id)
    setShowAddProg(false)
  }

  const addUniversity = async () => {
    if (!newUni.name) return
    setSaving(true)
    const { data } = await supabase.from('universities').insert(newUni).select().single()
    setUniversities([...universities, data])
    setNewUni({ name: '', short_name: '', description: '', type: 'university' })
    setShowAddUni(false)
    setSaving(false)
  }

  const addProgram = async () => {
    if (!newProg.name || !selected) return
    setSaving(true)
    const { data } = await supabase.from('programs').insert({ ...newProg, university_id: selected.id }).select().single()
    setPrograms([...programs, data])
    setNewProg({ name: '', short_name: '', level: 'undergraduate' })
    setShowAddProg(false)
    setSaving(false)
  }

  const deleteProgram = async (id) => {
    if (!confirm('Delete this program?')) return
    await supabase.from('programs').delete().eq('id', id)
    setPrograms(programs.filter(p => p.id !== id))
  }

  const deleteUniversity = async (id) => {
    if (!confirm('Delete this university and all its programs?')) return
    await supabase.from('universities').delete().eq('id', id)
    setUniversities(universities.filter(u => u.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F8F6' }}>
      <aside style={{ width: 220, background: '#085041', padding: '1.5rem 0', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 900, color: 'white', padding: '0 1.25rem 2rem' }}>
          Elim<span style={{ color: '#5DCAA5' }}>u</span>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontFamily: 'DM Sans, sans-serif', fontWeight: 400, marginTop: 2 }}>ADMIN PANEL</div>
        </div>
        {[
          ['🏠', 'Dashboard', '/admin'],
          ['👨‍🏫', 'Instructors', '/admin/instructors'],
          ['🏛️', 'Universities', '/admin/universities'],
          ['📚', 'Courses', '/admin/courses'],
        ].map(([icon, label, href]) => (
          <Link key={label} href={href} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 1.25rem',
            fontSize: 13, fontWeight: 500, textDecoration: 'none',
            color: label === 'Universities' ? 'white' : 'rgba(255,255,255,0.65)',
            background: label === 'Universities' ? 'rgba(255,255,255,0.1)' : 'transparent',
            borderLeft: label === 'Universities' ? '2px solid #5DCAA5' : '2px solid transparent',
          }}><span>{icon}</span>{label}</Link>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ padding: '1rem 1.25rem', borderTop: '0.5px solid rgba(255,255,255,0.1)' }}>
          <Link href="/" style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>← Back to site</Link>
        </div>
      </aside>

      <main style={{ flex: 1, padding: '1.5rem', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Universities & Programs</h1>
            <p style={{ fontSize: 13, color: '#888' }}>Manage institutions and their programs.</p>
          </div>
          <button onClick={() => setShowAddUni(!showAddUni)} style={{ padding: '9px 18px', background: '#0F6E56', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
            + Add University
          </button>
        </div>

        {showAddUni && (
          <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Add new university / institution</div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 4 }}>Full name *</label>
                <input value={newUni.name} onChange={e => setNewUni({ ...newUni, name: e.target.value })} placeholder="e.g. University of Ghana" style={{ width: '100%', padding: '9px 12px', border: '0.5px solid #ccc', borderRadius: 6, fontSize: 13, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 4 }}>Short name</label>
                <input value={newUni.short_name} onChange={e => setNewUni({ ...newUni, short_name: e.target.value })} placeholder="e.g. UG" style={{ width: '100%', padding: '9px 12px', border: '0.5px solid #ccc', borderRadius: 6, fontSize: 13, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 4 }}>Type</label>
                <select value={newUni.type} onChange={e => setNewUni({ ...newUni, type: e.target.value })} style={{ width: '100%', padding: '9px 12px', border: '0.5px solid #ccc', borderRadius: 6, fontSize: 13, outline: 'none', fontFamily: 'DM Sans, sans-serif', background: 'white' }}>
                  <option value="university">University</option>
                  <option value="shs">SHS</option>
                  <option value="polytechnic">Polytechnic</option>
                  <option value="general">General</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 4 }}>Description</label>
              <input value={newUni.description} onChange={e => setNewUni({ ...newUni, description: e.target.value })} placeholder="Short description" style={{ width: '100%', padding: '9px 12px', border: '0.5px solid #ccc', borderRadius: 6, fontSize: 13, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={addUniversity} disabled={saving} style={{ padding: '9px 20px', background: '#0F6E56', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                {saving ? 'Saving...' : 'Save University'}
              </button>
              <button onClick={() => setShowAddUni(false)} style={{ padding: '9px 20px', background: 'white', color: '#888', border: '0.5px solid #e5e5e5', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Cancel</button>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: '1rem' }}>
          <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '1rem', borderBottom: '0.5px solid #e5e5e5', fontSize: 14, fontWeight: 600 }}>
              {universities.length} institutions
            </div>
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Loading...</div>
            ) : (
              universities.map((uni, i) => (
                <div key={uni.id} onClick={() => selectUniversity(uni)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 1rem', borderBottom: i < universities.length - 1 ? '0.5px solid #e5e5e5' : 'none', cursor: 'pointer', background: selected?.id === uni.id ? '#E1F5EE' : 'white' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#0F6E56', flexShrink: 0 }}>
                    {uni.short_name?.[0] || '🏛️'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{uni.name}</div>
                    <div style={{ fontSize: 11, color: '#888' }}>{uni.short_name} · {uni.type}</div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); deleteUniversity(uni.id) }} style={{ padding: '4px 10px', border: '0.5px solid #e5e5e5', borderRadius: 5, fontSize: 11, color: '#E24B4A', cursor: 'pointer', background: 'white', fontFamily: 'DM Sans, sans-serif' }}>Delete</button>
                </div>
              ))
            )}
          </div>

          {selected && (
            <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '0.5px solid #e5e5e5' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{selected.short_name} Programs</div>
                  <div style={{ fontSize: 11, color: '#888' }}>{programs.length} programs</div>
                </div>
                <button onClick={() => setShowAddProg(!showAddProg)} style={{ padding: '6px 14px', background: '#0F6E56', color: 'white', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>+ Add</button>
              </div>

              {showAddProg && (
                <div style={{ padding: '1rem', background: '#F8F8F6', borderBottom: '0.5px solid #e5e5e5' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10, marginBottom: 10 }}>
                    <input value={newProg.name} onChange={e => setNewProg({ ...newProg, name: e.target.value })} placeholder="Program name e.g. BBA Finance" style={{ padding: '8px 12px', border: '0.5px solid #ccc', borderRadius: 6, fontSize: 13, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
                    <select value={newProg.level} onChange={e => setNewProg({ ...newProg, level: e.target.value })} style={{ padding: '8px 12px', border: '0.5px solid #ccc', borderRadius: 6, fontSize: 13, outline: 'none', fontFamily: 'DM Sans, sans-serif', background: 'white' }}>
                      <option value="undergraduate">Undergraduate</option>
                      <option value="postgraduate">Postgraduate</option>
                      <option value="diploma">Diploma</option>
                      <option value="certificate">Certificate</option>
                      <option value="shs">SHS</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={addProgram} disabled={saving} style={{ padding: '7px 16px', background: '#0F6E56', color: 'white', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={() => setShowAddProg(false)} style={{ padding: '7px 14px', background: 'white', color: '#888', border: '0.5px solid #e5e5e5', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Cancel</button>
                  </div>
                </div>
              )}

              <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                {programs.map((prog, i) => (
                  <div key={prog.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 1rem', borderBottom: i < programs.length - 1 ? '0.5px solid #e5e5e5' : 'none' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{prog.name}</div>
                      <div style={{ fontSize: 11, color: '#888', textTransform: 'capitalize' }}>{prog.level}</div>
                    </div>
                    <button onClick={() => deleteProgram(prog.id)} style={{ padding: '3px 8px', border: '0.5px solid #e5e5e5', borderRadius: 4, fontSize: 11, color: '#E24B4A', cursor: 'pointer', background: 'white', fontFamily: 'DM Sans, sans-serif' }}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}