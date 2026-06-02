# TaskSphere — Premium Task & Project CRUD Manager

## 1.3 Deskripsi Aplikasi

Aplikasi TaskSphere ini berfungsi sebagai pengelola tugas (task manager) premium daring yang memungkinkan pengguna untuk mengirimkan (membuat), melihat, memperbarui (mengedit), dan menghapus tugas secara interaktif tanpa perlu melakukan proses autentikasi atau pendaftaran akun terlebih dahulu. Aplikasi ini mengusung gaya modern Glassmorphism dengan palet warna HSL kustom dan dashboard statistik real-time untuk meningkatkan pengalaman pengguna (UX) dalam mengelola rencana mereka secara visual.

Link: https://github.com/Darjeelingggg/Simple-Crud-Web

Teknologi yang Digunakan:

*   **Frontend:** HTML5 Semantik, Vanilla CSS3 (Custom styling untuk tata letak halaman kustom, glassmorphic backdrop, priority badges, stats panel, dialog modal, notifikasi toast, dan animasi transisi kustom), dan Vanilla JavaScript (ES Modules untuk render DOM dinamis, dynamic stats, pencarian dengan debounce, filter kategori dinamis, dan sinkronisasi cache memori frontend).
*   **Backend:** PHP Native (Memproses operasi API RESTful asinkron di latar belakang untuk penambahan, pembacaan, pembaruan, dan penghapusan tugas/CRUD secara murni tanpa framework).
*   **Database:** SQLite (Menggunakan PDO / PHP Data Objects di PHP untuk mengelola koneksi database secara aman dengan struktur tabel bernama `tasks` yang menyimpan kolom `id`, `title`, `description`, `priority`, `category`, `dueDate`, `completed`, dan `createdAt`).

---

## ✨ Fitur Utama

1.  **Sistem CRUD Lengkap & Interaktif:**
    *   **Create:** Tambah tugas baru dengan detail judul, deskripsi, kategori kustom, tenggat waktu, dan tingkat prioritas (*High*, *Medium*, *Low*).
    *   **Read:** Daftar tugas ditampilkan dalam bentuk grid kartu yang indah dengan animasi masuk (*staggered animations*).
    *   **Update:** Edit tugas secara instan, serta tandai tugas selesai (*completed*) melalui checkbox interaktif.
    *   **Delete & Undo:** Hapus tugas dengan animasi keluar yang halus (*slide-out*), dilengkapi tombol **"Undo"** di notifikasi toast untuk memulihkan tugas yang tidak sengaja terhapus.
2.  **Dashboard Statistik Real-Time:**
    *   Panel statistik dinamis yang melacak jumlah tugas aktif, tugas selesai, dan persentase progres total proyek dalam bentuk bar progres yang teranimasi.
3.  **Pusat Kontrol (Pencarian, Filter, & Sortir):**
    *   **Pencarian Teks:** Pencarian instan berbasis judul dan deskripsi dengan sistem *debounce* untuk performa ketikan yang mulus.
    *   **Penyaringan Kategori:** Kategori dideteksi secara otomatis dari data tugas yang ada dan ditampilkan sebagai filter dinamis.
    *   **Penyaringan Prioritas:** Filter tugas berdasarkan tingkat kepentingan.
    *   **Pengurutan Pintar:** Urutkan berdasarkan tenggat waktu terdekat, tingkat prioritas tertinggi, atau tanggal pembuatan terbaru.
4.  **Notifikasi Toast Premium:**
    *   Umpan balik visual instan dalam bentuk kartu notifikasi (*toast*) di pojok layar untuk setiap aksi berhasil atau eror.
5.  **Arsitektur Dual-Layer State Management:**
    *   **Mutasi Asinkron:** Operasi penulisan ke database SQLite (`POST`, `PUT`, `DELETE`) berjalan secara asinkron di latar belakang.
    *   **Render Instan (Synchronous Cache):** Data tugas di-cache di memori frontend sehingga fungsi penyaringan, pencarian, dan render visual berjalan seketika tanpa lag pemrosesan.

---

## 🛠️ Arsitektur & Teknologi

*   **Frontend:**
    *   **Struktur:** HTML5 Semantik untuk SEO dan aksesibilitas yang baik.
    *   **Gaya (Styling):** Vanilla CSS3 dengan arsitektur variabel HSL, blur kaca (*glassmorphic backdrop*), efek cahaya neon, dan animasi kustom.
    *   **Logika:** Vanilla Javascript (ES Modules / JS Modern) terbagi menjadi `app.js` (entry point), `state.js` (state manager), dan `ui.js` (render DOM).
*   **Backend & Database:**
    *   **Runtime:** PHP (v8.0 atau yang lebih baru)
    *   **Web Server / Framework:** Built-in PHP Development Server (Murni Native PHP tanpa Framework / Tanpa Laravel)
    *   **Database:** SQLite melalui PDO (PHP Data Objects) — sangat mudah diganti ke MySQL.

---

## 🚀 Cara Menjalankan Aplikasi di Komputer Anda

### 1. Prasyarat
Pastikan Anda sudah menginstal **PHP** (versi 8.0 ke atas) di komputer Anda.

### 2. Kloning Repositori
```bash
git clone https://github.com/Darjeelingggg/Simple-Crud-Web.git
cd Simple-Crud-Web
```

### 3. Mulai Server & Database
Jalankan server PHP bawaan melalui terminal di folder proyek dengan perintah berikut:
```bash
php -S localhost:8000
```
*(Database `database.sqlite` dan struktur tabel akan diinisialisasi secara otomatis saat server dinyalakan pertama kali).*

### 4. Buka di Browser
Buka browser favorit Anda dan kunjungi:
👉 **[http://localhost:8000](http://localhost:8000)**

---

## 👤 Kontributor
*   **RaihannAM** (reyhanmaulanayea@gmail.com) — [Darjeelingggg](https://github.com/Darjeelingggg)
