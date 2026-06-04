# Rencana Fitur

---

## Fitur 1 — Astronomy Picture of the Day (APOD)

**Role Penanggung Jawab:** `Frontend & Backend`

**Sumber Data:** `Third-Party API — NASA APOD API`

**Deskripsi & Ekspektasi:**

Fitur utama aplikasi yang menampilkan foto atau video astronomi pilihan NASA setiap harinya, lengkap dengan judul, tanggal, penjelasan ilmiah, dan informasi hak cipta.

**Alur Kerja:**
1. Saat halaman dibuka, frontend mengirim request ke endpoint backend `/api/v1/apod`
2. Backend mengecek apakah data hari ini sudah ada di Laravel Cache
3. Jika ada → langsung kembalikan dari cache (hemat kuota API)
4. Jika tidak ada → backend memanggil NASA APOD API, simpan ke cache selama 24 jam, lalu kirim ke frontend
5. Frontend menerima response dan merender konten

**Detail Implementasi Frontend:**
- Tampilkan konten dengan animasi fade-in menggunakan Framer Motion saat halaman pertama kali dimuat
- Deteksi tipe konten dari field `media_type`:
  - Jika `image` → tampilkan sebagai gambar dengan efek parallax saat scroll
  - Jika `video` → embed player YouTube secara responsif
- Sediakan date picker untuk menjelajahi arsip APOD berdasarkan tanggal tertentu (NASA APOD tersedia sejak 16 Juni 1995)
- Batasi pemilihan tanggal maksimal hingga hari ini (tidak bisa pilih tanggal masa depan)
- Tampilkan informasi lengkap: judul, tanggal, penjelasan ilmiah, dan copyright (jika ada)
- Tombol bookmark di pojok konten untuk menyimpan ke daftar favorit (terintegrasi dengan Fitur 5)
- Tombol share untuk membagikan APOD ke teman (terintegrasi dengan Fitur 5)
- Tampilkan skeleton loading saat data sedang dimuat

**Detail Implementasi Backend:**
- Buat `ApodController.php` dengan method `index()`
- Terima query parameter `date` (opsional, format `YYYY-MM-DD`)
- Validasi: pastikan tanggal tidak melebihi hari ini dan tidak sebelum 1995-06-16
- Gunakan Guzzle HTTP untuk memanggil `https://api.nasa.gov/planetary/apod`
- Cache response dengan key `apod_{date}` selama 24 jam menggunakan `Cache::remember()`
- Return response terstruktur dengan status, data, dan pesan error jika gagal

---

## Fitur 2 — ISS Real-Time Tracker

**Role Penanggung Jawab:** `Frontend & Backend`

**Sumber Data:** `Third-Party API — Open Notify API / Where the ISS At API`

**Deskripsi & Ekspektasi:**

Melacak posisi Stasiun Luar Angkasa Internasional (ISS) secara real-time di atas peta dunia interaktif. Pengguna dapat melihat ISS bergerak di peta, lengkap dengan data ketinggian, kecepatan, dan koordinat terkini — mirip seperti platform ISS tracker yang banyak digunakan.

**Alur Kerja:**
1. Halaman dibuka → frontend memuat peta dunia menggunakan React-Leaflet + OpenStreetMap (gratis, tanpa API key)
2. Frontend melakukan polling ke backend setiap **5 detik** untuk mengambil posisi terkini ISS
3. Backend memanggil `https://api.wheretheiss.at/v1/satellites/25544` dan mengembalikan data posisi
4. Frontend memperbarui posisi marker ISS di peta secara smooth
5. Garis orbit ISS digambar sebagai polyline di peta menggunakan riwayat posisi beberapa titik terakhir

**Detail Implementasi Frontend:**
- Gunakan library **React-Leaflet** untuk render peta interaktif
- Gunakan tile OpenStreetMap sebagai basemap (gratis, tanpa API key)
- Tampilkan marker ISS dengan icon custom (gambar ISS atau ikon roket)
- Marker bergerak mengikuti posisi terbaru setiap 5 detik
- Gambar jejak orbit ISS dengan polyline (simpan riwayat 20 titik posisi terakhir)
- Panel informasi di samping/bawah peta menampilkan:
  - Latitude & Longitude terkini
  - Ketinggian (altitude) dalam km
  - Kecepatan (velocity) dalam km/jam
  - Timestamp terakhir diperbarui
