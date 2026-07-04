import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import func2url from '../../backend/func2url.json'

const AUTH_URL = func2url.auth
const VIDEOS_URL = func2url.videos

export interface User {
  username: string
  subscribers: number
}

export interface Video {
  id: string
  author: string
  title: string
  description: string
  thumbnail: string
  videoUrl: string
  publishAt: string
  createdAt: string
  likes: number
  likedByMe: boolean
}

interface AppContextType {
  user: User | null
  videos: Video[]
  loadingVideos: boolean
  register: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
  addVideo: (v: {
    title: string
    description: string
    thumbnail: string
    videoUrl: string
    publishAt: string
  }) => Promise<{ ok: boolean; error?: string }>
  toggleLike: (id: string) => Promise<void>
  getVideo: (id: string) => Video | undefined
  refreshVideos: () => Promise<void>
}

const AppContext = createContext<AppContextType | null>(null)

const SESSION_KEY = 'pl_session'

function loadSession(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => loadSession())
  const [videos, setVideos] = useState<Video[]>([])
  const [loadingVideos, setLoadingVideos] = useState(true)

  useEffect(() => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  }, [user])

  const refreshVideos = useCallback(async () => {
    setLoadingVideos(true)
    try {
      const res = await fetch(VIDEOS_URL, {
        headers: user ? { 'X-Username': user.username } : {},
      })
      if (res.ok) {
        const data = await res.json()
        setVideos(data)
      }
    } catch {
      /* сеть недоступна */
    } finally {
      setLoadingVideos(false)
    }
  }, [user])

  useEffect(() => {
    refreshVideos()
  }, [refreshVideos])

  const register = async (username: string, password: string) => {
    try {
      const res = await fetch(AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', username, password }),
      })
      const data = await res.json()
      if (!res.ok) return { ok: false, error: data.error || 'Ошибка регистрации' }
      setUser({ username: data.username, subscribers: data.subscribers })
      return { ok: true }
    } catch {
      return { ok: false, error: 'Не удалось подключиться к серверу' }
    }
  }

  const login = async (username: string, password: string) => {
    try {
      const res = await fetch(AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', username, password }),
      })
      const data = await res.json()
      if (!res.ok) return { ok: false, error: data.error || 'Ошибка входа' }
      setUser({ username: data.username, subscribers: data.subscribers })
      return { ok: true }
    } catch {
      return { ok: false, error: 'Не удалось подключиться к серверу' }
    }
  }

  const logout = () => setUser(null)

  const addVideo: AppContextType['addVideo'] = async (v) => {
    if (!user) return { ok: false, error: 'Не авторизован' }
    try {
      const res = await fetch(VIDEOS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          author: user.username,
          title: v.title,
          description: v.description,
          thumbnail: v.thumbnail,
          videoUrl: v.videoUrl,
          publishAt: v.publishAt,
        }),
      })
      const data = await res.json()
      if (!res.ok) return { ok: false, error: data.error || 'Ошибка публикации' }
      await refreshVideos()
      return { ok: true }
    } catch {
      return { ok: false, error: 'Не удалось подключиться к серверу' }
    }
  }

  const toggleLike = async (id: string) => {
    if (!user) return
    setVideos((prev) =>
      prev.map((v) =>
        v.id === id
          ? { ...v, likedByMe: !v.likedByMe, likes: v.likedByMe ? v.likes - 1 : v.likes + 1 }
          : v
      )
    )
    try {
      await fetch(VIDEOS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'like', username: user.username, videoId: id }),
      })
    } catch {
      /* откат не критичен, обновим при следующей загрузке */
    }
  }

  const getVideo = (id: string) => videos.find((v) => v.id === id)

  return (
    <AppContext.Provider
      value={{
        user,
        videos,
        loadingVideos,
        register,
        login,
        logout,
        addVideo,
        toggleLike,
        getVideo,
        refreshVideos,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
