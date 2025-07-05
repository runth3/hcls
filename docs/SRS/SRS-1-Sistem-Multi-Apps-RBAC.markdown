# Software Requirements Specification (SRS) - Sistem Multi-Portal RBAC Terpadu

**Modul**: Sistem Multi-Portal RBAC Terpadu  
**Tanggal**: 5 Juli 2025  
**Versi**: 2.0 (Modular & Aligned with BRD-1 v4.0)  
**Status**: 📋 Siap untuk Implementasi Ulang  
**Dibuat oleh**: Tim Pengembangan  
**Disetujui oleh**: [TBD - Pemangku Kepentingan]

---

## 1. Pendahuluan

### 1.1 Tujuan Dokumen
Dokumen ini merinci persyaratan fungsional dan non-fungsional untuk pengembangan Sistem Multi-Portal Role-Based Access Control (RBAC) Terpadu, yang menjadi fondasi keamanan dan kontrol akses untuk aplikasi **SuperTPA**. Sistem ini mendukung empat portal (**Sistem Core**, **Portal Klien**, **Portal Provider**, **Aplikasi Mobile Member**) dengan autentikasi terpadu, manajemen pengguna, dan kontrol akses kontekstual berbasis database. SRS ini diselaraskan dengan **BRD-1 versi 4.0**, memastikan modularitas, konsistensi, dan kepatuhan terhadap regulasi lokal (**UU PDP**) serta internasional (**HIPAA**). Dokumen ini menghindari referensi ke sistem eksternal yang tidak relevan dan fokus pada kebutuhan SuperTPA di pasar Indonesia.

### 1.2 Ruang Lingkup
Sistem ini mencakup:
- **Autentikasi Pengguna**: Menggunakan NextAuth.js untuk sign-in, sign-out, dan manajemen sesi dengan JSON Web Token (JWT).
- **Manajemen Pengguna**: Mendukung tipe pengguna (CORE, CLIENT, PROVIDER, MEMBER) dengan validasi NIK untuk pasar Indonesia.
- **Sistem RBAC Dinamis**: Definisi peran, izin, dan aturan kontekstual dikelola di database menggunakan kolom JSONB.
- **Kontrol Akses Kontekstual**: Aturan kompleks berdasarkan jumlah klaim, klien, provider, waktu, dan jenis klaim.
- **Multi-Portal**: Isolasi akses ke `/core`, `/client`, `/provider`, dan `/member` dengan pengalihan otomatis.
- **Kepatuhan**: Audit log dan pengelolaan data sesuai UU PDP dan HIPAA.
- **Usability**: Antarmuka multibahasa (Indonesia, Inggris) dan aksesibilitas (WCAG 2.1).

### 1.3 Latar Belakang
Sistem ini dirancang untuk mengatasi kebutuhan bisnis TPA di Indonesia, mendukung skala enterprise (200.000+ karyawan) dan kompleksitas seperti hierarki klien, penugasan provider, dan skenario pendaftaran. Implementasi sebelumnya mengalami bug akibat perubahan database berulang, sehingga SRS ini menetapkan skema database final, desain modular, dan pengujian komprehensif untuk memastikan keandalan dan skalabilitas.

---

## 2. Persyaratan Fungsional

### 2.1 Autentikasi & Manajemen Sesi
- **FR-AUTH-001**: Sistem harus menyediakan sign-in dengan email/password menggunakan NextAuth.js, dengan validasi NIK (16 digit, format +62 untuk telepon).
- **FR-AUTH-002**: Manajemen sesi dengan JWT (pembuatan, validasi, pembaruan, penghapusan), termasuk data `userId`, `userType`, `roleIds`, `globalRestrictions`, dan `defaultPortalAccess`.
- **FR-AUTH-003**: JWT harus mendukung struktur berikut:
```json
{
  "user": {
    "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "email": "john.doe@supertpa.dev",
    "name": "John Doe",
    "userType": "CORE",
    "roleIds": ["role-claims-uuid", "role-viewer-uuid"],
    "globalRestrictions": {
      "MAX_CLAIM_AMOUNT": { "value": 100000000, "currency": "IDR", "operator": "LESS_THAN_EQUAL" },
      "ACCESS_HOURS": { "start": "08:00", "end": "17:00", "days": [1, 2, 3, 4, 5], "operator": "BETWEEN" }
    },
    "defaultPortalAccess": ["core"]
  },
  "expires": "2025-07-06T12:00:00.000Z"
}
```
- **FR-AUTH-004**: Sign-out aman dengan penghapusan sesi dan invalidasi JWT.