- Tombol "Ikuti ISS" yang otomatis memusatkan peta ke posisi ISS terkini
- Tampilan responsif untuk mobile dan desktop

**Detail Implementasi Backend:**
- Buat `IssController.php` dengan method `position()`
- Panggil `https://api.wheretheiss.at/v1/satellites/25544` menggunakan Guzzle
- Cache response selama **5 detik** saja (karena data real-time)
- Return data: latitude, longitude, altitude, velocity, timestamp
- Jika API eksternal gagal, kembalikan pesan error yang informatif

---

## Fitur 3 — Near Earth Object Tracker (Asteroid)

**Role Penanggung Jawab:** `Frontend & Backend`

**Sumber Data:** `Third-Party API — NASA NeoWs (Near Earth Object Web Service)`

**Deskripsi & Ekspektasi:**

Menampilkan daftar asteroid yang mendekati Bumi dalam rentang waktu tertentu, lengkap dengan data ilmiah seperti ukuran, kecepatan, jarak, dan status potensi bahaya. Dirancang agar informasi yang kompleks dapat dipahami secara visual oleh pengguna awam sekalipun.

**Alur Kerja:**
1. Halaman dibuka → tampil data asteroid untuk 7 hari ke depan secara default
2. Frontend request ke backend `/api/v1/asteroids?start_date=...&end_date=...`
3. Backend memanggil NASA NeoWs API, format ulang data, dan kembalikan ke frontend
4. Frontend render tabel interaktif dan visualisasi
5. Pengguna dapat mengubah rentang tanggal (maks. 7 hari per request, sesuai batas NASA API)

**Detail Implementasi Frontend:**
- Tampilkan total asteroid yang ditemukan dalam rentang tanggal tersebut
- Tabel interaktif dengan kolom: nama, diameter estimasi, kecepatan, jarak terdekat ke Bumi, tanggal pendekatan, dan status bahaya
- Highlight baris dengan warna merah/oranye untuk asteroid yang berstatus **potentially hazardous**
- Filter: tampilkan hanya yang berbahaya / semua
- Urutkan (sort) berdasarkan jarak terdekat, ukuran, atau kecepatan
- Visualisasi sederhana: bar atau lingkaran yang merepresentasikan jarak asteroid relatif terhadap jarak Bumi-Bulan
- Date range picker untuk memilih rentang tanggal (dibatasi maksimal 7 hari)
- Tombol bookmark untuk menyimpan data asteroid tertentu

**Detail Implementasi Backend:**
- Buat `AsteroidController.php` dengan method `index()`
- Validasi: `end_date - start_date` tidak boleh melebihi 7 hari
- Panggil `https://api.nasa.gov/neo/rest/v1/feed` dengan parameter tanggal
- Format ulang respons NASA yang kompleks menjadi struktur yang lebih sederhana dan konsisten
- Cache response per kombinasi tanggal selama 1 jam
- Ekstrak field penting: nama, id, diameter (min & max dalam km), kecepatan (km/jam), jarak (km & lunar), tanggal pendekatan, is_potentially_hazardous

---

## Fitur 4 — Earth from Space (EPIC)

**Role Penanggung Jawab:** `Frontend & Backend`

**Sumber Data:** `Third-Party API — NASA EPIC API`

**Deskripsi & Ekspektasi:**

Menampilkan koleksi foto Bumi dari luar angkasa yang diambil oleh kamera EPIC (Earth Polychromatic Imaging Camera) milik NASA yang terpasang pada wahana DSCOVR. Pengguna dapat menjelajahi foto berdasarkan tanggal dan melihat Bumi berputar seolah-olah secara nyata.

**Alur Kerja:**
1. Halaman dibuka → backend mengambil daftar foto EPIC terbaru dari NASA
2. Backend menyusun URL gambar lengkap dari metadata yang diterima
3. Frontend menampilkan galeri foto dengan informasi detail
4. Pengguna dapat berpindah tanggal untuk melihat foto dari hari berbeda

**Detail Implementasi Frontend:**
- Tampilkan galeri foto EPIC dalam grid responsif
- Setiap card menampilkan: thumbnail foto, tanggal & waktu pengambilan (UTC), dan koordinat sentroid (latitude & longitude)
- Klik foto → buka modal/lightbox dengan foto resolusi penuh
- Di dalam modal, tampilkan informasi lengkap:
  - Caption dari NASA
  - Koordinat di mana Bumi difoto dari sudut pandang DSCOVR
  - Jarak DSCOVR ke Bumi saat foto diambil
