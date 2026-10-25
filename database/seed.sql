-- =====================================================================
-- Data contoh untuk Sistem Informasi Kegiatan Desa Sukamaju
-- Jalankan SETELAH schema.sql
-- Semua nama, NIK, nomor HP, dan email di bawah ini fiktif.
-- =====================================================================

INSERT INTO rt (nomor_rt, nama_ketua) VALUES
  ('001', 'Bapak Sutrisno'),
  ('002', 'Ibu Wartini'),
  ('003', 'Bapak Hendra');

INSERT INTO warga (rt_id, nik, nama_lengkap, jenis_kelamin, tanggal_lahir, no_hp, alamat) VALUES
  (1, '3201010101850001', 'Agus Santoso',    'L', '1985-03-12', '081200000001', 'Jl. Melati No. 3'),
  (1, '3201010101900002', 'Siti Rahmawati',  'P', '1990-07-25', '081200000002', 'Jl. Melati No. 7'),
  (2, '3201010101780003', 'Budi Hartono',    'L', '1978-11-02', '081200000003', 'Jl. Kenanga No. 1'),
  (2, '3201010101950004', 'Dewi Lestari',    'P', '1995-01-18', '081200000004', 'Jl. Kenanga No. 9'),
  (3, '3201010102000005', 'Rizky Pratama',   'L', '2000-05-30', '081200000005', 'Jl. Mawar No. 4'),
  (3, '3201010101880006', 'Nur Aisyah',      'P', '1988-09-14', '081200000006', 'Jl. Mawar No. 12');

-- Kata sandi tidak disimpan sebagai teks asli. Nilai di bawah hanya contoh hash.
INSERT INTO akun_warga (warga_id, email, password_hash, peran) VALUES
  (1, 'agus.santoso@contoh.id',   '$2b$10$contohHashUntukDataDummy0000000000000000000000000001', 'admin'),
  (2, 'siti.rahmawati@contoh.id', '$2b$10$contohHashUntukDataDummy0000000000000000000000000002', 'warga'),
  (4, 'dewi.lestari@contoh.id',   '$2b$10$contohHashUntukDataDummy0000000000000000000000000004', 'warga');

INSERT INTO kategori_kegiatan (nama_kategori, deskripsi) VALUES
  ('Kerja Bakti', 'Gotong royong membersihkan lingkungan desa'),
  ('Siskamling',  'Ronda malam untuk menjaga keamanan desa'),
  ('Posyandu',    'Pemeriksaan kesehatan balita dan lansia'),
  ('Perayaan',    'Acara perayaan hari besar dan lomba warga');

INSERT INTO lokasi (nama_lokasi, alamat) VALUES
  ('Balai Desa Sukamaju',  'Jl. Raya Sukamaju No. 1'),
  ('Lapangan Desa',        'Jl. Raya Sukamaju No. 20'),
  ('Pos Ronda RT 002',     'Jl. Kenanga, depan masjid'),
  ('Saluran Air Blok C',   'Sepanjang Jl. Mawar');

INSERT INTO kegiatan (kategori_id, lokasi_id, nama_kegiatan, deskripsi, tanggal, jam_mulai, jam_selesai, kuota, status) VALUES
  (1, 4, 'Kerja Bakti Bersih Saluran Air', 'Membersihkan saluran air sebelum musim hujan', '2026-11-08', '07:00', '11:00', 40, 'dijadwalkan'),
  (2, 3, 'Ronda Malam Pekan Pertama',     'Jadwal siskamling RT 002',                     '2026-11-07', '22:00', '23:59', 6,  'dijadwalkan'),
  (3, 1, 'Posyandu Balita dan Lansia',    'Penimbangan balita dan cek tekanan darah lansia', '2026-11-12', '08:00', '12:00', 60, 'dijadwalkan'),
  (4, 2, 'Lomba Tujuh Belasan',           'Lomba balap karung dan tarik tambang',         '2026-08-17', '07:30', '15:00', 100, 'selesai');

-- Many to many: warga mendaftar ke kegiatan
INSERT INTO pendaftaran_kegiatan (warga_id, kegiatan_id, status_kehadiran) VALUES
  (1, 1, 'terdaftar'),
  (3, 1, 'terdaftar'),
  (5, 1, 'terdaftar'),
  (3, 2, 'terdaftar'),
  (4, 2, 'terdaftar'),
  (2, 3, 'terdaftar'),
  (6, 3, 'terdaftar'),
  (1, 4, 'hadir'),
  (2, 4, 'hadir'),
  (5, 4, 'tidak_hadir');

-- One to one: laporan untuk kegiatan yang sudah selesai
INSERT INTO laporan_kegiatan (kegiatan_id, ringkasan, jumlah_hadir) VALUES
  (4, 'Lomba berjalan lancar dan diikuti warga dari tiga RT.', 2);
