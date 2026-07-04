import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import Icon from '@/components/ui/icon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'
import func2url from '../../backend/func2url.json'

const UPLOAD_URL = func2url.upload

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function uploadToStorage(file: File, folder: 'videos' | 'thumbnails'): Promise<string> {
  const res = await fetch(UPLOAD_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder, contentType: file.type || 'application/octet-stream' }),
  })
  if (!res.ok) throw new Error('Не удалось получить ссылку для загрузки')
  const { uploadUrl, publicUrl } = await res.json()

  const putRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
  })
  if (!putRes.ok) throw new Error('Не удалось загрузить файл в хранилище')

  return publicUrl
}

const MAX_VIDEO_SIZE = 500 * 1024 * 1024

const Upload = () => {
  const { addVideo } = useApp()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [publishAt, setPublishAt] = useState('')
  const [thumbnailPreview, setThumbnailPreview] = useState('')
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [stage, setStage] = useState('')

  const handleThumb = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setThumbnailFile(file)
    setThumbnailPreview(await fileToDataUrl(file))
  }

  const handleVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_VIDEO_SIZE) {
      toast({ title: 'Файл слишком большой', description: 'Максимальный размер видео — 500 МБ', variant: 'destructive' })
      return
    }
    setVideoFile(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast({ title: 'Укажите название видео', variant: 'destructive' })
      return
    }
    if (!videoFile) {
      toast({ title: 'Загрузите файл видео', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      setStage('Загружаем видео в хранилище...')
      const videoUrl = await uploadToStorage(videoFile, 'videos')

      let thumbnailUrl = ''
      if (thumbnailFile) {
        setStage('Загружаем миниатюру...')
        thumbnailUrl = await uploadToStorage(thumbnailFile, 'thumbnails')
      }

      setStage('Публикуем видео...')
      const res = await addVideo({
        title: title.trim(),
        description: description.trim(),
        thumbnail: thumbnailUrl,
        videoUrl,
        publishAt: publishAt ? new Date(publishAt).toISOString() : new Date().toISOString(),
      })

      if (!res.ok) {
        toast({ title: 'Не удалось опубликовать видео', description: res.error, variant: 'destructive' })
        return
      }
      toast({ title: 'Видео опубликовано!', description: 'Оно появилось на канале и во «Всех видео».' })
      navigate('/videos')
    } catch (err) {
      toast({
        title: 'Ошибка загрузки',
        description: err instanceof Error ? err.message : 'Попробуйте ещё раз',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
      setStage('')
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-black">Загрузить видео</h1>
        <p className="text-white/50">Заполните данные и опубликуйте ролик</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-white/70">Миниатюра</Label>
            <label className="flex aspect-video cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-white/15 bg-white/5 hover:border-fuchsia-500/50">
              {thumbnailPreview ? (
                <img src={thumbnailPreview} alt="preview" className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-white/40">
                  <Icon name="ImagePlus" size={26} />
                  <span className="text-xs">Выбрать изображение</span>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleThumb} className="hidden" disabled={loading} />
            </label>
          </div>

          <div className="space-y-2">
            <Label className="text-white/70">Файл видео</Label>
            <label className="flex aspect-video cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-white/15 bg-white/5 px-2 text-center hover:border-fuchsia-500/50">
              <Icon name={videoFile ? 'CircleCheck' : 'FileVideo'} size={26} className={videoFile ? 'text-green-400' : 'text-white/40'} />
              <span className="line-clamp-2 text-xs text-white/40">
                {videoFile?.name || 'Выбрать видеофайл'}
              </span>
              <input type="file" accept="video/*" onChange={handleVideo} className="hidden" disabled={loading} />
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title" className="text-white/70">Название</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Название ролика"
            className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="desc" className="text-white/70">Описание</Label>
          <Textarea
            id="desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="О чём это видео?"
            rows={4}
            className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="publish" className="text-white/70">Когда опубликовать</Label>
          <Input
            id="publish"
            type="datetime-local"
            value={publishAt}
            onChange={(e) => setPublishAt(e.target.value)}
            className="border-white/10 bg-white/5 text-white [color-scheme:dark]"
            disabled={loading}
          />
          <p className="text-xs text-white/40">Оставьте пустым, чтобы опубликовать сразу</p>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-fuchsia-500 to-purple-600 font-semibold hover:from-fuchsia-600 hover:to-purple-700"
        >
          <Icon name={loading ? 'Loader' : 'Upload'} size={16} className={loading ? 'animate-spin' : ''} />
          {loading ? stage || 'Публикуем...' : 'Опубликовать'}
        </Button>
      </form>
    </div>
  )
}

export default Upload
