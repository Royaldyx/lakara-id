import { randomUUID } from 'crypto'
import { getMemberStore } from '~/server/utils/member'
import { execute } from '~/server/utils/db'
import { deleteOrphanUploads } from '~/server/utils/uploads'

const VALID_TEMPLATES = [
  'none', 'gaming', 'minimal', 'gradient', 'pastel', 'neon', 'business',
  'sunset', 'ocean', 'midnight', 'vaporwave', 'forest', 'elegant', 'candy',
]
const VALID_BG_TYPES = ['solid', 'gradient', 'image', 'video']
const VALID_FONTS = [
  'default', 'inter', 'poppins', 'montserrat', 'raleway', 'nunito', 'quicksand',
  'dmsans', 'spacegrotesk', 'josefin', 'ubuntu', 'lato', 'roboto', 'exo2',
  'oswald', 'righteous', 'bebasneue', 'fredoka', 'playfair', 'merriweather',
  'cinzel', 'dancingscript', 'lobster', 'pacifico', 'caveat',
]
const VALID_SOCIAL = ['instagram', 'tiktok', 'youtube', 'twitter', 'facebook', 'twitch', 'discord', 'telegram', 'whatsapp', 'threads', 'linkedin', 'snapchat', 'pinterest', 'spotify', 'soundcloud', 'email', 'website', 'github']

const isHex = (v: any) => /^#[0-9a-fA-F]{3,6}$/.test(v)

function sanitizeSocials(raw: any): { type: string; url: string }[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((s: any) => s && VALID_SOCIAL.includes(s.type) && (s.url || '').toString().trim())
    .slice(0, 12)
    .map((s: any) => ({ type: s.type, url: s.url.toString().trim().slice(0, 300) }))
}

/** per-link card image (free=stock, pro=+static upload, premium=+gif/external) */
function sanitizeImage(raw: any, tier: string): string {
  const v = (raw || '').toString().trim().slice(0, 500)
  if (!v) return ''
  const isStock  = v.startsWith('/stock/')
  const isUpload = v.startsWith('/api/file/')
  const isGif    = /\.gif(\?|$)/i.test(v)
  if (isStock) return v
  if (tier === 'free') return ''
  if (tier === 'pro') return (isUpload && !isGif) ? v : ''
  if (isUpload) return v
  if (/^https:\/\//i.test(v)) return v
  return ''
}

/** wallpaper image/video — premium only */
function sanitizeBgMedia(raw: any, isPremium: boolean, kind: 'image' | 'video'): string {
  if (!isPremium) return ''
  const v = (raw || '').toString().trim().slice(0, 500)
  if (!v) return ''
  const isStock  = v.startsWith('/stock/')
  const isUpload = v.startsWith('/api/file/')
  if (kind === 'image') {
    if (isStock || isUpload) return v
    if (/^https:\/\//i.test(v)) return v
    return ''
  }
  // video: only uploaded mp4/webm
  if (isUpload && /\.(mp4|webm)(\?|$)/i.test(v)) return v
  return ''
}

export default defineEventHandler(async (event) => {
  const store = await getMemberStore(event)
  const body  = await readBody(event)

  const tier      = (store.product_tier || 'free').toString()
  const isPro     = ['pro', 'premium'].includes(tier)
  const isPremium = tier === 'premium'

  const links = (body.links || []).map((link: any) => ({
    id:        link.id || randomUUID(),
    type:      (link.type  || 'custom').toString().slice(0, 30),
    label:     (link.label || '').toString().trim().slice(0, 50),
    url:       (link.url   || '').toString().trim().slice(0, 500),
    image:     sanitizeImage(link.image, tier),
    enabled:   link.enabled !== false,
    featured:  isPro && link.featured === true,
  }))
  const allowedLinks = isPro ? links : links.slice(0, 5)

  // ── Wallpaper / background ──────────────────────────────────────────────
  let bgType = VALID_BG_TYPES.includes(body.bg_type) ? body.bg_type : 'solid'
  if (!isPremium && (bgType === 'image' || bgType === 'video')) bgType = 'gradient'

  const gradFrom  = isHex(body.gradient_from)  ? body.gradient_from  : '#3358ff'
  const gradTo    = isHex(body.gradient_to)    ? body.gradient_to    : '#7c3aed'
  let   gradAngle = parseInt(body.gradient_angle, 10)
  if (isNaN(gradAngle) || gradAngle < 0 || gradAngle > 360) gradAngle = 135

  const accent = isHex(body.accent_color) ? body.accent_color : (store.primary_color || '#3358ff')
  const baseText = isHex(body.text_color) ? body.text_color : '#111111'

  const linksBio = {
    title:          (body.title || store.name || '').toString().trim().slice(0, 60),
    bio:            (body.bio   || '').toString().trim().slice(0, 150),

    // Background
    bg_type:        bgType,
    bg_color:       isHex(body.bg_color) ? body.bg_color : '#ffffff',
    gradient_from:  gradFrom,
    gradient_to:    gradTo,
    gradient_angle: gradAngle,
    bg_image:       sanitizeBgMedia(body.bg_image, isPremium, 'image'),
    bg_video:       sanitizeBgMedia(body.bg_video, isPremium, 'video'),

    // Granular colors
    text_color:        baseText,
    accent_color:      accent,
    title_color:       isHex(body.title_color)       ? body.title_color       : baseText,
    bio_color:         isHex(body.bio_color)         ? body.bio_color         : baseText,
    button_color:      isHex(body.button_color)      ? body.button_color      : accent,
    button_text_color: isHex(body.button_text_color) ? body.button_text_color : '#ffffff',

    // Template + card
    template:       VALID_TEMPLATES.includes(body.template) ? body.template : 'none',
    card_style:     isPro && ['filled', 'outline', 'ghost'].includes(body.card_style) ? body.card_style : 'default',
    card_bg_color:  isPro && isHex(body.card_bg_color) ? body.card_bg_color : null,
    card_radius:    isPro && ['sm', 'md', 'lg', 'full'].includes(body.card_radius) ? body.card_radius : 'md',
    hide_branding:  isPremium && body.hide_branding === true,

    // Phase 2 features
    verified:         isPremium && body.verified === true,
    show_products:    body.show_products === true,
    button_animation: isPremium && ['pulse', 'shake', 'bounce', 'glow'].includes(body.button_animation) ? body.button_animation : 'none',

    // Phase A features
    show_name:      body.show_name !== false,
    show_bio:       body.show_bio !== false,
    font_family:    isPro && VALID_FONTS.includes(body.font_family) ? body.font_family : 'default',
    social_style:   ['outline', 'color'].includes(body.social_style) ? body.social_style : 'outline',
    socials:        sanitizeSocials(body.socials),

    // OG share image (1200x630 PNG auto-generated di browser, di-upload)
    og_image:       (body.og_image || '').toString().startsWith('/api/file/') ? body.og_image.toString().slice(0, 300) : '',
    og_sig:         (body.og_sig || '').toString().slice(0, 200),

    links:          allowedLinks,
  }

  await execute('UPDATE stores SET links_bio = ? WHERE id = ?', [JSON.stringify(linksBio), store.id])

  await deleteOrphanUploads(store, { ...store, links_bio: linksBio })

  return { ok: true }
})
