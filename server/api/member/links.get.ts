import { getMemberStore } from '~/server/utils/member'

export default defineEventHandler(async (event) => {
  const store = await getMemberStore(event)

  const linksBio = store.links_bio || {
    title:        store.name          || '',
    bio:          store.tagline       || '',
    bg_color:     '#ffffff',
    text_color:   '#111111',
    accent_color: store.primary_color || '#3358ff',
    links:        [],
  }

  return { ok: true, data: linksBio }
})
