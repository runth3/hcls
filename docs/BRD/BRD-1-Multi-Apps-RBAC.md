# Business Requirement Document (BRD) - Sistem Multi-Portal RBAC Terpadu

**Modul**: Sistem Multi-Portal RBAC Terpadu  
**Tanggal**: 5 Juli 2025  
**Versi**: 4.0 (Modular & Aligned with SRS)  
**Status**: 📋 Siap untuk Implementasi Ulang  
**Dibuat oleh**: Tim Pengembangan  
**Disetujui oleh**: [TBD - Pemangku Kepentingan]

---

## 1. Pendahuluan

### 1.1 Tujuan Dokumen
Dokumen ini mendefinisikan kebutuhan bisnis untuk Sistem Multi-Portal Role-Based Access Control (RBAC) Terpadu sebagai fondasi keamanan dan kontrol akses untuk aplikasi **SuperTPA**. Sistem ini mendukung empat portal berbeda (**Sistem Core**, **Portal Klien**, **Portal Provider**, **Aplikasi Mobile Member**) dengan autentikasi terpadu, manajemen pengguna, dan kontrol akses kontekstual berbasis database. BRD ini diselaraskan dengan **SRS - Sistem Multi-Portal RBAC Terpadu** untuk memastikan modularitas, konsistensi, dan kepatuhan terhadap regulasi lokal (**UU PDP**) serta internasional (**HIPAA**). Dokumen ini menghindari referensi ke sistem eksternal yang tidak relevan dengan SuperTPA untuk menjaga fokus pada kebutuhan inti.

### 1.2 Latar Belakang
Sistem RBAC Terpadu dirancang untuk mengelola akses pengguna ke berbagai portal dengan granularitas tinggi, mendukung kebutuhan bisnis Third Party Administration (TPA) di Indonesia, seperti validasi NIK, multibahasa, dan integrasi dengan sistem lokal (contoh: BPJS Kesehatan, e-wallet). Implementasi sebelumnya telah mencapai status LIVE untuk beberapa fitur, tetapi perubahan berulang pada struktur database menyebabkan inkonsistensi dan bug. BRD ini memperbaiki masalah tersebut dengan desain modular, skema database standar, dan pengujian komprehensif, memastikan sistem mendukung skala enterprise (200.000+ karyawan) dan kompleksitas bisnis TPA seperti hierarki klien dan penugasan provider.

### 1.3 Ruang Lingkup
Sistem mencakup:
- **Portal yang Didukung**:
  - **Sistem Core** (`/core`): Untuk staf TPA internal (manajemen penuh).
  - **Portal Klien** (`/client`): Untuk perusahaan klien (manajemen anggota dan laporan).
  - **Portal Provider** (`/provider`): Untuk penyedia layanan kesehatan (klaim dan pembayaran).
  - **Aplikasi Mobile Member** (`/member`): Untuk anggota individu (klaim dan informasi polis).
- **Fitur Utama**:
  - Autentikasi multi-portal menggunakan NextAuth.js dengan JSON Web Token (JWT).
  - Manajemen pengguna dengan tipe pengguna: CORE, CLIENT, PROVIDER, MEMBER.
  - Sistem RBAC dinamis berbasis database dengan izin granular.
  - Kontrol akses kontekstual berdasarkan jumlah klaim, klien, provider, waktu, dan jenis klaim.
  - Penugasan klien/provider yang fleksibel (single, multiple, exclusive).
  - Audit logging untuk semua aktivitas pengguna.
  - Kepatuhan terhadap UU PDP (pengelolaan data pribadi) dan HIPAA.
  - Dukungan multibahasa (Indonesia, Inggris) dan aksesibilitas (WCAG 2.1).
  - Validasi data lokal seperti NIK untuk pasar Indonesia.

