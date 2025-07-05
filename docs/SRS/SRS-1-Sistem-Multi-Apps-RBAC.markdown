# Software Requirements Specification (SRS) - Sistem Multi-Apps RBAC

**Modul**: Sistem Multi-Apps RBAC  
**Tanggal**: 5 July 2025  
**Versi**: 2.2 (Hybrid RBAC + ABAC, Aligned with BRD-1 v4.1, BRD-3 v2.1)  
**Status**: 📋 Siap untuk Implementasi Ulang  
**Dibuat oleh**: Tim Pengembangan  
**Disetujui oleh**: [TBD - Pemangku Kepentingan]

---

## 1. Pendahuluan

### 1.1 Tujuan Dokumen
Dokumen ini merinci persyaratan fungsional dan non-fungsional untuk Sistem Multi-Portal Role-Based Access Control (RBAC) dan Attribute-Based Access Control (ABAC) Terpadu untuk aplikasi **SuperTPA**. Sistem ini mendukung empat portal (**Sistem Core**, **Portal Klien**, **Portal Provider**, **Aplikasi Mobile Member**) dengan autentikasi terpadu, manajemen pengguna, dan kontrol akses berbasis peran (RBAC) serta atribut (ABAC). SRS ini diselaraskan dengan **BRD-1 v4.1**, **BRD-2 v3.3**, dan **BRD-3 v2.1**, mematuhi regulasi **UU PDP** dan **HIPAA**.

### 1.2 Ruang Lingkup
Sistem mencakup:
- **Autentikasi**: NextAuth.js dengan JWT, login via `email`/`username`, validasi NIK.
- **Manajemen Pengguna**: Tipe pengguna (`CORE`, `CLIENT`, `PROVIDER`, `MEMBER`, `LEXICON`, `FUTURE_APP`) dengan `user_identifiers`.
- **RBAC**: Dynamic roles (`roles`, `permissions`, `role_permissions`) untuk akses modul, termasuk Policy Management.
- **ABAC**: Data restrictions via `users.restrictions` dan `restrictions_definitions` (e.g., `CLIENT_CODE`, `POLICY_NUMBER`).
- **Multi-Portal**: Isolasi akses ke `/core`, `/client`, `/provider`, `/member`.
- **Integration**: Support for Policy Management module (`BRD-3`) with Member, Claims, Provider, and Financial modules.
- **Kepatuhan**: Audit logs, UU PDP, HIPAA.
- **Usability**: Multibahasa (Indonesia, Inggris) via `next-i18next`, WCAG 2.1.

### 1.3 Latar Belakang
Sistem ini mendukung kebutuhan TPA di Indonesia (200,000+ karyawan) dengan hierarki klien, penugasan provider, validasi lokal (NIK, +62), dan manajemen polis (BRD-3). Versi sebelumnya (1.0) LIVE untuk autentikasi dan RBAC dasar, tetapi bug akibat perubahan database memerlukan implementasi ulang dengan desain modular, hybrid RBAC + ABAC, dan `restrictions_definitions`.

---

## 2. Persyaratan Fungsional

### 2.1 Autentikasi & Manajemen Sesi
- **FR-AUTH-001**: Sign-in via `email` atau `username` menggunakan NextAuth.js, mendukung validasi NIK (`^[0-9]{16}$`) dan telepon (`^\+62[0-9]{9,12}$`).
- **FR-AUTH-002**: Manajemen sesi dengan JWT (`userId`, `userType`, `roleIds`, `restrictions`, `portalAccess`).
- **FR-AUTH-003**: JWT structure:
```json
{
  "user": {
    "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "email": "john.doe@supertpa.dev",
    "userType": "CORE",
    "roleIds": ["role-policy-admin-uuid"],
    "restrictions": {
      "POLICY_NUMBER": "POL123",
      "CLIENT_CODE": "C789",
      "MAX_CLAIM_AMOUNT": { "value": 100000000, "currency": "IDR", "operator": "LE" }
    },
    "portalAccess": ["core"]
  },
  "expires": "2025-07-06T12:00:00.000Z"
}
```
- **FR-AUTH-004**: Secure sign-out with session deletion.
- **FR-AUTH-005**: Support identifiers (`member_number`, `client_code`, `provider_code`, `policy_number`) via `user_identifiers`.

