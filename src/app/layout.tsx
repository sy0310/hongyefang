import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: '弘业坊 -- AI 精准筛选优质创业项目',
  description: 'AI 精准筛选优质创业用户，降低无效沟通成本，让有价值的创业咨询高效匹配。',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={`${geistSans.variable} antialiased bg-gray-900 flex justify-center min-h-screen`}>
        <div className="w-full max-w-[430px] bg-background min-h-screen shadow-2xl relative overflow-x-hidden flex flex-col">
          {children}
        </div>
      </body>
    </html>
  )
}
