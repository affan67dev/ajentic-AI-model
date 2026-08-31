import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Zexio AI — Your AI, unified',
  description: 'A premium AI workspace for better thinking.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className="bg-background"><body>{children}</body></html>
}