### 2.2 Manajemen Pengguna
- **FR-USER-001**: CRUD pada `users` dengan atribut: `email`, `username`, `password_hash`, `phone`, `user_type`, `status`, `restrictions`, `portal_access`, `preferred_language`.
- **FR-USER-002**: Tipe pengguna: `CORE`, `CLIENT`, `PROVIDER`, `MEMBER`, `LEXICON`, `FUTURE_APP`.
- **FR-USER-003**: Multi-peran via `user_roles`.
- **FR-USER-004**: Status: `ACTIVE`, `PENDING_APPROVAL`, `INACTIVE`, `SUSPENDED`.
- **FR-USER-005**: Restrictions di `users.restrictions` (JSONB).
  - Contoh:
```json
{
  "CLIENT_CODE": "C789",
  "POLICY_NUMBER": "POL123",
  "ACCESS_HOURS": { "start": "08:00", "end": "17:00", "days": [1, 2, 3, 4, 5] },
  "MAX_CLAIM_AMOUNT": { "value": 100000000, "currency": "IDR", "operator": "LE" }
}
```
- **FR-USER-006**: Validasi NIK dan telepon di `user_identifiers`.

### 2.3 Manajemen Peran & Izin
- **FR-ROLE-001**: CRUD untuk `roles` dengan `name`, `description` (JSONB), `allowed_user_types`, `default_portal_access`.
  - Contoh (updated with Policy Management roles):
```json
[
  {
    "id": "role-policy-admin-uuid",
    "name": "POLICY_ADMIN",
    "description": { "en": "Manage policies and benefits", "id": "Kelola polis dan manfaat" },
    "allowed_user_types": ["CORE"],
    "default_portal_access": ["core"]
  },
  {
    "id": "role-policy-analyst-uuid",
    "name": "POLICY_ANALYST",
    "description": { "en": "Analyze policy data", "id": "Analisis data polis" },
    "allowed_user_types": ["CORE", "CLIENT"],
    "default_portal_access": ["core", "client"]
  },
  {
    "id": "role-policy-viewer-uuid",
    "name": "POLICY_VIEWER",
    "description": { "en": "View policy data", "id": "Lihat data polis" },
    "allowed_user_types": ["CORE", "CLIENT", "PROVIDER"],
    "default_portal_access": ["core", "client", "provider"]
  }
]
```
- **FR-ROLE-002**: CRUD untuk `permissions` dengan `name`, `module`, `action`.
  - Contoh (updated with Policy Management permissions):
```json
[
  { "id": "perm-policies-read-uuid", "name": "policies:read", "module": "policies", "action": "read" },
  { "id": "perm-policies-write-uuid", "name": "policies:write", "module": "policies", "action": "write" },
  { "id": "perm-benefits-configure-uuid", "name": "benefits:configure", "module": "benefits", "action": "configure" },
  { "id": "perm-policies-analyze-uuid", "name": "policies:analyze", "module": "policies", "action": "analyze" }
]
```
- **FR-ROLE-003**: Penugasan izin via `role_permissions`.
  - Contoh:
```json
[
  { "role_id": "role-policy-admin-uuid", "permission_id": "perm-policies-read-uuid" },
  { "role_id": "role-policy-admin-uuid", "permission_id": "perm-policies-write-uuid" },
  { "role_id": "role-policy-admin-uuid", "permission_id": "perm-benefits-configure-uuid" },
  { "role_id": "role-policy-analyst-uuid", "permission_id": "perm-policies-analyze-uuid" }
]
```
- **FR-ROLE-004**: Dynamic role additions (e.g., `FINANCE_ADMIN`, `POLICY_ADMIN`) via database inserts.

