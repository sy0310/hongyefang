'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ClipboardList, Package, User } from 'lucide-react'

const navItems = [
  { label: '首页', href: '/dashboard', icon: Home },
  { label: '创业体检', href: '/assessment', icon: ClipboardList },
  { label: '咨询方案', href: '/consult', icon: Package },
  { label: '我的', href: '/profile', icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-border flex justify-around items-center h-16 px-4 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      {navItems.map(({ label, href, icon: Icon }) => {
        const isActive = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              isActive ? 'text-primary' : 'text-muted hover:text-foreground'
            }`}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
