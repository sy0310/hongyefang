import type { Metadata } from 'next'
import { DM_Sans, Noto_Sans_SC } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({
  variable: '--font-display',
  subsets: ['latin'],
})

const notoSansSC = Noto_Sans_SC({
  variable: '--font-body',
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
      <body className={`${dmSans.variable} ${notoSansSC.variable} bg-gray-900 flex justify-center min-h-screen`}>
        <div className="w-full max-w-[430px] bg-bg min-h-screen shadow-2xl relative overflow-x-hidden flex flex-col">
          {children}
        </div>
      </body>
    </html>
  )
}