### 1.4 Pemangku Kepentingan
- **TPA Administrator**: Mengelola pengguna, peran, izin, dan kepatuhan.
- **Client (Corporate)**: Mengakses Portal Klien untuk manajemen anggota dan laporan.
- **Sub-Client**: Divisi atau anak perusahaan dengan akses terbatas.
- **HR Manager**: Mengelola pendaftaran karyawan dan life events.
- **Provider**: Mengakses Portal Provider untuk pemrosesan klaim dan pembayaran.
- **Member**: Mengakses Aplikasi Mobile untuk pengajuan klaim dan statusehat.
- **Dependent**: Anggota keluarga yang covered di bawah polis.
- **Broker/Agent**: Perantara untuk akuisisi klien dan layanan.
- **Regulator**: Memastikan kepatuhan terhadap UU PDP, OJK, dan HIPAA.
- **Auditor**: Memeriksa audit log untuk kepatuhan dan akurasi finansial.

---

## 2. Tujuan Bisnis

### 2.1 Tujuan Utama
- Menyediakan sistem RBAC terpadu yang mendukung empat portal dengan akses terisolasi dan modular.
- Memastikan autentikasi aman dan cepat (< 500ms) menggunakan NextAuth.js.
- Mengelola izin pengguna dengan granularitas tinggi melalui aturan kontekstual berbasis JSONB.
- Mendukung kompleksitas bisnis TPA seperti hierarki klien, penugasan provider, dan skenario pendaftaran kompleks.
- Memastikan kepatuhan terhadap UU PDP (hak akses, hak dihapus) dan HIPAA.
- Meningkatkan modularitas untuk memudahkan pemeliharaan, skalabilitas, dan integrasi dengan modul lain (misalnya, Manajemen Keuangan, Klaim).
- Mendukung pasar Indonesia dengan validasi NIK, multibahasa, dan integrasi lokal.

### 2.2 Manfaat Bisnis
- **Keamanan**: Tidak ada akses tidak sah lintas portal, dengan audit log lengkap untuk kepatuhan.
- **Efisiensi**: Otomatisasi penugasan peran dan izin mengurangi tenaga kerja manual hingga 90%.
- **Fleksibilitas**: Multi-peran dan aturan kontekstual mendukung kebutuhan bisnis kompleks seperti hierarki klien dan capitation.
- **Pengalaman Pengguna**: Dasbor dinamis dan pengalihan portal otomatis meningkatkan Net Promoter Score (NPS) > 70.
- **Kepatuhan**: Enkripsi data, audit log, dan pengelolaan consent sesuai UU PDP dan HIPAA.
- **Skalabilitas**: Mendukung 10.000 pengguna aktif bersamaan tanpa penurunan performa.
- **Pasar Indonesia**: Validasi NIK, dukungan multibahasa, dan integrasi dengan e-wallet serta BPJS Kesehatan.

---

## 3. Spesifikasi Fungsional

### 3.1 Arsitektur Sistem Multi-Portal
#### 3.1.1 Struktur Portal
```
Sistem SuperTPA
├── Sistem Core (/core)
│   ├── Dashboard Admin
│   ├── Manajemen Klaim
│   ├── Manajemen Member
│   ├── Manajemen Provider
│   ├── Manajemen Polis
│   ├── Manajemen Keuangan
│   ├── Analitik
│   └── Kepatuhan
├── Portal Klien (/client)
│   ├── Manajemen Member (khusus klien)
│   ├── Pengajuan Klaim
│   ├── Laporan
│   └── Statusehat
├── Portal Provider (/provider)
│   ├── Pemrosesan Klaim
│   ├── Verifikasi Member
│   ├── Status Pembayaran
│   └── Data Medis
└── Aplikasi Mobile Member (/member)
    ├── Pengajuan Klaim
    ├── Informasi Polis
    ├── Kartu Member
    ├── Direktori Provider
    └── Statusehat
```

#### 3.1.2 Tipe Pengguna & Akses Portal
```typescript
enum TipePengguna {
  CORE = 'CORE',           // Staf TPA internal
  CLIENT = 'CLIENT',       // Pengguna klien korporat
  PROVIDER = 'PROVIDER',   // Penyedia layanan kesehatan
  MEMBER = 'MEMBER'        // Anggota individu
}

const AKSES_PORTAL = {
  CORE: ['core'],
  CLIENT: ['client'],
  PROVIDER: ['provider'],
  MEMBER: ['member']
}
```