### 2.4 Kontrol Akses Kontekstual & RBAC Dinamis
- **FR-RBAC-001**: `AuthorizationService` mengevaluasi izin berdasarkan `userId`, `permission`, dan konteks.
- **FR-RBAC-002**: Prioritas: `users.restrictions` (ABAC) > `contextual_rules` > `role_permissions` (RBAC).
- **FR-RBAC-003**: Dukungan `rule_action`: ALLOW, DENY, REQUIRE_APPROVAL.
- **FR-RBAC-004**: ABAC via `users.restrictions` untuk `CLIENT_CODE`, `PROVIDER_CODE`, `MEMBER_NUMBER`, `POLICY_NUMBER`.
- **FR-RBAC-005**: `restrictions_definitions` untuk meta-data batasan.
  - Contoh (updated with Policy Management):
```json
[
  {
    "id": "rd-client-code-uuid",
    "name": "CLIENT_CODE",
    "description": { "en": "Restrict to client code", "id": "Pembatasan kode klien" },
    "value_type": "STRING",
    "allowed_user_types": ["CLIENT"],
    "validation_rule": "^[A-Z0-9]{4}$"
  },
  {
    "id": "rd-policy-number-uuid",
    "name": "POLICY_NUMBER",
    "description": { "en": "Restrict to policy number", "id": "Pembatasan nomor polis" },
    "value_type": "STRING",
    "allowed_user_types": ["CORE", "CLIENT", "MEMBER"],
    "validation_rule": "^POL[0-9]{3}$"
  },
  {
    "id": "rd-max-claim-uuid",
    "name": "MAX_CLAIM_AMOUNT",
    "description": { "en": "Restrict claim amount", "id": "Batas jumlah klaim" },
    "value_type": "MONETARY",
    "allowed_user_types": ["CORE", "PROVIDER"],
    "validation_rule": "{ value: NUMBER, currency: 'IDR', operator: 'LE' }"
  }
]
```
- **FR-RBAC-006**: `SUPER_ADMIN` bypasses restrictions.
- **FR-RBAC-007**: Logika evaluasi (updated for Policy Management):
```typescript
export class AuthorizationService {
  static async hasPermission(
    userId: string,
    permission: string,
    context?: {
      clientCode?: string;
      providerCode?: string;
      memberNumber?: string;
      policyNumber?: string;
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
    if (restrictions.POLICY_NUMBER && context?.policyNumber && restrictions.POLICY_NUMBER !== context.policyNumber) {
      return { allowed: false, reason: user.preferred_language === 'id' ? 'Akses dibatasi ke nomor polis Anda' : 'Access restricted to your policy number' };
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
        case 'policyNumber':
          if (operator === 'EQ') return actualValue === value;
          break;
      }
    }
    return true;
  }
}
```

### 2.5 Multi-Portal Access
- **FR-PORTAL-001**: Auto-redirect to portal based on `portal_access`.
- **FR-PORTAL-002**: Protect routes/APIs with `AuthorizationService`.
- **FR-PORTAL-003**: Validate portal access via `portal_access` and `AuthorizationService`.
- **FR-PORTAL-004**: Protect Policy Management APIs (e.g., `/api/policies`, `/api/benefits/calculate`).
- **Contoh Middleware**:
```typescript
import { getSession } from 'next-auth/react';
import { AuthorizationService } from '../services/authorization';

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session || !session.user || !session.user.id) {
    return res.status(401).json({ message: session?.user?.preferred_language === 'id' ? 'Tidak terautentikasi' : 'Unauthorized' });
  }

  const portal = req.url.split('/')[1];
  const hasPortalAccess = await AuthorizationService.hasPermission(
    session.user.id,
    `portal:access:${portal}`
  );
  if (!hasPortalAccess.allowed) {
    return res.status(403).json({ message: session.user.preferred_language === 'id' ? 'Dilarang: Tidak memiliki akses ke portal' : 'Forbidden: No access to portal' });
  }

  if (req.url.includes('/api/policies')) {
    const { policyNumber, clientCode } = req.body || req.query;
    const hasPolicyAccess = await AuthorizationService.hasPermission(
      session.user.id,
      req.method === 'GET' ? 'policies:read' : 'policies:write',
      { policyNumber, clientCode }
    );
    if (!hasPolicyAccess.allowed) {
      return res.status(403).json({ message: hasPolicyAccess.reason || 'Forbidden' });
    }
  }
}
```

