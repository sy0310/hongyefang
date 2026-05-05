import Link from 'next/link'
import { LeafIcon } from './LeafIcon'
import { logout } from '@/app/(auth)/login/actions'

interface NavHeaderProps {
  userEmail?: string
}

export function NavHeader({ userEmail }: NavHeaderProps) {
  return (
    <header className="bg-surface border-b border-border-light px-6 h-[52px] flex items-center justify-between flex-shrink-0">
      <Link href="/dashboard" className="flex items-center gap-2">
        <LeafIcon size={22} />
        <span
          className="font-bold text-accent text-base tracking-tight"
          style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.3px' }}
        >
          弘业坊
        </span>
      </Link>

      <div className="flex items-center gap-3">
        {userEmail && (
          <span className="text-[13px] text-text-3 hidden sm:block">{userEmail}</span>
        )}
        <form action={logout}>
          <button
            type="submit"
            className="border border-border rounded-[7px] px-3 py-[5px] text-[13px] text-text-2 cursor-pointer bg-surface hover:bg-surface-2 transition-colors"
          >
            退出
          </button>
        </form>
      </div>
    </header>
  )
}
