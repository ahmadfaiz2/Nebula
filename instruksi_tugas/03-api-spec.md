# API Specification

> Dokumentasi seluruh endpoint yang dikembangkan pada backend Nebula API (Laravel)
> maupun yang dikonsumsi dari layanan eksternal.

---

## Register Pengguna

**Method:** `POST`

**URL:** `/api/v1/auth/register`

**Deskripsi:** Mendaftarkan pengguna baru ke dalam sistem menggunakan nama, email, dan password.

**Autentikasi Diperlukan:** `Tidak`

**Sumber:** `Internal System`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "password_confirmation": "string"
}
```

**Response Sukses (`201 Created`):**
```json
{
  "status": "success",
  "message": "Registrasi berhasil",
  "data": {
    "user": {
      "id": 1,
      "name": "Ahmad Faiz",
      "email": "ahmadfaiz@example.com"
    },
    "token": "<sanctum_token>"
  }
}
```

**Response Gagal (`422 Unprocessable Entity`):**
```json
{
  "status": "error",
  "message": "Email sudah digunakan"
}
```

---

## Login Pengguna

**Method:** `POST`

**URL:** `/api/v1/auth/login`

**Deskripsi:** Mengautentikasi pengguna dan mengembalikan token akses untuk sesi berikutnya.

**Autentikasi Diperlukan:** `Tidak`

**Sumber:** `Internal System`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response Sukses (`200 OK`):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": 1,
      "name": "Ahmad Faiz",
      "email": "ahmadfaiz@example.com"
    },
    "token": "<sanctum_token>"
  }
}
```

**Response Gagal (`401 Unauthorized`):**
```json
{
  "status": "error",
  "message": "Email atau password salah"
}
```

---

## Get Current User (Me)

**Method:** `GET`

**URL:** `/api/v1/auth/me`

**Deskripsi:** Mengambil data pengguna yang sedang login berdasarkan token yang dikirim.

**Autentikasi Diperlukan:** `Ya`

**Sumber:** `Internal System`

**Request Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:** `-`