---

## 3. Desain Database
### 3.1 Skema Database
- **users**:
  - `id` (UUID, PK)
  - `email` (VARCHAR, UNIQUE)
  - `username` (VARCHAR, UNIQUE)
  - `password_hash` (VARCHAR)
  - `phone` (VARCHAR, format +62)
  - `user_type` (VARCHAR: CORE, CLIENT, PROVIDER, MEMBER, LEXICON, FUTURE_APP)
  - `status` (VARCHAR: ACTIVE, PENDING_APPROVAL, INACTIVE, SUSPENDED)
  - `portal_access` (TEXT[])
  - `preferred_language` (VARCHAR: en, id)
  - `restrictions` (JSONB)
  - `created_at`, `updated_at` (TIMESTAMP)
  - `created_by`, `updated_by` (UUID)

- **user_identifiers**:
  - `id` (UUID, PK)
  - `user_id` (UUID, FK `users`)
  - `identifier_type` (VARCHAR: MEMBER_NUMBER, CLIENT_CODE, PROVIDER_CODE, POLICY_NUMBER, NIK, PHONE)
  - `identifier_value` (VARCHAR)
  - `is_verified` (BOOLEAN)
  - `created_at` (TIMESTAMP)
  - UNIQUE(`user_id`, `identifier_type`, `identifier_value`)
  - CHECK: NIK (`^[0-9]{16}$`), PHONE (`^\+62[0-9]{9,12}$`)

- **user_types**:
  - `id` (UUID, PK)
  - `name` (VARCHAR: CORE, CLIENT, PROVIDER, MEMBER, LEXICON, FUTURE_APP)
  - `description` (JSONB)
  - `portal_access` (TEXT[])
  - `created_at` (TIMESTAMP)

- **roles**:
  - `id` (UUID, PK)
  - `name` (VARCHAR, UNIQUE)
  - `description` (JSONB)
  - `allowed_user_types` (TEXT[])
  - `default_portal_access` (TEXT[])
  - `created_at`, `updated_at` (TIMESTAMP)

- **permissions**:
  - `id` (UUID, PK)
  - `name` (VARCHAR, UNIQUE)
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
  - `role_id` (UUID, FK `roles`, optional)
  - `conditions` (JSONB)
  - `rule_action` (VARCHAR: ALLOW, DENY, REQUIRE_APPROVAL)
  - `priority` (INTEGER)
  - `description` (TEXT)
  - `is_active` (BOOLEAN)
  - `is_system_rule` (BOOLEAN)
  - `created_by`, `updated_by` (UUID, FK `users`)
  - `created_at`, `updated_at` (TIMESTAMP)

- **restrictions_definitions**:
  - `id` (UUID, PK)
  - `name` (VARCHAR, UNIQUE)
  - `description` (JSONB)
  - `value_type` (VARCHAR: STRING, TIME_RANGE, MONETARY)
  - `allowed_user_types` (TEXT[])
  - `validation_rule` (TEXT)
  - `created_at` (TIMESTAMP)

### 3.2 Indeks Database
- GIN indexes on JSONB columns (`users.restrictions`, `contextual_rules.conditions`).
- Unique indexes on `users.email`, `users.username`.
- Indexes on `user_roles.user_id`, `role_permissions.role_id`.

---

