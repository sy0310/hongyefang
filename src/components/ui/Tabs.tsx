'use client'

interface TabsProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
}

export function Tabs({ value, onValueChange, children }: TabsProps) {
  return <div className="w-full">{children}</div>
}

interface TabsListProps { children: React.ReactNode }
export function TabsList({ children }: TabsListProps) {
  return <div className="flex border-b border-border/50">{children}</div>
}

interface TabsTriggerProps {
  value: string
  activeValue: string
  onClick: () => void
  children: React.ReactNode
}
export function TabsTrigger({ value, activeValue, onClick, children }: TabsTriggerProps) {
  const isActive = value === activeValue
  return (
    <button
      className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all duration-200
        ${isActive ? 'border-accent text-accent' : 'border-transparent text-text/40 hover:text-text/60'}`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  )
}

interface TabsContentProps {
  value: string
  activeValue: string
  children: React.ReactNode
}
export function TabsContent({ value, activeValue, children }: TabsContentProps) {
  if (value !== activeValue) return null
  return <div>{children}</div>
}