### 2.2 Manajemen Pengguna
- **FR-USER-001**: Operasi CRUD pada tabel `users` dengan atribut: `email`, `username`, `password_hash`, `first_name`, `last_name`, `phone`, `user_type`, `status`, `global_restrictions`.
- **FR-USER-002**: Tipe pengguna: CORE, CLIENT, PROVIDER, MEMBER.
- **FR-USER-003**: Dukungan multi-peran melalui tabel `user_roles` untuk skenario pengguna dengan beberapa peran.
- **FR-USER-004**: Status pengguna: ACTIVE, PENDING_APPROVAL, INACTIVE, SUSPENDED.
- **FR-USER-005**: Pembatasan kontekstual global disimpan di `global_restrictions` (JSONB).
  - Contoh:
```json
{
  "MAX_CLAIM_AMOUNT": { "value": 100000000, "currency": "IDR", "operator": "LESS_THAN_EQUAL" },
  "ACCESS_HOURS": { "start": "08:00", "end": "17:00", "days": [1, 2, 3, 4, 5], "operator": "BETWEEN" },
  "CLIENT_ID": { "value": "klien-vip", "operator": "NEQ" }
}
```
- **FR-USER-006**: Validasi NIK (16 digit) dan nomor telepon (format +62) untuk pengguna Indonesia.

### 2.3 Manajemen Peran & Izin
- **FR-ROLE-001**: CRUD untuk tabel `roles` dengan atribut: `name`, `description`, `allowed_user_types`, `default_portal_access`.
  - Contoh:
```json
[
  {
    "id": "role-claims-uuid",
    "name": "CLAIMS_PROCESSOR",
    "allowed_user_types": ["CORE"],
    "default_portal_access": ["core"]
  },
  {
    "id": "role-client-admin-uuid",
    "name": "CLIENT_ADMIN",
    "allowed_user_types": ["CLIENT"],
    "default_portal_access": ["client"]
  }
]
```
- **FR-ROLE-002**: CRUD untuk tabel `permissions` dengan atribut: `name`, `description`, `module`, `action`.
  - Contoh:
```json
[
  {
    "id": "perm-claim-read-uuid",
    "name": "claims:read",
    "module": "claims",
    "action": "read"
  },
  {
    "id": "perm-portal-core-uuid",
    "name": "portal:access:core",
    "module": "portal",
    "action": "access"
  }
]
```
- **FR-ROLE-003**: Penugasan izin ke peran melalui tabel `role_permissions`.
- **FR-ROLE-004**: Izin spesifik pengguna melalui tabel `user_specific_permissions` dengan `access_type` (GRANT/DENY) dan `contextual_conditions` (JSONB).
  - Contoh:
```json
{
  "user_id": "john-doe-uuid",
  "permission_id": "perm-claim-process-uuid",
  "access_type": "DENY",
  "contextual_conditions": { "CLIENT_ID": { "value": "klien-vip", "operator": "EQ" } }
}
```

### 2.4 Kontrol Akses Kontekstual & RBAC Dinamis
- **FR-RBAC-001**: `AuthorizationService` untuk mengevaluasi izin berdasarkan `userId`, `permissionName`, dan konteks dinamis.
- **FR-RBAC-002**: Evaluasi izin dengan prioritas: `user_specific_permissions` > `contextual_rules` > `role_permissions`.
- **FR-RBAC-003**: Dukungan `rule_action`: ALLOW, DENY, REQUIRE_APPROVAL.
- **FR-RBAC-004**: Evaluasi kondisi JSONB secara dinamis untuk batasan seperti `MAX_CLAIM_AMOUNT`, `ACCESS_HOURS`, `CLIENT_ID`.
  - Contoh Logika Evaluasi:
```typescript
private static evaluateConditions(
  conditionsJson: Record<string, any>,
  currentContext: Record<string, any>,
  userGlobalRestrictions: Record<string, any>
): boolean {
  for (const constraintKey in conditionsJson) {
    const { value, operator } = conditionsJson[constraintKey];
    let actualValue = currentContext[constraintKey] || userGlobalRestrictions[constraintKey]?.value;
    if (!actualValue) return false;

    switch (constraintKey) {
      case 'MAX_CLAIM_AMOUNT':
        if (operator === 'LESS_THAN_EQUAL') return actualValue <= value;
        if (operator === 'GREATER_THAN') return actualValue > value;
        break;
      case 'ACCESS_HOURS':
        const now = new Date();
        const currentHour = now.getHours();
        const currentDay = now.getDay();
        if (operator === 'BETWEEN') {
          return currentHour >= value.start && currentHour <= value.end && value.days.includes(currentDay);
        }
        break;
      case 'CLIENT_ID':
        if (operator === 'EQ') return actualValue === value;
        if (operator === 'NEQ') return actualValue !== value;
        break;
    }
  }
  return true;
}
```
- **FR-RBAC-005**: Tabel `dynamic_constraints` untuk mendefinisikan meta-data batasan.
  - Contoh:
```json
[
  {
    "id": "dc-max-claim-uuid",
    "constraint_key": "MAX_CLAIM_AMOUNT",
    "expected_value_type": "NUMBER",
    "allowed_operators": ["LT", "LE", "GT", "GE"],
    "example_json_schema": { "value": 100000000, "currency": "IDR" },
    "description": "Batas jumlah klaim dalam IDR"
  },
  {
    "id": "dc-access-hours-uuid",
    "constraint_key": "ACCESS_HOURS",
    "expected_value_type": "TIME_RANGE",
    "allowed_operators": ["BETWEEN"],
    "example_json_schema": { "start": "08:00", "end": "17:00", "days": [1, 2, 3, 4, 5] },
    "description": "Jam dan hari akses yang diizinkan"
  }
]
```

### 2.5 Multi-Portal Access
- **FR-PORTAL-001**: Pengalihan otomatis ke portal sesuai `default_portal_access` setelah sign-in.
  - Contoh Logika:
```typescript
const userPortalAccess = session.user.defaultPortalAccess;
if (userPortalAccess.includes('core')) return '/core/dashboard';
if (userPortalAccess.includes('client')) return '/client/dashboard';
if (userPortalAccess.includes('provider')) return '/provider/dashboard';
if (userPortalAccess.includes('member')) return '/member/dashboard';
```
- **FR-PORTAL-002**: Perlindungan route dan endpoint API menggunakan middleware Next.js atau `AuthorizationService`.
  - Contoh:
```typescript
import { getSession } from 'next-auth/react';
import { AuthorizationService } from '../../../services/authorization';

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session || !session.user || !session.user.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const portal = req.url.split('/')[1];
  const hasPortalAccess = await AuthorizationService.hasPermission(
    session.user.id,
    `portal:access:${portal}`
  );
  if (!hasPortalAccess.allowed) {
    return res.status(403).json({ message: 'Forbidden: No access to portal.' });
  }

  const { amount, clientId, claimId } = req.body;
  const hasPermissionForAction = await AuthorizationService.hasPermission(
    session.user.id,
    'claims:process',
    { amount, clientId, claimId }
  );
  if (!hasPermissionForAction.allowed) {
    return res.status(403).json({ message: hasPermissionForAction.reason || 'Forbidden' });
  }
  if (hasPermissionForAction.requiresApproval) {
    return res.status(202).json({ message: 'Claim submitted for approval.', requiresApproval: true });
  }

  return res.status(200).json({ message: 'Claim processed successfully.' });
}
```
- **FR-PORTAL-003**: Validasi akses portal melalui `default_portal_access` di tabel `roles` dan pengecekan lanjutan oleh `AuthorizationService`.

---

## 3. Desain Database
### 3.1 Skema Database
- **users**:
  - `id` (UUID, PK)
  - `email` (VARCHAR, UNIQUE)
  - `username` (VARCHAR, UNIQUE)
  - `password_hash` (VARCHAR)
  - `first_name` (VARCHAR)
  - `last_name` (VARCHAR)
  - `phone` (VARCHAR, format +62 untuk Indonesia)
  - `user_type` (VARCHAR: CORE, CLIENT, PROVIDER, MEMBER)
  - `status` (VARCHAR: ACTIVE, PENDING_APPROVAL, INACTIVE, SUSPENDED)
  - `portal_access` (TEXT[]: ['core'], ['client'], dll.)
  - `client_assignment_type` (VARCHAR: single, multiple, all, exclusive)
  - `provider_assignment_type` (VARCHAR)
  - `max_clients` (INTEGER)
  - `max_providers` (INTEGER)
  - `restrictions` (JSONB)
  - `assigned_clients` (TEXT[])
  - `restricted_clients` (TEXT[])
  - `assigned_providers` (TEXT[])
  - `restricted_providers` (TEXT[])
  - `created_at`, `updated_at` (TIMESTAMP)
  - `created_by`, `updated_by` (VARCHAR)