### 3.2 Sistem Role Multi-Portal
#### 3.2.1 Role Sistem Core
| Role | Deskripsi | Akses Modul |
|------|-----------|-------------|
| **SUPER_ADMIN** | Administrator penuh | Semua modul (8) |
| **ADMIN** | Administrator organisasi | Klaim, Member, Provider, Polis, Keuangan, Analitik (6) |
| **MANAGER** | Manajer departemen | Klaim, Member, Polis, Analitik (4) |
| **CLAIMS_PROCESSOR** | Pemroses klaim | Klaim, Member (2) |
| **MEMBER_SPECIALIST** | Spesialis member | Member, Klien (2) |
| **PROVIDER_SPECIALIST** | Spesialis provider | Provider, Klaim (2) |
| **VIEWER** | Hanya lihat | Analitik (1) |

#### 3.2.2 Role Portal Klien
| Role | Deskripsi | Akses |
|------|-----------|-------|
| **CLIENT_ADMIN** | Admin klien | Member, Klaim, Laporan, Statusehat |
| **CLIENT_HR** | HR klien | Member, Laporan |
| **CLIENT_USER** | Pengguna klien | Member (baca) |

#### 3.2.3 Role Portal Provider
| Role | Deskripsi | Akses |
|------|-----------|-------|
| **PROVIDER_ADMIN** | Admin provider | Klaim, Member, Pembayaran, Data Medis |
| **PROVIDER_STAFF** | Staff provider | Klaim, Verifikasi Member |

#### 3.2.4 Role Aplikasi Mobile Member
| Role | Deskripsi | Akses |
|------|-----------|-------|
| **MEMBER** | Anggota individu | Klaim, Polis, Kartu, Direktori, Statusehat |

### 3.3 Kontrol Akses Kontekstual
- **Definisi**: Aturan akses berbasis konteks (jumlah klaim, klien, provider, waktu, jenis klaim) disimpan dalam kolom JSONB untuk fleksibilitas.
- **Contoh Skenario (John - Claims Processor)**:
```typescript
const johnProfile = {
  tipePengguna: 'CORE',
  role: 'CLAIMS_PROCESSOR',
  izinDasar: [
    'claims:read', 'claims:create', 'claims:update',
    'members:read', 'providers:read'
  ],
  pembatasan: {
    batasApprovalKlaim: 100000000, // Maksimal 100 juta IDR
    batasProsesKlaim: 50000000,    // Maksimal 50 juta IDR
    aksesKlien: 'multiple',
    klienDitugaskan: ['klien-1', 'klien-2', 'klien-3'],
    klienTerbatas: ['klien-vip'],  // Hanya baca
    jamKerja: { mulai: '08:00', selesai: '17:00', hari: [1, 2, 3, 4, 5] },
    perluApproval: {
      'claims:approve': { jumlah: 50000000 },
      'claims:process': { jumlah: 25000000, klien: ['klien-vip'] }
    }
  }
}
```

### 3.4 Fitur Fungsional
#### 3.4.1 Autentikasi & Manajemen Sesi
- **FR-AUTH-001**: Sign-in dengan email/password menggunakan NextAuth.js, mendukung validasi NIK untuk pengguna Indonesia.
- **FR-AUTH-002**: Manajemen sesi dengan JWT (pembuatan, validasi, pembaruan, penghapusan).
- **FR-AUTH-003**: JWT menyertakan `userId`, `userType`, `roleIds`, `globalRestrictions`, `defaultPortalAccess`.
- **FR-AUTH-004**: Sign-out aman dengan penghapusan sesi.
- **Contoh JWT**:
```json
{
  "user": {
    "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "email": "john.doe@supertpa.dev",
    "name": "John Doe",
    "userType": "CORE",
    "roleIds": ["role-claims-uuid", "role-viewer-uuid"],
    "globalRestrictions": {
      "MAX_CLAIM_AMOUNT": { "value": 100000000, "currency": "IDR" },
      "ACCESS_HOURS": { "start": "08:00", "end": "17:00" }
    },
    "defaultPortalAccess": ["core"]
  },
  "expires": "2025-07-06T12:00:00.000Z"
}
```

