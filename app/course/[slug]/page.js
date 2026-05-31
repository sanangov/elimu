'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const course = {
  title: 'Full-Stack Web Development Bootcamp',
  subtitle: 'Master HTML, CSS, JavaScript, React, Node.js and databases. Build real projects and launch your career as a developer.',
  category: 'Technology',
  rating: 4.9,
  reviews: 2841,
  students: 14320,
  instructor: { name: 'Kwame Mensah', title: 'Senior Software Engineer & Educator', initials: 'KM', students: 28400, courses: 6, bio: 'Kwame is a senior software engineer with over 10 years of experience building products at tech companies across Africa and Europe. He has taught over 28,000 students on Elimu.' },
  price: 120,
  oldPrice: 350,
  icon: '💻',
  bg: '#E1F5EE',
  hours: 42,
  lessons: 87,
  sections: 12,
  updated: 'April 2026',
  languages: 'English, French, Swahili',
  learns: [
    'Build full-stack apps with React & Node.js',
    'Design and query PostgreSQL databases',
    'Build and consume REST APIs',
    'Deploy apps to the cloud with Vercel',
    'Implement user authentication & security',
    'Version control with Git & GitHub',
    'Style beautifully with Tailwind CSS',
    'Land your first developer job',
  ],
  requirements: [
    'No prior coding experience needed',
    'A computer with internet access',
    'Willingness to practice daily',
  ],
  curriculum: [
    { title: 'Getting Started', lessons: 5, duration: '1h 20m', items: [
      { name: 'Welcome & course overview', duration: '5:30', free: true },
      { name: 'Setting up your environment', duration: '12:45', free: true },
      { name: 'How the internet works', duration: '18:00', free: false },
      { name: 'Your first HTML page', duration: '22:00', free: false },
      { name: 'Section quiz', duration: '5:00', free: false },
    ]},
    { title: 'HTML & CSS Fundamentals', lessons: 9, duration: '4h 10m', items: [
      { name: 'HTML structure & semantic elements', duration: '28:00', free: false },
      { name: 'CSS layouts: Flexbox & Grid', duration: '35:00', free: false },
      { name: 'Responsive design & mobile-first', duration: '32:00', free: false },
    ]},
    { title: 'JavaScript Deep Dive', lessons: 11, duration: '6h 30m', items: [
      { name: 'Variables, functions & scope', duration: '42:00', free: false },
      { name: 'Async JS: Promises & Fetch API', duration: '50:00', free: false },
      { name: 'DOM manipulation', duration: '38:00', free: false },
    ]},
    { title: 'React Fundamentals', lessons: 10, duration: '5h 45m', items: [
      { name: 'Components & props', duration: '35:00', free: false },
      { name: 'State & hooks', duration: '45:00', free: false },
      { name: 'Building a real React app', duration: '60:00', free: false },
    ]},
    { title: 'Backend with Node.js', lessons: 12, duration: '7h 20m', items: [
      { name: 'Node.js fundamentals', duration: '40:00', free: false },
      { name: 'Building REST APIs with Express', duration: '55:00', free: false },
      { name: 'Database integration', duration: '65:00', free: false },
    ]},
  ],
  reviews: [
    { name: 'Ama Kyei', initials: 'AK', location: 'Accra, Ghana', rating: 5, bg: '#E1F5EE', color: '#0F6E56', text: 'This course completely changed my life. I went from zero coding knowledge to landing a junior developer role in 6 months.', date: '3 weeks ago' },
    { name: 'Taiwo Okonkwo', initials: 'TO', location: 'Lagos, Nigeria', rating: 5, bg: '#EEEDFE', color: '#534AB7', text: 'Best investment I have made this year. The curriculum is very well structured and up to date.', date: '1 month ago' },
    { name: 'Fatou Diallo', initials: 'FD', location: 'Dakar, Senegal', rating: 4, bg: '#FAEEDA', color: '#854F0B', text: 'Very comprehensive course. I gave 4 stars only because some videos in section 7 could be updated.', date: '2 months ago' },
  ],
}

export default function CoursePage() {
  const [openSections, setOpenSections] = useState([0])
  const [activeTab, setActiveTab] = useState('reviews')
  const [enrolled, setEnrolled] = useState(false)

  const toggleSection = (i) => {
    setOpenSections(prev =>
      prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
    )
  }

  const [user, setUser] = useState(null)
const router = useRouter()

useEffect(() => {
  const getUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) setUser(session.user)
  }
  getUser()
}, [])