- Date picker untuk berpindah ke tanggal lain (NASA EPIC tersedia mulai Juni 2015)
- Fitur animasi: tampilkan urutan foto dalam satu hari sebagai slideshow otomatis untuk mensimulasikan rotasi Bumi
- Tombol bookmark untuk menyimpan foto EPIC favorit

**Detail Implementasi Backend:**
- Buat `EpicController.php` dengan method `index()`
- Terima query parameter `date` (opsional, format `YYYY-MM-DD`)
- Jika tanpa date → ambil koleksi terbaru (`/api/EPIC/api/natural/latest`)
- Jika ada date → ambil berdasarkan tanggal (`/api/EPIC/api/natural/date/{date}`)
- Susun URL gambar lengkap dari metadata: `https://epic.gsfc.nasa.gov/archive/natural/{yyyy}/{mm}/{dd}/png/{image_name}.png`
- Cache response per tanggal selama 6 jam
- Return: identifier, caption, date, image_url, centroid_coordinates, dscovr_j2000_position

---

## Fitur 5 — Autentikasi, Bookmark & Share Konten

**Role Penanggung Jawab:** `Backend (logika) & Frontend (UI)`

**Sumber Data:** `Internal System`

**Deskripsi & Ekspektasi:**

Sistem manajemen akun pengguna yang mencakup registrasi, login, pengelolaan konten favorit (bookmark), dan kemampuan berbagi konten ke orang lain melalui tautan unik yang dapat di-embed atau dibagikan ke media sosial dengan tampilan preview otomatis.

**Alur Kerja Autentikasi:**
1. Pengguna membuka halaman Register → isi nama, email, password
2. Backend membuat akun, generate token Laravel Sanctum
3. Token disimpan di `localStorage` frontend
4. Setiap request selanjutnya menyertakan token di header `Authorization: Bearer <token>`
5. Untuk logout → backend menghapus token, frontend menghapus token dari localStorage

**Detail Implementasi Autentikasi — Frontend:**
- Halaman Register: form nama, email, password, konfirmasi password
- Halaman Login: form email dan password
- Validasi form di sisi frontend sebelum dikirim (field kosong, format email, panjang password minimal 8 karakter)
- Simpan token di localStorage setelah login berhasil
- Redirect otomatis ke halaman utama setelah login
- Protected routes: halaman Bookmark dan Profil hanya bisa diakses jika sudah login
- Navbar berubah: tampilkan nama user dan tombol Logout jika sudah login

**Detail Implementasi Autentikasi — Backend:**
- `AuthController.php` dengan method: `register()`, `login()`, `logout()`, `me()`
- Validasi input: email unik, password minimal 8 karakter
- Gunakan Laravel Sanctum untuk generate dan revoke token
- Middleware `auth:sanctum` untuk melindungi endpoint yang membutuhkan login

**Alur Kerja Bookmark:**
1. Pengguna yang sudah login menekan tombol bookmark pada konten manapun (APOD, ISS, Asteroid, EPIC)
2. Frontend mengirim request POST ke `/api/v1/bookmarks` dengan data konten
3. Backend menyimpan ke tabel `bookmarks` milik user tersebut
4. Tombol bookmark berubah tampilan menjadi aktif/terisi
5. Di halaman Bookmark, semua konten yang disimpan ditampilkan dalam satu tempat

**Detail Implementasi Bookmark — Frontend:**
- Tombol bookmark ada di setiap konten (APOD, asteroid, foto EPIC)
- State bookmark disinkronkan: jika sudah di-bookmark, ikon tampil solid/aktif
- Halaman `/bookmark` menampilkan semua konten yang disimpan, dikelompokkan per tipe
- Fitur hapus bookmark langsung dari halaman bookmark

**Detail Implementasi Bookmark — Backend:**
- `BookmarkController.php` dengan method: `index()`, `store()`, `destroy()`
- Tabel `bookmarks`: id, user_id, type (apod/asteroid/epic), title, reference_date, thumbnail_url, metadata (JSON), created_at
- Validasi: satu user tidak bisa bookmark konten yang sama dua kali

