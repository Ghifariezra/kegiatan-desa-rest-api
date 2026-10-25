-- =====================================================================
-- Sistem Informasi Kegiatan Desa Sukamaju
-- Database : PostgreSQL
-- Isi file : struktur tabel (8 tabel)
--
-- Relasi:
--   One to One   : warga    <-> akun_warga        (1 warga punya 1 akun)
--                  kegiatan <-> laporan_kegiatan  (1 kegiatan punya 1 laporan)
--   One to Many  : rt                <-> warga     (1 RT punya banyak warga)
--                  kategori_kegiatan <-> kegiatan  (1 kategori punya banyak kegiatan)
--                  lokasi            <-> kegiatan  (1 lokasi dipakai banyak kegiatan)
--   Many to Many : warga <-> kegiatan, lewat tabel pendaftaran_kegiatan
--                  (1 warga ikut banyak kegiatan, 1 kegiatan diikuti banyak warga)
-- =====================================================================

-- 1. Rukun Tetangga (RT)
CREATE TABLE rt (
  id          SERIAL PRIMARY KEY,
  nomor_rt    VARCHAR(3)   NOT NULL UNIQUE,
  nama_ketua  VARCHAR(100) NOT NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Warga desa (one to many: satu RT memiliki banyak warga)
CREATE TABLE warga (
  id             SERIAL PRIMARY KEY,
  rt_id          INTEGER      NOT NULL,
  nik            CHAR(16)     NOT NULL UNIQUE,
  nama_lengkap   VARCHAR(100) NOT NULL,
  jenis_kelamin  CHAR(1)      NOT NULL,
  tanggal_lahir  DATE         NOT NULL,
  no_hp          VARCHAR(15),
  alamat         TEXT,
  created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_warga_rt FOREIGN KEY (rt_id) REFERENCES rt (id) ON DELETE RESTRICT,
  CONSTRAINT chk_warga_jenis_kelamin CHECK (jenis_kelamin IN ('L', 'P'))
);

-- 3. Akun login warga (one to one: warga_id dibuat UNIQUE)
CREATE TABLE akun_warga (
  id             SERIAL PRIMARY KEY,
  warga_id       INTEGER      NOT NULL UNIQUE,
  email          VARCHAR(100) NOT NULL UNIQUE,
  password_hash  VARCHAR(255) NOT NULL,
  peran          VARCHAR(20)  NOT NULL DEFAULT 'warga',
  created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_akun_warga FOREIGN KEY (warga_id) REFERENCES warga (id) ON DELETE CASCADE,
  CONSTRAINT chk_akun_peran CHECK (peran IN ('warga', 'admin'))
);

-- 4. Kategori kegiatan, misalnya kerja bakti, siskamling, posyandu
CREATE TABLE kategori_kegiatan (
  id             SERIAL PRIMARY KEY,
  nama_kategori  VARCHAR(50) NOT NULL UNIQUE,
  deskripsi      TEXT
);

-- 5. Lokasi kegiatan, misalnya balai desa atau lapangan
CREATE TABLE lokasi (
  id           SERIAL PRIMARY KEY,
  nama_lokasi  VARCHAR(100) NOT NULL,
  alamat       TEXT         NOT NULL
);

-- 6. Kegiatan desa (one to many dari kategori_kegiatan dan dari lokasi)
CREATE TABLE kegiatan (
  id             SERIAL PRIMARY KEY,
  kategori_id    INTEGER      NOT NULL,
  lokasi_id      INTEGER      NOT NULL,
  nama_kegiatan  VARCHAR(150) NOT NULL,
  deskripsi      TEXT,
  tanggal        DATE         NOT NULL,
  jam_mulai      TIME         NOT NULL,
  jam_selesai    TIME         NOT NULL,
  kuota          INTEGER      NOT NULL,
  status         VARCHAR(20)  NOT NULL DEFAULT 'dijadwalkan',
  created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_kegiatan_kategori FOREIGN KEY (kategori_id) REFERENCES kategori_kegiatan (id) ON DELETE RESTRICT,
  CONSTRAINT fk_kegiatan_lokasi FOREIGN KEY (lokasi_id) REFERENCES lokasi (id) ON DELETE RESTRICT,
  CONSTRAINT chk_kegiatan_kuota CHECK (kuota > 0),
  CONSTRAINT chk_kegiatan_jam CHECK (jam_selesai > jam_mulai),
  CONSTRAINT chk_kegiatan_status CHECK (status IN ('dijadwalkan', 'berlangsung', 'selesai', 'dibatalkan'))
);

-- 7. Pendaftaran warga ke kegiatan (tabel penghubung many to many)
CREATE TABLE pendaftaran_kegiatan (
  id                SERIAL PRIMARY KEY,
  warga_id          INTEGER     NOT NULL,
  kegiatan_id       INTEGER     NOT NULL,
  tanggal_daftar    TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status_kehadiran  VARCHAR(20) NOT NULL DEFAULT 'terdaftar',
  CONSTRAINT fk_pendaftaran_warga FOREIGN KEY (warga_id) REFERENCES warga (id) ON DELETE CASCADE,
  CONSTRAINT fk_pendaftaran_kegiatan FOREIGN KEY (kegiatan_id) REFERENCES kegiatan (id) ON DELETE CASCADE,
  CONSTRAINT uq_pendaftaran_warga_kegiatan UNIQUE (warga_id, kegiatan_id),
  CONSTRAINT chk_pendaftaran_status CHECK (status_kehadiran IN ('terdaftar', 'hadir', 'tidak_hadir'))
);

-- 8. Laporan hasil kegiatan (one to one: kegiatan_id dibuat UNIQUE)
CREATE TABLE laporan_kegiatan (
  id            SERIAL PRIMARY KEY,
  kegiatan_id   INTEGER   NOT NULL UNIQUE,
  ringkasan     TEXT      NOT NULL,
  jumlah_hadir  INTEGER   NOT NULL DEFAULT 0,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_laporan_kegiatan FOREIGN KEY (kegiatan_id) REFERENCES kegiatan (id) ON DELETE CASCADE,
  CONSTRAINT chk_laporan_jumlah_hadir CHECK (jumlah_hadir >= 0)
);
