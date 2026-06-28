-- ============================================================
-- Lakara — Seed Default Terms Member (Lakara Bio & Storefront)
-- Database: lakaraid_lakaracreative  | Tabel: settings (key = member_terms)
-- Tampil di /member/terms, editable di /admin/terms. Tanpa rebuild.
-- ============================================================

INSERT INTO settings (`key`, `value`) VALUES ('member_terms',
'<h2>1. Tentang Layanan</h2><p>Lakara Bio dan Lakara Storefront adalah produk platform mandiri dari PT Lakara Solusi Kreatif yang memungkinkan pengguna membuat halaman link bio dan katalog produk. Layanan ini <strong>terpisah</strong> dari layanan agensi Lakara Creative (jasa pembuatan website, aplikasi, marketing, dan talent esports). Syarat dan Ketentuan ini hanya mengatur penggunaan Lakara Bio dan Storefront.</p>

<h2>2. Akun dan Pendaftaran</h2><ul><li>Kamu bertanggung jawab penuh atas kerahasiaan email dan password akunmu.</li><li>Satu akun terikat pada satu alamat lakara.id/namamu yang tidak dapat diubah setelah didaftarkan.</li><li>Informasi yang kamu daftarkan harus benar dan tidak menyesatkan.</li></ul>

<h2>3. Penggunaan yang Diperbolehkan</h2><p>Kamu boleh menggunakan Lakara Bio dan Storefront untuk keperluan pribadi maupun bisnis yang sah, selama mematuhi ketentuan ini dan hukum yang berlaku di Indonesia.</p>

<h2>4. Konten yang Dilarang</h2><p>Kamu dilarang mengunggah atau menautkan konten yang:</p><ul><li>Melanggar hukum, menipu, atau merugikan pihak lain.</li><li>Mengandung pornografi, kekerasan, ujaran kebencian, atau SARA.</li><li>Melanggar hak cipta atau merek pihak lain.</li><li>Berisi malware, phishing, judi online, atau skema penipuan.</li></ul>

<h2>5. Kepemilikan Konten</h2><p>Semua konten yang kamu unggah (foto, teks, tautan) tetap menjadi milikmu. Dengan mengunggah, kamu memberi Lakara izin untuk menampilkan konten tersebut sebagai bagian dari layanan. Kamu bertanggung jawab penuh atas konten yang kamu publikasikan.</p>

<h2>6. Produk dan Transaksi</h2><p>Lakara Storefront berfungsi sebagai katalog yang mengarahkan pembeli ke marketplace (Shopee, Tokopedia, dan lain-lain) atau WhatsApp milikmu. <strong>Lakara bukan pihak dalam transaksi jual beli</strong> dan tidak bertanggung jawab atas pengiriman, pembayaran, kualitas produk, maupun sengketa antara penjual dan pembeli.</p>

<h2>7. Paket dan Pembayaran</h2><ul><li>Tersedia paket Free, Pro, dan Premium dengan fitur berbeda. Detail harga ada di menu Upgrade.</li><li>Pembayaran upgrade bersifat prabayar dan diaktifkan setelah dikonfirmasi.</li><li>Biaya yang sudah dibayarkan tidak dapat dikembalikan kecuali diatur lain oleh Lakara.</li></ul>

<h2>8. Penangguhan dan Penghapusan Akun</h2><p>Lakara berhak menangguhkan atau menghapus akun yang melanggar ketentuan ini, menyalahgunakan layanan, atau membahayakan keamanan platform, tanpa pemberitahuan sebelumnya.</p>

<h2>9. Batasan Tanggung Jawab</h2><p>Layanan disediakan apa adanya. Lakara berupaya menjaga ketersediaan layanan namun tidak menjamin layanan bebas gangguan atau error. Lakara tidak bertanggung jawab atas kerugian yang timbul dari penggunaan atau ketidaktersediaan layanan.</p>

<h2>10. Perubahan Ketentuan</h2><p>Lakara dapat memperbarui Syarat dan Ketentuan ini sewaktu-waktu. Perubahan berlaku sejak dipublikasikan di halaman ini. Penggunaan layanan secara berkelanjutan dianggap sebagai persetujuan atas ketentuan terbaru.</p>

<h2>11. Kontak</h2><p>Pertanyaan terkait Syarat dan Ketentuan ini dapat disampaikan melalui halaman Kontak di lakara.id/contact atau WhatsApp resmi Lakara.</p>')
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

SELECT `key`, LEFT(`value`, 60) AS preview FROM settings WHERE `key` = 'member_terms';
