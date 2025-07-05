# Business Requirement Document (BRD) - Sistem Multi-Portal RBAC Terpadu

**Modul**: Sistem Multi-Portal RBAC Terpadu  
**Tanggal**: 5 July 2025  
**Versi**: 4.1 (Hybrid RBAC + ABAC, Modular & Aligned with SRS)  
**Status**: 📋 Siap untuk Implementasi Ulang  
**Dibuat oleh**: Tim Pengembangan  
**Disetujui oleh**: [TBD - Pemangku Kepentingan]

---

## 1. Pendahuluan

### 1.1 Tujuan Dokumen
Dokumen ini mendefinisikan kebutuhan bisnis untuk Sistem Multi-Portal Role-Based Access Control (RBAC) dan Attribute-Based Access Control (ABAC) Terpadu untuk aplikasi **SuperTPA**. Sistem ini mendukung empat portal (**Sistem Core**, **Portal Klien**, **Portal Provider**, **Aplikasi Mobile Member**) dengan autentikasi terpadu, manajemen pengguna, dan kontrol akses berbasis peran (RBAC) serta atribut (ABAC). BRD ini diselaraskan dengan **SRS - Sistem Multi-Portal RBAC Terpadu**, **BRD-2** (v3.3), serta regulasi lokal (**UU PDP**) dan internasional (**HIPAA**).

### 1.2 Latar Belakang
Sistem ini mengelola akses pengguna ke berbagai portal dengan granularitas tinggi, mendukung kebutuhan bisnis Third Party Administration (TPA) di Indonesia (validasi NIK, multibahasa, integrasi BPJS Kesehatan). Versi sebelumnya (3.0) LIVE untuk autentikasi dan RBAC dasar, tetapi perubahan database menyebabkan inkonsistensi. Versi 4.1 memperbaiki ini dengan desain modular, hybrid RBAC + ABAC, dan tabel `restrictions_definitions` untuk batasan terstruktur.

### 1.3 Ruang Lingkup
Sistem mencakup:
- **Portal**:
  - **Sistem Core** (`/core`): Staf TPA internal.
  - **Portal Klien** (`/client`): Perusahaan klien.
  - **Portal Provider** (`/provider`): Penyedia layanan kesehatan.
  - **Aplikasi Mobile Member** (`/member`): Anggota individu.
- **Fitur Utama**:
  - Autentikasi via NextAuth.js dengan JWT.
  - Tipe pengguna: `CORE`, `CLIENT`, `PROVIDER`, `MEMBER`, `LEXICON`, `FUTURE_APP`.
  - RBAC untuk akses modul (e.g., `claims:read`).
  - ABAC untuk pembatasan data (e.g., `CLIENT_CODE`, `ACCESS_HOURS`).
  - Audit logging untuk kepatuhan UU PDP dan HIPAA.
  - Dukungan multibahasa (Indonesia, Inggris) via `next-i18next`.
  - Validasi NIK dan nomor telepon (+62).

### 1.4 Pemangku Kepentingan
- **TPA Administrator**: Mengelola pengguna, peran, izin.
- **Client (Corporate)**: Manajemen anggota dan laporan.
- **Provider**: Pemrosesan klaim dan pembayaran.
- **Member**: Pengajuan klaim dan informasi polis.
- **Regulator**: Kepatuhan UU PDP, OJK, HIPAA.
- **Auditor**: Memeriksa audit log.

---

## 2. Tujuan Bisnis

### 2.1 Tujuan Utama
- Menyediakan sistem RBAC + ABAC terpadu untuk empat portal.
- Memastikan autentikasi aman (< 500ms) via NextAuth.js.
- Mengelola akses granular dengan RBAC (modul) dan ABAC (data).
- Mendukung kompleksitas TPA (hierarki klien, penugasan provider).
- Mematuhi UU PDP (hak akses, hapus) dan HIPAA.
- Mendukung pasar Indonesia (NIK, multibahasa, BPJS).

