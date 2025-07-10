 
# Software Requirements Specification (SRS) - Manajemen Pengguna

**Modul**: Manajemen Pengguna  
**Tanggal**: 6 Juli 2025  
**Versi**: 3.0 (Diperbarui untuk FastAPI, PostgreSQL, FastAPI-SQLAlchemy)  
**Status**: 📋 Siap untuk Implementasi  
**Dibuat oleh**: Tim Pengembangan  
**Disetujui oleh**: [TBD - Pemangku Kepentingan]  
**Referensi BRD**: BRD-1 v4.3, BRD-General-TPA v5.8  

---

## 1. Pendahuluan

### 1.1 Tujuan Dokumen
SRS ini merinci persyaratan teknis untuk modul Manajemen Pengguna dalam aplikasi TPA, menggunakan **FastAPI** (backend), **PostgreSQL** (database), dan **FastAPI-SQLAlchemy** untuk akses database yang disederhanakan. Sistem mendukung autentikasi JWT, RBAC/ABAC, audit log (UU PDP/HIPAA), dan integrasi dengan frontend **Next.js** untuk portal (Core, Client, Provider, Member).

### 1.2 Ruang Lingkup
- **Autentikasi**: Endpoint `/api/auth/login` untuk login via username/email, validasi NIK.
- **Manajemen Pengguna**: CRUD pengguna dengan tipe (CORE, CLIENT, PROVIDER, MEMBER).
- **RBAC**: Peran dinamis (TPA_ADMIN, CALL_CENTER_AGENT, PROVIDER, CLIENT, MEMBER).
- **ABAC**: Pembatasan akses via JSONB (CLIENT_CODE, POLICY_NUMBER).
- **Audit Log**: Log aktivitas untuk kepatuhan UU PDP/HIPAA.
- **Integrasi**: Next.js frontend, mendukung portal dan modul masa depan (`BRD-6`, `BRD-CallCenter`).

### 1.3 Latar Belakang
Modul ini adalah fondasi untuk sistem TPA, mendukung 200,000+ pengguna, API < 2 detik (95%), dan kepatuhan lokal (NIK, Satu Sehat). Versi sebelumnya (SRS-2.2) menggunakan Next.js API Routes dan Prisma; versi ini beralih ke FastAPI untuk performa dan integrasi AI/ML.

---

## 2. Persyaratan Fungsional

### 2.1 Autentikasi & Manajemen Sesi
- **FR-AUTH-001**: Endpoint `/api/auth/login` (POST):
  - **Input**: `username` (string), `password` (string) via OAuth2PasswordRequestForm.
  - **Output**: `{access_token, token_type}` (JWT dengan `user_id`, `user_type`, `role_ids`, `restrictions`).
  - **JWT Structure**:
    ```json
    {
      "sub": "uuid",
      "user_type": "CORE",
      "role_ids": ["uuid1", "uuid2"],
      "restrictions": {"CLIENT_CODE": "C789", "POLICY_NUMBER": "POL123"},
      "exp": "2025-07-06T12:00:00Z"
    }
    ```
- **FR-AUTH-002**: Validasi NIK (`^[0-9]{16}$`) di `users.nik`.
- **FR-AUTH-003**: Log login attempt/success di `audit_logs`.
- **FR-AUTH-004**: Token expiry 30 menit, dengan refresh token (opsional).

### 2.2 Manajemen Pengguna
- **FR-USER-001**: CRUD pada `users` dengan atribut: `id`, `username`, `email`, `password_hash`, `nik`, `user_type`, `restrictions`, `created_at`, `updated_at`.
- **FR-USER-002**: Tipe pengguna: `CORE`, `CLIENT`, `PROVIDER`, `MEMBER`.
- **FR-USER-003**: Status: `ACTIVE`, `PENDING_APPROVAL`, `INACTIVE`, `SUSPENDED`.
- **FR-USER-004**: `restrictions` (JSONB) untuk ABAC, contoh:
  ```json
  {"CLIENT_CODE": "C789", "POLICY_NUMBER": "POL123"}
  ```

### 2.3 Manajemen Peran & Izin
- **FR-ROLE-001**: CRUD pada `roles` dan `permissions`.
- **FR-ROLE-002**: Penugasan peran via `user_roles`, izin via `role_permissions`.
- **FR-ROLE-003**: Peran awal: `TPA_ADMIN`, `CALL_CENTER_AGENT`, `PROVIDER`, `CLIENT`, `MEMBER`.

### 2.4 Kontrol Akses
- **FR-RBAC-001**: Validasi RBAC berdasarkan `role_ids` di JWT.
- **FR-ABAC-001**: Validasi ABAC berdasarkan `restrictions` di JWT, menggunakan `restrictions_definitions`.
- **FR-ABAC-002**: `TPA_ADMIN` bypass ABAC restrictions.
- **FR-AUDIT-001**: Log semua aksi autentikasi di `audit_logs` dengan `ip_address`.