**Response Sukses (`200 OK`):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": 1,
      "name": "Ahmad Faiz",
      "email": "ahmadfaiz@example.com"
    }
  }
}
```

**Response Gagal (`401 Unauthorized`):**
```json
{
  "status": "error",
  "message": "Unauthenticated"
}
```

---

## Logout Pengguna

**Method:** `POST`

**URL:** `/api/v1/auth/logout`

**Deskripsi:** Mencabut (revoke) token akses pengguna yang sedang login sehingga tidak dapat digunakan lagi.

**Autentikasi Diperlukan:** `Ya`

**Sumber:** `Internal System`

**Request Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:** `-`

**Response Sukses (`200 OK`):**
```json
{
  "status": "success",
  "message": "Logout berhasil"
}
```

**Response Gagal (`401 Unauthorized`):**
```json
{
  "status": "error",
  "message": "Unauthenticated"
}
```

---

## Get Astronomy Picture of the Day (APOD)

**Method:** `GET`

**URL:** `/api/v1/apod`

**Deskripsi:** Mengambil data Astronomy Picture of the Day dari NASA APOD API. Mendukung query parameter `date` untuk mengambil APOD pada tanggal tertentu. Response di-cache selama 24 jam.

**Autentikasi Diperlukan:** `Tidak`

**Sumber:** `Third-Party API — NASA APOD`

**Request Headers:**
```
Content-Type: application/json
```

**Query Parameters:**
```
date (opsional): YYYY-MM-DD — default hari ini (rentang valid: 1995-06-16 s/d hari ini)
```

**Request Body:** `-`

**Response Sukses (`200 OK`):**
```json
{
  "status": "success",
  "data": {
    "date": "2025-06-03",
    "title": "The Pillars of Creation",
    "explanation": "Deskripsi ilmiah dari NASA...",
    "media_type": "image",
    "url": "https://apod.nasa.gov/apod/image/...",
    "hdurl": "https://apod.nasa.gov/apod/image/...hd.jpg",
    "copyright": "Nama Fotografer"
  }
}
```

**Response Gagal (`400 Bad Request`):**
```json
{
  "status": "error",
  "message": "Gagal mengambil data APOD dari NASA"
}
```

---

## Get ISS Position (Real-Time Tracker)

**Method:** `GET`

**URL:** `/api/v1/iss/position`

**Deskripsi:** Mengambil posisi terkini Stasiun Luar Angkasa Internasional (ISS), termasuk koordinat, ketinggian, dan kecepatan. Dikonsumsi dari Where the ISS At API. Response di-cache selama 5 detik karena bersifat real-time.

**Autentikasi Diperlukan:** `Tidak`

**Sumber:** `Third-Party API — Where the ISS At`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:** `-`

**Response Sukses (`200 OK`):**
```json
{
  "status": "success",
  "data": {
    "name": "iss",
    "latitude": -6.2088,
    "longitude": 106.8456,
    "altitude_km": 421.7,
    "velocity_kmh": 27556.3,
    "visibility": "daylight",
    "timestamp": 1717392000
  }
}
```

**Response Gagal (`503 Service Unavailable`):**
```json
{
  "status": "error",
  "message": "Gagal mengambil posisi ISS dari layanan eksternal"
}
```

---

## Get Near Earth Objects (Asteroid Tracker)

**Method:** `GET`

**URL:** `/api/v1/asteroids`

**Deskripsi:** Mengambil daftar asteroid yang mendekati Bumi dalam rentang tanggal tertentu (maksimal 7 hari). Data dikonsumsi dari NASA NeoWs API dan diformat ulang menjadi struktur yang lebih sederhana.

**Autentikasi Diperlukan:** `Tidak`

**Sumber:** `Third-Party API — NASA NeoWs (Near Earth Object Web Service)`

**Request Headers:**
```
Content-Type: application/json
```

**Query Parameters:**
```
start_date (wajib)   : YYYY-MM-DD
end_date   (opsional): YYYY-MM-DD — default start_date + 7 hari (maksimal selisih 7 hari)
```

**Request Body:** `-`

**Response Sukses (`200 OK`):**
```json
{
  "status": "success",
  "data": {
    "total_asteroids": 23,
    "asteroids": [
      {
        "id": "3542519",
        "name": "(2010 PK9)",
        "estimated_diameter_km": {
          "min": 0.19,
          "max": 0.43
        },
        "is_potentially_hazardous": false,
        "close_approach_date": "2025-06-04",
        "miss_distance_km": "4523819.2",
        "miss_distance_lunar": "11.76",
        "relative_velocity_kmh": "58392.1"
      }
    ]
  }
}
```

**Response Gagal (`422 Unprocessable Entity`):**
```json
{
  "status": "error",
  "message": "Rentang tanggal tidak valid atau melebihi 7 hari"
}
```

---

## Get Earth from Space (EPIC)

**Method:** `GET`

**URL:** `/api/v1/epic`

**Deskripsi:** Mengambil daftar foto Bumi dari kamera EPIC NASA beserta metadata. Tanpa parameter `date` akan mengambil koleksi terbaru. Mendukung filter berdasarkan tanggal pengambilan foto.

**Autentikasi Diperlukan:** `Tidak`

**Sumber:** `Third-Party API — NASA EPIC API`

**Request Headers:**
```
Content-Type: application/json
```

**Query Parameters:**
```
date (opsional): YYYY-MM-DD — default foto terbaru (tersedia mulai Juni 2015)
```

**Request Body:** `-`

**Response Sukses (`200 OK`):**
```json
{
  "status": "success",
  "data": [
    {
      "identifier": "20250603003",
      "caption": "This image was taken by the EPIC camera...",
      "date": "2025-06-03 00:31:45",
      "image_url": "https://epic.gsfc.nasa.gov/archive/natural/2025/06/03/png/epic_1b_20250603003.png",
      "centroid_coordinates": {
        "lat": -8.62,
        "lon": 159.12
      },
      "dscovr_distance_km": 1471392.5
    }
  ]
}
```

**Response Gagal (`404 Not Found`):**
```json
{
  "status": "error",
  "message": "Tidak ada foto tersedia untuk tanggal yang diminta"
}
```

---

## Get Bookmarks

**Method:** `GET`

**URL:** `/api/v1/bookmarks`

**Deskripsi:** Mengambil seluruh bookmark yang telah disimpan oleh pengguna yang sedang login.

**Autentikasi Diperlukan:** `Ya`

**Sumber:** `Internal System`

**Request Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:** `-`

**Response Sukses (`200 OK`):**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "type": "apod",
      "title": "The Pillars of Creation",
      "reference_date": "2025-06-03",
      "thumbnail_url": "https://apod.nasa.gov/...",
      "created_at": "2025-06-03T08:00:00Z"
    }
  ]
}
```

