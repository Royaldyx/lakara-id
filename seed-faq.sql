-- ============================================================
-- Lakara — Seed FAQ (jalankan di phpMyAdmin)
-- Database: lakaraid_lakaracreative  | Tabel: faqs
-- FAQ ini tampil di halaman publik & section FAQ. Tanpa rebuild.
-- ============================================================

-- (OPSIONAL) hapus semua FAQ lama dulu biar bersih. Hapus tanda komentar (--) di bawah kalau mau reset total:
-- DELETE FROM faqs;

INSERT INTO faqs (question, answer, sort_order, active) VALUES
('Apa itu Lakara?',
 'Lakara adalah platform digital all-in-one dari PT Lakara Solusi Kreatif. Kamu bisa bikin halaman Link Bio (semua link dalam satu halaman) dan Storefront (katalog produk online) secara gratis. Selain itu Lakara juga menyediakan jasa profesional: pembuatan website & aplikasi, social media management, Meta Ads, SEO, video TikTok/Reels, dan talent esports.', 1, 1),

('Apakah Lakara gratis?',
 'Ya. Kamu bisa daftar dan pakai fitur dasar sepenuhnya gratis, termasuk Link Bio (hingga 5 link) dan Storefront (hingga 10 produk). Tersedia juga paket Pro dan Premium dengan fitur lebih lengkap. Cek menu Upgrade untuk detail harga terbaru.', 2, 1),

('Bagaimana cara daftar di Lakara?',
 'Buka lakara.id, klik Daftar, isi nama toko dan email, lalu buat password. Akun langsung aktif dan kamu otomatis punya halaman lakara.id/namatokomu.', 3, 1),

('Apa bedanya tier Free, Pro, dan Premium?',
 'Free: 5 link, template & warna dasar, hingga 10 produk. Pro: link tak terbatas, custom gaya kartu, analitik klik, dan produk unlimited. Premium: semua fitur Pro plus wallpaper foto/video, GIF, animasi tombol, verified badge, dan hapus branding Lakara. Detail lengkap ada di menu Upgrade.', 4, 1),

('Bagaimana cara upgrade ke Pro atau Premium?',
 'Masuk ke dashboard member, klik menu Upgrade, pilih paket, lalu transfer sesuai nominal ke rekening yang tertera dan kirim konfirmasi. Admin akan mengaktifkan paket kamu dalam 1x24 jam setelah pembayaran dikonfirmasi.', 5, 1),

('Apa itu fitur Link Bio?',
 'Link Bio adalah satu halaman (lakara.id/namamu) yang menampung semua tautan penting kamu: Instagram, TikTok, WhatsApp, marketplace, sampai embed video YouTube. Bisa diatur warna, wallpaper, template, dan foto profil sesuai brand kamu.', 6, 1),

('Apa itu Storefront?',
 'Storefront adalah halaman katalog produk di lakara.id/namamu/store. Lengkap dengan foto produk, harga, deskripsi, review, dan tombol beli yang langsung mengarah ke marketplace (Shopee, Tokopedia, Lazada, TikTok Shop) atau WhatsApp.', 7, 1),

('Apakah bisa jualan tanpa punya toko di marketplace?',
 'Bisa. Kamu bisa pakai tombol Link Beli Utama yang mengarah ke WhatsApp, atau link apa pun yang kamu mau. Marketplace sifatnya opsional.', 8, 1),

('Metode pembayaran apa saja yang diterima?',
 'Transfer bank (semua bank), QRIS, GoPay, OVO, DANA, dan ShopeePay. Untuk jasa (website, SMM, dll), invoice dikirim via email atau WhatsApp.', 9, 1),

('Apakah Lakara menerima jasa website atau aplikasi custom?',
 'Ya. Lakara Creative mengerjakan website, web app, mobile app Android/iOS, desain UI/UX, dan sistem custom. Konsultasi gratis via WhatsApp untuk estimasi harga dan timeline.', 10, 1),

('Berapa lama proyek jasa dikerjakan setelah DP?',
 'Untuk proyek jasa, tim mulai mengerjakan maksimal 2 sampai 3 hari kerja setelah DP diterima. Durasi pengerjaan menyesuaikan kompleksitas proyek dan dijelaskan saat konsultasi.', 11, 1),

('Apakah saya bisa pakai domain sendiri?',
 'Saat ini setiap toko otomatis dapat alamat lakara.id/namamu. Opsi domain atau subdomain custom sedang dalam pengembangan untuk member Premium. Hubungi admin untuk info terbaru.', 12, 1),

('Bagaimana cara menghubungi tim Lakara?',
 'Hubungi kami via WhatsApp, email, atau form kontak di lakara.id/contact. Kami merespons dalam 1 sampai 24 jam kerja.', 13, 1);

-- Cek hasil:
SELECT id, sort_order, question, active FROM faqs ORDER BY sort_order;
