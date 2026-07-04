import { Link } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import Icon from '@/components/ui/icon'
import { Button } from '@/components/ui/button'
import VideoCard from '@/components/VideoCard'

const Videos = () => {
  const { videos } = useApp()
  const now = Date.now()
  const published = videos
    .filter((v) => new Date(v.publishAt).getTime() <= now)
    .sort((a, b) => b.createdAt - a.createdAt)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Все видео</h1>
          <p className="text-white/50">Свежие публикации PLAYERS LIVE</p>
        </div>
        <Link to="/upload">
          <Button className="bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700">
            <Icon name="Upload" size={16} />
            <span className="hidden sm:inline">Загрузить</span>
          </Button>
        </Link>
      </div>

      {published.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-white/10 py-20 text-center text-white/40">
          <Icon name="Film" size={48} />
          <p className="text-lg font-medium text-white/60">Пока нет видео</p>
          <p className="max-w-sm text-sm">
            Здесь появятся ролики, как только их опубликуют. Будьте первым — загрузите своё видео!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {published.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Videos
