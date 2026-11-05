import { getBlogPostForApp } from '../../utils/blog'
import {
  appBuildYoutubeUrl,
  appHeroPreviewUrl,
  appIconUrl,
  youtubeEmbedId,
} from '../../utils/apps'

export function resolveYoutubeVideoId(app) {
  if (!app) return null
  const blogPost = getBlogPostForApp(app)
  const episodeYoutubeUrl = blogPost?.youtubeId
    ? `https://www.youtube.com/watch?v=${blogPost.youtubeId}`
    : null
  const youtubeUrl = episodeYoutubeUrl || appBuildYoutubeUrl(app)
  return youtubeUrl ? youtubeEmbedId(youtubeUrl) : null
}

export function cardThumbUrl(app, videoId) {
  const preview = appHeroPreviewUrl(app)
  if (preview) return preview
  if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
  const icon = appIconUrl(app)
  if (icon) return icon
  return null
}
