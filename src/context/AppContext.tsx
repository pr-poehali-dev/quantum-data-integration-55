import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export interface User {
  username: string
  password: string
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
  createdAt: number
  likes: number
  likedBy: string[]
}

interface AppContextType {
  user: User | null
  videos: Video[]
  register: (username: string, password: string) => { ok: boolean; error?: string }
  login: (username: string, password: string) => { ok: boolean; error?: string }
  logout: () => void
  addVideo: (v: Omit<Video, 'id' | 'author' | 'createdAt' | 'likes' | 'likedBy'>) => void
  toggleLike: (id: string) => void
  getVideo: (id: string) => Video | undefined
}

const AppContext = createContext<AppContextType | null>(null)

const USERS_KEY = 'pl_users'
const VIDEOS_KEY = 'pl_videos'
const SESSION_KEY = 'pl_session'

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => load<User[]>(USERS_KEY, []))
  const [videos, setVideos] = useState<Video[]>(() => load<Video[]>(VIDEOS_KEY, []))
  const [user, setUser] = useState<User | null>(() => load<User | null>(SESSION_KEY, null))

  useEffect(() => localStorage.setItem(USERS_KEY, JSON.stringify(users)), [users])
  useEffect(() => localStorage.setItem(VIDEOS_KEY, JSON.stringify(videos)), [videos])
  useEffect(() => localStorage.setItem(SESSION_KEY, JSON.stringify(user)), [user])

  const register = (username: string, password: string) => {
    const name = username.trim()
    if (!name || !password) return { ok: false, error: 'Заполните все поля' }
    if (users.some((u) => u.username.toLowerCase() === name.toLowerCase()))
      return { ok: false, error: 'Такой пользователь уже существует' }
    const newUser: User = { username: name, password, subscribers: 0 }
    setUsers((prev) => [...prev, newUser])
    setUser(newUser)
    return { ok: true }
  }

  const login = (username: string, password: string) => {
    const found = users.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
    )
    if (!found) return { ok: false, error: 'Неверный логин или пароль' }
    setUser(found)
    return { ok: true }
  }

  const logout = () => setUser(null)

  const addVideo: AppContextType['addVideo'] = (v) => {
    if (!user) return
    const video: Video = {
      ...v,
      id: crypto.randomUUID(),
      author: user.username,
      createdAt: Date.now(),
      likes: 0,
      likedBy: [],
    }
    setVideos((prev) => [video, ...prev])
  }

  const toggleLike = (id: string) => {
    if (!user) return
    setVideos((prev) =>
      prev.map((v) => {
        if (v.id !== id) return v
        const liked = v.likedBy.includes(user.username)
        return {
          ...v,
          likedBy: liked
            ? v.likedBy.filter((n) => n !== user.username)
            : [...v.likedBy, user.username],
          likes: liked ? v.likes - 1 : v.likes + 1,
        }
      })
    )
  }

  const getVideo = (id: string) => videos.find((v) => v.id === id)

  return (
    <AppContext.Provider
      value={{ user, videos, register, login, logout, addVideo, toggleLike, getVideo }}
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