---

## 3. Desain Database
### 3.1 Skema
- **users**:
  - `id` (UUID, PK)
  - `username` (VARCHAR(50), UNIQUE)
  - `email` (VARCHAR(100), UNIQUE)
  - `password_hash` (VARCHAR(255))
  - `nik` (VARCHAR(16), `^[0-9]{16}$`)
  - `user_type` (VARCHAR: CORE, CLIENT, PROVIDER, MEMBER)
  - `status` (VARCHAR: ACTIVE, PENDING_APPROVAL, INACTIVE, SUSPENDED)
  - `restrictions` (JSONB)
  - `created_at`, `updated_at` (TIMESTAMP)
- **roles**:
  - `id` (UUID, PK)
  - `name` (VARCHAR(50), UNIQUE)
  - `description` (VARCHAR(255))
- **permissions**:
  - `id` (UUID, PK)
  - `name` (VARCHAR, UNIQUE)
  - `module` (VARCHAR)
  - `action` (VARCHAR)
- **user_roles**:
  - `user_id` (UUID, FK `users`)
  - `role_id` (UUID, FK `roles`)
  - PK: (`user_id`, `role_id`)
- **role_permissions**:
  - `role_id` (UUID, FK `roles`)
  - `permission_id` (UUID, FK `permissions`)
  - PK: (`role_id`, `permission_id`)
- **audit_logs**:
  - `id` (UUID, PK)
  - `user_id` (UUID, FK `users`, nullable)
  - `action` (VARCHAR(100))
  - `details` (VARCHAR(255))
  - `ip_address` (VARCHAR(45))
  - `created_at` (TIMESTAMP)
- **restrictions_definitions**:
  - `id` (UUID, PK)
  - `name` (VARCHAR, UNIQUE)
  - `value_type` (VARCHAR: STRING, MONETARY)
  - `validation_rule` (TEXT)
  - `description` (VARCHAR(255))

### 3.2 Indeks
- B-tree: `users.username`, `users.email`, `users.nik`, `user_roles.user_id`, `audit_logs.created_at`.
- GIN: `users.restrictions`.

---

## 4. Persyaratan Non-Fungsional
- **Performa**: Login < 2 detik (95%), audit log < 1 detik.
- **Keamanan**: JWT (HS256), bcrypt, AES-256, audit log (UU PDP/HIPAA).
- **Skalabilitas**: 200,000+ pengguna, Redis caching, AWS ECS.
- **Usability**: Multibahasa (Indonesia, Inggris), WCAG 2.1 (via Next.js).
- **Kepatuhan**: UU PDP (audit log), HIPAA (data keamanan).

---

## 5. Implementasi
- **Backend**: FastAPI, FastAPI-SQLAlchemy, PostgreSQL.
- **Autentikasi**: JWT via `python-jose`, bcrypt via `passlib`.
- **Frontend Integration**: Next.js, REST calls ke `/api/auth/login`.
- **Deployment**: AWS ECS, Docker, Redis.
- **Pengujian**: Pytest, k6 untuk performa.

### 5.1 Contoh Endpoint
- **/api/auth/login**:
  - **Method**: POST
  - **Input**: `username`, `password` (form-data)
  - **Output**: `{access_token, token_type}`
  - **Logika**:
    - Validasi `username` di `users`.
    - Verifikasi `password_hash` dengan bcrypt.
    - Ambil `role_ids` dari `user_roles`.
    - Generate JWT dengan `user_id`, `user_type`, `role_ids`, `restrictions`.
    - Log ke `audit_logs`.

---

## 6. Uji Kasus
- **TC-001**: Login sukses (`TPA_ADMIN`, valid credentials) → `{access_token, token_type}`.
- **TC-002**: Login gagal (invalid password) → 401 Unauthorized.
- **TC-003**: ABAC restriction (CLIENT, `CLIENT_CODE: C789`) → hanya akses data klien C789.
- **TC-004**: Audit log mencatat login attempt/success dengan `ip_address`.
- **TC-005**: Validasi NIK (`^[0-9]{16}$`) saat user creation.

---

## 7. Roadmap Implementasi
- **6-8 Juli 2025**: Setup database, terapkan skema.
- **9-12 Juli 2025**: Implementasi `/api/auth/login`, uji awal.
- **13-19 Juli 2025**: Uji RBAC/ABAC, audit log, performa.
- **20 Juli 2025**: Integrasi dengan Next.js frontend.

---

## 8. Risiko dan Mitigasi
| **Risiko** | **Dampak** | **Mitigasi** |
|------------|------------|--------------|
| Performa JSONB lambat | API > 2 detik | Indeks GIN, Redis caching |
| Kesalahan RBAC/ABAC | Akses salah | Uji kasus kritis |
| Migrasi dari Prisma | Inkonsistensi | Validasi skema |

---

## 9. Persetujuan
**Disetujui oleh**: [TBD]  
**Tanggal Persetujuan**: [TBD]
 