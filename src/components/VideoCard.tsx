import { Link } from 'react-router-dom'
import { Video } from '@/context/AppContext'
import Icon from '@/components/ui/icon'

export default function VideoCard({ video }: { video: Video }) {
  const scheduled = new Date(video.publishAt).getTime() > Date.now()

  return (
    <Link
      to={`/video/${video.id}`}
      className="group overflow-hidden rounded-xl border border-white/10 bg-white/5 transition hover:border-fuchsia-500/40 hover:bg-white/[0.07]"
    >
      <div className="relative aspect-video overflow-hidden bg-black">
        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-white/20">
            <Icon name="Image" size={40} />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-fuchsia-500">
            <Icon name="Play" size={22} className="ml-0.5 text-white" />
          </div>
        </div>
        {scheduled && (
          <span className="absolute left-2 top-2 rounded-md bg-amber-500/90 px-2 py-0.5 text-xs font-semibold text-black">
            Запланировано
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-1 font-semibold text-white">{video.title}</h3>
        <div className="mt-1 flex items-center justify-between text-xs text-white/50">
          <span>@{video.author}</span>
          <span className="flex items-center gap-1">
            <Icon name="Heart" size={13} /> {video.likes}
          </span>
        </div>
      </div>
    </Link>
  )
}