#### 3.4.2 Manajemen Pengguna
- **FR-USER-001**: Operasi CRUD untuk pengguna (`users`) dengan atribut `email`, `userType`, `role`, `status`, `globalRestrictions`, `phone` (validasi format +62).
- **FR-USER-002**: Tipe pengguna: CORE, CLIENT, PROVIDER, MEMBER.
- **FR-USER-003**: Dukungan multi-peran melalui tabel `user_roles`.
- **FR-USER-004**: Status pengguna: ACTIVE, PENDING_APPROVAL, INACTIVE, SUSPENDED.
- **FR-USER-005**: Pembatasan kontekstual global disimpan di `global_restrictions` (JSONB).
- **Contoh**:
```json
{
  "MAX_CLAIM_AMOUNT": { "value": 100000000, "currency": "IDR", "operator": "LESS_THAN_EQUAL" },
  "ACCESS_HOURS": { "start": "08:00", "end": "17:00", "days": [1, 2, 3, 4, 5], "operator": "BETWEEN" },
  "CLIENT_ID": { "value": "klien-vip", "operator": "NEQ" }
}
```

#### 3.4.3 Manajemen Peran & Izin
- **FR-ROLE-001**: CRUD untuk peran (`roles`) dengan atribut `name`, `allowed_user_types`, `default_portal_access`.
- **FR-ROLE-002**: CRUD untuk izin atomik (`permissions`) dengan atribut `name`, `module`, `action`.
- **FR-ROLE-003**: Penugasan izin ke peran melalui `role_permissions`.
- **FR-ROLE-004**: Izin spesifik pengguna (`user_specific_permissions`) dengan `access_type` (GRANT/DENY) dan `contextual_conditions` (JSONB).
- **Contoh**:
```json
{
  "user_id": "john-doe-uuid",
  "permission_id": "perm-claim-process-uuid",
  "access_type": "DENY",
  "contextual_conditions": { "CLIENT_ID": { "value": "klien-vip", "operator": "EQ" } }
}
```

#### 3.4.4 Kontrol Akses Kontekstual
- **FR-RBAC-001**: `AuthorizationService` untuk mengevaluasi izin berdasarkan `userId`, `permissionName`, dan konteks dinamis.
- **FR-RBAC-002**: Evaluasi izin dengan prioritas: user-specific > contextual rules > role permissions.
- **FR-RBAC-003**: Dukungan `rule_action`: ALLOW, DENY, REQUIRE_APPROVAL.
- **FR-RBAC-004**: Evaluasi kondisi JSONB secara dinamis (misalnya, `MAX_CLAIM_AMOUNT`, `ACCESS_HOURS`, `CLIENT_ID`).
- **FR-RBAC-005**: Tabel `dynamic_constraints` untuk mendefinisikan meta-data batasan.
- **Contoh**:
```json
{
  "constraint_key": "MAX_CLAIM_AMOUNT",
  "expected_value_type": "NUMBER",
  "allowed_operators": ["LT", "LE", "GT", "GE"],
  "example_json_schema": { "value": 100000000, "currency": "IDR" }
}
```

#### 3.4.5 Multi-Portal Access
- **FR-PORTAL-001**: Pengalihan otomatis ke portal sesuai `defaultPortalAccess` setelah sign-in.
- **FR-PORTAL-002**: Perlindungan route/API dengan `AuthorizationService` melalui middleware Next.js.
- **FR-PORTAL-003**: Validasi akses portal melalui `default_portal_access` dan `AuthorizationService`.
- **Contoh Middleware**:
```typescript
import { getSession } from 'next-auth/react';
import { AuthorizationService } from '../services/authorization';

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session || !session.user || !session.user.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const hasPortalAccess = await AuthorizationService.hasPermission(
    session.user.id,
    `portal:access:${req.url.split('/')[1]}`
  );
  if (!hasPortalAccess.allowed) {
    return res.status(403).json({ message: 'Forbidden: No access to portal.' });
  }

  // Lanjutkan ke API atau route
}
```

