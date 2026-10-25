-- Menghapus semua tabel agar schema.sql dan seed.sql bisa dijalankan ulang dari awal.
-- Hati-hati: semua data di tabel ini akan hilang.
DROP TABLE IF EXISTS laporan_kegiatan;
DROP TABLE IF EXISTS pendaftaran_kegiatan;
DROP TABLE IF EXISTS kegiatan;
DROP TABLE IF EXISTS lokasi;
DROP TABLE IF EXISTS kategori_kegiatan;
DROP TABLE IF EXISTS akun_warga;
DROP TABLE IF EXISTS warga;
DROP TABLE IF EXISTS rt;
