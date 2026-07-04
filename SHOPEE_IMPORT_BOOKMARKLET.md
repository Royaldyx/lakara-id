# Import Produk Shopee → Lakara (Bookmarklet) — GRATIS & ANDAL

> Kenapa ini jalan (sedangkan import server sering gagal): bookmarklet berjalan **di dalam halaman Shopee, di browser kamu sendiri**. Jadi request-nya same-origin + pakai sesi & IP kamu → Shopee anggap normal, **nggak keblokir**. Server cPanel diblok karena IP datacenter.

---

## Cara pasang (sekali saja)

1. Buka browser di **laptop** (Chrome/Edge/Firefox).
2. Buat bookmark baru (bebas: klik ⭐ / bookmark manager → Add).
3. **Nama:** `Import ke Lakara`
4. **URL:** tempel kode di bawah ini (PERSIS, satu baris):

```
javascript:(function(){var h=location.href,m=h.match(/-i\.(\d+)\.(\d+)/)||h.match(/product\/(\d+)\/(\d+)/);if(!m){alert('Buka halaman PRODUK Shopee dulu (yang ada foto+harga), baru klik tombol ini.');return;}fetch('/api/v4/item/get?itemid='+m[2]+'&shopid='+m[1],{headers:{'x-api-source':'pc'},credentials:'include'}).then(function(r){return r.json()}).then(function(j){var it=j.data;if(!it){alert('Data produk tidak ketemu. Refresh halaman Shopee lalu coba lagi.');return;}var rp=function(v){return v&&v>0?Math.round(v/100000):0};var p=rp(it.price||it.price_min),pb=rp(it.price_before_discount||it.price_max);var d={name:it.name,description:(it.description||'').slice(0,2500),price:p,price_original:pb>p?pb:0,images:(it.images||[]).slice(0,8).map(function(x){return'https://down-id.img.susercontent.com/file/'+x}),shopee_url:h.split('?')[0],rating:(it.item_rating&&it.item_rating.rating_star)?Math.round(it.item_rating.rating_star*10)/10:0};window.open('https://lakara.id/member/products/edit?shopee_import='+encodeURIComponent(JSON.stringify(d)),'_blank');}).catch(function(e){alert('Gagal ambil data: '+e)});})();
```

5. Simpan. Pastikan **login dulu** ke `lakara.id/member` (akun toko yang mau diisi).

---

## Cara pakai (tiap produk)

1. Buka **halaman produk Shopee** di browser (bukan link toko — halaman 1 produk yang ada foto & harga).
2. Klik bookmark **Import ke Lakara**.
3. Tab baru kebuka: form produk Lakara **sudah keisi** (nama, deskripsi, harga, gambar, link Shopee).
4. Cek & rapikan → **Simpan**. Selesai. Lanjut produk berikutnya.

> Tips onboarding banyak produk: buka beberapa tab produk Shopee, klik bookmarklet satu-satu.

---

## Buat TESTING di localhost (dev)

Kalau mau nyoba di `npm run dev` (localhost), pakai versi ini — sama persis, cuma target domainnya diganti ke `http://localhost:3000`:

```
javascript:(function(){var h=location.href,m=h.match(/-i\.(\d+)\.(\d+)/)||h.match(/product\/(\d+)\/(\d+)/);if(!m){alert('Buka halaman PRODUK Shopee dulu.');return;}fetch('/api/v4/item/get?itemid='+m[2]+'&shopid='+m[1],{headers:{'x-api-source':'pc'},credentials:'include'}).then(function(r){return r.json()}).then(function(j){var it=j.data;if(!it){alert('Data tidak ketemu.');return;}var rp=function(v){return v&&v>0?Math.round(v/100000):0};var p=rp(it.price||it.price_min),pb=rp(it.price_before_discount||it.price_max);var d={name:it.name,description:(it.description||'').slice(0,2500),price:p,price_original:pb>p?pb:0,images:(it.images||[]).slice(0,8).map(function(x){return'https://down-id.img.susercontent.com/file/'+x}),shopee_url:h.split('?')[0],rating:(it.item_rating&&it.item_rating.rating_star)?Math.round(it.item_rating.rating_star*10)/10:0};window.open('http://localhost:3000/member/products/edit?shopee_import='+encodeURIComponent(JSON.stringify(d)),'_blank');}).catch(function(e){alert('Gagal: '+e)});})();
```

---

## Catatan
- **Login dulu** di tab Lakara (browser yang sama) sebelum klik bookmarklet, biar form kebuka di akun yang benar.
- Kalau tab baru ke-blok "popup blocked" → izinkan popup dari Shopee, atau klik lagi.
- Gambar = hotlink dari CDN Shopee (nggak di-download). Kalau ada gambar yang nggak muncul di toko, tinggal upload ulang manual.
- Shopee bisa sewaktu-waktu ubah struktur API-nya; kalau bookmarklet tiba-tiba error, kabarin buat update.
- Ini akses tidak resmi — pakai wajar (buat isi katalog toko kamu/klien), jangan scraping massal.
