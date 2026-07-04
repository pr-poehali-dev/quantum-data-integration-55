import { Link } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import Icon from '@/components/ui/icon'
import { Button } from '@/components/ui/button'
import VideoCard from '@/components/VideoCard'

const Channel = () => {
  const { user, videos } = useApp()
  const myVideos = videos.filter((v) => v.author === user?.username)
  const totalLikes = myVideos.reduce((sum, v) => sum + v.likes, 0)

  const stats = [
    { label: 'Подписчики', value: user?.subscribers ?? 0, icon: 'Users' },
    { label: 'Лайки', value: totalLikes, icon: 'Heart' },
    { label: 'Видео', value: myVideos.length, icon: 'Play' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-black/40 p-8 text-center backdrop-blur-sm sm:flex-row sm:text-left">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-700 text-2xl font-black">
          {user?.username.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-black">@{user?.username}</h1>
          <p className="text-white/50">Ваш канал на PLAYERS LIVE</p>
        </div>
        <Link to="/upload">
          <Button className="bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700">
            <Icon name="Upload" size={16} />
            Загрузить видео
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-5 text-center"
          >
            <Icon name={s.icon} size={24} className="text-fuchsia-400" />
            <div className="text-2xl font-black">{s.value}</div>
            <div className="text-xs text-white/50">{s.label}</div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-4 text-lg font-bold">Мои видео</h2>
        {myVideos.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-white/10 py-16 text-center text-white/40">
            <Icon name="VideoOff" size={40} />
            <p>Вы ещё не загрузили ни одного видео</p>
            <Link to="/upload">
              <Button variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10">
                Загрузить первое видео
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myVideos.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Channel
