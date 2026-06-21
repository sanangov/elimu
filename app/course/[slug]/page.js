'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function CoursePage() {
  const router = useRouter()
  const params = useParams()
  const [course, setCourse] = useState(null)
  const [instructor, setInstructor] = useState(null)
  const [sections, setSections] = useState([])
  const [openSections, setOpenSections] = useState([0])
  const [activeTab, setActiveTab] = useState('reviews')
  const [dbReviews, setDbReviews] = useState([])
  const [avgRating, setAvgRating] = useState(0)
  const [user, setUser] = useState(null)
  const [enrolled, setEnrolled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [enrollmentCount, setEnrollmentCount] = useState(0)
  const [inWishlist, setInWishlist] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)

  useEffect(() => {
    const getData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) setUser(session.user)

      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', params.slug)
        .single()

      if (!courseData) { router.push('/'); return }
      setCourse(courseData)

      // Instructor profile
      const { data: instructorData } = await supabase
        .from('instructor_profiles')
        .select('*')
        .eq('user_id', courseData.instructor_id)
        .single()
      setInstructor(instructorData)

      // Sections + lessons
      const { data: sectionsData } = await supabase
        .from('course_sections')
        .select('*, course_lessons(*)')
        .eq('course_id', courseData.id)
        .order('position')
      setSections(sectionsData || [])

      // Reviews
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('*')
        .eq('course_slug', params.slug)
        .order('created_at', { ascending: false })
      if (reviewsData && reviewsData.length > 0) {
        setDbReviews(reviewsData)
        const avg = reviewsData.reduce((acc, r) => acc + r.rating, 0) / reviewsData.length
        setAvgRating(Math.round(avg * 10) / 10)
      }

      // Enrollment count
      const { count } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('course_slug', params.slug)
      setEnrollmentCount(count || 0)

      // Check if current user is enrolled
      if (session) {
        const { data: enrollment } = await supabase
          .from('enrollments')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('course_slug', params.slug)
          .single()
        if (enrollment) setEnrolled(true)
      } 
      if (session) {
        const { data: wishlistItem } = await supabase
          .from('wishlists')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('course_slug', params.slug)
          .single()
        if (wishlistItem) setInWishlist(true)
      }

      setLoading(false)
    }
    getData()
  }, [params.slug, router])

  const toggleSection = (i) => {
    setOpenSections(prev =>
      prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
    )
  }

  const handleEnroll = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    if (course.price === 0) {
      // Free course - enroll directly
      const { error } = await supabase.from('enrollments').insert({
        user_id: user.id,
        course_slug: course.slug,
        course_title: course.title,
        course_price: 0,
        payment_ref: `free_${Date.now()}`,
      })
      if (!error) router.push('/dashboard?enrolled=true')
      return
    }

    const PaystackPop = (await import('@paystack/inline-js')).default
    const handler = PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_KEY,
      email: user.email,
      amount: course.price * 100,
      currency: 'GHS',
      ref: `elimu_${Date.now()}`,
      metadata: {
        course_title: course.title,
        user_id: user.id,
      },
      onSuccess: async (transaction) => {
        const { error } = await supabase
          .from('enrollments')
          .insert({
            user_id: user.id,
            course_slug: course.slug,
            course_title: course.title,
            course_price: course.price,
            payment_ref: transaction.reference,
          })

        if (error) {
          console.error('Enrollment save error:', error)
        }

        router.push('/dashboard?enrolled=true')
      },
      onCancel: () => {
        console.log('Payment cancelled')
      },
    })
    handler.openIframe()
  }

      const toggleWishlist = async () => {
      if (!user) {
        router.push('/login')
        return
      }
      setWishlistLoading(true)

      if (inWishlist) {
        await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', user.id)
          .eq('course_slug', course.slug)
        setInWishlist(false)
      } else {
        await supabase
          .from('wishlists')
          .insert({
            user_id: user.id,
            course_slug: course.slug,
            course_title: course.title,
          })
        setInWishlist(true)
      }
      setWishlistLoading(false)
    }

  if (loading || !course) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F8F6' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 900, color: '#0F6E56', marginBottom: 12 }}>Elimu</div>
        <p style={{ fontSize: 14, color: '#888' }}>Loading course...</p>
      </div>
    </div>
  )

  const totalLessons = sections.reduce((acc, s) => acc + (s.course_lessons?.length || 0), 0)
  const totalSections = sections.length
  const instructorName = instructor ? `${instructor.first_name} ${instructor.last_name}` : 'Elimu Instructor'
  const instructorInitials = instructor ? `${instructor.first_name?.[0] || ''}${instructor.last_name?.[0] || ''}`.toUpperCase() : 'EI'
  const learns = course.what_you_learn || []
  const requirements = course.requirements || []
  const includes = course.includes || []

  return (
    <main style={{ background: '#F8F8F6', minHeight: '100vh' }}>

      {/* NAVBAR */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem 1.25rem', background: 'white',
        borderBottom: '0.5px solid #e5e5e5', position: 'sticky', top: 0, zIndex: 10
      }}>
        <Link href="/" style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 900, color: '#0F6E56', textDecoration: 'none' }}>
          Elim<span style={{ color: '#1D9E75' }}>u</span>
        </Link>
        <div style={{ fontSize: 12, color: '#888', display: 'flex', gap: 6 }}>
          <Link href="/" style={{ color: '#1D9E75' }}>Home</Link> ›
          <span>{course.category}</span>
        </div>
        {!user ? (
          <div style={{ display: 'flex', gap: 10 }}>
            <Link href="/login" style={{ padding: '8px 18px', border: '1.5px solid #1D9E75', borderRadius: 8, color: '#0F6E56', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>Log in</Link>
            <Link href="/signup" style={{ padding: '8px 18px', background: '#0F6E56', borderRadius: 8, color: 'white', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>Sign up</Link>
          </div>
        ) : (
          <Link href="/dashboard" style={{ fontSize: 13, color: '#0F6E56', fontWeight: 500, textDecoration: 'none' }}>My Dashboard →</Link>
        )}
      </nav>

      {/* HERO */}
      <div style={{ background: 'linear-gradient(135deg, #085041 0%, #0F6E56 100%)', padding: '2.5rem 1.25rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ display: 'inline-block', background: 'rgba(29,158,117,0.3)', color: '#9FE1CB', fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 20, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.5px' }}>
              {course.category}
            </div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 900, color: 'white', lineHeight: 1.25, marginBottom: 10 }}>{course.title}</h1>
            {course.subtitle && (
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,.75)', lineHeight: 1.6, marginBottom: 16, maxWidth: 560 }}>{course.subtitle}</p>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
              {dbReviews.length > 0 ? (
                <>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#EF9F27' }}>{avgRating}</span>
                  <span style={{ color: '#EF9F27' }}>{'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}</span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,.6)' }}>({dbReviews.length} ratings)</span>
                </>
              ) : (
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,.6)' }}>No ratings yet</span>
              )}
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,.6)' }}>· {enrollmentCount} student{enrollmentCount !== 1 ? 's' : ''}</span>
            </div>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
              {[
                `${totalLessons} lessons`,
                `${totalSections} sections`,
                'Lifetime access',
              ].map(item => (
                <span key={item} style={{ fontSize: 13, color: 'rgba(255,255,255,.7)' }}>✓ {item}</span>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,.7)' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1D9E75', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#085041' }}>
                {instructorInitials}
              </div>
              Created by <span style={{ color: '#9FE1CB', fontWeight: 500 }}>{instructorName}</span>
              &nbsp;·&nbsp; Last updated {new Date(course.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
            </div>
          </div>

          {/* ENROLL CARD */}
          <div style={{ width: 280, flexShrink: 0, background: 'white', borderRadius: 14, overflow: 'hidden', border: '0.5px solid #e5e5e5' }}>
            <div style={{ height: 130, background: course.bg_color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52, position: 'relative' }}>
              {course.icon}
            </div>
            <div style={{ padding: '1.25rem' }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 30, fontWeight: 700, color: '#0F6E56', marginBottom: 4 }}>
                {course.price === 0 ? 'Free' : `GH₵ ${course.price}`}
              </div>
              {course.old_price && course.old_price > course.price && (
                <>
                  <div style={{ fontSize: 13, color: '#888', textDecoration: 'line-through', marginBottom: 4 }}>GH₵ {course.old_price}</div>
                  <div style={{ display: 'inline-block', background: '#FAECE7', color: '#993C1D', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4, marginBottom: 14 }}>
                    {Math.round((1 - course.price / course.old_price) * 100)}% off
                  </div>
                </>
              )}

          {enrolled ? (
            <Link href={`/learn/${course.slug}`} style={{ display: 'block', textAlign: 'center', width: '100%', padding: 13, background: '#1D9E75', color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, textDecoration: 'none', marginBottom: 10 }}>
              Continue learning →
            </Link>
          ) : (
            <>
              <button onClick={handleEnroll} style={{
                width: '100%', padding: 13, background: '#0F6E56', color: 'white',
                border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', marginBottom: 10
              }}>{course.price === 0 ? 'Enroll for free' : 'Enroll now'}</button>

              <button
                onClick={toggleWishlist}
                disabled={wishlistLoading}
                style={{
                  width: '100%', padding: 11, background: inWishlist ? '#FAECE7' : 'transparent',
                  color: inWishlist ? '#993C1D' : '#0F6E56',
                  border: `1.5px solid ${inWishlist ? '#F0A98A' : '#1D9E75'}`, borderRadius: 10, fontSize: 14,
                  fontWeight: 500, cursor: wishlistLoading ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', marginBottom: 14
                }}>
                {inWishlist ? '♥ Remove from wishlist' : '♡ Add to wishlist'}
              </button>
            </>
          )}

          <div style={{ fontSize: 12, color: '#888', textAlign: 'center', marginBottom: 14 }}>Lifetime access</div>

              {includes.length > 0 && (
                <div style={{ borderTop: '0.5px solid #e5e5e5', paddingTop: 12 }}>
                  {includes.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#888', marginBottom: 8 }}>
                      <span style={{ color: '#1D9E75' }}>✓</span>{f}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.25rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 280 }}>

          {/* WHAT YOU WILL LEARN */}
          {learns.length > 0 && (
            <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 700, marginBottom: 14 }}>What you will learn</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
                {learns.map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 13, color: '#555', lineHeight: 1.4 }}>
                    <span style={{ color: '#1D9E75', flexShrink: 0, marginTop: 1 }}>✓</span>{item}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DESCRIPTION */}
          {course.description && (
            <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 700, marginBottom: 10 }}>Description</h2>
              <p style={{ fontSize: 13, color: '#555', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{course.description}</p>
            </div>
          )}

          {/* CURRICULUM */}
          <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Course curriculum</h2>
            <div style={{ fontSize: 13, color: '#888', marginBottom: 14 }}>{totalSections} sections · {totalLessons} lessons</div>

            {sections.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#888', fontSize: 13 }}>Curriculum coming soon.</div>
            ) : (
              sections.map((section, i) => (
                <div key={section.id} style={{ border: '0.5px solid #e5e5e5', borderRadius: 10, marginBottom: 10, overflow: 'hidden' }}>
                  <div
                    onClick={() => toggleSection(i)}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#F8F8F6', cursor: 'pointer' }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 500 }}>
                      {openSections.includes(i) ? '▼' : '▶'} &nbsp;Section {i + 1}: {section.title}
                    </div>
                    <div style={{ fontSize: 12, color: '#888' }}>{section.course_lessons?.length || 0} lessons</div>
                  </div>
                  {openSections.includes(i) && (
                    <div style={{ padding: '0 14px' }}>
                      {(section.course_lessons || []).map((item, j) => (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: j < section.course_lessons.length - 1 ? '0.5px solid #e5e5e5' : 'none', fontSize: 13 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 6, background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13 }}>
                            {item.is_free ? '▶' : '🔒'}
                          </div>
                          <div style={{ flex: 1 }}>{item.title}</div>
                          {item.is_free && <span style={{ fontSize: 12, color: '#1D9E75', fontWeight: 500 }}>Free preview</span>}
                          <div style={{ fontSize: 12, color: '#888' }}>{item.duration || '--'}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* TABS — REVIEWS & INSTRUCTOR */}
          <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '1.25rem' }}>
            <div style={{ display: 'flex', borderBottom: '0.5px solid #e5e5e5', marginBottom: '1rem' }}>
              {['reviews', 'instructor'].map(tab => (
                <div key={tab} onClick={() => setActiveTab(tab)} style={{
                  padding: '8px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer',
                  color: activeTab === tab ? '#0F6E56' : '#888',
                  borderBottom: activeTab === tab ? '2px solid #0F6E56' : '2px solid transparent',
                  marginBottom: -1, textTransform: 'capitalize'
                }}>{tab === 'reviews' ? 'Student reviews' : 'Instructor'}</div>
              ))}
            </div>

            {activeTab === 'reviews' && (
              <div>
                {dbReviews.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#888', fontSize: 14 }}>
                    No reviews yet. Be the first to review this course!
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                      <div style={{ textAlign: 'center', flexShrink: 0 }}>
                        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 52, fontWeight: 700, color: '#BA7517', lineHeight: 1 }}>
                          {avgRating}
                        </div>
                        <div style={{ color: '#EF9F27', fontSize: 18 }}>{'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}</div>
                        <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>Course rating</div>
                      </div>
                    </div>
                    {dbReviews.map((rev, i) => (
                      <div key={rev.id} style={{ padding: '14px 0', borderBottom: i < dbReviews.length - 1 ? '0.5px solid #e5e5e5' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#0F6E56' }}>
                            {rev.reviewer_name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 500 }}>{rev.reviewer_name || 'Student'}</div>
                          </div>
                          <div style={{ marginLeft: 'auto', color: '#EF9F27', fontSize: 12 }}>
                            {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                          </div>
                        </div>
                        <div style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>{rev.comment}</div>
                        <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>
                          {new Date(rev.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {activeTab === 'instructor' && (
              <div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 600, color: '#0F6E56', flexShrink: 0 }}>
                    {instructorInitials}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{instructorName}</div>
                    {instructor?.qualifications && (
                      <div style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>{instructor.qualifications}</div>
                    )}
                  </div>
                </div>
                <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>{instructor?.bio || 'No bio available.'}</p>
              </div>
            )}
          </div>
        </div>

        {/* SIDEBAR */}
        <div style={{ width: 240, flexShrink: 0 }}>
          {requirements.length > 0 && (
            <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Requirements</div>
              {requirements.map(r => (
                <div key={r} style={{ display: 'flex', gap: 7, fontSize: 13, color: '#888', marginBottom: 8, lineHeight: 1.4 }}>
                  <span style={{ flexShrink: 0 }}>•</span>{r}
                </div>
              ))}
            </div>
          )}

          <div style={{ background: '#E1F5EE', border: '0.5px solid #9FE1CB', borderRadius: 12, padding: '1.25rem' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#085041', marginBottom: 6 }}>Share this course</div>
            <div style={{ fontSize: 12, color: '#0F6E56', marginBottom: 10 }}>Know someone who would benefit?</div>
            <button
              onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Link copied!') }}
              style={{ width: '100%', padding: 9, background: '#0F6E56', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              Copy link
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}