import { useParams, useNavigate, Link } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import Icon from '@/components/ui/icon'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'

const VideoView = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getVideo, toggleLike, user } = useApp()
  const video = id ? getVideo(id) : undefined

  if (!video) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center text-white/50">
        <Icon name="VideoOff" size={48} />
        <p>Видео не найдено</p>
        <Link to="/videos">
          <Button variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10">
            К списку видео
          </Button>
        </Link>
      </div>
    )
  }

  const liked = user ? video.likedBy.includes(user.username) : false

  const handleShare = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: video.title, url })
      } else {
        await navigator.clipboard.writeText(url)
        toast({ title: 'Ссылка скопирована!' })
      }
    } catch {
      /* пользователь отменил */
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-white/60 hover:text-white"
      >
        <Icon name="ArrowLeft" size={16} /> Назад
      </button>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-black">
        <video
          src={video.videoUrl}
          poster={video.thumbnail || undefined}
          controls
          className="aspect-video w-full bg-black"
        />
      </div>

      <div className="space-y-4">
        <h1 className="text-xl font-black">{video.title}</h1>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-700 text-sm font-bold">
              {video.author.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium">@{video.author}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleLike(video.id)}
              className={`border-white/15 bg-white/5 hover:bg-white/10 ${
                liked ? 'text-fuchsia-400' : 'text-white'
              }`}
            >
              <Icon name="Heart" size={16} className={liked ? 'fill-fuchsia-400' : ''} />
              {video.likes}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="border-white/15 bg-white/5 text-white hover:bg-white/10"
            >
              <Icon name="Share2" size={16} />
              Поделиться
            </Button>
          </div>
        </div>

        {video.description && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70 whitespace-pre-wrap">
            {video.description}
          </div>
        )}
      </div>
    </div>
  )
}

export default VideoView
