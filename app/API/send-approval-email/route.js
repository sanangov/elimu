import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req) {
  const { email, firstName, approved } = await req.json()

  try {
    await resend.emails.send({
      from: 'Elimu <onboarding@resend.dev>',
      to: email,
      subject: approved
        ? '🎉 Your Elimu instructor application has been approved!'
        : 'Update on your Elimu instructor application',
      html: approved ? `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif; background: #F8F8F6; margin: 0; padding: 0;">
            <div style="max-width: 560px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; border: 0.5px solid #e5e5e5;">
              <div style="background: linear-gradient(135deg, #085041, #1D9E75); padding: 2.5rem; text-align: center;">
                <h1 style="font-family: Georgia, serif; font-size: 32px; font-weight: 900; color: white; margin: 0 0 8px;">Elimu</h1>
                <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 0;">Africa's Learning Platform</p>
              </div>
              <div style="padding: 2rem;">
                <h2 style="font-family: Georgia, serif; font-size: 22px; font-weight: 700; margin-bottom: 12px; color: #2C2C2A;">
                  Congratulations ${firstName}! 🎉
                </h2>
                <p style="font-size: 15px; color: #555; line-height: 1.7; margin-bottom: 20px;">
                  Your instructor application has been <strong>approved!</strong> You can now log in and start creating courses on Elimu.
                </p>
                <div style="background: #E1F5EE; border-radius: 12px; padding: 1.25rem; margin-bottom: 24px;">
                  <div style="font-size: 13px; color: #085041; font-weight: 600; margin-bottom: 8px;">What you can do now:</div>
                  <div style="font-size: 13px; color: #0F6E56; margin-bottom: 4px;">✓ Create and publish courses</div>
                  <div style="font-size: 13px; color: #0F6E56; margin-bottom: 4px;">✓ Upload lecture notes and study materials</div>
                  <div style="font-size: 13px; color: #0F6E56; margin-bottom: 4px;">✓ Set assignments for students</div>
                  <div style="font-size: 13px; color: #0F6E56;">✓ Earn income from every enrollment</div>
                </div>
                <a href="https://elimu-gules.vercel.app/instructor" style="display: block; text-align: center; padding: 14px; background: #0F6E56; color: white; border-radius: 10px; font-size: 15px; font-weight: 600; text-decoration: none; margin-bottom: 20px;">
                  Go to instructor dashboard →
                </a>
                <p style="font-size: 13px; color: #888; line-height: 1.7;">
                  Welcome to the Elimu family! If you have any questions, just reply to this email.
                </p>
              </div>
              <div style="background: #085041; padding: 1.25rem 2rem; text-align: center;">
                <p style="font-size: 12px; color: rgba(255,255,255,0.5); margin: 0;">© 2026 Elimu. Africa's Learning Platform. 🌍</p>
              </div>
            </div>
          </body>
        </html>
      ` : `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif; background: #F8F8F6; margin: 0; padding: 0;">
            <div style="max-width: 560px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; border: 0.5px solid #e5e5e5;">
              <div style="background: linear-gradient(135deg, #085041, #1D9E75); padding: 2.5rem; text-align: center;">
                <h1 style="font-family: Georgia, serif; font-size: 32px; font-weight: 900; color: white; margin: 0 0 8px;">Elimu</h1>
              </div>
              <div style="padding: 2rem;">
                <h2 style="font-family: Georgia, serif; font-size: 22px; font-weight: 700; margin-bottom: 12px;">
                  Hi ${firstName},
                </h2>
                <p style="font-size: 15px; color: #555; line-height: 1.7; margin-bottom: 20px;">
                  Thank you for applying to teach on Elimu. After reviewing your application, we are unable to approve it at this time.
                </p>
                <p style="font-size: 14px; color: #555; line-height: 1.7; margin-bottom: 20px;">
                  You are welcome to reapply with updated qualifications or additional information about your teaching experience.
                </p>
                <a href="https://elimu-gules.vercel.app/instructor/apply" style="display: block; text-align: center; padding: 14px; background: #0F6E56; color: white; border-radius: 10px; font-size: 15px; font-weight: 600; text-decoration: none;">
                  Reapply →
                </a>
              </div>
              <div style="background: #085041; padding: 1.25rem 2rem; text-align: center;">
                <p style="font-size: 12px; color: rgba(255,255,255,0.5); margin: 0;">© 2026 Elimu. Africa's Learning Platform. 🌍</p>
              </div>
            </div>
          </body>
        </html>
      `
    })
    return Response.json({ success: true })
  } catch (error) {
    console.error('Email error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}