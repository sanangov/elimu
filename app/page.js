import Link from 'next/link'
//import styles from './page.module.css'

const categories = [
  { icon: '💻', name: 'Technology', count: '1,240' },
  { icon: '📈', name: 'Business', count: '860' },
  { icon: '🎨', name: 'Design', count: '540' },
  { icon: '📊', name: 'Finance', count: '430' },
  { icon: '🌿', name: 'Agriculture', count: '310' },
  { icon: '🎵', name: 'Arts & Music', count: '280' },
  { icon: '🏥', name: 'Health', count: '390' },
  { icon: '🗣️', name: 'Languages', count: '195' },
]

const courses = [
  { icon: '💻', bg: '#E1F5EE', tag: 'Technology', title: 'Full-Stack Web Development Bootcamp', instructor: 'Kwame Mensah', rating: '4.9', price: 'GH₵ 120' },
  { icon: '📈', bg: '#FAEEDA', tag: 'Business', title: 'Start & Grow Your Business in Africa', instructor: 'Amina Diallo', rating: '4.8', price: 'GH₵ 89' },
  { icon: '🎨', bg: '#FAECE7', tag: 'Design', title: 'UI/UX Design Masterclass', instructor: 'Fatima Osei', rating: '4.7', price: 'GH₵ 75' },
  { icon: '🌿', bg: '#EAF3DE', tag: 'Agriculture', title: 'Modern Farming Techniques for Africa', instructor: 'Dr. Olu Adeyemi', rating: '5.0', price: 'Free' },
  { icon: '📊', bg: '#E6F1FB', tag: 'Finance', title: 'Personal Finance & Investment 101', instructor: 'Nana Ama Boateng', rating: '4.9', price: 'GH₵ 55' },
  { icon: '🗣️', bg: '#EEEDFE', tag: 'Languages', title: 'Learn French from Scratch — A1 to B2', instructor: 'Marie Coulibaly', rating: '4.6', price: 'GH₵ 65' },
]

export default function Home() {
  return (
    <main>

      {/* NAVBAR */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem 2rem', background: 'white',
        borderBottom: '0.5px solid #e5e5e5', position: 'sticky', top: 0, zIndex: 10
      }}>
        <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 900, color: '#0F6E56' }}>
          Elim<span style={{ color: '#1D9E75' }}>u</span>
        </span>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {['Explore', 'Categories', 'Teach on Elimu', 'About'].map(l => (
            <Link key={l} href="#" style={{ fontSize: 14, color: '#888', fontWeight: 500 }}>{l}</Link>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/login" style={{
            padding: '8px 18px', border: '1.5px solid #1D9E75', borderRadius: 8,
            color: '#0F6E56', fontSize: 14, fontWeight: 500
          }}>Log in</Link>
          <Link href="/signup" style={{
            padding: '8px 18px', background: '#0F6E56', borderRadius: 8,
            color: 'white', fontSize: 14, fontWeight: 500
          }}>Sign up free</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        background: 'linear-gradient(135deg, #085041 0%, #1D9E75 60%, #5DCAA5 100%)',
        padding: '5rem 2rem 4rem', textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-block', background: 'rgba(255,255,255,0.15)',
          color: 'white', fontSize: 12, fontWeight: 600, padding: '6px 16px',
          borderRadius: 20, marginBottom: '1.5rem', letterSpacing: '0.5px', textTransform: 'uppercase'
        }}>🌍 Africa's Learning Platform</div>

        <h1 style={{
          fontFamily: 'Playfair Display, serif', fontSize: 52, fontWeight: 900,
          color: 'white', lineHeight: 1.1, marginBottom: '1.25rem',
          maxWidth: 600, marginLeft: 'auto', marginRight: 'auto'
        }}>Learn Anything. Grow Every Day.</h1>

        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.85)', maxWidth: 480, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
          Thousands of courses taught by expert instructors. Start learning today and unlock your potential.
        </p>

        <div style={{
          display: 'flex', maxWidth: 520, margin: '0 auto 2.5rem',
          background: 'white', borderRadius: 12, overflow: 'hidden',
          boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
        }}>
          <input placeholder="What do you want to learn today?" style={{
            flex: 1, border: 'none', padding: '14px 18px', fontSize: 14, outline: 'none'
          }} />
          <button style={{
            padding: '14px 22px', background: '#0F6E56', border: 'none',
            color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer'
          }}>Search</button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem' }}>
          {[['12K+', 'Courses'], ['85K+', 'Students'], ['2K+', 'Instructors'], ['4.8★', 'Avg Rating']].map(([num, label]) => (
            <div key={label} style={{ textAlign: 'center', color: 'white' }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700 }}>{num}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section style={{ padding: '3.5rem 2rem', background: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.75rem' }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 700 }}>Browse Categories</h2>
          <span style={{ fontSize: 13, color: '#1D9E75', fontWeight: 500, cursor: 'pointer' }}>View all →</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
          {categories.map(cat => (
            <div key={cat.name} style={{
              background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12,
              padding: '1.25rem 1rem', textAlign: 'center', cursor: 'pointer'
            }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{cat.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{cat.name}</div>
              <div style={{ fontSize: 11, color: '#888' }}>{cat.count} courses</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED COURSES */}
      <section style={{ padding: '3.5rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.75rem' }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 700 }}>Featured Courses</h2>
          <span style={{ fontSize: 13, color: '#1D9E75', fontWeight: 500, cursor: 'pointer' }}>See all →</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {courses.map(course => (
            <Link href="/course/full-stack-web-development" key={course.title} style={{
              background: 'white', border: '0.5px solid #e5e5e5',
              borderRadius: 12, overflow: 'hidden', display: 'block'
            }}>
              <div style={{ height: 120, background: course.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>
                {course.icon}
              </div>
              <div style={{ padding: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#0F6E56', marginBottom: 6 }}>{course.tag}</div>
                <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4, marginBottom: 8 }}>{course.title}</div>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>by {course.instructor}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#BA7517' }}>★ {course.rating}</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#0F6E56' }}>{course.price}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* INSTRUCTOR BANNER */}
      <section style={{ padding: '0 2rem 3rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, #085041, #0F6E56)',
          borderRadius: 16, padding: '2.5rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, color: 'white', marginBottom: 8 }}>
              Share your knowledge. Earn income.
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', maxWidth: 340, lineHeight: 1.6 }}>
              Join thousands of instructors on Elimu. Create a course, reach students across Africa, and earn every time someone enrolls.
            </p>
          </div>
          <Link href="/signup" style={{
            padding: '12px 24px', background: 'white', borderRadius: 10,
            color: '#0F6E56', fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap'
          }}>Become an Instructor →</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#085041', color: 'white', padding: '2.5rem 2rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 900, marginBottom: 10 }}>Elimu</div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, maxWidth: 220 }}>
              Africa's premier online learning platform. Knowledge for everyone, everywhere.
            </p>
          </div>
          {[
            ['Learn', ['All Courses', 'Free Courses', 'Certificates', 'Learning Paths']],
            ['Teach', ['Become Instructor', 'How it Works', 'Instructor FAQ', 'Payouts']],
            ['Company', ['About Us', 'Blog', 'Careers', 'Contact']],
          ].map(([title, links]) => (
            <div key={title}>
              <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</h4>
              {links.map(l => (
                <Link key={l} href="#" style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 7 }}>{l}</Link>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.15)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between' }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>© 2026 Elimu. All rights reserved.</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Privacy Policy · Terms of Service</p>
        </div>
      </footer>

    </main>
  )
}