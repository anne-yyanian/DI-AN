# Student Activity Backend API

Base URL: `http://localhost:3001`

## 1. Autentikasi (`/auth`)

### Register Akun
- **Endpoint:** `POST /auth/register`
- **Body (JSON):**
  ```json
  {
    "name": "Dinda",
    "email": "dinda@example.com",
    "password": "password123"
  }
## Frontend (Next.js)

Aplikasi frontend dibangun menggunakan **Next.js (JavaScript, App Router)** dan **Tailwind CSS**, terhubung ke backend NestJS (`http://localhost:3001`) menggunakan autentikasi JWT (`Bearer Token`).

### Struktur Folder Utama (`frontend/`)

```text
frontend/
├── .env.local
└── src/
    ├── lib/
    │   └── api.js
    └── app/
        ├── page.js
        └── dashboard/
            └── page.jsx
```

* **`src/lib/api.js`**: Helper request HTTP (`apiRequest`) serta manajemen token JWT (`getToken`, `setToken`, `clearToken`) di `localStorage` dan pengiriman header `Authorization: Bearer <token>`.
* **`src/app/page.js`**: Halaman utama (`/`) untuk **Login** (`/auth/login`) dan **Register** (`/auth/register`), lalu mengarahkan pengguna ke `/dashboard` setelah token diterima.
* **`src/app/dashboard/page.jsx`**: Halaman **Dashboard** (`/dashboard`) yang terproteksi token untuk membuat, melihat, mencari/memfilter, mengubah status selesai, mengedit, dan menghapus aktivitas (`/activities`).

### Konfigurasi Environment Variable

Buat file `.env.local` di dalam folder `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Menjalankan Frontend

Pastikan server **backend** sudah berjalan di port `3001` terlebih dahulu, lalu jalankan frontend:

```bash
cd frontend
npm install
npm run dev
```

Buka `http://localhost:3000` di browser untuk mengakses aplikasi.