**Alur Kerja Share Konten:**
1. Pengguna menekan tombol "Share" pada konten tertentu
2. Backend generate URL unik: `https://nebula.app/share/{type}/{id_atau_date}`
3. Halaman share memiliki meta tag Open Graph lengkap (title, description, image) agar tampil sebagai preview card saat dibagikan ke WhatsApp, Twitter/X, Telegram, dll.
4. Pengguna dapat menyalin link share, atau menyalin embed code (iframe) untuk disisipkan ke website lain

**Detail Implementasi Share — Frontend:**
- Tombol "Share" di setiap konten
- Modal share muncul dengan 3 opsi:
  - **Salin Link**: copy URL unik ke clipboard
  - **Bagikan ke sosmed**: tombol shortcut untuk WhatsApp, Twitter/X, Telegram
  - **Embed Code**: tampilkan kode `<iframe>` siap pakai untuk disematkan ke website lain
- Halaman publik `/share/{type}/{slug}` dapat diakses tanpa login
- Halaman ini menampilkan konten yang dibagikan dengan tampilan yang bersih dan menarik

**Detail Implementasi Share — Backend:**
- Endpoint `GET /api/v1/share/{type}/{slug}` yang mengembalikan data konten beserta meta Open Graph
- Generate Open Graph tags: `og:title`, `og:description`, `og:image`, `og:url`
- Tidak memerlukan autentikasi (publik)

---

## Fitur 6 — CI/CD Pipeline & Deployment Otomatis

**Role Penanggung Jawab:** `DevOps`

**Sumber Data:** `Internal System`

**Deskripsi & Ekspektasi:**

Mengotomasi proses build dan deployment seluruh aplikasi menggunakan GitHub Actions, sehingga setiap perubahan kode yang di-push ke branch utama langsung terdeploy ke lingkungan produksi tanpa proses manual. Frontend dideploy ke Vercel, backend dideploy ke Render.

**Alur Kerja CI/CD:**
1. Developer melakukan push atau merge ke branch `main`
2. GitHub Actions otomatis terpicu
3. Pipeline frontend berjalan: build React + deploy ke Vercel
4. Pipeline backend berjalan: deploy Laravel ke Render
5. Jika ada langkah yang gagal → pipeline berhenti dan mengirim notifikasi ke GitHub

**Detail Implementasi — GitHub Actions Frontend (`.github/workflows/frontend.yml`):**
- Trigger: push ke branch `main` yang mengubah file di folder `frontend/`
- Steps:
  1. Checkout repository
  2. Setup Node.js versi terbaru
  3. Install dependencies (`npm install`) di folder `frontend/`
  4. Build project (`npm run build`)
  5. Deploy hasil build ke Vercel menggunakan Vercel CLI atau Vercel GitHub Integration
- Environment variable: `VITE_API_URL` (URL backend Render) disimpan di GitHub Secrets

**Detail Implementasi — GitHub Actions Backend (`.github/workflows/backend.yml`):**
- Trigger: push ke branch `main` yang mengubah file di folder `backend/`
- Steps:
  1. Checkout repository
  2. Setup PHP 8.2
  3. Install dependencies (`composer install --no-dev --optimize-autoloader`) di folder `backend/`
  4. Deploy ke Render menggunakan Render Deploy Hook (URL webhook unik dari dashboard Render)
- Environment variable: seluruh isi `.env` production disimpan di GitHub Secrets dan di-set di dashboard Render

**Detail Pengelolaan Environment Variable:**
- **Development** → file `.env` lokal di masing-masing mesin developer (tidak di-push ke GitHub)
- **Production** → disimpan di:
  - Dashboard Vercel (untuk variabel frontend seperti `VITE_API_URL`)
  - Dashboard Render (untuk variabel backend seperti `NASA_API_KEY`, `DB_HOST`, `DB_PASSWORD`, dll.)
- File `.env.example` di-push ke GitHub sebagai referensi variabel apa saja yang dibutuhkan (tanpa nilai sensitif)

**Branching Strategy:**
- `main` → branch production, setiap push otomatis deploy
- `develop` → branch pengembangan aktif, untuk integrasi fitur dari masing-masing developer
- Feature branch: `feature/nama-fitur` → selesai dikerjakan lalu di-merge ke `develop`

