import { createRequire } from 'node:module'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '../..')

const require = createRequire(import.meta.url)

let loaded = false

export function loadEnv() {
  if (loaded) return
  loaded = true

  let dotenvConfig
  try {
    dotenvConfig = require('dotenv').config
  } catch {
    dotenvConfig = require('../node_modules/dotenv').config
  }

  dotenvConfig({ path: resolve(ROOT, '.env') })
  dotenvConfig({ path: resolve(ROOT, '.ENV') })
}

export function getRootDir() {
  return ROOT
}
