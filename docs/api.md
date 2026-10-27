# API

## API endpoints

All resources have the same 5 routes.

| Method | URL | Purpose | Success status |
| --- | --- | --- | --- |
| GET | `/api/{resource}` | Get all records | 200 |
| GET | `/api/{resource}/:id` | Get one record by ID | 200 |
| POST | `/api/{resource}` | Add a new record | 201 |
| PUT | `/api/{resource}/:id` | Update a record (only send the columns that change) | 200 |
| DELETE | `/api/{resource}/:id` | Delete a record | 200 |

| Resource | Table | Response notes | GET all ordering |
| --- | --- | --- | --- |
| `rt` | `rt` | RT data | `nomor_rt` |
| `warga` | `warga` | Includes `nomor_rt` | `nama_lengkap` |
| `akun-warga` | `akun_warga` | Includes `nama_lengkap`, without `password_hash` | `id` |
| `kategori-kegiatan` | `kategori_kegiatan` | Activity categories | `nama_kategori` |
| `lokasi` | `lokasi` | Activity locations | `nama_lokasi` |
| `kegiatan` | `kegiatan` | Includes `nama_kategori` and `nama_lokasi` | `tanggal`, then `jam_mulai` |
| `pendaftaran-kegiatan` | `pendaftaran_kegiatan` | Includes `nama_lengkap` and `nama_kegiatan` | `tanggal_daftar`, newest first |
| `laporan-kegiatan` | `laporan_kegiatan` | Includes `nama_kegiatan` | `created_at`, newest first |

GET all returns every row, without pagination.

### Response format

> [!NOTE]
> The `message` texts and validation error messages returned by the API are in Indonesian (for example `Data tidak valid` means "Invalid data"). They are shown as-is in the examples below.

<details>
<summary><b>Success, GET all</b></summary>

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
<summary><b>Success, GET by ID, POST, PUT, and DELETE</b></summary>

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

The DELETE response contains the record that was just deleted.

</details>

<details>
<summary><b>Failure</b></summary>

```json
{
  "status": "error",
  "message": "Data tidak valid",
  "errors": [
    { "field": "nik", "message": "nik harus 16 digit angka" }
  ]
}
```

The `errors` field only appears on Zod validation failures (400). Other errors, such as 404 and 409, only contain `status` and `message`. For failures on `:id`, `field` is `id`. For a PUT with an empty body, `field` is `body`.

</details>

> [!NOTE]
> Date columns are returned as `YYYY-MM-DD` text. `TIMESTAMP` columns (such as `created_at`) are returned in ISO format.

### Request body examples

<details>
<summary><b>POST /api/warga</b></summary>

```json
{
  "rt_id": 1,
  "nik": "3201012509990001",
  "nama_lengkap": "Rina Wulandari",
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
  "email": "rina@sukamaju.id",
  "password": "rahasia123",
  "peran": "warga"
}
```

PUT: `{ "email": "Rina.W@sukamaju.id", "peran": "admin" }`. To change the password, also send `password` (it will be re-hashed). `warga_id` cannot be changed, and the email is always stored in lowercase.

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

PUT: `{ "jumlah_hadir": 45 }`. Activity id 4 in the sample data already has a report, so use another activity.

</details>

<details>
<summary><b>POST /api/rt, /api/kategori-kegiatan, and /api/lokasi</b></summary>

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

## Validation rules

Columns marked with `*` are required on POST. On PUT, send at least one known column (except `pendaftaran-kegiatan`, which must send `status_kehadiran`).

| Resource | Columns and rules |
| --- | --- |
| `rt` | `nomor_rt`\* 3 digits (example `001`), unique; `nama_ketua`\* up to 100 characters |
| `warga` | `rt_id`\*; `nik`\* 16 digits, unique; `nama_lengkap`\* max. 100; `jenis_kelamin`\* `L` or `P`; `tanggal_lahir`\* `YYYY-MM-DD`, must be a valid date and not in the future; `no_hp` optional, format `08...`, `628...`, or `+628...`; `alamat` optional |
| `akun-warga` | `warga_id`\* (one resident, one account; cannot be changed through PUT); `email`\* valid, max. 100, unique, stored in lowercase; `password`\* 8 to 72 characters, stored as a bcrypt hash; `peran` optional `warga` (default) or `admin` |
| `kategori-kegiatan` | `nama_kategori`\* max. 50, unique; `deskripsi` optional |
| `lokasi` | `nama_lokasi`\* max. 100; `alamat`\* |
| `kegiatan` | `kategori_id`\*; `lokasi_id`\*; `nama_kegiatan`\* max. 150; `deskripsi` optional; `tanggal`\* `YYYY-MM-DD` and valid; `jam_mulai`\* and `jam_selesai`\* in `HH:MM` format (end must be later than start); `kuota`\* integer greater than 0; `status` optional: `dijadwalkan` (default), `berlangsung`, `selesai`, `dibatalkan` |
| `pendaftaran-kegiatan` | `warga_id`\*; `kegiatan_id`\*; `status_kehadiran` optional: `terdaftar` (default), `hadir`, `tidak_hadir`. Through PUT only `status_kehadiran` can be changed |
| `laporan-kegiatan` | `kegiatan_id`\* (one activity, one report; cannot be changed through PUT); `ringkasan`\*; `jumlah_hadir` optional, integer that cannot be negative (default 0) |

General rules:

- Unknown columns in the body are ignored and do not cause an error. Because of this, sending `warga_id` through PUT `akun-warga` changes nothing. If `warga_id` is the only column sent, the result is 400 because there is no known column.
- Text is trimmed automatically, except `password`. On the optional `deskripsi` and `alamat` (warga) columns, an empty string is stored as `NULL`.
- The `:id` parameter must be a positive integer with no leading zeros. IDs above PostgreSQL's `INTEGER` limit (2147483647) return 400.

**Registration business rules:** on POST, a registration is rejected (409) if the activity status is not `dijadwalkan`, the number of registrants has reached the quota, or the resident is already registered for the same activity. If `kegiatan_id` does not exist, the result is 400. These rules are only checked on POST, not on PUT.

## Error handling

| Condition | Status |
| --- | --- |
| Required column missing, wrong format, or empty body | 400 |
| Body is not valid JSON | 400 |
| `:id` is not a positive integer, or exceeds the `INTEGER` limit | 400 |
| Referenced ID (`rt_id`, `kategori_id`, `lokasi_id`, `warga_id`, `kegiatan_id`) does not exist in the database | 400 |
| Data rejected by a database constraint, for example a PUT on `kegiatan` that sends only one time and so violates `jam_selesai > jam_mulai` | 400 |
| Date, time, or number format rejected by PostgreSQL | 400 |
| No record with that ID | 404 |
| Unknown route | 404 |
| Duplicate data (NIK, email, RT number, category name, resident already has an account, activity already has a report) | 409 |
| Resident already registered for the same activity | 409 |
| Registration closed or quota full | 409 |
| Deleting an RT, category, or location still used by other data | 409 |
| Unexpected server error | 500 |