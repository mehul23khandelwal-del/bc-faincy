import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Faincy Silver · Est. 1939',
  description: 'Pure 92.5 handcrafted silver articles from Jaipur since 1939. Silver idols, dibbis, bottles, frames and gifting items.',
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon-32.png',
  },
  openGraph: {
    title: 'Faincy Silver · Est. 1939',
    description: 'Pure 92.5 handcrafted silver articles from Jaipur since 1939.',
    url: 'https://bc.faincy.co.in',
    siteName: 'Faincy Silver',
    locale: 'en_IN',
    type: 'website',
    images: [{ url: '/logo.jpg', width: 512, height: 512 }],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  )
}
