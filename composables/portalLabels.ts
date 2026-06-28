// Label & style bersama untuk Client Portal (tiket, status, dll)

export function ticketCat(c: string) {
  const map: Record<string, { label: string; icon: string }> = {
    revision:  { label: 'Revisi',          icon: 'i-tabler-refresh' },
    billing:   { label: 'Billing',         icon: 'i-tabler-file-invoice' },
    technical: { label: 'Teknis',          icon: 'i-tabler-tool' },
    general:   { label: 'Pertanyaan Umum', icon: 'i-tabler-help-circle' },
  }
  return map[c] || map.general
}

export function taskType(t: string) {
  const map: Record<string, { label: string; icon: string }> = {
    design:  { label: 'Desain',          icon: 'i-tabler-palette' },
    writing: { label: 'Content Writing', icon: 'i-tabler-pencil' },
    uiux:    { label: 'UI/UX',           icon: 'i-tabler-layout-2' },
    other:   { label: 'Lainnya',         icon: 'i-tabler-clipboard' },
  }
  return map[t] || map.other
}

export function taskStatus(s: string) {
  const map: Record<string, { label: string; class: string }> = {
    todo:        { label: 'To Do',      class: 'bg-slate-100 text-slate-600' },
    in_progress: { label: 'Dikerjakan', class: 'bg-blue-100 text-blue-700' },
    submitted:   { label: 'Disubmit',   class: 'bg-amber-100 text-amber-700' },
    revision:    { label: 'Revisi',     class: 'bg-red-100 text-red-700' },
    done:        { label: 'Selesai',    class: 'bg-green-100 text-green-700' },
  }
  return map[s] || map.todo
}

export function invoiceStatus(s: string) {
  const map: Record<string, { label: string; class: string; bg: string; text: string }> = {
    paid:    { label: 'Lunas',       class: 'bg-green-100 text-green-700',  bg: 'bg-green-50',  text: 'text-green-500' },
    unpaid:  { label: 'Belum Bayar', class: 'bg-amber-100 text-amber-700',  bg: 'bg-amber-50',  text: 'text-amber-500' },
    overdue: { label: 'Jatuh Tempo', class: 'bg-red-100 text-red-700',      bg: 'bg-red-50',    text: 'text-red-500' },
  }
  return map[s] || map.unpaid
}

export function ticketStatus(s: string) {
  const map: Record<string, { label: string; class: string }> = {
    open:           { label: 'Open',           class: 'bg-blue-100 text-blue-700' },
    in_progress:    { label: 'Diproses',       class: 'bg-amber-100 text-amber-700' },
    waiting_client: { label: 'Menunggu Kamu',  class: 'bg-purple-100 text-purple-700' },
    closed:         { label: 'Selesai',        class: 'bg-slate-100 text-slate-500' },
  }
  return map[s] || map.open
}
