'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ReviewForm({ courseSlug, courseId, userId, firstName, onReviewSubmitted }) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) { setError('Please select a rating.'); return }
    if (!comment.trim()) { setError('Please write a review.'); return }
    setError('')
    setLoading(true)

    const { error } = await supabase.from('reviews').insert({
      user_id: userId,
      course_slug: courseSlug,
      course_id: courseId,
      rating,
      comment,
      reviewer_name: firstName,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
      if (onReviewSubmitted) onReviewSubmitted({ rating, comment, reviewer_name: firstName, created_at: new Date() })
    }
  }

  if (success) return (
    <div style={{ background: '#E1F5EE', border: '0.5px solid #9FE1CB', borderRadius: 10, padding: '1.25rem', textAlign: 'center' }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>⭐</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#085041', marginBottom: 4 }}>Thank you for your review!</div>
      <div style={{ fontSize: 13, color: '#0F6E56' }}>Your feedback helps other students make better decisions.</div>
    </div>
  )

  return (
    <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '1.25rem' }}>
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Leave a review</div>

      {error && (
        <div style={{ background: '#FCEBEB', border: '0.5px solid #F09595', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#A32D2D', marginBottom: '1rem' }}>{error}</div>
      )}

      {/* STAR RATING */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Your rating</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[1, 2, 3, 4, 5].map(star => (
            <span
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              style={{ fontSize: 28, cursor: 'pointer', color: star <= (hover || rating) ? '#EF9F27' : '#e5e5e5', transition: 'color .15s' }}
            >★</span>
          ))}
        </div>
        {rating > 0 && (
          <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
            {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
          </div>
        )}
      </div>

      {/* COMMENT */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Your review</div>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Share your experience with this course. What did you learn? Would you recommend it?"
          rows={4}
          style={{ width: '100%', padding: '11px 14px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif', resize: 'vertical' }}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{ width: '100%', padding: 12, background: loading ? '#9FE1CB' : '#0F6E56', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
        {loading ? 'Submitting...' : 'Submit review'}
      </button>
    </div>
  )
}