### 2.2 Manfaat Bisnis
- **Keamanan**: Isolasi portal, audit log lengkap.
- **Efisiensi**: Otomatisasi peran mengurangi kerja manual 90%.
- **Fleksibilitas**: Mendukung hierarki klien dan capitation.
- **Pengalaman Pengguna**: NPS > 70 dengan dasbor dinamis.
- **Skalabilitas**: 10.000 pengguna aktif bersamaan.
- **Kepatuhan**: Enkripsi data, audit log sesuai regulasi.

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
│   ├── Manajemen Member
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
const USER_TYPES = [
  { name: 'CORE', description: { en: 'Core System User', id: 'Pengguna Sistem Inti' }, portal_access: ['core'] },
  { name: 'CLIENT', description: { en: 'Client User', id: 'Pengguna Klien' }, portal_access: ['client'] },
  { name: 'PROVIDER', description: { en: 'Provider User', id: 'Pengguna Provider' }, portal_access: ['provider'] },
  { name: 'MEMBER', description: { en: 'Member User', id: 'Pengguna Anggota' }, portal_access: ['member'] },
  { name: 'LEXICON', description: { en: 'Lexicon App User', id: 'Pengguna Aplikasi Lexicon' }, portal_access: ['lexicon'] },
  { name: 'FUTURE_APP', description: { en: 'Future App User', id: 'Pengguna Aplikasi Masa Depan' }, portal_access: ['future_app'] }
];
```

### 3.2 Sistem Role Multi-Portal
#### 3.2.1 Role Sistem Core
| Role | Deskripsi (en) | Deskripsi (id) | Permissions |
|------|----------------|----------------|-------------|
| SUPER_ADMIN | Full access to all modules | Akses penuh ke semua modul | * |
| ADMIN | Organization admin | Admin organisasi | claims:read, claims:write, members:read, members:write, providers:read, providers:write, policies:read, policies:write, finance:read, finance:write, analytics:read |
| MANAGER | Department manager | Manajer departemen | claims:read, claims:write, members:read, members:write, policies:read, analytics:read |
| CLAIMS_PROCESSOR | Process claims | Pemroses Klaim | claims:read, claims:write, members:read, providers:read |
| MEMBER_SPECIALIST | Manage member data | Spesialis Keanggotaan | members:read, members:write, clients:read |
| PROVIDER_SPECIALIST | Manage provider data | Spesialis Provider | providers:read, providers:write, claims:read |
| VIEWER | View-only access | Hanya lihat | analytics:read |
| MODULE_ADMIN | Future module admin | Admin Modul Masa Depan | Configurable |

#### 3.2.2 Role Portal Klien
| Role | Deskripsi (en) | Deskripsi (id) | Permissions |
|------|----------------|----------------|-------------|
| CLIENT_ADMIN | Manage client data | Admin Klien | members:read, members:write, clients:read, claims:read, claims:write, reports:read |
| CLIENT_HR | HR client management | HR Klien | members:read, members:write, reports:read |
| CLIENT_USER | Client user | Pengguna Klien | members:read |

#### 3.2.3 Role Portal Provider
| Role | Deskripsi (en) | Deskripsi (id) | Permissions |
|------|----------------|----------------|-------------|
| PROVIDER_ADMIN | Manage provider data | Admin Provider | claims:read, claims:write, members:read, payments:read, medical_data:read |
| PROVIDER_STAFF | Provider staff | Staff Provider | claims:read, claims:write, members:read |

#### 3.2.4 Role Aplikasi Mobile Member
| Role | Deskripsi (en) | Deskripsi (id) | Permissions |
|------|----------------|----------------|-------------|
| MEMBER | Individual member | Anggota | members:read, claims:read, claims:write, policies:read, card:read, directory:read, statusehat:read |

#### 3.2.5 Additional Roles
- **LEXICON_USER**: Access health profiles (BRD-7), permissions: `members:risk-data`.
- **FUTURE_APP_USER**: Placeholder for future apps, permissions configurable.

### 3.3 Kontrol Akses Kontekstual
- **Definisi**: RBAC for module access (via `roles` and `permissions`), ABAC for data restrictions (via `users.restrictions` and `restrictions_definitions`).
- **Contoh Skenario (John - CLAIMS_PROCESSOR)**:
```typescript
const johnProfile = {
  tipePengguna: 'CORE',
  role: 'CLAIMS_PROCESSOR',
  permissions: ['claims:read', 'claims:write', 'members:read', 'providers:read'],
  restrictions: {
    ACCESS_HOURS: { start: '08:00', end: '17:00', days: [1, 2, 3, 4, 5] },
    MAX_CLAIM_AMOUNT: { value: 100000000, currency: 'IDR', operator: 'LE' }
  }
};
```

### 3.4 Fitur Fungsional
#### 3.4.1 Autentikasi & Manajemen Sesi
- **FR-AUTH-001**: Sign-in via `email` or `username` using NextAuth.js, supports NIK validation.
- **FR-AUTH-002**: JWT session management (creation, validation, refresh, deletion).
- **FR-AUTH-003**: JWT includes `userId`, `userType`, `roleIds`, `restrictions`, `portalAccess`.
- **FR-AUTH-004**: Secure sign-out with session deletion.
- **FR-AUTH-005**: Support identifiers (`member_number`, `client_code`, `provider_code`) via `user_identifiers`.
- **Contoh JWT**:
```json
{
  "user": {
    "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "email": "john.doe@supertpa.dev",
    "userType": "CORE",
    "roleIds": ["role-claims-uuid"],
    "restrictions": {
      "MAX_CLAIM_AMOUNT": { "value": 100000000, "currency": "IDR", "operator": "LE" },
      "ACCESS_HOURS": { "start": "08:00", "end": "17:00", "days": [1, 2, 3, 4, 5] }
    },
    "portalAccess": ["core"]
  },
  "expires": "2025-07-06T12:00:00.000Z"
}
```

#### 3.4.2 Manajemen Pengguna
- **FR-USER-001**: CRUD for `users` with `email`, `username`, `userType`, `status`, `restrictions`.
- **FR-USER-002**: User types: `CORE`, `CLIENT`, `PROVIDER`, `MEMBER`, `LEXICON`, `FUTURE_APP`.
- **FR-USER-003**: Multi-role support via `user_roles`.
- **FR-USER-004**: Status: `ACTIVE`, `PENDING_APPROVAL`, `INACTIVE`, `SUSPENDED`.
- **FR-USER-005**: Contextual restrictions in `users.restrictions` (JSONB).

#### 3.4.3 Manajemen Peran & Izin
- **FR-ROLE-001**: CRUD for `roles` with `name`, `allowed_user_types`, `default_portal_access`.
- **FR-ROLE-002**: CRUD for atomic `permissions` with `name`, `module`, `action`.
- **FR-ROLE-003**: Assign permissions to roles via `role_permissions`.
- **FR-ROLE-004**: Dynamic role additions (e.g., `FINANCE_ADMIN`) via database inserts.

#### 3.4.4 Kontrol Akses Kontekstual
- **FR-RBAC-001**: RBAC for module access via `roles` and `permissions`.
- **FR-RBAC-002**: ABAC for data restrictions via `users.restrictions` and `restrictions_definitions`.
- **FR-RBAC-003**: Restrict `CLIENT` users to `restrictions.CLIENT_CODE`.
- **FR-RBAC-004**: Restrict `PROVIDER` users to `restrictions.PROVIDER_CODE`.
- **FR-RBAC-005**: Restrict `MEMBER` users to `restrictions.MEMBER_NUMBER`.
- **FR-RBAC-006**: `SUPER_ADMIN` bypasses restrictions.
- **FR-RBAC-007**: Support future restrictions (e.g., time, money) via `restrictions_definitions`.
- **Implementation**:
```typescript
export class AuthorizationService {
  static async hasPermission(
    userId: string,
    permission: string,
    context?: {
      clientCode?: string;
      providerCode?: string;
      memberNumber?: string;
      currentTime?: string;
      claimAmount?: number;
    }
  ): Promise<{
    allowed: boolean;
    reason?: string;
    requiresApproval?: boolean;
  }> {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: { user_roles: { include: { roles: true } } }
    });
    if (!user) return { allowed: false, reason: user.preferred_language === 'id' ? 'Pengguna tidak ditemukan' : 'User not found' };

    // SUPER_ADMIN bypass
    if (user.user_type === 'CORE' && user.user_roles.some(ur => ur.roles.name === 'SUPER_ADMIN')) {
      return { allowed: true };
    }

    // Check RBAC permissions
    const hasBasePermission = await this.checkBasePermission(user, permission);
    if (!hasBasePermission) {
      return { allowed: false, reason: user.preferred_language === 'id' ? 'Tidak memiliki izin dasar' : 'No base permission' };
    }

    // Apply ABAC restrictions
    const restrictions = user.restrictions || {};
    if (user.user_type === 'CLIENT' && context?.clientCode && restrictions.CLIENT_CODE !== context.clientCode) {
      return { allowed: false, reason: user.preferred_language === 'id' ? 'Akses dibatasi ke kode klien Anda' : 'Access restricted to your client code' };
    }
    if (user.user_type === 'PROVIDER' && context?.providerCode && restrictions.PROVIDER_CODE !== context.providerCode) {
      return { allowed: false, reason: user.preferred_language === 'id' ? 'Akses dibatasi ke kode provider Anda' : 'Access restricted to your provider code' };
    }
    if (user.user_type === 'MEMBER' && context?.memberNumber && restrictions.MEMBER_NUMBER !== context.memberNumber) {
      return { allowed: false, reason: user.preferred_language === 'id' ? 'Akses dibatasi ke nomor anggota Anda' : 'Access restricted to your member number' };
    }
    if (restrictions.ACCESS_HOURS && context?.currentTime) {
      const { start, end, days } = restrictions.ACCESS_HOURS;
      const now = new Date();
      if (!days.includes(now.getDay()) || context.currentTime < start || context.currentTime > end) {
        return { allowed: false, reason: user.preferred_language === 'id' ? 'Akses di luar jam yang diizinkan' : 'Access outside allowed hours' };
      }
    }
    if (restrictions.MAX_CLAIM_AMOUNT && context?.claimAmount) {
      const { value, currency, operator } = restrictions.MAX_CLAIM_AMOUNT;
      if (currency === 'IDR' && operator === 'LE' && context.claimAmount > value) {
        return { allowed: false, reason: user.preferred_language === 'id' ? 'Jumlah klaim melebihi batas' : 'Claim amount exceeds limit' };
      }
    }

    // Check contextual rules
    const rules = await prisma.contextual_rules.findMany({
      where: { role_id: { in: user.user_roles.map(ur => ur.role_id) } }
    });
    for (const rule of rules) {
      if (this.evaluateConditions(rule.conditions, context)) {
        if (rule.rule_action === 'REQUIRE_APPROVAL') {
          return { allowed: true, requiresApproval: true };
        }
        return { allowed: rule.rule_action === 'ALLOW', reason: rule.description };
      }
    }

    return { allowed: true };
  }

  private static async checkBasePermission(user: any, permission: string): Promise<boolean> {
    const rolePermissions = await prisma.role_permissions.findMany({
      where: { role_id: { in: user.user_roles.map((ur: any) => ur.role_id) } },
      select: { permission_id: true }
    });
    const permissions = await prisma.permissions.findMany({
      where: { id: { in: rolePermissions.map((rp: any) => rp.permission_id) } }
    });
    return permissions.some(p => p.name === permission || p.name === '*');
  }

  private static evaluateConditions(conditions: any, context: any): boolean {
    for (const key in conditions) {
      const { value, operator } = conditions[key];
      const actualValue = context[key];
      if (!actualValue) return false;
      switch (key) {
        case 'amount':
          if (operator === 'LESS_THAN_EQUAL') return actualValue <= value;
          break;
        case 'clientId':
          if (operator === 'EQ') return actualValue === value;
          break;
      }
    }
    return true;
  }
}
```

#### 3.4.5 Multi-Portal Access
- **FR-PORTAL-001**: Auto-redirect to portal based on `portal_access`.
- **FR-PORTAL-002**: Protect routes/APIs with `AuthorizationService` via Next.js middleware.
- **FR-PORTAL-003**: Validate portal access via `portal_access` and `AuthorizationService`.
- **Contoh Middleware**:
```typescript
import { getSession } from 'next-auth/react';
import { AuthorizationService } from '../services/authorization';

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session || !session.user || !session.user.id) {
    return res.status(401).json({ message: session?.user?.preferred_language === 'id' ? 'Tidak terautentikasi' : 'Unauthorized' });
  }

  const hasPortalAccess = await AuthorizationService.hasPermission(
    session.user.id,
    `portal:access:${req.url.split('/')[1]}`
  );
  if (!hasPortalAccess.allowed) {
    return res.status(403).json({ message: session.user.preferred_language === 'id' ? 'Dilarang: Tidak memiliki akses ke portal' : 'Forbidden: No access to portal' });
  }
}
```

#### 3.4.6 WebSocket Authentication
- **FR-WS-001**: Authenticate WebSocket connections using JWT.
- **FR-WS-002**: Authorize via `AuthorizationService`, applying RBAC and ABAC.
- **FR-WS-003**: Return bilingual errors.
- **API**:
```typescript
WS /ws/auth
// Payload: { token: string, language: 'en' | 'id' }
// Response (id, error): { error: "Autentikasi gagal" }
```

#### 3.4.7 Notification System
- **FR-NOTIF-001**: Email/SMS notifications for events (e.g., BRD-2 bulk upload).
- **FR-NOTIF-002**: Use `preferred_language` for messages.
- **FR-NOTIF-003**: Integrate with Twilio Indonesia for SMS.
- **API**:
```typescript
POST /api/notifications/email
// Payload: { userId: string, subject: string, message: string, language: 'en' | 'id' }
// Example (id): { subject: "Status Unggah Massal", message: "Unggah selesai" }
```

---

## 4. Skema Database
### 4.1 Tabel Pengguna
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  phone VARCHAR(20), -- Format +62
  user_type VARCHAR(20) NOT NULL DEFAULT 'CORE',
  portal_access TEXT[],
  preferred_language VARCHAR(2) DEFAULT 'en',
  status VARCHAR(20) DEFAULT 'PENDING_APPROVAL',
  restrictions JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID,
  updated_by UUID
);

CREATE TABLE user_identifiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  identifier_type VARCHAR(20) NOT NULL, -- MEMBER_NUMBER, CLIENT_CODE, PROVIDER_CODE, NIK, PHONE
  identifier_value VARCHAR(255) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, identifier_type, identifier_value),
  CHECK (identifier_type = 'NIK' AND identifier_value ~ '^[0-9]{16}$' OR identifier_type != 'NIK'),
  CHECK (identifier_type = 'PHONE' AND identifier_value ~ '^\+62[0-9]{9,12}$' OR identifier_type != 'PHONE')
);

CREATE TABLE user_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(20) UNIQUE NOT NULL,
  description JSONB,
  portal_access TEXT[] NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
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
  name VARCHAR(50) UNIQUE NOT NULL,
  description JSONB,
  allowed_user_types TEXT[] NOT NULL,
  default_portal_access TEXT[] NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
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

CREATE TABLE restrictions_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL, -- e.g., CLIENT_CODE, ACCESS_HOURS
  description JSONB, -- { "en": "Client code restriction", "id": "Pembatasan kode klien" }
  value_type VARCHAR(20) NOT NULL, -- STRING, TIME_RANGE, MONETARY
  allowed_user_types TEXT[] NOT NULL,
  validation_rule TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4.5 Predefined Restrictions
| Name | Description (en) | Description (id) | Value Type | Allowed User Types | Validation Rule |
|------|------------------|------------------|------------|-------------------|-----------------|
| CLIENT_CODE | Restrict to client code | Pembatasan kode klien | STRING | ['CLIENT'] | ^[A-Z0-9]{4}$ |
| PROVIDER_CODE | Restrict to provider code | Pembatasan kode provider | STRING | ['PROVIDER'] | ^[A-Z0-9]{4}$ |
| MEMBER_NUMBER | Restrict to member number | Pembatasan nomor anggota | STRING | ['MEMBER'] | ^M[0-9]{5}$ |
| ACCESS_HOURS | Restrict access hours | Pembatasan jam akses | TIME_RANGE | ['CORE', 'CLIENT', 'PROVIDER'] | { start: HH:MM, end: HH:MM, days: [1-7] } |
| MAX_CLAIM_AMOUNT | Restrict claim amount | Batas jumlah klaim | MONETARY | ['CORE', 'PROVIDER'] | { value: NUMBER, currency: 'IDR', operator: 'LE' } |

- **Example Insert**:
```sql
INSERT INTO restrictions_definitions (name, description, value_type, allowed_user_types, validation_rule)
VALUES
  ('CLIENT_CODE', '{"en": "Restrict to client code", "id": "Pembatasan kode klien"}', 'STRING', '{"CLIENT"}', '^[A-Z0-9]{4}$'),
  ('ACCESS_HOURS', '{"en": "Restrict access hours", "id": "Pembatasan jam akses"}', 'TIME_RANGE', '{"CORE", "CLIENT", "PROVIDER"}', '{ start: HH:MM, end: HH:MM, days: [1-7] }'),
  ('MAX_CLAIM_AMOUNT', '{"en": "Restrict claim amount", "id": "Batas jumlah klaim"}', 'MONETARY', '{"CORE", "PROVIDER"}', '{ value: NUMBER, currency: "IDR", operator: "LE" }');