const handleEnroll = async () => {
  if (!user) {
    router.push('/login')
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
      course_slug: 'full-stack-web-development',
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

  return (
    <main style={{ background: '#F8F8F6', minHeight: '100vh' }}>

      {/* NAVBAR */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem 2rem', background: 'white',
        borderBottom: '0.5px solid #e5e5e5', position: 'sticky', top: 0, zIndex: 10
      }}>
        <Link href="/" style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 900, color: '#0F6E56', textDecoration: 'none' }}>
          Elim<span style={{ color: '#1D9E75' }}>u</span>
        </Link>
        <div style={{ fontSize: 12, color: '#888', display: 'flex', gap: 6 }}>
          <Link href="/" style={{ color: '#1D9E75' }}>Home</Link> ›
          <span style={{ color: '#1D9E75' }}>Technology</span> ›
          <span>Full-Stack Web Development</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/login" style={{ padding: '8px 18px', border: '1.5px solid #1D9E75', borderRadius: 8, color: '#0F6E56', fontSize: 14, fontWeight: 500 }}>Log in</Link>
          <Link href="/signup" style={{ padding: '8px 18px', background: '#0F6E56', borderRadius: 8, color: 'white', fontSize: 14, fontWeight: 500 }}>Sign up</Link>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background: 'linear-gradient(135deg, #085041 0%, #0F6E56 100%)', padding: '2.5rem 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'inline-block', background: 'rgba(29,158,117,0.3)', color: '#9FE1CB', fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 20, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.5px' }}>
              {course.category}
            </div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 900, color: 'white', lineHeight: 1.25, marginBottom: 10 }}>{course.title}</h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,.75)', lineHeight: 1.6, marginBottom: 16, maxWidth: 560 }}>{course.subtitle}</p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#EF9F27' }}>{course.rating}</span>
              <span style={{ color: '#EF9F27' }}>{'★'.repeat(Math.floor(course.rating))}{'☆'.repeat(5 - Math.floor(course.rating))}</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,.6)' }}>({course.reviews.toLocaleString()} ratings) · {course.students.toLocaleString()} students</span>
            </div>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
              {[
                `${course.hours} hours of video`,
                `${course.lessons} lessons`,
                'Certificate included',
                'Lifetime access',
              ].map(item => (
                <span key={item} style={{ fontSize: 13, color: 'rgba(255,255,255,.7)' }}>✓ {item}</span>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,.7)' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1D9E75', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#085041' }}>
                {course.instructor.initials}
              </div>
              Created by <span style={{ color: '#9FE1CB', fontWeight: 500 }}>{course.instructor.name}</span>
              &nbsp;·&nbsp; Last updated {course.updated}
              &nbsp;·&nbsp; {course.languages}
            </div>
          </div>

          {/* ENROLL CARD */}
          <div style={{ width: 260, flexShrink: 0, background: 'white', borderRadius: 14, overflow: 'hidden', border: '0.5px solid #e5e5e5' }}>
            <div style={{ height: 130, background: course.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52, position: 'relative' }}>
              {course.icon}
              <div style={{ position: 'absolute', top: 10, right: 10, background: '#0F6E56', color: 'white', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase' }}>Bestseller</div>
            </div>
            <div style={{ padding: '1.25rem' }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 30, fontWeight: 700, color: '#0F6E56', marginBottom: 4 }}>GH₵ {course.price}</div>
              <div style={{ fontSize: 13, color: '#888', textDecoration: 'line-through', marginBottom: 4 }}>GH₵ {course.oldPrice}</div>
              <div style={{ display: 'inline-block', background: '#FAECE7', color: '#993C1D', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4, marginBottom: 14 }}>
                {Math.round((1 - course.price / course.oldPrice) * 100)}% off
              </div>
              <button onClick={handleEnroll} style={{
                width: '100%', padding: 13, background: '#0F6E56', color: 'white',
                border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', marginBottom: 10
              }}>Enroll now</button>
              <button style={{
                width: '100%', padding: 11, background: 'transparent', color: '#0F6E56',
                border: '1.5px solid #1D9E75', borderRadius: 10, fontSize: 14,
                fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', marginBottom: 14
              }}>♡ Add to wishlist</button>
              <div style={{ fontSize: 12, color: '#888', textAlign: 'center', marginBottom: 14 }}>30-day money-back guarantee</div>
              <div style={{ borderTop: '0.5px solid #e5e5e5', paddingTop: 12 }}>
                {['Mobile & desktop access', 'Full lifetime access', 'Certificate of completion', 'Community access'].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#888', marginBottom: 8 }}>
                    <span style={{ color: '#1D9E75' }}>✓</span>{f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* WHAT YOU WILL LEARN */}
          <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 700, marginBottom: 14 }}>What you will learn</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {course.learns.map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 13, color: '#555', lineHeight: 1.4 }}>
                  <span style={{ color: '#1D9E75', flexShrink: 0, marginTop: 1 }}>✓</span>{item}
                </div>
              ))}
            </div>
          </div>

          {/* CURRICULUM */}
          <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Course curriculum</h2>
            <div style={{ fontSize: 13, color: '#888', marginBottom: 14 }}>{course.sections} sections · {course.lessons} lessons · {course.hours}h total</div>

            {course.curriculum.map((section, i) => (
              <div key={i} style={{ border: '0.5px solid #e5e5e5', borderRadius: 10, marginBottom: 10, overflow: 'hidden' }}>
                <div
                  onClick={() => toggleSection(i)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#F8F8F6', cursor: 'pointer' }}
                >
                  <div style={{ fontSize: 14, fontWeight: 500 }}>
                    {openSections.includes(i) ? '▼' : '▶'} &nbsp;Section {i + 1}: {section.title}
                  </div>
                  <div style={{ fontSize: 12, color: '#888' }}>{section.lessons} lessons · {section.duration}</div>
                </div>
                {openSections.includes(i) && (
                  <div style={{ padding: '0 14px' }}>
                    {section.items.map((item, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: j < section.items.length - 1 ? '0.5px solid #e5e5e5' : 'none', fontSize: 13 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13 }}>
                          {item.free ? '▶' : '🔒'}
                        </div>
                        <div style={{ flex: 1 }}>{item.name}</div>
                        {item.free && <span style={{ fontSize: 12, color: '#1D9E75', fontWeight: 500, cursor: 'pointer' }}>Preview</span>}
                        <div style={{ fontSize: 12, color: '#888' }}>{item.duration}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
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
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 52, fontWeight: 700, color: '#BA7517', lineHeight: 1 }}>4.9</div>
                    <div style={{ color: '#EF9F27', fontSize: 18 }}>★★★★★</div>
                    <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>Course rating</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    {[[85, '5'], [11, '4'], [3, '3'], [1, '2'], [0, '1']].map(([pct, stars]) => (
                      <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: '#888', width: 30, textAlign: 'right' }}>{stars} ★</span>
                        <div style={{ flex: 1, height: 6, background: '#eee', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: 6, background: '#EF9F27', borderRadius: 3, width: `${pct}%` }} />
                        </div>
                        <span style={{ fontSize: 12, color: '#888', width: 30 }}>{pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                {course.reviews.map((rev, i) => (
                  <div key={i} style={{ padding: '14px 0', borderBottom: i < course.reviews.length - 1 ? '0.5px solid #e5e5e5' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: rev.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: rev.color }}>
                        {rev.initials}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>{rev.name}</div>
                        <div style={{ fontSize: 11, color: '#888' }}>{rev.location}</div>
                      </div>
                      <div style={{ marginLeft: 'auto', color: '#EF9F27', fontSize: 12 }}>{'★'.repeat(rev.rating)}</div>
                    </div>
                    <div style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>{rev.text}</div>
                    <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>{rev.date}</div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'instructor' && (
              <div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 600, color: '#0F6E56', flexShrink: 0 }}>
                    {course.instructor.initials}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{course.instructor.name}</div>
                    <div style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>{course.instructor.title}</div>
                    <div style={{ display: 'flex', gap: 14 }}>
                      {[['⭐', '4.9 rating'], ['👥', `${course.instructor.students.toLocaleString()} students`], ['📚', `${course.instructor.courses} courses`]].map(([icon, label]) => (
                        <div key={label} style={{ fontSize: 12, color: '#888' }}>{icon} {label}</div>
                      ))}
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>{course.instructor.bio}</p>
              </div>
            )}
          </div>
        </div>

        {/* SIDEBAR */}
        <div style={{ width: 240, flexShrink: 0 }}>
          <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Requirements</div>
            {course.requirements.map(r => (
              <div key={r} style={{ display: 'flex', gap: 7, fontSize: 13, color: '#888', marginBottom: 8, lineHeight: 1.4 }}>
                <span style={{ flexShrink: 0 }}>•</span>{r}
              </div>
            ))}
          </div>

          <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>This course includes</div>
            {[
              [`${course.hours} hours on-demand video`, '🎬'],
              ['18 articles & reading materials', '📄'],
              ['32 downloadable resources', '⬇️'],
              ['Hands-on coding projects', '💻'],
              ['Mobile & desktop access', '📱'],
              ['Certificate of completion', '🏆'],
            ].map(([label, icon]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#888', marginBottom: 8 }}>
                <span>{icon}</span>{label}
              </div>
            ))}
          </div>

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