import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req) {
  const { email, firstName, courseTitle, coursePrice } = await req.json()

  try {
    await resend.emails.send({
      from: 'Elimu <onboarding@resend.dev>',
      to: email,
      subject: `You're enrolled in ${courseTitle}! 🎉`,
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: DM Sans, Arial, sans-serif; background: #F8F8F6; margin: 0; padding: 0;">
            <div style="max-width: 560px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; border: 0.5px solid #e5e5e5;">

              <!-- HEADER -->
              <div style="background: linear-gradient(135deg, #085041, #1D9E75); padding: 2.5rem; text-align: center;">
                <h1 style="font-family: Georgia, serif; font-size: 32px; font-weight: 900; color: white; margin: 0 0 8px;">Elimu</h1>
                <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 0;">Africa's Learning Platform</p>
              </div>

              <!-- BODY -->
              <div style="padding: 2rem;">
                <h2 style="font-family: Georgia, serif; font-size: 22px; font-weight: 700; margin-bottom: 12px; color: #2C2C2A;">
                  You're enrolled! 🎉
                </h2>
                <p style="font-size: 15px; color: #555; line-height: 1.7; margin-bottom: 20px;">
                  Hi ${firstName}, welcome to <strong>${courseTitle}</strong>. You now have full lifetime access to this course.
                </p>

                <!-- COURSE CARD -->
                <div style="background: #E1F5EE; border-radius: 12px; padding: 1.25rem; margin-bottom: 24px;">
                  <div style="font-size: 13px; color: #085041; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Enrolled course</div>
                  <div style="font-size: 16px; font-weight: 600; color: #085041; margin-bottom: 4px;">${courseTitle}</div>
                  <div style="font-size: 13px; color: #0F6E56;">Amount paid: GH₵ ${coursePrice}</div>
                </div>

                <!-- CTA -->
                <a href="https://elimu-gules.vercel.app/dashboard" style="display: block; text-align: center; padding: 14px; background: #0F6E56; color: white; border-radius: 10px; font-size: 15px; font-weight: 600; text-decoration: none; margin-bottom: 20px;">
                  Start learning now →
                </a>

                <p style="font-size: 13px; color: #888; line-height: 1.7;">
                  If you have any questions, just reply to this email. We're always happy to help!
                </p>
              </div>

              <!-- FOOTER -->
              <div style="background: #085041; padding: 1.25rem 2rem; text-align: center;">
                <p style="font-size: 12px; color: rgba(255,255,255,0.5); margin: 0;">
                  © 2026 Elimu. Africa's Learning Platform. 🌍
                </p>
              </div>

            </div>
          </body>
        </html>
      `,
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Email error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}