- **user_client_access**:
  - `id` (UUID, PK)
  - `user_id` (UUID, FK `users`)
  - `client_id` (UUID, FK `clients`)
  - `access_type` (VARCHAR: full, read_only, restricted, exclusive)
  - `restrictions` (JSONB)
  - `is_primary` (BOOLEAN)
  - `is_exclusive` (BOOLEAN)
  - `priority` (INTEGER)
  - `assigned_by` (UUID, FK `users`)
  - `assigned_at`, `expires_at` (TIMESTAMP)
  - `is_active` (BOOLEAN)

- **roles**:
  - `id` (UUID, PK)
  - `name` (VARCHAR)
  - `description` (TEXT)
  - `allowed_user_types` (TEXT[])
  - `default_portal_access` (TEXT[])
  - `created_at`, `updated_at` (TIMESTAMP)

- **permissions**:
  - `id` (UUID, PK)
  - `name` (VARCHAR, UNIQUE)
  - `description` (TEXT)
  - `module` (VARCHAR)
  - `action` (VARCHAR)
  - `created_at` (TIMESTAMP)

- **role_permissions**:
  - `role_id` (UUID, FK `roles`)
  - `permission_id` (UUID, FK `permissions`)
  - PK: (`role_id`, `permission_id`)

- **user_roles**:
  - `user_id` (UUID, FK `users`)
  - `role_id` (UUID, FK `roles`)
  - `context` (JSONB)
  - `is_active` (BOOLEAN)
  - `assigned_at` (TIMESTAMP)
  - `assigned_by` (UUID)
  - PK: (`user_id`, `role_id`)

- **contextual_rules**:
  - `id` (UUID, PK)
  - `rule_name` (VARCHAR)
  - `permission_id` (UUID, FK `permissions`)
  - `role_id` (UUID, FK `roles`, opsional)
  - `conditions` (JSONB)
  - `rule_action` (VARCHAR: ALLOW, DENY, REQUIRE_APPROVAL)
  - `priority` (INTEGER)
  - `description` (TEXT)
  - `is_active` (BOOLEAN)
  - `is_system_rule` (BOOLEAN)
  - `created_by`, `updated_by` (UUID, FK `users`)
  - `created_at`, `updated_at` (TIMESTAMP)

- **user_specific_permissions**:
  - `user_id` (UUID, FK `users`)
  - `permission_id` (UUID, FK `permissions`)
  - `access_type` (VARCHAR: GRANT, DENY)
  - `contextual_conditions` (JSONB)
  - `is_active` (BOOLEAN)
  - `created_at` (TIMESTAMP)
  - PK: (`user_id`, `permission_id`)

- **dynamic_constraints**:
  - `id` (UUID, PK)
  - `constraint_key` (VARCHAR, UNIQUE)
  - `expected_value_type` (VARCHAR)
  - `allowed_operators` (TEXT[])
  - `example_json_schema` (JSONB)
  - `description` (TEXT)
  - `is_active` (BOOLEAN)
  - `created_at` (TIMESTAMP)

### 3.2 Indeks Database
- Indeks GIN pada kolom JSONB (`users.restrictions`, `user_client_access.restrictions`, `contextual_rules.conditions`, `user_specific_permissions.contextual_conditions`) untuk performa query.
- Indeks unik pada `users.email` dan `users.username`.
- Indeks pada `user_roles.user_id` dan `role_permissions.role_id` untuk akses cepat.

---

## 4. Persyaratan Non-Fungsional

### 4.1 Performa
- **NFR-PERF-001**: Autentikasi (login) selesai dalam < 500ms untuk 95% permintaan.
- **NFR-PERF-002**: Pengecekan izin (`AuthorizationService.hasPermission`) < 100ms untuk 95% permintaan.
- **NFR-PERF-003**: Query database untuk RBAC < 50ms untuk 95% permintaan.
- **NFR-PERF-004**: Bulk query untuk penugasan klien/provider < 1 detik untuk 1.000 entri.