## 4. Persyaratan Non-Fungsional

### 4.1 Performa
- **NFR-PERF-001**: Login < 500ms for 95% requests.
- **NFR-PERF-002**: `AuthorizationService.hasPermission` < 100ms for 95% requests.
- **NFR-PERF-003**: Policy API calls (e.g., `/api/policies`) < 200ms for 95% requests.
- **NFR-PERF-004**: Bulk policy operations (1,000 policies) < 60s.

### 4.2 Keamanan
- **NFR-SEC-001**: Hash credentials with bcrypt.
- **NFR-SEC-002**: JWT session with auto-refresh.
- **NFR-SEC-003**: All APIs (including Policy Management) protected by `AuthorizationService`.
- **NFR-SEC-004**: Full portal isolation.
- **NFR-SEC-005**: JSONB input validation.
- **NFR-SEC-006**: Audit logs for policy CRUD operations (UU PDP/HIPAA).

### 4.3 Skalabilitas
- **NFR-SCAL-001**: Support 10,000 concurrent users, 50,000+ policies.
- **NFR-SCAL-002**: Add restrictions/roles without schema changes.
- **NFR-SCAL-003**: AWS deployment with load balancing, Redis caching.

### 4.4 Maintainabilitas
- **NFR-MAINT-001**: Modular `AuthorizationService`, `MultiPortalUserService`.
- **NFR-MAINT-002**: Admin interface for rules/roles (future phase).
- **NFR-MAINT-003**: OpenAPI/Swagger documentation.

### 4.5 Usability
- **NFR-USAB-001**: Multibahasa via `next-i18next`.
- **NFR-USAB-002**: WCAG 2.1 accessibility.
- **NFR-USAB-003**: Bilingual error messages for policy operations.
- **Example id.json**:
```json
{
  "login_error": "Email, nama pengguna, atau kata sandi salah",
  "forbidden": "Dilarang: Tidak memiliki akses ke portal",
  "restricted_policy": "Akses dibatasi ke nomor polis Anda",
  "restricted_data": "Akses dibatasi ke data Anda sendiri"
}
```

### 4.6 Kepatuhan
- **NFR-COMP-001**: UU PDP data management.
- **NFR-COMP-002**: Audit logs for all user actions, including policy CRUD.
- **NFR-COMP-003**: HIPAA compliance for health data.

---

## 5. Implementasi & Teknologi
- **Backend**: Next.js (API Routes), Prisma (ORM), PostgreSQL.
- **Autentikasi**: NextAuth.js with JWT.
- **Frontend**: Next.js (React), Tailwind CSS.
- **Caching**: Redis for permission and policy checks.
- **Deployment**: AWS with Docker/Kubernetes.
- **Multibahasa**: `next-i18next`.
- **Pengujian**: Jest, Cypress.

