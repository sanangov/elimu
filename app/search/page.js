'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Suspense } from 'react'

const categories = ['All', 'Technology', 'Business', 'Design', 'Finance', 'Agriculture', 'Arts & Music', 'Health', 'Languages']

function SearchResults() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get('q') || ''
  const category = searchParams.get('category') || 'All'

  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState(query)

  useEffect(() => {
    const getCourses = async () => {
      setLoading(true)
      let queryBuilder = supabase
        .from('courses')
        .select('*')
        .eq('status', 'published')

      if (query) {
        queryBuilder = queryBuilder.or(`title.ilike.%${query}%,subtitle.ilike.%${query}%,description.ilike.%${query}%`)
      }

      if (category && category !== 'All') {
        queryBuilder = queryBuilder.eq('category', category)
      }

      const { data } = await queryBuilder.order('created_at', { ascending: false })
      setCourses(data || [])
      setLoading(false)
    }
    getCourses()
  }, [query, category])

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    if (category !== 'All') params.set('category', category)
    router.push(`/search?${params.toString()}`)
  }

  const handleCategory = (cat) => {
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    if (cat !== 'All') params.set('category', cat)
    router.push(`/search?${params.toString()}`)
  }

  return (
    <main style={{ background: '#F8F8F6', minHeight: '100vh' }}>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', background: 'white', borderBottom: '0.5px solid #e5e5e5', position: 'sticky', top: 0, zIndex: 10 }}>
        <Link href="/" style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 900, color: '#0F6E56', textDecoration: 'none' }}>
          Elim<span style={{ color: '#1D9E75' }}>u</span>
        </Link>
        <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 500, margin: '0 2rem', display: 'flex', background: '#F8F8F6', borderRadius: 8, overflow: 'hidden', border: '0.5px solid #e5e5e5' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search for courses..."
            style={{ flex: 1, border: 'none', padding: '10px 14px', fontSize: 14, outline: 'none', background: 'transparent', fontFamily: 'DM Sans, sans-serif' }}
          />
          <button type="submit" style={{ padding: '10px 18px', background: '#0F6E56', border: 'none', color: 'white', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Search</button>
        </form>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/login" style={{ padding: '8px 16px', border: '1.5px solid #1D9E75', borderRadius: 8, color: '#0F6E56', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>Log in</Link>
          <Link href="/signup" style={{ padding: '8px 16px', background: '#0F6E56', borderRadius: 8, color: 'white', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>Sign up</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem' }}>

        {/* SEARCH HEADER */}
        <div style={{ marginBottom: '1.5rem' }}>
          {query ? (
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, marginBottom: 6 }}>
              Results for "<span style={{ color: '#0F6E56' }}>{query}</span>"
            </h1>
          ) : (
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, marginBottom: 6 }}>
              Browse all courses
            </h1>
          )}
          <p style={{ fontSize: 13, color: '#888' }}>
            {loading ? 'Searching...' : `${courses.length} course${courses.length !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {/* CATEGORY FILTERS */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategory(cat)}
              style={{
                padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500,
                cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', border: 'none',
                background: category === cat ? '#0F6E56' : 'white',
                color: category === cat ? 'white' : '#555',
                border: `0.5px solid ${category === cat ? '#0F6E56' : '#e5e5e5'}`,
              }}
            >{cat}</button>
          ))}
        </div>

        {/* RESULTS */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#888' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
            <p>Searching courses...</p>
          </div>
        ) : courses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: 12, border: '0.5px solid #e5e5e5' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>No courses found</h2>
            <p style={{ fontSize: 14, color: '#888', marginBottom: 20 }}>
              {query ? `No results for "${query}". Try a different search term.` : 'No courses available yet.'}
            </p>
            <Link href="/" style={{ display: 'inline-block', padding: '10px 24px', background: '#0F6E56', color: 'white', borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
              Back to homepage
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {courses.map(course => (
              <Link href={`/course/${course.slug}`} key={course.id} style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, overflow: 'hidden', display: 'block', textDecoration: 'none', color: 'inherit', transition: 'transform .15s, box-shadow .15s' }}>
                <div style={{ height: 120, background: course.bg_color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>
                  {course.icon}
                </div>
                <div style={{ padding: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#0F6E56', marginBottom: 6 }}>{course.category}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4, marginBottom: 6 }}>{course.title}</div>
                  <div style={{ fontSize: 12, color: '#888', marginBottom: 10, lineHeight: 1.4 }}>{course.subtitle}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: '#BA7517' }}>★ New</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#0F6E56' }}>
                      {course.price === 0 ? 'Free' : `GH₵ ${course.price}`}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#888' }}>Loading...</p></div>}>
      <SearchResults />
    </Suspense>
  )
}