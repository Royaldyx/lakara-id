-- ============================================================
-- Lakara — Seed Testimoni (jalankan di phpMyAdmin)
-- Database: lakaraid_lakaracreative  | Tabel: testimonials
-- Tampil di section testimoni halaman publik. Tanpa rebuild.
-- Avatar pakai i.pravatar.cc (foto orang, untuk demo).
-- ============================================================

-- (OPSIONAL) reset testimoni lama. Hapus tanda komentar (--) kalau mau bersih total:
-- DELETE FROM testimonials;

INSERT INTO testimonials (name, role, text, rating, avatar, sort_order, active) VALUES
('Andika Pratama', 'Owner, Brand Fashion Lokal',
 'Website baru dari Lakara loadingnya cepat banget dan konversinya naik. Timnya responsif, hasilnya melebihi ekspektasi. Recommended buat yang serius jualan online.',
 5, 'https://i.pravatar.cc/150?img=12', 1, 1),

('Rina Marlina', 'Manager Marketing, F&B',
 'Sejak SMM dikelola Lakara, engagement Instagram kami naik drastis dan DM order makin rame. Konten konsisten, caption-nya juga ngena ke audiens.',
 5, 'https://i.pravatar.cc/150?img=45', 2, 1),

('Budi Santoso', 'IT Manager, Perusahaan Energi',
 'Dashboard monitoring yang dibangun Lakara sangat membantu operasional harian. Komunikasi lancar dari awal sampai launch, support pasca-proyek juga oke.',
 5, 'https://i.pravatar.cc/150?img=33', 3, 1),

('Siti Nurhaliza', 'Founder, Startup Kuliner',
 'Aplikasi kasir dari Lakara dipakai di semua cabang kami. Stabil, gampang dipakai karyawan, dan kalau ada kendala support-nya cepat tanggap.',
 5, 'https://i.pravatar.cc/150?img=49', 4, 1),

('Galih Ramadhan', 'Content Creator / Streamer',
 'Pakai Link Bio Lakara buat naro semua link aku. Tampilannya bisa di-custom sampai mirip brand sendiri, plus bisa embed video YouTube. Keren dan gratis.',
 5, 'https://i.pravatar.cc/150?img=15', 5, 1),

('Dewi Lestari', 'Pemilik UMKM Kerajinan',
 'Storefront Lakara bikin katalog produkku rapi banget. Pelanggan tinggal klik ke Shopee atau WhatsApp. Jualan jadi lebih gampang tanpa ribet bikin website mahal.',
 5, 'https://i.pravatar.cc/150?img=26', 6, 1),

('Bayu Setiawan', 'Manajer Tim Esports',
 'Lakara jadi host dan shoutcaster turnamen kami. Profesional, hype-nya kebawa ke penonton, dan koordinasinya rapi dari rundown sampai eksekusi.',
 5, 'https://i.pravatar.cc/150?img=51', 7, 1),

('Maya Anggraini', 'Owner, Skincare Brand',
 'Meta Ads yang diatur Lakara ROAS-nya jauh lebih baik dari sebelumnya. Laporannya transparan tiap minggu, jadi tahu persis duit iklan lari ke mana.',
 5, 'https://i.pravatar.cc/150?img=20', 8, 1);

-- Cek hasil:
SELECT id, sort_order, name, role, rating, active FROM testimonials ORDER BY sort_order;