### 5.1 Contoh Implementasi
#### MultiPortalUserService
```typescript
export class MultiPortalUserService {
  static async createUser(userData: {
    email: string;
    username: string;
    userType: 'CORE' | 'CLIENT' | 'PROVIDER' | 'MEMBER' | 'LEXICON' | 'FUTURE_APP';
    phone?: string;
    restrictions?: any;
  }) {
    if (userData.phone && !/^\+62\d{9,12}$/.test(userData.phone)) {
      throw new Error(userData.preferred_language === 'id' ? 'Format telepon tidak valid untuk Indonesia (+62)' : 'Invalid phone format for Indonesia (+62)');
    }
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

---

## 6. Uji Kasus Kritis
### TC-001: Super Admin Bypass
- **Kondisi**: `SUPER_ADMIN` user.
- **Skenario**: Access `/api/policies`.
- **Hasil**: `{ allowed: true }`.

### TC-002: Policy Admin - Policy Management
- **Kondisi**: `POLICY_ADMIN` with `policies:write`, `restrictions.CLIENT_CODE: 'C789'`.
- **Skenario**: Create policy for `clientCode: 'C789'`.
- **Hasil**: `{ allowed: true }`.

### TC-003: Policy Admin - Restricted Client
- **Kondisi**: `POLICY_ADMIN` with `restrictions.CLIENT_CODE: 'C789'`.
- **Skenario**: Create policy for `clientCode: 'C123'`.
- **Hasil**: `{ allowed: false, reason: 'Akses dibatasi ke kode klien Anda' }`.

### TC-004: Policy Analyst - Analytics Access
- **Kondisi**: `POLICY_ANALYST` with `policies:analyze`.
- **Skenario**: Access `/api/policies/comparison`.
- **Hasil**: `{ allowed: true }`.

### TC-005: Client User - Policy View
- **Kondisi**: `CLIENT_USER` with `policies:read`, `restrictions.POLICY_NUMBER: 'POL123'`.
- **Skenario**: Access policy `POL123`.
- **Hasil**: `{ allowed: true }`.

### TC-006: Member - Policy Restriction
- **Kondisi**: `MEMBER` with `restrictions.POLICY_NUMBER: 'POL123'`.
- **Skenario**: Access policy `POL456`.
- **Hasil**: `{ allowed: false, reason: 'Akses dibatasi ke nomor polis Anda' }`.

### TC-007: Validasi NIK Indonesia
- **Kondisi**: New user with invalid `phone`.
- **Skenario**: `MultiPortalUserService.createUser` with `phone: '08123456789'`.
- **Hasil**: Error: `'Format telepon tidak valid untuk Indonesia (+62)'`.

---

## 7. Roadmap Implementasi
### Fase 1: Fondasi Multi-Portal (Minggu 1-2)
- Setup database schema with GIN indexes.
- Implement NextAuth.js authentication.
- Basic portal routing with middleware.
- NIK and phone validation.

### Fase 2: RBAC + ABAC (Minggu 3-4)
- Implement `AuthorizationService` for RBAC and ABAC.
- Setup `restrictions_definitions` and `users.restrictions`.
- Test policy management roles and restrictions.

### Fase 3: Pengembangan Portal & Policy Management (Minggu 5-8)
- Dynamic dashboards for all portals.
- Policy Management APIs (`/api/policies`, `/api/benefits`).
- Client, provider, member portal features.

### Fase 4: Fitur Lanjutan & Pengujian (Minggu 9-12)
- Approval workflows for `REQUIRE_APPROVAL`.
- Test critical use cases (TC-001 to TC-007).
- Audit reporting and performance monitoring for policy operations.

---

## 8. Status Implementasi
- **Status Sebelumnya**: Version 1.0 LIVE (authentication, basic RBAC).
- **Status Baru**: Version 2.2 ready for re-implementation with hybrid RBAC + ABAC and Policy Management.
- **Fitur LIVE**:
  - NextAuth.js authentication.
  - Basic RBAC.
  - Dynamic dashboards.
- **Fokus Implementasi Ulang**:
  - Hybrid RBAC + ABAC.
  - Policy Management roles and APIs.
  - Structured restrictions via `restrictions_definitions`.
  - Indonesia-specific features (NIK, multibahasa).
- **Tanggal Target**: 31 August 2025.

---

## 9. Risiko dan Mitigasi
| **Risiko** | **Dampak** | **Mitigasi** |
|------------|------------|--------------|
| Inkonsistensi database | Bug akses | Final schema, migration testing |
| JSONB evaluation slow | Low performance | GIN indexes, Redis caching |
| Portal access leakage | Security breach | Strict middleware, cross-portal testing |
| Invalid NIK | Data errors | Regex validation, manual fallback |
| Complex policy rules | Permission errors | JSONB schema validation, critical tests |
| Policy integration issues | Data inconsistencies | Comprehensive integration testing |

---

## 10. Persetujuan
**Disetujui oleh**: [TBD - Pemangku Kepentingan]  
**Tanggal Persetujuan**: [TBD]