### 4.2 Keamanan
- **NFR-SEC-001**: Kredensial pengguna di-hash menggunakan bcrypt.
- **NFR-SEC-002**: Sesi dilindungi dengan JWT (masa berlaku sesuai, pembaruan otomatis).
- **NFR-SEC-003**: Semua endpoint API dilindungi oleh `AuthorizationService`.
- **NFR-SEC-004**: Isolasi penuh antar portal untuk mencegah kebocoran akses.
- **NFR-SEC-005**: Validasi ketat untuk input JSONB untuk mencegah injeksi data.
- **NFR-SEC-006**: Audit log mencatat semua aktivitas (login, izin, CRUD) sesuai UU PDP dan HIPAA.

### 4.3 Skalabilitas
- **NFR-SCAL-001**: Mendukung 10.000 pengguna aktif bersamaan tanpa penurunan performa.
- **NFR-SCAL-002**: Penambahan batasan kontekstual baru tanpa perubahan skema atau downtime.
- **NFR-SCAL-003**: Deployment di cloud (AWS) dengan load balancing dan caching Redis.

### 4.4 Maintainabilitas
- **NFR-MAINT-001**: Kode modular untuk `AuthorizationService` dan `MultiPortalUserService`.
- **NFR-MAINT-002**: Aturan dan batasan dikelola melalui antarmuka admin (fase berikutnya).
- **NFR-MAINT-003**: Dokumentasi API menggunakan OpenAPI/Swagger.

### 4.5 Usability
- **NFR-USAB-001**: Antarmuka multibahasa (Indonesia, Inggris) dengan `next-i18next`.
- **NFR-USAB-002**: Aksesibilitas sesuai WCAG 2.1 (tombol pintasan, navigasi tab).
- **NFR-USAB-003**: Notifikasi error dalam bahasa Indonesia dan Inggris, ramah pengguna.

### 4.6 Kepatuhan
- **NFR-COMP-001**: Pengelolaan data pribadi (hak akses, hak dihapus) sesuai UU PDP.
- **NFR-COMP-002**: Audit log lengkap untuk semua transaksi pengguna.
- **NFR-COMP-003**: Kepatuhan terhadap HIPAA untuk data kesehatan.

---

## 5. Implementasi & Teknologi
- **Backend**: Next.js (API Routes), Prisma (ORM), PostgreSQL (Database).
- **Autentikasi**: NextAuth.js dengan JWT.
- **Frontend**: Next.js (React), Tailwind CSS untuk styling.
- **Caching**: Redis untuk performa pengecekan izin.
- **Deployment**: AWS dengan Docker/Kubernetes untuk skalabilitas.
- **Multibahasa**: `next-i18next` untuk Indonesia dan Inggris.
- **Pengujian**: Jest untuk unit testing, Cypress untuk end-to-end testing.

### 5.1 Contoh Implementasi
#### MultiPortalUserService
```typescript
export class MultiPortalUserService {
  static async createUser(userData: {
    email: string;
    userType: 'CORE' | 'CLIENT' | 'PROVIDER' | 'MEMBER';
    role: string;
    phone?: string; // Validasi +62
    clientId?: string;
    providerId?: string;
    restrictions?: any;
  }) {
    if (userData.phone && !/^\+62\d{9,12}$/.test(userData.phone)) {
      throw new Error('Invalid phone format for Indonesia (+62)');
    }
    const user = await prisma.user.create({
      data: {
        ...userData,
        portal_access: AKSES_PORTAL[userData.userType],
        restrictions: userData.restrictions || {},
        status: 'PENDING_APPROVAL'
      }
    });
    return user;
  }

  static async assignMultipleClients(
    userId: string,
    clientAssignments: Array<{
      clientId: string;
      accessType: 'full' | 'read_only' | 'restricted' | 'exclusive';
      isPrimary?: boolean;
      isExclusive?: boolean;
      priority?: number;
    }>
  ) {
    const assignments = await prisma.$transaction(
      clientAssignments.map(assignment =>
        prisma.userClientAccess.create({
          data: {
            user_id: userId,
            client_id: assignment.clientId,
            access_type: assignment.accessType,
            is_primary: assignment.isPrimary || false,
            is_exclusive: assignment.isExclusive || false,
            priority: assignment.priority || 0
          }
        })
      )
    );
    return assignments;
  }
}
```

