# TaskSphere — Premium Task & Project CRUD Manager

TaskSphere adalah aplikasi manajemen tugas (To-Do List) dan proyek pribadi dengan tampilan modern premium yang mengusung gaya **Glassmorphism**, palet warna **HSL kustom**, **real-time dashboard stats**, serta didukung oleh backend **Express.js** dan database relasional **SQLite**.

---

## 📝 Latar Belakang Proyek

Di era digital yang serba cepat, pengelolaan waktu dan produktivitas menjadi kunci utama dalam mencapai keberhasilan. Banyak aplikasi pengelola tugas (to-do list) di luar sana yang fungsional, tetapi sering kali mengabaikan aspek estetika dan pengalaman pengguna (*User Experience* / UX) yang menyenangkan. Tampilan yang monoton dapat menurunkan motivasi pengguna dalam mengelola rencana mereka.

**TaskSphere** lahir sebagai solusi untuk menjembatani fungsionalitas manajemen tugas yang andal dengan **desain visual kelas atas (premium)**. Proyek ini awalnya dirancang sebagai aplikasi client-side murni berbasis `localStorage`. Namun, seiring dengan kebutuhan akan persistensi data yang lebih aman, terpusat, dan andal, proyek ini ditingkatkan dengan mengintegrasikan server backend modern berbasis **Node.js/Express** dan database relasional **SQLite**.

Dengan TaskSphere, mengelola tugas harian bukan lagi sebuah rutinitas yang membosankan, melainkan sebuah pengalaman interaktif yang memanjakan mata melalui efek transisi halus, mode gelap (*dark-mode*) yang elegan, dan kontrol penyaringan tugas yang sangat dinamis.

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
    *   **Runtime:** Node.js (v22.x+)
    *   **Web Framework:** Express.js (RESTful API kustom)
    *   **Database:** SQLite3 (`database.sqlite`)

---

## 🚀 Cara Menjalankan Aplikasi di Komputer Anda

### 1. Prasyarat
Pastikan Anda sudah menginstal [Node.js](https://nodejs.org/) (versi 18 ke atas) di komputer Anda.

### 2. Kloning Repositori
```bash
git clone https://github.com/Darjeelingggg/Simple-Crud-Web.git
cd Simple-Crud-Web
```

### 3. Instal Dependensi
Unduh paket server Express dan driver SQLite dengan menjalankan:
```bash
npm install
```

### 4. Mulai Server & Database
Jalankan perintah tunggal berikut untuk menyalakan database dan server:
```bash
npm start
```

### 5. Buka di Browser
Buka browser favorit Anda dan kunjungi:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 👤 Kontributor
*   **RaihannAM** (reyhanmaulanayea@gmail.com) — [Darjeelingggg](https://github.com/Darjeelingggg)