---

## 4. Skema Database
### 4.1 Tabel Pengguna
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20), -- Format +62 untuk Indonesia
  user_type VARCHAR(20) NOT NULL DEFAULT 'CORE',
  role VARCHAR(50) NOT NULL,
  portal_access TEXT[], -- ['core'], ['client'], dll.
  status VARCHAR(20) DEFAULT 'PENDING_APPROVAL',
  client_assignment_type VARCHAR(20), -- single, multiple, all, exclusive
  provider_assignment_type VARCHAR(20),
  max_clients INTEGER,
  max_providers INTEGER,
  restrictions JSONB, -- Pembatasan kontekstual
  assigned_clients TEXT[],
  restricted_clients TEXT[],
  assigned_providers TEXT[],
  restricted_providers TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by VARCHAR(255),
  updated_by VARCHAR(255)
);
```

### 4.2 Tabel Akses Klien
```sql
CREATE TABLE user_client_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  access_type VARCHAR(20) NOT NULL, -- full, read_only, restricted, exclusive
  restrictions JSONB,
  is_primary BOOLEAN DEFAULT false,
  is_exclusive BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 0,
  assigned_by UUID REFERENCES users(id),
  assigned_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, client_id)
);
```

### 4.3 Tabel Peran & Izin
```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  description TEXT,
  allowed_user_types TEXT[] NOT NULL,
  default_portal_access TEXT[] NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  module VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE role_permissions (
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_roles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  context JSONB,
  is_active BOOLEAN DEFAULT true,
  assigned_at TIMESTAMP DEFAULT NOW(),
  assigned_by UUID,
  PRIMARY KEY (user_id, role_id)
);
```

### 4.4 Tabel Aturan Kontekstual
```sql
CREATE TABLE contextual_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name VARCHAR(255) NOT NULL,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id),
  conditions JSONB NOT NULL,
  rule_action VARCHAR(20) NOT NULL, -- ALLOW, DENY, REQUIRE_APPROVAL
  priority INTEGER DEFAULT 0,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  is_system_rule BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_specific_permissions (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  access_type VARCHAR(20) NOT NULL, -- GRANT, DENY
  contextual_conditions JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, permission_id)
);

CREATE TABLE dynamic_constraints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  constraint_key VARCHAR(100) UNIQUE NOT NULL,
  expected_value_type VARCHAR(50) NOT NULL,
  allowed_operators TEXT[] NOT NULL,
  example_json_schema JSONB,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 5. Implementasi Komponen

### 5.1 MultiPortalUserService
```typescript
export class MultiPortalUserService {
  static async createUser(userData: {
    email: string;
    userType: 'CORE' | 'CLIENT' | 'PROVIDER' | 'MEMBER';
    role: string;
    phone?: string; // Validasi +62 untuk Indonesia
    clientId?: string;
    providerId?: string;
    restrictions?: any;
  }) {
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

### 5.2 AuthorizationService
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

  private static evaluateConditions(conditions: any, context: any, globalRestrictions: any): boolean {
    for (const key in conditions) {
      const { value, operator } = conditions[key];
      let actualValue = context[key] || globalRestrictions[key]?.value;

      if (!actualValue) return false;

      switch (key) {
        case 'MAX_CLAIM_AMOUNT':
          if (operator === 'LESS_THAN_EQUAL') return actualValue <= value;
          break;
        case 'ACCESS_HOURS':
          const now = new Date();
          const currentHour = now.getHours();
          if (operator === 'BETWEEN') return currentHour >= value.start && currentHour <= value.end;
          break;
        case 'CLIENT_ID':
          if (operator === 'EQ') return actualValue === value;
          break;
      }
    }
    return true;
  }
}
```

---

## 6. Spesifikasi Non-Fungsional

### 6.1 Performa
- **NFR-PERF-001**: Login selesai dalam < 500ms untuk 95% permintaan.
- **NFR-PERF-002**: Pengecekan izin (`AuthorizationService.hasPermission`) < 100ms untuk 95% permintaan.
- **NFR-PERF-003**: Query database untuk RBAC < 50ms untuk 95% permintaan.

