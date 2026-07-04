import { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Squares } from '@/components/landing/squares-background'
import { useApp } from '@/context/AppContext'
import Icon from '@/components/ui/icon'
import { Button } from '@/components/ui/button'

interface NavItem {
  to: string
  label: string
  icon: string
}

const navItems: NavItem[] = [
  { to: '/channel', label: 'Мой канал', icon: 'User' },
  { to: '/videos', label: 'Все видео', icon: 'Play' },
  { to: '/upload', label: 'Загрузить', icon: 'Upload' },
]

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useApp()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/auth')
  }

  return (
    <div className="relative min-h-screen text-white" style={{ background: '#060606' }}>
      <div className="fixed inset-0 z-0 opacity-60">
        <Squares direction="diagonal" speed={0.4} borderColor="#1f1f1f" hoverFillColor="#151515" />
      </div>

      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/videos" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-500 to-purple-700">
              <Icon name="Radio" size={20} className="text-white" />
            </div>
            <span className="text-lg font-black tracking-tight">
              PLAYERS <span className="text-fuchsia-500">LIVE</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const active = location.pathname === item.to
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    active ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Icon name={item.icon} size={16} />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-white/60 sm:block">@{user?.username}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-white/70 hover:bg-red-500/10 hover:text-red-400"
            >
              <Icon name="LogOut" size={16} />
              <span className="hidden sm:inline">Выйти</span>
            </Button>
          </div>
        </div>

        <nav className="flex items-center justify-around border-t border-white/10 px-2 py-2 md:hidden">
          {navItems.map((item) => {
            const active = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-0.5 text-xs ${
                  active ? 'text-fuchsia-400' : 'text-white/60'
                }`}
              >
                <Icon name={item.icon} size={18} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  )
}
