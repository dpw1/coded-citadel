import { config } from './back-end/node_modules/dotenv/lib/main.js'

config()

const token = process.env.YOUTUBE_ANALYTICS_ACCESS_TOKEN
if (!token) {
  console.error('Missing YOUTUBE_ANALYTICS_ACCESS_TOKEN in .env')
  process.exit(1)
}

const url =
  'https://youtubeanalytics.googleapis.com/v2/reports?' +
  new URLSearchParams({
    ids: 'channel==MINE',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    metrics: 'views,estimatedMinutesWatched,subscribersGained',
    access_token: token,
  })

const response = await fetch(url)
const data = await response.json()
console.log(JSON.stringify(data, null, 2))
