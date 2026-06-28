export const useSiteConfig = () => {
  const CONTACT = {
    phone: '6285161313693',
    phoneDisplay: '+62 851-6131-3693',
    email: 'lakarasolusikreatif@gmail.com',
    address: 'Jl. Animan No. 03, Kp. Cikaret (Lt Ground/Basement)',
  }

  const SOCIAL = {
    instagram: 'https://instagram.com/wearelakara',
    youtube: 'https://youtube.com/@lakaracreative',
    whatsapp: `https://wa.me/${CONTACT.phone}`,
  }

  const wa = (msg: string) =>
    `https://wa.me/${CONTACT.phone}?text=${encodeURIComponent(msg)}`

  return { CONTACT, SOCIAL, wa }
}
