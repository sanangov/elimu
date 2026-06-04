import { DM_Sans } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({ subsets: ['latin'] })

export const metadata = {
  title: 'Elimu — Africa\'s Learning Platform',
  description: 'Thousands of courses taught by expert instructors. Start learning today and unlock your potential.',
  keywords: 'online learning, africa, courses, education, ghana',
  openGraph: {
    title: 'Elimu — Africa\'s Learning Platform',
    description: 'Learn anything. Grow every day.',
    url: 'https://elimu-gules.vercel.app',
    siteName: 'Elimu',
    locale: 'en_US',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={dmSans.className}>{children}</body>
    </html>
  )
}