# Identitas Kelompok

---

**Nama Proyek / Aplikasi:** `Nebula — Platform Eksplorasi Luar Angkasa Interaktif`

**Jumlah Anggota:** `3` orang

**Repositori:** `https://github.com/ahmadfaiz2/Nebula`

---

## Anggota & Role

**Anggota 1**
- Nama Lengkap: `Ahmad Faiz`
- NIM: `230705067`
- Role: `Frontend Developer`
- Teknologi: `React, Vite, Tailwind CSS, Framer Motion, Axios`

**Anggota 2**
- Nama Lengkap: `Budi Santoso`
- NIM: `2201002`
- Role: `Backend Developer`
- Teknologi: `Laravel 13, Supabase (PostgreSQL), Laravel Sanctum, Guzzle HTTP, Laravel Cache`

**Anggota 3**
- Nama Lengkap: `Citra Dewi`
- NIM: `2201003`
- Role: `DevOps Engineer`
- Teknologi: `GitHub Actions, Vercel, Render`

---

## Stack Teknologi

**Frontend:** `React + Vite`
*(Tailwind CSS untuk styling, Framer Motion untuk animasi, Axios untuk HTTP request ke backend)*

**Backend:** `Laravel 13` *(wajib)*
*(Laravel Sanctum untuk autentikasi, Guzzle HTTP untuk konsumsi NASA API, Laravel Cache untuk caching response)*

**Database:** `Supabase (PostgreSQL)`
*(Managed database dari Supabase, diakses oleh Laravel melalui koneksi PostgreSQL)*

**DevOps / Infrastruktur:** `GitHub Actions, Vercel (frontend), Render (backend)`

---

## Arsitektur Aplikasi

Nebula terdiri dari satu aplikasi frontend dan satu aplikasi backend yang saling berkomunikasi.
Frontend mengambil seluruh data melalui REST API yang disediakan backend. Backend bertindak sebagai
perantara antara frontend dan NASA API, sekaligus mengelola autentikasi pengguna dan data internal
yang tersimpan di Supabase.

**Aplikasi 1 — Frontend**
- Nama Aplikasi: `Nebula Web`
- Deskripsi Singkat: `Antarmuka pengguna berbasis React + Vite yang menampilkan data luar angkasa secara interaktif dan visual, termasuk galeri foto, animasi, dan tracker asteroid secara real-time.`
- Berkomunikasi dengan: `Nebula API (Backend Laravel)`

**Aplikasi 2 — Backend (Laravel)**
- Nama Aplikasi / Service: `Nebula API`
- Deskripsi Singkat: `Layanan REST API berbasis Laravel 13 yang mengelola autentikasi pengguna, mengonsumsi NASA API, menyimpan data bookmark ke Supabase, dan menyediakan seluruh data yang dibutuhkan frontend.`
- Menyediakan layanan untuk: `Nebula Web (Frontend)`
