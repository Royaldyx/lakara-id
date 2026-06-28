import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { resolve, join } from 'path'
import { createHash } from 'crypto'

// Data directory: lakara-daily/data/ (one level up from the Nuxt project)
export const getDataDir = () => {
  const config = useRuntimeConfig()
  return (config.dataDir as string) || resolve(process.cwd(), '..', 'data')
}

export function readJson<T = any>(filename: string): T[] {
  const file = join(getDataDir(), filename)
  if (!existsSync(file)) return [] as T[]
  try {
    const content = readFileSync(file, 'utf-8')
    const parsed = JSON.parse(content)
    return Array.isArray(parsed) ? parsed : (typeof parsed === 'object' ? parsed : []) as T[]
  } catch { return [] as T[] }
}

export function readJsonObj<T = any>(filename: string): T {
  const file = join(getDataDir(), filename)
  if (!existsSync(file)) return {} as T
  try { return JSON.parse(readFileSync(file, 'utf-8')) as T } catch { return {} as T }
}

export function writeJson(filename: string, data: any): boolean {
  const dir = getDataDir()
  try {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    const file = join(dir, filename)
    writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8')
    return true
  } catch { return false }
}

const makeSessionToken = (pass: string) =>
  createHash('sha256').update(pass + 'lakara_session_v1').digest('hex').slice(0, 32)

export function checkAuth(event: any): boolean {
  const config       = useRuntimeConfig()
  const token        = getHeader(event, 'x-admin-token') || ''
  const validToken   = makeSessionToken(config.adminPass as string)
  // Support token baru (hash) maupun legacy (password langsung) selama transisi
  return token === validToken || token === (config.adminPass as string)
}

export function slugify(str: string): string {
  return str.toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}