**Response Gagal (`401 Unauthorized`):**
```json
{
  "status": "error",
  "message": "Unauthenticated"
}
```

---

## Tambah Bookmark

**Method:** `POST`

**URL:** `/api/v1/bookmarks`

**Deskripsi:** Menyimpan konten pilihan pengguna (APOD, ISS, Asteroid, atau EPIC) ke dalam daftar bookmark.

**Autentikasi Diperlukan:** `Ya`

**Sumber:** `Internal System`

**Request Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "type": "apod | iss | asteroid | epic",
  "title": "string",
  "reference_date": "YYYY-MM-DD",
  "thumbnail_url": "string",
  "metadata": {}
}
```

**Response Sukses (`201 Created`):**
```json
{
  "status": "success",
  "message": "Bookmark berhasil disimpan",
  "data": {
    "id": 5,
    "type": "apod",
    "title": "The Pillars of Creation",
    "reference_date": "2025-06-03"
  }
}
```

**Response Gagal (`409 Conflict`):**
```json
{
  "status": "error",
  "message": "Konten ini sudah ada di bookmark Anda"
}
```

---

## Hapus Bookmark

**Method:** `DELETE`

**URL:** `/api/v1/bookmarks/{id}`

**Deskripsi:** Menghapus bookmark berdasarkan ID milik pengguna yang sedang login.

**Autentikasi Diperlukan:** `Ya`

**Sumber:** `Internal System`

**Request Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:** `-`

**Response Sukses (`200 OK`):**
```json
{
  "status": "success",
  "message": "Bookmark berhasil dihapus"
}
```

**Response Gagal (`404 Not Found`):**
```json
{
  "status": "error",
  "message": "Bookmark tidak ditemukan"
}
```

---

## Get Shared Content (Share)

**Method:** `GET`

**URL:** `/api/v1/share/{type}/{slug}`

**Deskripsi:** Mengambil data konten yang dibagikan beserta metadata Open Graph, untuk ditampilkan di halaman publik `/share/{type}/{slug}`. Dapat diakses tanpa login. `type` dapat berupa apod, iss, asteroid, atau epic. `slug` berupa tanggal atau id konten.

**Autentikasi Diperlukan:** `Tidak`

**Sumber:** `Internal System`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:** `-`

**Contoh URL:** `/api/v1/share/apod/2025-06-03`

**Response Sukses (`200 OK`):**
```json
{
  "status": "success",
  "data": {
    "type": "apod",
    "title": "The Pillars of Creation",
    "description": "Deskripsi singkat konten...",
    "image_url": "https://apod.nasa.gov/apod/image/...",
    "share_url": "https://nebula.app/share/apod/2025-06-03",
    "embed_code": "<iframe src='https://nebula.app/embed/apod/2025-06-03' width='600' height='400'></iframe>",
    "open_graph": {
      "og:title": "The Pillars of Creation — Nebula",
      "og:description": "Deskripsi singkat konten...",
      "og:image": "https://apod.nasa.gov/apod/image/...",
      "og:url": "https://nebula.app/share/apod/2025-06-03"
    }
  }
}
```

**Response Gagal (`404 Not Found`):**
```json
{
  "status": "error",
  "message": "Konten yang dibagikan tidak ditemukan"
}
```

---

## Ringkasan Endpoint

| No | Method | Endpoint | Auth | Sumber |
|----|--------|----------|------|--------|
| 1 | POST | `/api/v1/auth/register` | Tidak | Internal |
| 2 | POST | `/api/v1/auth/login` | Tidak | Internal |
| 3 | GET | `/api/v1/auth/me` | Ya | Internal |
| 4 | POST | `/api/v1/auth/logout` | Ya | Internal |
| 5 | GET | `/api/v1/apod` | Tidak | NASA APOD |
| 6 | GET | `/api/v1/iss/position` | Tidak | Where the ISS At |
| 7 | GET | `/api/v1/asteroids` | Tidak | NASA NeoWs |
| 8 | GET | `/api/v1/epic` | Tidak | NASA EPIC |
| 9 | GET | `/api/v1/bookmarks` | Ya | Internal |
| 10 | POST | `/api/v1/bookmarks` | Ya | Internal |
| 11 | DELETE | `/api/v1/bookmarks/{id}` | Ya | Internal |
| 12 | GET | `/api/v1/share/{type}/{slug}` | Tidak | Internal |

