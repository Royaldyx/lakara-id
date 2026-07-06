# Import Produk Shopee → Lakara (Bookmarklet + Clipboard) — GRATIS & ANDAL

> **Kenapa cara ini (clipboard):** cara lama (buka tab `?shopee_import=`) sering kebanting ke dashboard
> karena bootstrap SPA member. Cara clipboard **nggak kena masalah itu** — bookmarklet cuma nyalin data,
> lalu kamu tempel di editor Lakara. 100% andal, gratis, nggak ada dependency.

---

## Cara pasang bookmarklet (sekali saja)

1. Buka browser di **laptop** (Chrome/Edge/Firefox).
2. Buat bookmark baru (klik ⭐ / bookmark manager → Add).
3. **Nama:** `Salin Produk Shopee`
4. **URL:** tempel kode di bawah (PERSIS, satu baris):

```
javascript:(function(){var h=location.href,m=h.match(/-i\.(\d+)\.(\d+)/)||h.match(/product\/(\d+)\/(\d+)/);if(!m){alert('Buka halaman PRODUK Shopee dulu (yang ada foto+harga), baru klik.');return;}fetch('/api/v4/item/get?itemid='+m[2]+'&shopid='+m[1],{headers:{'x-api-source':'pc'},credentials:'include'}).then(function(r){return r.json()}).then(function(j){var it=j.data;if(!it){alert('Data produk tidak ketemu. Refresh halaman lalu coba lagi.');return;}var rp=function(v){return v&&v>0?Math.round(v/100000):0};var p=rp(it.price||it.price_min),pb=rp(it.price_before_discount||it.price_max);var d={name:it.name,description:(it.description||'').slice(0,2000),price:p,price_original:pb>p?pb:0,images:(it.images||[]).slice(0,8).map(function(x){return'https://down-id.img.susercontent.com/file/'+x}),shopee_url:h.split('?')[0],rating:(it.item_rating&&it.item_rating.rating_star)?Math.round(it.item_rating.rating_star*10)/10:0};navigator.clipboard.writeText(JSON.stringify(d)).then(function(){alert('✓ Data DISALIN!\n\n'+d.name+'\nRp'+d.price+'\n'+d.images.length+' foto\n\nBuka Lakara → Tambah Produk → klik TEMPEL DATA.');}).catch(function(){window.prompt('Clipboard diblok. Salin (Ctrl+C) data ini, lalu tempel di Lakara:',JSON.stringify(d));});}).catch(function(e){alert('Gagal ambil data: '+e)});})();
```

5. Simpan.

---

## Cara pakai (tiap produk)

1. Buka **halaman PRODUK Shopee** (yang ada foto & harga — bukan halaman toko).
2. Klik bookmark **Salin Produk Shopee** → muncul alert "✓ Data DISALIN" (nama, harga, jumlah foto).
3. Buka **Lakara → Produk → Tambah Produk**.
4. Klik tombol oranye **"Tempel Data"** → form otomatis keisi (nama, harga, deskripsi, foto, link Shopee).
5. Cek & rapikan → **Simpan**. Lanjut produk berikutnya.

> Kalau muncul kotak "Clipboard diblok" (browser nggak kasih izin), tinggal Ctrl+C teksnya, lalu di Lakara klik "Tempel Data" (dia baca clipboard) — atau paste manual.

---

## Catatan
- Login dulu di Lakara (akun toko yang mau diisi).
- Foto = hotlink dari CDN Shopee (nggak di-download). Kalau ada yang nggak muncul, upload ulang manual.
- Cara ini pakai **navigasi dalam app** (Tambah Produk) + **clipboard** → nggak kena masalah redirect/SPA. Andal.
- Shopee bisa sewaktu-waktu ubah API-nya; kalau bookmarklet error, kabari buat update.
- Akses tidak resmi — pakai wajar (isi katalog toko kamu/klien), jangan scraping massal.
