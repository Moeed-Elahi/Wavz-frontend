import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/providers/Providers'
import { Navbar } from '@/components/layout/Navbar'
import { Toaster } from 'react-hot-toast'
import localFont from 'next/font/local'

// 🔥 Custom Font
const myFont = localFont({
  src: [
    {
      path: '../fonts/CraftRounded-DemiBold.ttf',
     weight: '500',
      style: 'normal',
    },
  ],
  variable: '--font-primary',
})

export const metadata: Metadata = {
  title: 'Token Launchpad | Create & Trade Meme Tokens on Solana',
  description:
    'Launch your own token with a fair bonding curve. No presale, no team allocation. Just fair and fun.',
  keywords: ['solana', 'token', 'launchpad', 'meme', 'bonding curve', 'defi'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={myFont.variable}>
      <body className={myFont.className}>
        <Providers>
          <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
          </div>

          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#1a1a1a',
                color: '#fff',
                border: '1px solid #333',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}