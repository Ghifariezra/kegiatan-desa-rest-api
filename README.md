<div align="center">

# Sistem Informasi Kegiatan Desa Sukamaju

REST API untuk mengelola RT, warga, jadwal kegiatan, pendaftaran peserta, dan laporan hasil kegiatan desa.

![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A520-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Zod](https://img.shields.io/badge/Validasi-Zod-3E67B1)
![Postman](https://img.shields.io/badge/Postman-collection-FF6C37?logo=postman&logoColor=white)
![Newman](https://img.shields.io/badge/Newman-CLI-FF6C37?logo=postman&logoColor=white)
![License](https://img.shields.io/badge/license-ISC-blue)

</div>

## Ringkasan

- **8 tabel** PostgreSQL dengan relasi one to one, one to many, dan many to many.
- **8 resource REST** dengan 5 route CRUD masing-masing: GET semua, GET by ID, POST, PUT, DELETE.
- **Validasi berlapis**: Zod di level request, constraint di level database, dan pesan error PostgreSQL yang sudah diterjemahkan.
- **Arsitektur ringkas**: logika CRUD ditulis sekali di `src/core/`, setiap resource hanya perlu konfigurasi.
- **Postman collection + Newman** berisi tes otomatis (status code, JSON schema, isi data, dan pengecekan data sensitif) yang bisa dijalankan dari terminal dengan `npm run test:api`.

## Daftar isi

- [Sistem Informasi Kegiatan Desa Sukamaju](#sistem-informasi-kegiatan-desa-sukamaju)
  - [Ringkasan](#ringkasan)
  - [Daftar isi](#daftar-isi)
  - [Studi kasus](#studi-kasus)
  - [Mulai cepat](#mulai-cepat)
  - [Rancangan database](#rancangan-database)
    - [Relasi](#relasi)
    - [Aturan penghapusan (ON DELETE)](#aturan-penghapusan-on-delete)
    - [Data contoh (`seed.sql`)](#data-contoh-seedsql)
  - [Struktur folder](#struktur-folder)
  - [Arsitektur kode](#arsitektur-kode)
    - [Teknologi](#teknologi)
  - [Instalasi lengkap](#instalasi-lengkap)
    - [Skrip npm](#skrip-npm)
  - [Endpoint API](#endpoint-api)
    - [Format response](#format-response)
    - [Contoh body](#contoh-body)
  - [Aturan validasi](#aturan-validasi)
  - [Penanganan error](#penanganan-error)
  - [Pengujian dengan Postman dan Newman](#pengujian-dengan-postman-dan-newman)
    - [Import dan persiapan](#import-dan-persiapan)
    - [Variable collection](#variable-collection)
    - [Urutan menjalankan](#urutan-menjalankan)
    - [Menjalankan dengan Newman](#menjalankan-dengan-newman)
    - [Tes manual untuk resource lain](#tes-manual-untuk-resource-lain)
  - [Pemecahan masalah](#pemecahan-masalah)
  - [Rencana pengembangan](#rencana-pengembangan)
  - [Lisensi](#lisensi)

## Studi kasus

Desa Sukamaju membutuhkan sistem informasi kegiatan desa untuk mengelola jadwal dan peserta kegiatan warga, seperti kerja bakti, siskamling, posyandu, dan perayaan hari besar. Selama ini pengumuman kegiatan hanya disampaikan lewat grup WhatsApp dan pengeras suara masjid. Akibatnya, perangkat desa sulit mengetahui berapa warga yang akan hadir, dan hasil kegiatan tidak terdokumentasi.

Kebutuhan fitur:

1. Pendataan RT dan warga di setiap RT.
2. Data akun untuk setiap warga (satu warga memiliki satu akun).
3. Pengelompokan kegiatan berdasarkan kategori dan lokasi.
4. Penjadwalan kegiatan: tanggal, jam mulai dan selesai, kuota peserta, dan status.
5. Pendaftaran warga ke kegiatan beserta pencatatan kehadirannya.
6. Laporan hasil untuk setiap kegiatan yang sudah selesai.

## Mulai cepat

Prasyarat: Node.js 20 atau lebih baru, dan PostgreSQL (perintah `psql` harus bisa dipanggil dari terminal).

```bash
git clone https://github.com/Ghifariezra/kegiatan-desa-rest-api.git
cd kegiatan-desa-rest-api
npm install

psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE kegiatan_desa;"

cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env
# isi DB_PASSWORD di file .env

npm run db:reset          # membuat tabel dan mengisi data contoh
npm run dev
```

Server berjalan di `http://localhost:3000`. Detail setiap langkah ada di bagian [Instalasi lengkap](#instalasi-lengkap).

Untuk menjalankan tes API otomatis, biarkan server tetap berjalan, lalu di terminal lain jalankan `npm run test:api`. Penjelasannya ada di bagian [Pengujian dengan Postman dan Newman](#pengujian-dengan-postman-dan-newman).

## Rancangan database

| Tabel | Isi |
| --- | --- |
| `rt` | Data Rukun Tetangga |
| `warga` | Data warga desa |
| `akun_warga` | Akun warga |
| `kategori_kegiatan` | Jenis kegiatan (kerja bakti, siskamling, dan lainnya) |
| `lokasi` | Tempat kegiatan |
| `kegiatan` | Jadwal kegiatan desa |
| `pendaftaran_kegiatan` | Warga yang mendaftar ke kegiatan |
| `laporan_kegiatan` | Laporan hasil kegiatan |

```mermaid
erDiagram
    RT ||--o{ WARGA : "memiliki"
    WARGA ||--o| AKUN_WARGA : "punya"
    WARGA ||--o{ PENDAFTARAN_KEGIATAN : "mendaftar"
    KEGIATAN ||--o{ PENDAFTARAN_KEGIATAN : "diikuti"
    KATEGORI_KEGIATAN ||--o{ KEGIATAN : "mengelompokkan"
    LOKASI ||--o{ KEGIATAN : "menjadi tempat"
    KEGIATAN ||--o| LAPORAN_KEGIATAN : "dilaporkan"

    RT {
        int id PK
        string nomor_rt UK
        string nama_ketua
    }
    WARGA {
        int id PK
        int rt_id FK
        string nik UK
        string nama_lengkap
        char jenis_kelamin
        date tanggal_lahir
    }
    AKUN_WARGA {
        int id PK
        int warga_id FK
        string email UK
        string password_hash
        string peran
    }
    KATEGORI_KEGIATAN {
        int id PK
        string nama_kategori UK
    }
    LOKASI {
        int id PK
        string nama_lokasi
        string alamat
    }
    KEGIATAN {
        int id PK
        int kategori_id FK
        int lokasi_id FK
        string nama_kegiatan
        date tanggal
        time jam_mulai
        time jam_selesai
        int kuota
        string status
    }
    PENDAFTARAN_KEGIATAN {
        int id PK
        int warga_id FK
        int kegiatan_id FK
        timestamp tanggal_daftar
        string status_kehadiran
    }
    LAPORAN_KEGIATAN {
        int id PK
        int kegiatan_id FK
        string ringkasan
        int jumlah_hadir
    }
```

### Relasi

| Jenis relasi | Tabel | Penjelasan |
| --- | --- | --- |
| One to one | `warga` - `akun_warga` | Satu warga hanya punya satu akun (`warga_id` bersifat UNIQUE) |
| One to one | `kegiatan` - `laporan_kegiatan` | Satu kegiatan hanya punya satu laporan (`kegiatan_id` bersifat UNIQUE) |
| One to many | `rt` - `warga` | Satu RT memiliki banyak warga |
| One to many | `kategori_kegiatan` - `kegiatan` | Satu kategori memiliki banyak kegiatan |
| One to many | `lokasi` - `kegiatan` | Satu lokasi dipakai banyak kegiatan |
| Many to many | `warga` - `kegiatan` | Lewat tabel `pendaftaran_kegiatan`; pasangan `warga_id` dan `kegiatan_id` bersifat UNIQUE |

### Aturan penghapusan (ON DELETE)

| Menghapus | Efek |
| --- | --- |
| `rt` yang masih punya warga | Ditolak (409) |
| `kategori_kegiatan` atau `lokasi` yang masih dipakai kegiatan | Ditolak (409) |
| `warga` | Akun dan pendaftaran milik warga ikut terhapus |
| `kegiatan` | Pendaftaran dan laporan kegiatan ikut terhapus |

### Data contoh (`seed.sql`)

| Tabel | Jumlah | Catatan |
| --- | --- | --- |
| `rt` | 3 | RT 001 sampai 003 |
| `warga` | 6 | Tersebar di 3 RT |
| `akun_warga` | 3 | Milik warga id 1, 2, dan 4 |
| `kategori_kegiatan` | 4 | Kerja Bakti, Siskamling, Posyandu, Perayaan |
| `lokasi` | 4 | Balai desa, lapangan, pos ronda, saluran air |
| `kegiatan` | 4 | 3 berstatus `dijadwalkan`, 1 `selesai` (id 4) |
| `pendaftaran_kegiatan` | 10 | Banyak ke banyak antara warga dan kegiatan |
| `laporan_kegiatan` | 1 | Untuk kegiatan id 4 |

> [!NOTE]
> Semua nama, NIK, nomor HP, dan email di data contoh adalah fiktif. Nilai `password_hash` pada seed hanya contoh, bukan hash dari kata sandi yang bisa dipakai.

File SQL ada di folder `database`:

| File | Fungsi |
| --- | --- |
| `schema.sql` | Membuat 8 tabel beserta relasi dan constraint |
| `seed.sql` | Mengisi data contoh |
| `reset.sql` | Menghapus semua tabel (`DROP TABLE`) untuk mengulang dari awal |
| `diagram.dbml` | Versi DBML, bisa di-import ke [dbdiagram.io](https://dbdiagram.io) |

<!-- Tambahkan link dbdiagram publik di sini: [Lihat diagram di dbdiagram.io](URL) -->

## Struktur folder

```
kegiatan-desa-rest-api/
├── database/
│   ├── schema.sql                     # membuat tabel dan relasi
│   ├── seed.sql                       # data contoh
│   ├── reset.sql                      # menghapus semua tabel
│   └── diagram.dbml                   # diagram untuk dbdiagram.io
├── postman/
│   └── API - Desa Sukamaju.postman_collection.json
├── scripts/
│   └── db-reset.mjs                   # menjalankan reset.sql, schema.sql, seed.sql (kredensial dari .env)
├── src/
│   ├── index.js                       # titik awal server
│   ├── config/
│   │   ├── env.js                     # memuat file .env
│   │   └── db.js                      # koneksi (pool) ke PostgreSQL
│   ├── core/                          # kode dasar yang dipakai semua resource
│   │   ├── BaseController.js          # handler CRUD generik
│   │   ├── BaseService.js             # query CRUD generik ke database
│   │   ├── createCrudRouter.js        # membuat 5 route CRUD dari sebuah controller
│   │   ├── AppError.js                # kelas error dengan status code
│   │   └── dbError.js                 # menerjemahkan error PostgreSQL ke pesan yang jelas
│   ├── middlewares/
│   │   ├── validate.js                # validasi params dan body dengan Zod
│   │   └── errorHandler.js            # handler 404 dan error global
│   ├── schemas/                       # aturan validasi (Zod) per resource
│   │   ├── common.js                  # helper validasi bersama (teks, tanggal, jam, enum, :id)
│   │   └── *.js                       # schema per resource
│   ├── services/                      # akses database dan aturan bisnis per resource
│   ├── controllers/                   # controller per resource
│   └── routes/
│       ├── index.js                   # menggabungkan semua route di bawah /api
│       └── *.routes.js                # route per resource
├── .env.example                       # contoh isi file .env
├── .gitignore
├── package.json
└── package-lock.json
```

Setiap resource memiliki satu file di `schemas`, `services`, `controllers`, dan `routes` dengan nama yang sama, misalnya `kegiatan.js`, `kegiatan.service.js`, `kegiatan.controller.js`, dan `kegiatan.routes.js`.

## Arsitektur kode

```mermaid
flowchart LR
    A["Client / Postman"] --> B["routes/*.routes.js"]
    B --> C["validate (Zod)"]
    C --> D["controller"]
    D --> E["service"]
    E --> F[("PostgreSQL")]
    C -. "400 data tidak valid" .-> G["errorHandler"]
    E -. "AppError" .-> G
    G --> A
```

| Lapisan | Tugas |
| --- | --- |
| `routes` | Menentukan URL dan method, memasang middleware validasi |
| `middlewares/validate.js` | Memeriksa `:id` dan body dengan schema Zod, lalu mengganti `req.body` dengan hasil validasi (teks di-trim, email diubah ke huruf kecil) |
| `controllers` | Menerima request dan mengirim response JSON |
| `services` | Menjalankan query ke PostgreSQL dan aturan bisnis |
| `core/dbError.js` | Menerjemahkan error PostgreSQL (unique, foreign key, check, not null, format data) menjadi pesan yang mudah dibaca |
| `middlewares/errorHandler.js` | Mengubah error menjadi response JSON yang seragam |

Karena kelima route CRUD sama untuk semua tabel, kodenya ditulis sekali di `core/`:

- **`BaseService`** menerima konfigurasi tabel (nama tabel, label untuk pesan, kolom yang boleh ditulis, query SELECT dengan JOIN, kolom id, urutan data, dan kolom `updated_at` jika ada) lalu menyediakan `findAll`, `findById`, `create`, `update`, dan `delete`. Query memakai parameter (`$1`, `$2`, ...), dan nama kolom diambil dari daftar kolom di service, bukan dari input pengguna. Hasil `create` dan `update` selalu dibaca ulang lewat query SELECT dasar, sehingga response sudah menyertakan kolom hasil JOIN.
- **`BaseController`** memanggil service dan membentuk response JSON.
- **`createCrudRouter`** memasang 5 route beserta middleware validasinya.

Resource yang butuh aturan khusus cukup mengoverride method yang diperlukan:

- `akun-warga.service.js`: password dari client di-hash dengan bcrypt sebelum disimpan (lewat hook `prepare`), dan `password_hash` tidak pernah ikut di response karena tidak termasuk dalam query SELECT.
- `pendaftaran-kegiatan.service.js`: pendaftaran hanya diterima jika kegiatan berstatus `dijadwalkan` dan kuotanya belum penuh.
- `kegiatan.service.js`: kolom `updated_at` diperbarui otomatis setiap kali data diubah lewat PUT.

Menambah resource baru cukup membuat satu file schema, service, controller, dan route, lalu mendaftarkan route di `src/routes/index.js`.

Beberapa detail lain di `src/index.js` dan `src/config/db.js`:

- Kolom bertipe `DATE` dibaca sebagai teks `YYYY-MM-DD` agar tidak bergeser karena zona waktu.
- `GET /` menampilkan daftar resource yang tersedia.
- Saat menerima `SIGINT` (Ctrl+C) atau `SIGTERM`, server berhenti menerima request lalu menutup koneksi database dengan rapi.

### Teknologi

| Kebutuhan | Library |
| --- | --- |
| Web framework | Express 5 |
| Database | PostgreSQL (driver `pg`) |
| Validasi input | Zod 4 |
| Hash password | bcryptjs |
| Header keamanan dan CORS | helmet, cors |
| Log request | morgan (nonaktif jika `NODE_ENV=production`) |
| Konfigurasi | dotenv |
| Auto restart saat development | nodemon |
| Pengujian API | Postman, Newman, newman-reporter-htmlextra |

Proyek memakai ES Modules (`import ... from`) dan membutuhkan Node.js 20 atau lebih baru (`engines` di `package.json`).

> [!NOTE]
> Paket `jsonwebtoken` dan `express-rate-limit` sudah terdaftar di `dependencies` untuk [rencana pengembangan](#rencana-pengembangan), tetapi belum dipakai di kode saat ini. API belum memiliki autentikasi maupun pembatasan laju request.

## Instalasi lengkap

**1. Clone repository dan pasang dependensi**

```bash
git clone https://github.com/Ghifariezra/kegiatan-desa-rest-api.git
cd kegiatan-desa-rest-api
npm install
```

**2. Buat database**

```bash
psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE kegiatan_desa;"
```

**3. Atur file `.env`**

Salin `.env.example` menjadi `.env`, lalu sesuaikan isinya:

| Variable | Contoh | Keterangan |
| --- | --- | --- |
| `PORT` | `3000` | Port server |
| `DB_HOST` | `localhost` | Alamat PostgreSQL |
| `DB_PORT` | `5432` | Port PostgreSQL |
| `DB_USER` | `postgres` | User PostgreSQL |
| `DB_PASSWORD` | `password_postgres_kamu` | Password PostgreSQL |
| `DB_NAME` | `kegiatan_desa` | Nama database |
| `NODE_ENV` | `production` | Opsional. Jika `production`, log request morgan dimatikan |

> [!WARNING]
> File `.env` berisi kredensial database dan sudah terdaftar di `.gitignore`. Jangan pernah di-commit.

**4. Buat tabel dan isi data contoh**

```bash
npm run db:reset
```

Perintah ini menjalankan `reset.sql`, `schema.sql`, lalu `seed.sql` secara berurutan lewat `psql`, memakai kredensial dari `.env` (`DB_NAME` dan `DB_PASSWORD` wajib diisi), sehingga tidak perlu mengetik password berulang. Proses berhenti jika salah satu file SQL error. Perintah yang sama dipakai kapan pun database perlu dikembalikan ke data contoh.

Cek hasilnya dengan `\dt` di dalam psql. Harus muncul 8 tabel.

> [!WARNING]
> `db:reset` menghapus semua tabel dan seluruh isinya. Hentikan server (`npm start` atau `npm run dev`) terlebih dahulu agar `DROP TABLE` tidak tertahan oleh koneksi yang masih aktif.

**5. Jalankan server**

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Mode development, restart otomatis saat file berubah (nodemon) |
| `npm start` | Mode biasa (`node src/index.js`) |

Jika berhasil, terminal menampilkan:

```
Server berjalan di http://localhost:3000
Terhubung ke database "kegiatan_desa"
```

Jika koneksi database gagal, server tetap menyala dan terminal menampilkan pesan `Gagal terhubung ke database. Periksa isi file .env`.

Buka `http://localhost:3000` untuk melihat daftar resource yang tersedia.

### Skrip npm

| Perintah | Fungsi |
| --- | --- |
| `npm start` | Menjalankan server |
| `npm run dev` | Menjalankan server dengan nodemon |
| `npm run test:api` | Menjalankan Postman collection dengan Newman (server harus sedang berjalan) |
| `npm run test:api:report` | Sama seperti `test:api`, ditambah laporan HTML di `postman/report.html` |
| `npm run db:reset` | Menghapus semua tabel, lalu membuat ulang tabel dan data contoh (kredensial dari `.env`) |

## Endpoint API

Semua resource memiliki 5 route yang sama.

| Metode | URL | Fungsi | Status berhasil |
| --- | --- | --- | --- |
| GET | `/api/{resource}` | Ambil semua data | 200 |
| GET | `/api/{resource}/:id` | Ambil satu data berdasarkan ID | 200 |
| POST | `/api/{resource}` | Tambah data baru | 201 |
| PUT | `/api/{resource}/:id` | Perbarui data (cukup kirim kolom yang berubah) | 200 |
| DELETE | `/api/{resource}/:id` | Hapus data | 200 |

| Resource | Tabel | Keterangan response | Urutan GET semua |
| --- | --- | --- | --- |
| `rt` | `rt` | Data RT | `nomor_rt` |
| `warga` | `warga` | Menyertakan `nomor_rt` | `nama_lengkap` |
| `akun-warga` | `akun_warga` | Menyertakan `nama_lengkap`, tanpa `password_hash` | `id` |
| `kategori-kegiatan` | `kategori_kegiatan` | Kategori kegiatan | `nama_kategori` |
| `lokasi` | `lokasi` | Lokasi kegiatan | `nama_lokasi` |
| `kegiatan` | `kegiatan` | Menyertakan `nama_kategori` dan `nama_lokasi` | `tanggal`, lalu `jam_mulai` |
| `pendaftaran-kegiatan` | `pendaftaran_kegiatan` | Menyertakan `nama_lengkap` dan `nama_kegiatan` | `tanggal_daftar` terbaru lebih dulu |
| `laporan-kegiatan` | `laporan_kegiatan` | Menyertakan `nama_kegiatan` | `created_at` terbaru lebih dulu |

### Format response

<details>
<summary><b>Berhasil, GET semua data</b></summary>

```json
{
  "status": "success",
  "message": "Berhasil mengambil semua data akun warga",
  "total": 3,
  "data": [
    {
      "id": 1,
      "warga_id": 1,
      "nama_lengkap": "Agus Santoso",
      "email": "agus.santoso@contoh.id",
      "peran": "admin",
      "created_at": "2026-10-25T15:17:51.361Z"
    }
  ]
}
```

</details>

<details>
<summary><b>Berhasil, GET by ID, POST, PUT, dan DELETE</b></summary>

```json
{
  "status": "success",
  "message": "Akun warga berhasil ditambahkan",
  "data": {
    "id": 4,
    "warga_id": 3,
    "nama_lengkap": "Budi Hartono",
    "email": "budi@sukamaju.id",
    "peran": "warga",
    "created_at": "2026-10-26T01:10:00.000Z"
  }
}
```

Response DELETE berisi data yang baru dihapus.

</details>

<details>
<summary><b>Gagal</b></summary>

```json
{
  "status": "error",
  "message": "Data tidak valid",
  "errors": [
    { "field": "nik", "message": "nik harus 16 digit angka" }
  ]
}
```

Field `errors` hanya muncul pada kegagalan validasi (400). Error lain, seperti 404 dan 409, hanya berisi `status` dan `message`.

</details>

> [!NOTE]
> Kolom bertipe tanggal dikembalikan sebagai teks `YYYY-MM-DD` agar tidak bergeser karena zona waktu.

### Contoh body

<details>
<summary><b>POST /api/warga</b></summary>

```json
{
  "rt_id": 1,
  "nik": "3201012509990001",
  "nama_lengkap": "Naila Putri Fahel",
  "jenis_kelamin": "P",
  "tanggal_lahir": "2003-05-14",
  "no_hp": "081234567890",
  "alamat": "Jl. Melati No. 12, Desa Sukamaju"
}
```

PUT: `{ "no_hp": "089876543210" }`

</details>

<details>
<summary><b>POST /api/akun-warga</b></summary>

```json
{
  "warga_id": 3,
  "email": "naila@sukamaju.id",
  "password": "rahasia123",
  "peran": "warga"
}
```

PUT: `{ "email": "Naila.Putri@sukamaju.id", "peran": "admin" }`. Untuk mengganti password, kirim juga `password` (akan di-hash ulang). `warga_id` tidak bisa diubah, dan email selalu disimpan dalam huruf kecil.

</details>

<details>
<summary><b>POST /api/kegiatan</b></summary>

```json
{
  "kategori_id": 1,
  "lokasi_id": 1,
  "nama_kegiatan": "Kerja Bakti Persiapan Musim Hujan",
  "deskripsi": "Membersihkan selokan dan memangkas pohon rawan tumbang",
  "tanggal": "2026-11-15",
  "jam_mulai": "07:00",
  "jam_selesai": "10:00",
  "kuota": 30
}
```

PUT: `{ "kuota": 45, "deskripsi": "Membersihkan selokan dan mengecek pintu air" }`

</details>

<details>
<summary><b>POST /api/pendaftaran-kegiatan</b></summary>

```json
{ "warga_id": 3, "kegiatan_id": 1 }
```

PUT: `{ "status_kehadiran": "hadir" }`

</details>

<details>
<summary><b>POST /api/laporan-kegiatan</b></summary>

```json
{
  "kegiatan_id": 1,
  "ringkasan": "Kegiatan berjalan lancar, warga antusias membersihkan lingkungan.",
  "jumlah_hadir": 42
}
```

PUT: `{ "jumlah_hadir": 45 }`. Kegiatan id 4 pada data contoh sudah punya laporan, jadi gunakan kegiatan lain.

</details>

<details>
<summary><b>POST /api/rt, /api/kategori-kegiatan, dan /api/lokasi</b></summary>

```json
{ "nomor_rt": "004", "nama_ketua": "Bapak Slamet Riyadi" }
```

```json
{ "nama_kategori": "Keagamaan", "deskripsi": "Pengajian dan peringatan hari besar" }
```

```json
{ "nama_lokasi": "Masjid Al-Ikhlas", "alamat": "Jl. Kenanga No. 2" }
```

</details>

## Aturan validasi

Kolom bertanda `*` wajib diisi saat POST. Saat PUT, kirim minimal satu kolom (kecuali `pendaftaran-kegiatan`, yang hanya menerima `status_kehadiran`).

| Resource | Kolom dan aturan |
| --- | --- |
| `rt` | `nomor_rt`\* 3 digit angka (contoh `001`), unik; `nama_ketua`\* maksimal 100 karakter |
| `warga` | `rt_id`\*; `nik`\* 16 digit angka, unik; `nama_lengkap`\* maks. 100; `jenis_kelamin`\* `L` atau `P`; `tanggal_lahir`\* `YYYY-MM-DD`, harus tanggal yang valid dan tidak boleh di masa depan; `no_hp` opsional, format `08...`, `628...`, atau `+628...`; `alamat` opsional |
| `akun-warga` | `warga_id`\* (satu warga satu akun, tidak bisa diubah lewat PUT); `email`\* valid, maks. 100, unik, disimpan huruf kecil; `password`\* 8 sampai 72 karakter, disimpan sebagai hash bcrypt; `peran` opsional `warga` (bawaan) atau `admin` |
| `kategori-kegiatan` | `nama_kategori`\* maks. 50, unik; `deskripsi` opsional |
| `lokasi` | `nama_lokasi`\* maks. 100; `alamat`\* |
| `kegiatan` | `kategori_id`\*; `lokasi_id`\*; `nama_kegiatan`\* maks. 150; `deskripsi` opsional; `tanggal`\* `YYYY-MM-DD` dan valid; `jam_mulai`\* dan `jam_selesai`\* format `HH:MM` (selesai harus lebih besar dari mulai); `kuota`\* bilangan bulat lebih dari 0; `status` opsional: `dijadwalkan` (bawaan), `berlangsung`, `selesai`, `dibatalkan` |
| `pendaftaran-kegiatan` | `warga_id`\*; `kegiatan_id`\*; `status_kehadiran` opsional: `terdaftar` (bawaan), `hadir`, `tidak_hadir`. Lewat PUT hanya `status_kehadiran` yang bisa diubah dan wajib dikirim |
| `laporan-kegiatan` | `kegiatan_id`\* (satu kegiatan satu laporan, tidak bisa diubah lewat PUT); `ringkasan`\*; `jumlah_hadir` opsional, bilangan bulat tidak boleh negatif (bawaan 0) |

Ketentuan umum:

- Kolom yang tidak dikenal di body diabaikan dan tidak menimbulkan error. Karena itu, mengirim `warga_id` lewat PUT `akun-warga` tidak mengubah apa pun.
- Teks otomatis di-trim. Pada kolom opsional `deskripsi` dan `alamat` (warga), string kosong disimpan sebagai `NULL`.
- Parameter `:id` harus bilangan bulat positif tanpa awalan nol.

**Aturan bisnis pendaftaran:** pendaftaran ditolak (409) jika status kegiatan bukan `dijadwalkan`, kuota sudah penuh, atau warga sudah terdaftar pada kegiatan yang sama. Aturan ini diperiksa saat POST. Jika `kegiatan_id` tidak ada, hasilnya 400.

## Penanganan error

| Kondisi | Status |
| --- | --- |
| Kolom wajib kosong, format salah, atau body kosong | 400 |
| Body bukan JSON yang valid | 400 |
| `:id` bukan angka bulat positif | 400 |
| ID referensi (`rt_id`, `kategori_id`, `lokasi_id`, `warga_id`, `kegiatan_id`) tidak ada di database | 400 |
| Data ditolak constraint database, misalnya PUT `kegiatan` yang hanya mengirim satu jam sehingga melanggar aturan `jam_selesai > jam_mulai` | 400 |
| Format tanggal, jam, atau angka ditolak PostgreSQL | 400 |
| Data dengan ID tersebut tidak ditemukan | 404 |
| Route tidak dikenal | 404 |
| Data duplikat (NIK, email, nomor RT, nama kategori, warga sudah punya akun, kegiatan sudah punya laporan) | 409 |
| Warga sudah terdaftar di kegiatan yang sama | 409 |
| Pendaftaran ditutup atau kuota penuh | 409 |
| Menghapus RT, kategori, atau lokasi yang masih dipakai data lain | 409 |
| Kesalahan tak terduga di server | 500 |

## Pengujian dengan Postman dan Newman

Collection tersedia di `postman/API - Desa Sukamaju.postman_collection.json` dan berisi 5 request untuk resource `akun-warga`. Setiap request sudah memiliki tes otomatis. Collection bisa dijalankan lewat aplikasi Postman maupun lewat terminal dengan Newman.

### Import dan persiapan

1. Postman: **Import**, lalu pilih file collection di folder `postman`.
2. Pastikan server berjalan dan database dalam kondisi data contoh (`npm run db:reset`).
3. Pilih **No Environment**. Variable yang dibutuhkan sudah ada di collection.

> [!IMPORTANT]
> Tes membandingkan hasil dengan data contoh dari `seed.sql` (3 akun, id 1 sampai 3). Jika data sudah berubah, jalankan `npm run db:reset` sebelum menjalankan collection.

### Variable collection

| Variable | Diisi oleh | Fungsi |
| --- | --- | --- |
| `BASE_URL` | Collection | `http://localhost:3000` |
| `ENDPOINT_API` | Collection | `{{BASE_URL}}/api` |
| `AWID_jsonSchema` | Collection | JSON Schema untuk response satu akun |
| `AWALL_jsonSchema` | Collection | JSON Schema untuk response daftar akun |
| `Account_Data` | Collection | Body request POST. Nilai `warga_id` diganti otomatis oleh script pre-request dengan warga yang belum punya akun |
| `Account_Update` | Collection | Body request PUT |
| `akun_id` | Script POST | ID akun yang sedang dites, dipakai di URL GET by ID, PUT, dan DELETE |
| `akun_terakhir` | Script POST dan PUT | Data akun terbaru, dipakai sebagai pembanding di tes lain |

### Urutan menjalankan

| No | Request | Status | Yang dites |
| --- | --- | --- | --- |
| 1 | `POST` Tambah Akun Warga | 201 | Schema, data sesuai input, `akun_id` tersimpan. Script pre-request memilih warga yang belum punya akun secara otomatis |
| 2 | `GET` Semua Akun Warga | 200 | Schema, `total`, urutan ID, email dan `warga_id` unik, akun baru ada di daftar |
| 3 | `GET` Akun Warga Per ID | 200 | Schema, ID sesuai URL, isi data sesuai |
| 4 | `PUT` Ubah Akun Warga | 200 | Kolom yang dikirim berubah, kolom lain tidak berubah |
| 5 | `DELETE` Hapus Akun Warga | 200 | Data yang dihapus sesuai, `GET` ulang menghasilkan 404, variable dibersihkan |

Semua request juga memastikan `password` dan `password_hash` tidak muncul di response dan waktu respons di bawah 500 ms.

Urutan di atas tidak boleh diubah, karena `akun_id` baru tersedia setelah POST berhasil dan DELETE sengaja berada paling akhir. Request bisa dijalankan satu per satu atau lewat **Collection Runner** (1 iterasi). Karena DELETE membersihkan akun yang dibuat POST, seluruh rangkaian bisa diulang tanpa mengubah data contoh.

### Menjalankan dengan Newman

Newman adalah CLI runner untuk Postman collection dan sudah terpasang sebagai devDependency, jadi tes bisa dijalankan tanpa membuka Postman. Dengan server yang sedang berjalan, buka terminal kedua lalu jalankan:

```bash
npm run test:api
```

Perintah ini menjalankan collection dengan jeda 200 ms antar request. Jika semua berhasil, ringkasan di akhir output kurang lebih seperti ini:

| Metrik | Hasil |
| --- | --- |
| `requests` | 8 executed, 0 failed |
| `test-scripts` | 5 executed, 0 failed |
| `prerequest-scripts` | 1 executed, 0 failed |
| `assertions` | 53 executed, 0 failed |

Jumlah `requests` lebih banyak dari 5 karena script di dalam collection menembak API tambahan: pre-request POST mengambil daftar akun dan warga (2 request), dan script DELETE melakukan `GET` ulang untuk memastikan data benar-benar terhapus (1 request).

Untuk sekaligus membuat laporan HTML (hasilnya di `postman/report.html`):

```bash
npm run test:api:report
```

### Tes manual untuk resource lain

| Skenario | Request | Hasil |
| --- | --- | --- |
| ID tidak ada | `GET /api/warga/9999` | 404 |
| ID bukan angka | `GET /api/warga/abc` | 400 |
| Validasi gagal | `POST /api/warga` dengan `"nik": "123"` | 400 |
| NIK duplikat | `POST /api/warga` dengan NIK yang sama dua kali | 409 |
| Warga sudah punya akun | `POST /api/akun-warga` dengan `"warga_id": 1` | 409 |
| Kegiatan sudah selesai | `POST /api/pendaftaran-kegiatan` dengan `"kegiatan_id": 4` | 409 |
| Sudah terdaftar | `POST /api/pendaftaran-kegiatan` dengan `{ "warga_id": 1, "kegiatan_id": 1 }` | 409 |
| RT masih punya warga | `DELETE /api/rt/1` | 409 |
| Jam tidak berurutan | `POST /api/kegiatan` dengan `jam_selesai` lebih kecil dari `jam_mulai` | 400 |

## Pemecahan masalah

| Gejala | Penyebab dan solusi |
| --- | --- |
| `Gagal terhubung ke database` saat server menyala | Periksa isi `.env` (host, port, user, password, nama database) dan pastikan PostgreSQL berjalan |
| `EADDRINUSE` | Port sudah dipakai. Ubah `PORT` di `.env` atau hentikan proses yang memakai port 3000 |
| `relation "warga" does not exist` | Tabel belum dibuat. Jalankan `npm run db:reset` |
| `psql` tidak dikenali | Folder `bin` PostgreSQL belum ada di `PATH`. Tambahkan, lalu buka ulang terminal |
| POST akun menghasilkan 409 `warga ini sudah punya akun` | Pilih `warga_id` yang belum punya akun. Pada data contoh, akun dimiliki warga id 1, 2, dan 4 |
| Tes Postman atau Newman gagal pada data seed, misalnya `expected 4 to deeply equal 3` | Data sudah berubah dari kondisi awal (biasanya ada akun sisa dari run yang gagal di tengah). Jalankan `npm run db:reset` |
| Newman: `SyntaxError: Identifier 'data' has already been declared` | Test script mendeklarasikan `const data`, padahal nama `data` sudah dipakai sandbox Newman. Collection di repo sudah memperbaikinya. Jika collection di-export ulang dari Postman, bungkus isi test script dengan `(() => { ... })();` atau ganti nama variable-nya |
| Newman: request ke `/akun-warga/{{akun_id}}` menghasilkan 400 | `akun_id` kosong karena POST belum berhasil atau urutan request di collection berubah. Pastikan urutannya POST, GET semua, GET by ID, PUT, DELETE |
| `npm run db:reset` tertahan atau gagal pada `DROP TABLE` | Server masih berjalan dan memegang koneksi. Hentikan server dulu |
| `npm run db:reset`: `DB_NAME / DB_PASSWORD tidak ditemukan di .env` | Isi `DB_NAME` dan `DB_PASSWORD` di file `.env` |
| Request Postman ke alamat yang salah | Environment lain memiliki variable `BASE_URL`. Pilih **No Environment** |
| Pesan peringatan code page saat memakai `psql` di Windows | Hanya peringatan karakter 8-bit dan tidak memengaruhi data |
| `npm audit` melaporkan banyak vulnerability setelah `npm install` | Berasal dari dependensi lama milik Newman dan reporter-nya, yang hanya berstatus devDependency dan tidak dipakai server. Hindari `npm audit fix --force` karena dapat merusak versi paket |

## Rencana pengembangan

- Endpoint login dan autentikasi (JWT) berbasis tabel `akun_warga` (paket `jsonwebtoken` sudah terpasang).
- Pembatasan laju request (rate limiting) dengan `express-rate-limit`, yang juga sudah terpasang.
- Pagination dan filter pada endpoint GET semua data.
- Postman collection untuk 7 resource lainnya.

## Lisensi

ISC