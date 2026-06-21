'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function WishlistPage() {
  const router = useRouter()
  const [wishlistItems, setWishlistItems] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      const { data: wishlistData } = await supabase
        .from('wishlists')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      setWishlistItems(wishlistData || [])

      if (wishlistData && wishlistData.length > 0) {
        const slugs = wishlistData.map(w => w.course_slug)
        const { data: coursesData } = await supabase
          .from('courses')
          .select('*')
          .in('slug', slugs)
        setCourses(coursesData || [])
      }

      setLoading(false)
    }
    getData()
  }, [router])

  const removeFromWishlist = async (slug) => {
    const { data: { session } } = await supabase.auth.getSession()
    await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', session.user.id)
      .eq('course_slug', slug)
    setWishlistItems(wishlistItems.filter(w => w.course_slug !== slug))
    setCourses(courses.filter(c => c.slug !== slug))
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F8F6' }}>
      <p style={{ color: '#888' }}>Loading your wishlist...</p>
    </div>
  )

  return (
    <div style={{ background: '#F8F8F6', minHeight: '100vh' }}>
      <nav style={{ background: 'white', borderBottom: '0.5px solid #e5e5e5', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 900, color: '#0F6E56', textDecoration: 'none' }}>
          Elim<span style={{ color: '#1D9E75' }}>u</span>
        </Link>
        <Link href="/dashboard" style={{ fontSize: 13, color: '#888', textDecoration: 'none' }}>← Back to Dashboard</Link>
      </nav>

      <div style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1.25rem' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 700, marginBottom: 6 }}>My Wishlist</h1>
        <p style={{ fontSize: 13, color: '#888', marginBottom: '1.5rem' }}>Courses you've saved for later.</p>

        {courses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: 12, border: '0.5px solid #e5e5e5' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>♡</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Your wishlist is empty</div>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>Save courses you're interested in to find them easily later.</p>
            <Link href="/search" style={{ display: 'inline-block', padding: '10px 24px', background: '#0F6E56', color: 'white', borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>Browse courses →</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {courses.map(course => (
              <div key={course.id} style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, overflow: 'hidden' }}>
                <Link href={`/course/${course.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ height: 120, background: course.bg_color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>
                    {course.icon}
                  </div>
                  <div style={{ padding: 14 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#0F6E56', marginBottom: 4 }}>{course.category}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4, marginBottom: 8 }}>{course.title}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0F6E56' }}>
                      {course.price === 0 ? 'Free' : `GH₵ ${course.price}`}
                    </div>
                  </div>
                </Link>
                <div style={{ padding: '0 14px 14px' }}>
                  <button
                    onClick={() => removeFromWishlist(course.slug)}
                    style={{ width: '100%', padding: 8, background: 'white', color: '#E24B4A', border: '0.5px solid #e5e5e5', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                    Remove from wishlist
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}