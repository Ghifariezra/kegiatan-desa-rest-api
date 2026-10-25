# Sistem Informasi Kegiatan Desa Sukamaju

REST API untuk mengelola kegiatan desa, dibuat dengan **Express.js 5** dan **PostgreSQL**. Seluruh 8 tabel di database sudah memiliki 5 route CRUD (GET semua, GET by ID, POST, PUT, DELETE).

## Daftar Isi

- [Sistem Informasi Kegiatan Desa Sukamaju](#sistem-informasi-kegiatan-desa-sukamaju)
  - [Daftar Isi](#daftar-isi)
  - [Studi kasus](#studi-kasus)
  - [Rancangan database (8 tabel)](#rancangan-database-8-tabel)
  - [Teknologi](#teknologi)
  - [Struktur folder](#struktur-folder)
  - [Arsitektur kode](#arsitektur-kode)
  - [Cara menjalankan](#cara-menjalankan)
  - [Endpoint API](#endpoint-api)
    - [Format response](#format-response)
    - [Contoh body](#contoh-body)
  - [Aturan validasi per resource](#aturan-validasi-per-resource)
  - [Penanganan error](#penanganan-error)
  - [Pengujian dengan Postman](#pengujian-dengan-postman)
  - [Catatan keamanan](#catatan-keamanan)

## Studi kasus

Desa Sukamaju membutuhkan sistem informasi kegiatan desa untuk mengelola jadwal dan peserta kegiatan warga, seperti kerja bakti, siskamling, posyandu, dan perayaan hari besar. Selama ini pengumuman kegiatan hanya disampaikan lewat grup WhatsApp dan pengeras suara masjid. Akibatnya, perangkat desa sulit mengetahui berapa warga yang akan hadir, dan hasil kegiatan tidak terdokumentasi.

Kebutuhan fitur:

1. Pendataan RT dan warga di setiap RT.
2. Akun login untuk setiap warga (satu warga memiliki satu akun).
3. Pengelompokan kegiatan berdasarkan kategori dan lokasi.
4. Penjadwalan kegiatan: tanggal, jam mulai dan selesai, kuota peserta, dan status.
5. Pendaftaran warga ke kegiatan beserta pencatatan kehadirannya.
6. Laporan hasil untuk setiap kegiatan yang sudah selesai.

## Rancangan database (8 tabel)

| Tabel | Isi |
| --- | --- |
| `rt` | Data Rukun Tetangga |
| `warga` | Data warga desa |
| `akun_warga` | Akun login warga |
| `kategori_kegiatan` | Jenis kegiatan (kerja bakti, siskamling, dan lainnya) |
| `lokasi` | Tempat kegiatan |
| `kegiatan` | Jadwal kegiatan desa |
| `pendaftaran_kegiatan` | Warga yang mendaftar ke kegiatan |
| `laporan_kegiatan` | Laporan hasil kegiatan |

Relasi:

| Jenis relasi | Tabel | Penjelasan |
| --- | --- | --- |
| One to one | `warga` - `akun_warga` | Satu warga hanya punya satu akun (`warga_id` bersifat UNIQUE) |
| One to one | `kegiatan` - `laporan_kegiatan` | Satu kegiatan hanya punya satu laporan (`kegiatan_id` bersifat UNIQUE) |
| One to many | `rt` - `warga` | Satu RT memiliki banyak warga |
| One to many | `kategori_kegiatan` - `kegiatan` | Satu kategori memiliki banyak kegiatan |
| One to many | `lokasi` - `kegiatan` | Satu lokasi dipakai banyak kegiatan |
| Many to many | `warga` - `kegiatan` | Lewat tabel `pendaftaran_kegiatan`: satu warga ikut banyak kegiatan, satu kegiatan diikuti banyak warga |

File SQL ada di folder `database`:

- `schema.sql` : membuat 8 tabel beserta relasi dan constraint-nya
- `seed.sql` : data contoh
- `reset.sql` : menghapus semua tabel untuk mengulang dari awal
- `diagram.dbml` : versi DBML untuk dbdiagram.io

## Teknologi

| Kebutuhan | Library |
| --- | --- |
| Web framework | Express 5 |
| Database | PostgreSQL (driver `pg`) |
| Validasi input | Zod |
| Hash password | bcryptjs |
| Keamanan header dan CORS | helmet, cors |
| Log request | morgan (aktif selain mode production) |
| Konfigurasi | dotenv |
| Auto restart saat development | nodemon |

Proyek memakai ES Modules (`import ... from`).

## Struktur folder

```
si-kegiatan-desa/
├── database/
│   ├── schema.sql                     membuat tabel dan relasi
│   ├── seed.sql                       data contoh
│   ├── reset.sql                      menghapus semua tabel
│   └── diagram.dbml                   diagram untuk dbdiagram.io
├── src/
│   ├── index.js                       titik awal server
│   ├── config/
│   │   ├── env.js                     memuat file .env
│   │   └── db.js                      koneksi (pool) ke PostgreSQL
│   ├── core/                          kode dasar yang dipakai semua resource
│   │   ├── BaseController.js          handler CRUD generik
│   │   ├── BaseService.js             query CRUD generik ke database
│   │   ├── createCrudRouter.js        membuat 5 route CRUD dari sebuah controller
│   │   ├── AppError.js                kelas error dengan status code
│   │   └── dbError.js                 menerjemahkan error PostgreSQL ke pesan yang jelas
│   ├── middlewares/
│   │   ├── validate.js                validasi params dan body dengan Zod
│   │   └── errorHandler.js            handler 404 dan error global
│   ├── schemas/                       aturan validasi (Zod) per resource
│   ├── services/                      akses database dan aturan bisnis per resource
│   ├── controllers/                   controller per resource
│   └── routes/
│       ├── index.js                   menggabungkan semua route di bawah /api
│       └── *.routes.js                route per resource
├── .env.example                       contoh isi file .env
├── .gitignore
└── package.json
```

Setiap resource memiliki satu file di `schemas`, `services`, `controllers`, dan `routes` dengan nama yang sama (contoh: `kegiatan.js`, `kegiatan.service.js`, `kegiatan.controller.js`, `kegiatan.routes.js`).

## Arsitektur kode

Setiap request melewati alur berikut:

```
Request
  → routes/*.routes.js          menentukan URL dan method
  → middlewares/validate.js     cek :id dan body memakai schema Zod
  → controllers/*.controller    menerima request, mengirim response JSON
  → services/*.service          menjalankan query ke PostgreSQL
  → config/db.js (pool)         koneksi ke database
```

Karena kelima route CRUD sama untuk semua tabel, kodenya ditulis sekali di `core/`:

- `BaseService` menerima konfigurasi tabel (nama tabel, kolom yang boleh ditulis, query SELECT dengan JOIN, urutan data) lalu menyediakan `findAll`, `findById`, `create`, `update`, dan `delete`. Query memakai parameter (`$1`, `$2`, ...) sehingga aman dari SQL injection, dan nama kolom diambil dari daftar kolom di service, bukan dari input pengguna.
- `BaseController` memanggil service dan membentuk response JSON.
- `createCrudRouter` memasang 5 route beserta middleware validasinya.

Untuk resource yang butuh aturan khusus, service cukup mengoverride method yang diperlukan:

- `akun-warga.service.js` : password dari client di-hash dengan bcrypt sebelum disimpan, dan `password_hash` tidak pernah ikut di response.
- `pendaftaran-kegiatan.service.js` : pendaftaran hanya diterima jika kegiatan berstatus `dijadwalkan` dan kuotanya belum penuh.

Dengan pola ini, menambah resource baru cukup membuat satu file schema, service, controller, dan route.

## Cara menjalankan

Prasyarat: Node.js dan PostgreSQL sudah terpasang.

**1. Clone repository dan pasang dependensi**

```bash
git clone https://github.com/Ghifariezra/kegiatan-desa-rest-api.git
cd si-kegiatan-desa
npm install
```

**2. Buat database**

```bash
psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE kegiatan_desa;"
```

**3. Buat tabel dan isi data contoh**

```bash
psql -U postgres -h localhost -p 5432 -d kegiatan_desa -f database/schema.sql
psql -U postgres -h localhost -p 5432 -d kegiatan_desa -f database/seed.sql
```

Untuk mengulang dari awal, jalankan `database/reset.sql` terlebih dahulu, lalu ulangi langkah 3.

Cek hasilnya dengan `\dt` di dalam psql. Harus muncul 8 tabel.

**4. Atur file `.env`**

Salin `.env.example` menjadi `.env`, lalu sesuaikan isinya:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=isi_password_postgresql_kamu
DB_NAME=kegiatan_desa
```

File `.env` tidak ikut di-push ke GitHub karena sudah terdaftar di `.gitignore`.

**5. Jalankan server**

```bash
npm run dev
```

Jika berhasil, terminal menampilkan:

```
Server berjalan di http://localhost:3000
Terhubung ke database "kegiatan_desa"
```

Buka `http://localhost:3000` di browser atau Postman untuk melihat daftar resource yang tersedia.

## Endpoint API

Semua resource memiliki 5 route yang sama.

| Metode | URL | Fungsi | Status berhasil |
| --- | --- | --- | --- |
| GET | `/api/{resource}` | Ambil semua data | 200 |
| GET | `/api/{resource}/:id` | Ambil satu data berdasarkan ID | 200 |
| POST | `/api/{resource}` | Tambah data baru | 201 |
| PUT | `/api/{resource}/:id` | Perbarui data (cukup kirim kolom yang berubah) | 200 |
| DELETE | `/api/{resource}/:id` | Hapus data | 200 |

Daftar `{resource}`:

| Resource | Tabel | Keterangan |
| --- | --- | --- |
| `rt` | `rt` | Data RT |
| `warga` | `warga` | Data warga, response menyertakan `nomor_rt` |
| `akun-warga` | `akun_warga` | Akun warga, response menyertakan `nama_lengkap` |
| `kategori-kegiatan` | `kategori_kegiatan` | Kategori kegiatan |
| `lokasi` | `lokasi` | Lokasi kegiatan |
| `kegiatan` | `kegiatan` | Jadwal kegiatan, response menyertakan `nama_kategori` dan `nama_lokasi` |
| `pendaftaran-kegiatan` | `pendaftaran_kegiatan` | Pendaftaran warga, response menyertakan `nama_lengkap` dan `nama_kegiatan` |
| `laporan-kegiatan` | `laporan_kegiatan` | Laporan kegiatan, response menyertakan `nama_kegiatan` |

### Format response

Berhasil (GET semua data):

```json
{
  "status": "success",
  "message": "Berhasil mengambil semua data warga",
  "total": 8,
  "data": [ ... ]
}
```

Berhasil (GET by ID, POST, PUT, DELETE):

```json
{
  "status": "success",
  "message": "Warga berhasil ditambahkan",
  "data": { ... }
}
```

Gagal:

```json
{
  "status": "error",
  "message": "Data tidak valid",
  "errors": [
    { "field": "nik", "message": "nik harus 16 digit angka" }
  ]
}
```

Catatan: kolom bertipe tanggal dikembalikan sebagai teks `YYYY-MM-DD` agar tidak bergeser karena zona waktu. Response DELETE berisi data yang baru dihapus.

### Contoh body

**POST `/api/kegiatan`**

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

**PUT `/api/kegiatan/:id`**

```json
{
  "kuota": 45,
  "deskripsi": "Membersihkan selokan, memangkas pohon rawan tumbang, dan mengecek pintu air"
}
```

**POST `/api/warga`**

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

**POST `/api/akun-warga`**

```json
{
  "warga_id": 1,
  "email": "naila@sukamaju.id",
  "password": "rahasia123",
  "peran": "warga"
}
```

**POST `/api/pendaftaran-kegiatan`**

```json
{ "warga_id": 1, "kegiatan_id": 1 }
```

**POST `/api/laporan-kegiatan`**

```json
{
  "kegiatan_id": 1,
  "ringkasan": "Kegiatan berjalan lancar, warga antusias membersihkan lingkungan.",
  "jumlah_hadir": 42
}
```

## Aturan validasi per resource

Kolom bertanda `*` wajib diisi saat POST. Saat PUT, kirim minimal satu kolom.

| Resource | Kolom dan aturan |
| --- | --- |
| `rt` | `nomor_rt`\* 3 digit angka (contoh `001`), unik; `nama_ketua`\* maksimal 100 karakter |
| `warga` | `rt_id`\*; `nik`\* 16 digit, unik; `nama_lengkap`\* maks. 100; `jenis_kelamin`\* `L` atau `P`; `tanggal_lahir`\* `YYYY-MM-DD`, tidak boleh di masa depan; `no_hp` opsional, format `08...` atau `+628...`; `alamat` opsional |
| `akun-warga` | `warga_id`\* (satu warga satu akun, tidak bisa diubah lewat PUT); `email`\* valid dan unik; `password`\* 8 sampai 72 karakter; `peran` opsional `warga` atau `admin` |
| `kategori-kegiatan` | `nama_kategori`\* maks. 50, unik; `deskripsi` opsional |
| `lokasi` | `nama_lokasi`\* maks. 100; `alamat`\* |
| `kegiatan` | `kategori_id`\*; `lokasi_id`\*; `nama_kegiatan`\* maks. 150; `deskripsi` opsional; `tanggal`\* `YYYY-MM-DD`; `jam_mulai`\* dan `jam_selesai`\* format `HH:MM` (selesai harus lebih besar dari mulai); `kuota`\* lebih dari 0; `status` opsional: `dijadwalkan`, `berlangsung`, `selesai`, `dibatalkan` |
| `pendaftaran-kegiatan` | `warga_id`\*; `kegiatan_id`\*; `status_kehadiran` opsional: `terdaftar`, `hadir`, `tidak_hadir`. Lewat PUT hanya `status_kehadiran` yang bisa diubah |
| `laporan-kegiatan` | `kegiatan_id`\* (satu kegiatan satu laporan, tidak bisa diubah lewat PUT); `ringkasan`\*; `jumlah_hadir` opsional, tidak boleh negatif |

Aturan bisnis tambahan: pendaftaran ke kegiatan ditolak (409) jika status kegiatan bukan `dijadwalkan` atau kuota sudah penuh.

## Penanganan error

| Kondisi | Status |
| --- | --- |
| Kolom wajib kosong, format salah, atau body kosong | 400 |
| Body bukan JSON yang valid | 400 |
| `:id` bukan angka bulat positif | 400 |
| ID referensi (`rt_id`, `kategori_id`, `lokasi_id`, `warga_id`, `kegiatan_id`) tidak ada di database | 400 |
| Data dengan ID tersebut tidak ditemukan | 404 |
| Route tidak dikenal | 404 |
| Data duplikat (NIK, email, nomor RT, nama kategori, dan lainnya) | 409 |
| Warga sudah terdaftar di kegiatan yang sama | 409 |
| Pendaftaran ditutup atau kuota penuh | 409 |
| Data masih dipakai data lain saat DELETE (contoh: warga yang sudah punya akun) | 409 |
| Kesalahan tak terduga di server | 500 |

Error dari PostgreSQL (unique, foreign key, check, not null) diterjemahkan di `src/core/dbError.js` menjadi pesan yang mudah dibaca.

## Pengujian dengan Postman

Base URL: `http://localhost:3000`. Untuk POST dan PUT, pilih **Body → raw → JSON**.

Urutan tes untuk satu resource (contoh `warga`):

| No | Request | Hasil yang diharapkan |
| --- | --- | --- |
| 1 | `POST /api/warga` dengan body di atas | 201, catat `id` dari response |
| 2 | `GET /api/warga` | 200, data baru ada di daftar |
| 3 | `GET /api/warga/{id}` | 200, satu data |
| 4 | `PUT /api/warga/{id}` dengan `{ "no_hp": "089876543210" }` | 200, data berubah |
| 5 | `DELETE /api/warga/{id}` | 200, lalu `GET /api/warga/{id}` menghasilkan 404 |

Tes error yang berguna:

| Tes | Request | Hasil |
| --- | --- | --- |
| ID tidak ada | `GET /api/warga/9999` | 404 |
| ID bukan angka | `GET /api/warga/abc` | 400 |
| Validasi gagal | `POST /api/warga` dengan `"nik": "123"` | 400 |
| Duplikat | `POST /api/warga` dengan NIK yang sama dua kali | 409 |

## Catatan keamanan

- Password disimpan sebagai hash bcrypt, tidak pernah dikembalikan di response.
- Semua query memakai parameter, bukan penggabungan string.
- File `.env` berisi kredensial database dan tidak boleh di-commit.