### 6.2 Keamanan
- **NFR-SEC-001**: Kredensial di-hash dengan bcrypt sebelum disimpan.
- **NFR-SEC-002**: Sesi dilindungi dengan JWT (masa berlaku sesuai, pembaruan otomatis).
- **NFR-SEC-003**: Semua endpoint API dilindungi oleh `AuthorizationService`.
- **NFR-SEC-004**: Isolasi penuh antar portal untuk mencegah kebocoran akses.
- **NFR-SEC-005**: Validasi ketat untuk input JSONB guna mencegah injeksi data.

### 6.3 Skalabilitas
- **NFR-SCAL-001**: Mendukung 10.000 pengguna aktif bersamaan tanpa penurunan performa.
- **NFR-SCAL-002**: Penambahan batasan kontekstual baru tanpa perubahan skema atau downtime.

### 6.4 Maintainabilitas
- **NFR-MAINT-001**: Kode modular untuk `MultiPortalUserService` dan `AuthorizationService`.
- **NFR-MAINT-002**: Aturan dan batasan dikelola melalui antarmuka admin (direncanakan untuk fase berikutnya).

### 6.5 Usability
- **NFR-USAB-001**: Antarmuka multibahasa (Indonesia, Inggris) menggunakan `next-i18next`.
- **NFR-USAB-002**: Aksesibilitas sesuai WCAG 2.1 (tombol pintasan, navigasi tab).
- **NFR-USAB-003**: Notifikasi error ramah pengguna dalam bahasa Indonesia dan Inggris.

### 6.6 Kepatuhan
- **NFR-COMP-001**: Audit log mencatat semua aktivitas pengguna sesuai UU PDP dan HIPAA.
- **NFR-COMP-002**: Pengelolaan data pribadi (hak akses, hak dihapus) sesuai UU PDP.

---

## 7. Roadmap Implementasi

### Fase 1: Fondasi Multi-Portal (Minggu 1-2)
- Setup skema database final (`users`, `roles`, `permissions`, `contextual_rules`, dll.).
- Implementasi autentikasi dengan NextAuth.js (login, logout, sesi).
- Routing portal dasar (`/core`, `/client`, `/provider`, `/member`) dengan middleware.
- Validasi tipe pengguna dan akses portal dengan `default_portal_access`.

### Fase 2: RBAC Dinamis (Minggu 3-4)
- Implementasi `AuthorizationService` untuk izin dasar dan kontekstual.
- Setup tabel `contextual_rules` dan `dynamic_constraints` untuk aturan JSONB.
- Pengujian izin berbasis peran dan user-specific permissions.
- Validasi input JSONB untuk mencegah injeksi.

### Fase 3: Pengembangan Portal (Minggu 5-8)
- Dasbor dinamis untuk Sistem Core (8 modul: Klaim, Member, Provider, dll.).
- Portal Klien (Member, Klaim, Laporan, Statusehat).
- Portal Provider (Klaim, Verifikasi Member, Pembayaran, Data Medis).
- Fondasi Aplikasi Mobile Member (React Native: Klaim, Polis, Kartu).

### Fase 4: Fitur Lanjutan & Pengujian (Minggu 9-12)
- Workflow approval untuk aturan `REQUIRE_APPROVAL`.
- Pembatasan berbasis waktu, klien, dan provider.
- Pengujian komprehensif untuk uji kasus kritis (TC-001 hingga TC-006).
- Pelaporan audit dan pemantauan performa real-time.

---

## 8. Metrik Keberhasilan
- **Autentikasi**: Login < 500ms, pengalihan portal otomatis sesuai `userType`.
- **Kontrol Akses**: 100% endpoint API dilindungi oleh `AuthorizationService`.
- **Multi-Portal**: Isolasi penuh antar 4 portal tanpa kebocoran akses.
- **Dashboard Dinamis**: Load < 300ms untuk semua portal.
- **Keamanan**: Zero breach, 100% aktivitas tercatat dalam audit log.
- **Performa**: Pengecekan izin < 100ms, query database < 50ms.
- **Skalabilitas**: Mendukung 10.000 pengguna aktif bersamaan.
- **Kepatuhan**: Audit log dan pengelolaan data sesuai UU PDP dan HIPAA.
- **Pasar Indonesia**: Validasi NIK (16 digit), dukungan multibahasa, error dalam bahasa lokal.

