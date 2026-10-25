import AppError from './AppError.js';

// Nama constraint sesuai database/schema.sql.
// Constraint tanpa nama eksplisit memakai pola bawaan PostgreSQL: <tabel>_<kolom>_key.
const PESAN_CONSTRAINT = {
    rt_nomor_rt_key: 'nomor_rt sudah terdaftar',
    warga_nik_key: 'nik sudah terdaftar',
    akun_warga_email_key: 'email sudah dipakai',
    akun_warga_warga_id_key: 'warga ini sudah punya akun',
    kategori_kegiatan_nama_kategori_key: 'nama_kategori sudah ada',
    laporan_kegiatan_kegiatan_id_key: 'kegiatan ini sudah punya laporan',
    uq_pendaftaran_warga_kegiatan: 'warga sudah terdaftar pada kegiatan ini',

    fk_warga_rt: 'rt_id tidak ditemukan',
    fk_akun_warga: 'warga_id tidak ditemukan',
    fk_kegiatan_kategori: 'kategori_id tidak ditemukan',
    fk_kegiatan_lokasi: 'lokasi_id tidak ditemukan',
    fk_pendaftaran_warga: 'warga_id tidak ditemukan',
    fk_pendaftaran_kegiatan: 'kegiatan_id tidak ditemukan',
    fk_laporan_kegiatan: 'kegiatan_id tidak ditemukan',

    chk_warga_jenis_kelamin: "jenis_kelamin harus 'L' atau 'P'",
    chk_akun_peran: "peran harus 'warga' atau 'admin'",
    chk_kegiatan_kuota: 'kuota harus lebih dari 0',
    chk_kegiatan_jam: 'jam_selesai harus lebih besar dari jam_mulai',
    chk_kegiatan_status: 'status tidak valid',
    chk_pendaftaran_status: 'status_kehadiran tidak valid',
    chk_laporan_jumlah_hadir: 'jumlah_hadir tidak boleh negatif',
};

// Menerjemahkan error PostgreSQL menjadi AppError. Error lain dikembalikan apa adanya.
export function toAppError(err) {
    if (err instanceof AppError) return err;

    const pesan = PESAN_CONSTRAINT[err.constraint];

    switch (err.code) {
        case '23505': // unique_violation
            return new AppError(409, pesan ?? 'Data duplikat');
        case '23503': // foreign_key_violation
            if (err.detail?.includes('is still referenced')) {
                return new AppError(409, 'Data masih dipakai oleh data lain, hapus data terkait terlebih dahulu');
            }
            return new AppError(400, pesan ?? 'Data referensi tidak ditemukan');
        case '23514': // check_violation
            return new AppError(400, pesan ?? 'Data tidak memenuhi aturan database');
        case '23502': // not_null_violation
            return new AppError(400, `${err.column} tidak boleh kosong`);
        case '22001': // string terlalu panjang
        case '22003':
        case '22007':
        case '22008':
        case '22P02':
            return new AppError(400, 'Format data tidak valid, periksa tanggal, jam, atau angka');
        default:
            return err;
    }
}