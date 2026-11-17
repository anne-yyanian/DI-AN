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