---

## 9. Uji Kasus Kritis
### TC-001: Super Admin Bypass
- **Skenario**: Pengguna `superadmin@supertpa.dev` mengakses `/core/claims/delete`.
- **Hasil**: `{ allowed: true }` tanpa pengecekan lebih lanjut.

### TC-002: Claims Processor - Batas Jumlah
- **Kondisi**: `MAX_CLAIM_AMOUNT: 100M`, aturan `claims:process` memerlukan approval > 50M.
- **Skenario**: John memproses klaim 75M IDR.
- **Hasil**: `{ allowed: true, requiresApproval: true }`.

### TC-003: Claims Processor - Batas Waktu
- **Kondisi**: `ACCESS_HOURS: 08:00-17:00, hari 1-5`.
- **Skenario**: John memproses klaim pada Minggu 10:00 atau Rabu 19:00.
- **Hasil**: `{ allowed: false, reason: 'Dilarang karena di luar jam akses.' }`.

### TC-004: Client Admin - Akses Portal
- **Skenario**: `CLIENT_ADMIN` mencoba akses `/core/dashboard`.
- **Hasil**: `{ allowed: false, reason: 'Tidak memiliki izin akses portal.' }`.

### TC-005: Client User - Hak Baca
- **Skenario 1**: `CLIENT_USER` mencoba edit data member di `/client/members/edit`.
- **Hasil**: `{ allowed: false, reason: 'Tidak memiliki izin dasar.' }`.
- **Skenario 2**: `CLIENT_USER` mencoba lihat data member klien lain.
- **Hasil**: `{ allowed: false, reason: 'Dilarang oleh aturan klien.' }`.

### TC-006: Aturan Kontekstual Overlap
- **Skenario**: `ADMIN` dengan `DENY` untuk klien tertentu mencoba `claims:process`.
- **Hasil**: `{ allowed: false, reason: 'Dilarang oleh izin spesifik pengguna.' }`.

---

## 10. Status Implementasi
- **Status Sebelumnya**: Versi 3.0 selesai (LIVE untuk autentikasi, RBAC dasar, dasbor dinamis), tetapi perubahan database menyebabkan bug.
- **Status Baru**: Siap untuk implementasi ulang dengan desain modular berdasarkan SRS.
- **Fitur LIVE**:
  - Autentikasi dengan NextAuth.js.
  - RBAC dasar dengan peran dan izin.
  - Dasbor dinamis berbasis peran.
- **Fokus Implementasi Ulang**:
  - Modularitas dengan layanan terpisah (`MultiPortalUserService`, `AuthorizationService`).
  - Validasi JSONB yang ketat untuk aturan kontekstual.
  - Pengujian komprehensif untuk mencegah bug.
  - Dukungan pasar Indonesia (validasi NIK, multibahasa).
- **Tanggal Target**: 31 Agustus 2025.

---

## 11. Risiko dan Mitigasi
| **Risiko** | **Dampak** | **Mitigasi** |
|------------|------------|--------------|
| Inkonsistensi database | Bug pada akses pengguna | Skema database final, pengujian migrasi |
| Evaluasi JSONB lambat | Performa rendah | Indeks GIN pada kolom JSONB, caching Redis |
| Kebocoran akses portal | Pelanggaran keamanan | Middleware ketat, pengujian lintas portal |
| Validasi NIK gagal | Data pengguna tidak valid | Regex +62 dan 16 digit, fallback manual |
| Aturan kontekstual kompleks | Kesalahan izin | Validasi skema JSONB, uji kasus kritis |
| Skalabilitas rendah | Sistem lambat pada beban tinggi | Microservices, load balancing, caching |

---

## 12. Persetujuan
**Disetujui oleh**: [TBD - Pemangku Kepentingan]  
**Tanggal Persetujuan**: [TBD]

---