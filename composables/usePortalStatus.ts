// Label & warna status untuk Client Portal (brief & konten).

const LABELS: Record<string, string> = {
  // brief
  draft: 'Draft', submitted: 'Dikirim', in_progress: 'Diproses', completed: 'Selesai',
  // content
  idea: 'Ide', designing: 'Desain', waiting_approval: 'Menunggu Approval',
  approved: 'Disetujui', scheduled: 'Terjadwal', published: 'Tayang',
}

const CLASSES: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-500',
  submitted: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
  idea: 'bg-slate-100 text-slate-500',
  designing: 'bg-purple-100 text-purple-700',
  waiting_approval: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  scheduled: 'bg-blue-100 text-blue-700',
  published: 'bg-[#3358ff]/10 text-[#3358ff]',
}

export const statusLabel = (s: string) => LABELS[s] || s
export const statusClass = (s: string) => CLASSES[s] || 'bg-slate-100 text-slate-500'

export const CONTENT_TYPE_LABEL: Record<string, string> = {
  feed: 'Feed', carousel: 'Carousel', reels: 'Reels', story: 'Story',
}