#### AuthorizationService
```typescript
export class AuthorizationService {
  static async hasPermission(
    userId: string,
    permission: string,
    context?: {
      amount?: number;
      clientId?: string;
      providerId?: string;
      claimType?: string;
    }
  ): Promise<{
    allowed: boolean;
    reason?: string;
    requiresApproval?: boolean;
    restrictions?: string[];
  }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { roles: true, userSpecificPermissions: true }
    });
    if (!user) return { allowed: false, reason: 'Pengguna tidak ditemukan' };

    if (user.role === 'SUPER_ADMIN') return { allowed: true };

    const hasBasePermission = await this.checkBasePermission(user, permission);
    if (!hasBasePermission) return { allowed: false, reason: 'Tidak memiliki izin dasar' };

    return await this.applyContextualRules(user, permission, context);
  }

  private static async checkBasePermission(user: any, permission: string): Promise<boolean> {
    const rolePermissions = await prisma.role_permissions.findMany({
      where: { role_id: { in: user.roles.map((r: any) => r.role_id) } },
      select: { permission_id: true }
    });
    const permissions = await prisma.permissions.findMany({
      where: { id: { in: rolePermissions.map((rp: any) => rp.permission_id) } }
    });
    return permissions.some(p => p.name === permission);
  }

  private static async applyContextualRules(user: any, permission: string, context: any) {
    const userSpecific = await prisma.user_specific_permissions.findFirst({
      where: { user_id: user.id, permission_id: { in: (await prisma.permissions.findMany({ where: { name: permission } })).map(p => p.id) } }
    });
    if (userSpecific && userSpecific.access_type === 'DENY') {
      return { allowed: false, reason: 'Dilarang oleh izin spesifik pengguna' };
    }

    const rules = await prisma.contextual_rules.findMany({
      where: { permission_id: { in: (await prisma.permissions.findMany({ where: { name: permission } })).map(p => p.id) } },
      orderBy: { priority: 'desc' }
    });

    for (const rule of rules) {
      if (this.evaluateConditions(rule.conditions, context, user.restrictions)) {
        if (rule.rule_action === 'REQUIRE_APPROVAL') {
          return { allowed: true, requiresApproval: true };
        }
        return { allowed: rule.rule_action === 'ALLOW', reason: rule.description };
      }
    }

    return { allowed: true };
  }
}
```

---

## 6. Uji Kasus Kritis
### TC-001: Super Admin Bypass
- **Kondisi**: Pengguna dengan peran `SUPER_ADMIN` (`superadmin@supertpa.dev`).
- **Skenario**: Mengakses `/core/claims/delete`.
- **Hasil**: `{ allowed: true }` tanpa pengecekan lebih lanjut.

### TC-002: Claims Processor - Batas Jumlah
- **Kondisi**: `global_restrictions`: `{"MAX_CLAIM_AMOUNT": {"value": 100000000, "currency": "IDR", "operator": "LESS_THAN_EQUAL"}}`. Aturan `contextual_rules` untuk `claims:process` dengan `conditions`: `{"MAX_CLAIM_AMOUNT": {"value": 50000000, "operator": "GT"}}` dan `rule_action`: `REQUIRE_APPROVAL`.
- **Skenario**: John memproses klaim 75M IDR.
- **Panggilan**: `AuthorizationService.hasPermission(johnId, 'claims:process', { amount: 75000000 })`
- **Hasil**: `{ allowed: true, requiresApproval: true }`.

### TC-003: Claims Processor - Batas Waktu
- **Kondisi**: `global_restrictions`: `{"ACCESS_HOURS": {"start": "08:00", "end": "17:00", "days": [1,2,3,4,5], "operator": "BETWEEN"}}`.
- **Skenario**: John memproses klaim pada Minggu 10:00 atau Rabu 19:00.
- **Hasil**: `{ allowed: false, reason: 'Dilarang karena di luar jam akses.' }`.

### TC-004: Client Admin - Akses Portal
- **Kondisi**: Pengguna `CLIENT_ADMIN` dengan `default_portal_access: ['client']`.
- **Skenario**: Mencoba akses `/core/dashboard` atau `/api/core/reports`.
- **Hasil**: `{ allowed: false, reason: 'Tidak memiliki izin akses portal.' }`.

