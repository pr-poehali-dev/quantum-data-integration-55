import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Squares } from '@/components/landing/squares-background'
import { useApp } from '@/context/AppContext'
import Icon from '@/components/ui/icon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const Auth = () => {
  const { user, login, register } = useApp()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/channel" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = mode === 'login' ? await login(username, password) : await register(username, password)
    setLoading(false)
    if (!res.ok) {
      setError(res.error || 'Ошибка')
      return
    }
    navigate('/channel')
  }

  return (
    <div
      className="relative flex min-h-screen items-center justify-center px-4 text-white"
      style={{ background: '#060606' }}
    >
      <div className="fixed inset-0 z-0 opacity-70">
        <Squares direction="diagonal" speed={0.5} borderColor="#1f1f1f" hoverFillColor="#151515" />
      </div>

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-black/60 p-8 backdrop-blur-xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-purple-700">
            <Icon name="Radio" size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">
            PLAYERS <span className="text-fuchsia-500">LIVE</span>
          </h1>
          <p className="mt-1 text-sm text-white/50">
            {mode === 'login' ? 'Войдите в свой аккаунт' : 'Создайте новый аккаунт'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-white/70">
              Имя пользователя
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ваш никнейм"
              className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white/70">
              Пароль
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
              <Icon name="TriangleAlert" size={16} />
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-fuchsia-500 to-purple-600 font-semibold hover:from-fuchsia-600 hover:to-purple-700"
          >
            {loading ? 'Подождите...' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-white/50">
          {mode === 'login' ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}{' '}
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login')
              setError('')
            }}
            className="font-semibold text-fuchsia-400 hover:text-fuchsia-300"
          >
            {mode === 'login' ? 'Регистрация' : 'Вход'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Auth