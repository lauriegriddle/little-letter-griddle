import './globals.css'
import { Analytics } from "@vercel/analytics/react"

export const metadata = {
  title: 'Little Letter Griddle - A Moonlit Word Puzzle 🌙',
  description: 'Unwind with Little Letter Griddle, a peaceful nighttime word puzzle. Unscramble 3 words at your own pace. New puzzle daily at 7:30 PM EST.',
  keywords: 'word puzzle, word game, relaxing game, calming puzzle, letter griddle, anagram, brain game',
  openGraph: {
    title: 'Little Letter Griddle 🌙',
    description: 'A moonlit word puzzle to wind down your evening',
    url: 'https://www.littlelettergriddle.com',
    siteName: 'Little Letter Griddle',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Little Letter Griddle 🌙',
    description: 'A moonlit word puzzle to wind down your evening',
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}<Analytics /></body>
    </html>
  )
}