### TC-005: Client User - Hak Baca
- **Kondisi**: Pengguna `CLIENT_USER` dengan izin `member:read` di `role_permissions`.
- **Skenario 1**: Mencoba edit data di `/client/members/edit`.
- **Hasil**: `{ allowed: false, reason: 'Tidak memiliki izin dasar.' }`.
- **Skenario 2**: Mencoba lihat data member klien lain.
- **Hasil**: `{ allowed: false, reason: 'Dilarang oleh aturan klien.' }`.

### TC-006: Aturan Kontekstual Overlap
- **Kondisi**: Pengguna `ADMIN` dengan `user_specific_permissions` untuk `claims:process` dengan `access_type: 'DENY'` jika `CLIENT_ID` adalah `klien-vip`.
- **Skenario**: Memproses klaim dari `klien-vip`.
- **Hasil**: `{ allowed: false, reason: 'Dilarang oleh izin spesifik pengguna.' }`.

### TC-007: Validasi NIK Indonesia
- **Kondisi**: Pengguna baru dibuat dengan `phone` tidak sesuai format +62.
- **Skenario**: `MultiPortalUserService.createUser` dengan `phone: '08123456789'`.
- **Hasil**: Error: `'Invalid phone format for Indonesia (+62)'`.

---

## 7. Roadmap Implementasi
### Fase 1: Fondasi Multi-Portal (Minggu 1-2)
- Setup skema database final dengan indeks GIN untuk JSONB.
- Implementasi autentikasi NextAuth.js (login, logout, sesi).
- Routing portal (`/core`, `/client`, `/provider`, `/member`) dengan middleware.
- Validasi NIK dan nomor telepon untuk pengguna Indonesia.

### Fase 2: RBAC Dinamis (Minggu 3-4)
- Implementasi `AuthorizationService` untuk izin dasar dan kontekstual.
- Setup tabel `contextual_rules` dan `dynamic_constraints`.
- Pengujian izin berbasis peran dan user-specific permissions.
- Validasi JSONB ketat untuk mencegah injeksi.

### Fase 3: Pengembangan Portal (Minggu 5-8)
- Dasbor dinamis untuk Sistem Core (8 modul).
- Portal Klien (Member, Klaim, Laporan, Statusehat).
- Portal Provider (Klaim, Verifikasi Member, Pembayaran, Data Medis).
- Fondasi Aplikasi Mobile Member (React Native).

### Fase 4: Fitur Lanjutan & Pengujian (Minggu 9-12)
- Workflow approval untuk `REQUIRE_APPROVAL`.
- Pembatasan berbasis waktu, klien, dan provider.
- Pengujian komprehensif (TC-001 hingga TC-007).
- Pelaporan audit dan pemantauan performa.

---

## 8. Status Implementasi
- **Status Sebelumnya**: Versi 1.0 selesai (LIVE untuk autentikasi, RBAC dasar), tetapi bug akibat perubahan database.
- **Status Baru**: Siap untuk implementasi ulang dengan desain modular.
- **Fitur LIVE**:
  - Autentikasi dengan NextAuth.js.
  - RBAC dasar dengan peran dan izin.
  - Dasbor dinamis berbasis peran.
- **Fokus Implementasi Ulang**:
  - Skema database final dengan indeks untuk performa.
  - Validasi JSONB ketat dan pengujian kritis.
  - Dukungan pasar Indonesia (NIK, multibahasa, UU PDP).
- **Tanggal Target**: 31 Agustus 2025.

---

## 9. Risiko dan Mitigasi
| **Risiko** | **Dampak** | **Mitigasi** |
|------------|------------|--------------|
| Inkonsistensi database | Bug pada akses pengguna | Skema final, pengujian migrasi |
| Performa JSONB lambat | Pengecekan izin lambat | Indeks GIN, caching Redis |
| Kebocoran akses portal | Pelanggaran keamanan | Middleware ketat, pengujian lintas portal |
| Validasi NIK gagal | Data pengguna tidak valid | Regex +62 dan 16 digit, fallback manual |
| Aturan kontekstual kompleks | Kesalahan izin | Validasi skema JSONB, uji kasus kritis |
| Skalabilitas rendah | Sistem lambat | Microservices, load balancing, caching |

---

## 10. Persetujuan
**Disetujui oleh**: [TBD - Pemangku Kepentingan]  
**Tanggal Persetujuan**: [TBD]

---