```

---

## 5. Implementasi Komponen

### 5.1 MultiPortalUserService
```typescript
export class MultiPortalUserService {
  static async createUser(userData: {
    email: string;
    username: string;
    userType: 'CORE' | 'CLIENT' | 'PROVIDER' | 'MEMBER' | 'LEXICON' | 'FUTURE_APP';
    phone?: string;
    restrictions?: any;
  }) {
    const user = await prisma.users.create({
      data: {
        ...userData,
        portal_access: USER_TYPES.find(ut => ut.name === userData.userType)?.portal_access || [],
        restrictions: userData.restrictions || {},
        status: 'PENDING_APPROVAL'
      }
    });
    return user;
  }

  static async assignRole(userId: string, roleId: string, context?: any) {
    return await prisma.user_roles.create({
      data: {
        user_id: userId,
        role_id: roleId,
        context: context || {},
        is_active: true
      }
    });
  }
}
```

### 5.2 AuthorizationService
(See section 3.4.4 for implementation.)

---

## 6. Spesifikasi Non-Fungsional

### 6.1 Performa
- **NFR-PERF-001**: Login < 500ms for 95% requests.
- **NFR-PERF-002**: `AuthorizationService.hasPermission` < 100ms for 95% requests.
- **NFR-PERF-003**: Database queries < 50ms for 95% requests.

### 6.2 Keamanan
- **NFR-SEC-001**: Hash credentials with bcrypt.
- **NFR-SEC-002**: JWT session with auto-refresh.
- **NFR-SEC-003**: All APIs protected by `AuthorizationService`.
- **NFR-SEC-004**: Full portal isolation.
- **NFR-SEC-005**: JSONB input validation.

### 6.3 Skalabilitas
- **NFR-SCAL-001**: Support 10,000 concurrent users.
- **NFR-SCAL-002**: Add restrictions without schema changes.

### 6.4 Maintainabilitas
- **NFR-MAINT-001**: Modular `MultiPortalUserService` and `AuthorizationService`.
- **NFR-MAINT-002**: Admin interface for rules (future phase).

### 6.5 Usability
- **NFR-USAB-001**: Multibahasa via `next-i18next`.
- **NFR-USAB-002**: WCAG 2.1 accessibility.
- **NFR-USAB-003**: Bilingual error messages.
- **Example id.json**:
```json
{
  "login_error": "Email, nama pengguna, atau kata sandi salah",
  "forbidden": "Dilarang: Tidak memiliki akses ke portal",
  "restricted_data": "Akses dibatasi ke data Anda sendiri",
  "time_restricted": "Akses di luar jam yang diizinkan",
  "amount_restricted": "Jumlah klaim melebihi batas"
}
```

### 6.6 Kepatuhan
- **NFR-COMP-001**: Audit logs for all user actions (UU PDP, HIPAA).
- **NFR-COMP-002**: Data management per UU PDP.

---

## 7. Roadmap Implementasi
### Fase 1: Fondasi Multi-Portal (Minggu 1-2)
- Setup database schema (`users`, `roles`, `permissions`, `restrictions_definitions`).
- Implement NextAuth.js authentication.
- Basic portal routing with middleware.

### Fase 2: RBAC + ABAC (Minggu 3-4)
- Implement `AuthorizationService` for RBAC and ABAC.
- Setup `restrictions_definitions` and `users.restrictions`.
- Test role-based and data restrictions.

### Fase 3: Pengembangan Portal (Minggu 5-8)
- Dynamic dashboards for all portals.
- Client, provider, and member portal features.

### Fase 4: Fitur Lanjutan & Pengujian (Minggu 9-12)
- Approval workflows for `REQUIRE_APPROVAL`.
- Test critical use cases (TC-001 to TC-006).
- Audit reporting and performance monitoring.

---

## 8. Metrik Keberhasilan
- **Autentikasi**: Login < 500ms, auto-redirect by `userType`.
- **Kontrol Akses**: 100% API endpoints protected.
- **Multi-Portal**: Full isolation across portals.
- **Keamanan**: Zero breaches, full audit logs.
- **Performa**: Permission checks < 100ms, queries < 50ms.
- **Skalabilitas**: 10,000 concurrent users.
- **Kepatuhan**: UU PDP and HIPAA compliance.

---

## 9. Uji Kasus Kritis
### TC-001: Super Admin Bypass
- **Skenario**: `superadmin@supertpa.dev` accesses `/core/claims/delete`.
- **Hasil**: `{ allowed: true }`.

### TC-002: Claims Processor - Batas Jumlah
- **Kondisi**: `MAX_CLAIM_AMOUNT: 100M IDR`.
- **Skenario**: Process claim of 75M IDR.
- **Hasil**: `{ allowed: true }`.

### TC-003: Claims Processor - Batas Waktu
- **Kondisi**: `ACCESS_HOURS: 08:00-17:00, days: [1-5]`.
- **Skenario**: Process claim on Sunday or Wednesday 19:00.
- **Hasil**: `{ allowed: false, reason: 'Akses di luar jam yang diizinkan' }`.

### TC-004: Client Admin - Akses Portal
- **Skenario**: `CLIENT_ADMIN` accesses `/core/dashboard`.
- **Hasil**: `{ allowed: false, reason: 'Dilarang: Tidak memiliki akses ke portal' }`.

### TC-005: Client User - Hak Baca
- **Skenario**: `CLIENT_USER` tries to edit member data or access another client’s data.
- **Hasil**: `{ allowed: false, reason: 'Akses dibatasi ke kode klien Anda' }`.

### TC-006: Member - Data Restriction
- **Skenario**: `MEMBER` accesses another member’s data.
- **Hasil**: `{ allowed: false, reason: 'Akses dibatasi ke nomor anggota Anda' }`.

---

## 10. Status Implementasi
- **Status Sebelumnya**: Version 3.0 LIVE (authentication, basic RBAC, dynamic dashboards).
- **Status Baru**: Version 4.1 ready for re-implementation with hybrid RBAC + ABAC.
- **Fitur LIVE**:
  - NextAuth.js authentication.
  - Basic RBAC.
  - Dynamic dashboards.
- **Fokus Implementasi Ulang**:
  - Hybrid RBAC + ABAC.
  - Structured restrictions via `restrictions_definitions`.
  - Dynamic role support.
  - Indonesia-specific features (NIK, multibahasa).
- **Tanggal Target**: 31 August 2025.

---

## 11. Risiko dan Mitigasi
| **Risiko** | **Dampak** | **Mitigasi** |
|------------|------------|--------------|
| Inkonsistensi database | Bug akses | Final schema, migration testing |
| JSONB evaluation slow | Low performance | GIN indexes, Redis caching |
| Portal access leakage | Security breach | Strict middleware, cross-portal testing |
| Invalid NIK | Data errors | Regex validation, manual fallback |
| Complex rules | Permission errors | JSONB schema validation, critical tests |
| Low scalability | System slowdown | Microservices, load balancing |

---

## 12. Persetujuan
**Disetujui oleh**: [TBD - Pemangku Kepentingan]  
**Tanggal Persetujuan**: [TBD]