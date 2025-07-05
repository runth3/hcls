# Business Requirement Document (BRD) - Modul Manajemen Anggota dan Klien TPA

**Tanggal**: 05 Juli 2025  
**Versi**: 3.3  
**Dibuat oleh**: Tim Pengembangan TPA  
**Disetujui oleh**: 📋 **PENDING FINAL REVIEW**  
**Modul**: BRD-2-Member-Client-Management  
**Dependencies**: BRD-1 (Multi-Apps-RBAC), BRD-3 (Policy), BRD-4 (Claims), BRD-5 (Provider), BRD-6 (Financial), BRD-7 (Analytics)

---

## 1. Executive Summary

### 1.1 Tujuan Modul
Modul **Member and Client Management** mengelola data klien (perusahaan/organisasi) dan anggota (karyawan dan dependen), meliputi:
- **Client Management**: CRUD untuk data klien, hierarki, dan preferensi penagihan multi-currency untuk mendukung klien asing.
- **Member Management**: CRUD untuk data anggota, termasuk eligibilitas, profil kesehatan, dan metode pembayaran.
- **Enrollment**: Proses pendaftaran anggota ke rencana asuransi.
- **External App Support**: API dan RBAC untuk client portal, provider portal, lexicon apps, member portal/apps, dan aplikasi masa depan.
- **Billing Support**: Data penagihan untuk BRD-6.
- **Analytics Support**: Data demografis dan profil kesehatan untuk BRD-7.
- **Authentication**: Integrasi dengan BRD-1 untuk akses berbasis peran.

### 1.2 Business Value
- **Efisiensi Operasional**: Otomatisasi pendaftaran dan manajemen eligibilitas mengurangi waktu input data hingga 80%.
- **Kepatuhan Regulasi**: Memenuhi UU PDP, OJK, dan opsional HIPAA melalui BRD-1.
- **Integrasi Sistem**: Mendukung klaim (BRD-4), penyedia (BRD-5), keuangan (BRD-6), dan analitik (BRD-7).
- **External Apps**: API mendukung client portal, provider portal, lexicon apps, member portal/apps, dan aplikasi baru.
- **Skalabilitas**: Mendukung 1 juta+ anggota dengan respons API <3 detik.

---

## 2. Functional Requirements

### 2.1 Client Management
**Fitur Kunci**:
- **CRUD Klien**: Tambah, ubah, hapus data klien.
- **Hierarki Klien**: Dukungan untuk unit bisnis dan cabang.
- **Preferensi Penagihan**: Mata uang (IDR, USD, EUR, dll.) untuk BRD-6.
- **Autentikasi**: Kaitkan klien dengan `user_id` BRD-1 untuk akses.
- **External Apps**: API untuk client portal (e.g., view client details, manage sub-clients).

### 2.2 Member Management
**Fitur Kunci**:
- **CRUD Anggota**: Tambah, ubah, hapus data anggota dan dependen.
- **Eligibilitas**: Validasi status berdasarkan aturan BRD-3.
- **Demografis**: Usia, jenis kelamin, wilayah untuk BRD-7.
- **Profil Kesehatan**: Data risiko kesehatan (misalnya, kondisi kronis) untuk BRD-7.
- **Metode Pembayaran**: Dukungan bank, e-wallet, dan pengambilan tunai untuk BRD-6.
- **External Apps**: API untuk member portal/apps (e.g., view profile, update payment methods).

### 2.3 Enrollment Management
**Fitur Kunci**:
- **Pendaftaran Rencana**: Tetapkan anggota ke rencana asuransi (BRD-3).
- **Perubahan Rencana**: Dukung open enrollment dan peristiwa kualifikasi.
- **COB**: Status koordinasi manfaat untuk BRD-4.
- **Jaringan Penyedia**: Kaitkan tingkat jaringan dari BRD-5.
- **External Apps**: API untuk member portal (e.g., plan selection) dan provider portal (e.g., verify eligibility).

### 2.4 External App Integration
**Fitur Kunci**:
- **Client Portal**: View/edit client details, manage sub-clients, view billing summary (BRD-6).
- **Member Portal/Apps**: View profile, update payment methods, view claims history (BRD-4), select plans (BRD-3).
- **Provider Portal**: Verify member eligibility, view network tiers (BRD-5).
- **Lexicon Apps**: Access member health profiles for clinical integration (BRD-7).
- **Future Apps**: Flexible APIs and RBAC roles for extensibility.

### 2.5 Integration Support
**Fitur Kunci**:
- **Riwayat Klaim**: Tampilan hanya baca dari data klaim BRD-4.
- **Metrik Real-Time**: Data pendaftaran dan churn untuk dashboard BRD-7.
- **Autentikasi**: Integrasi dengan BRD-1 untuk OAuth 2.0.

---

## 3. Technical Specifications

### 3.1 Database Schema

#### 3.1.1 Core Tables
```sql
-- Clients
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id), -- BRD-1 integration
  client_code VARCHAR(20) UNIQUE NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  currency_preference VARCHAR(3) DEFAULT 'IDR', -- BRD-6 for foreign clients
  address TEXT,
  contact_email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Members
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id), -- BRD-1 integration
  client_id UUID REFERENCES clients(id),
  member_number VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  date_of_birth DATE,
  age INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth))) STORED, -- BRD-7
  gender VARCHAR(10), -- BRD-7
  region VARCHAR(50), -- BRD-7
  created_at TIMESTAMP DEFAULT NOW()
);

-- Client Benefit Plans
CREATE TABLE client_benefit_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id),
  policy_id UUID REFERENCES policies(id), -- BRD-3
  plan_name VARCHAR(100),
  billing_cycle VARCHAR(20), -- BRD-6: MONTHLY, QUARTERLY, SEMI_ANNUAL, ANNUAL
  created_at TIMESTAMP DEFAULT NOW()
);

-- Member Plan Enrollments
CREATE TABLE member_plan_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id),
  plan_id UUID REFERENCES client_benefit_plans(id),
  policy_id UUID REFERENCES policies(id), -- BRD-3
  cob_status VARCHAR(20) DEFAULT 'primary', -- BRD-4
  network_tier_id UUID REFERENCES provider_network_tiers(id), -- BRD-5
  enrollment_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Member Payment Methods
CREATE TABLE member_payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id),
  method_type VARCHAR(20), -- BANK, EWALLET, CASH_PICKUP
  e_wallet_type VARCHAR(20), -- GOPAY, OVO, DANA, SHOPEEPAY, LINKAJA
  cash_pickup_preference VARCHAR(20), -- INDOMARET, ALFAMART
  bank_account_id UUID, -- BRD-6
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Member Health Profile
CREATE TABLE member_health_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id),
  chronic_conditions JSONB, -- { "diabetes": true, "hypertension": false }
  smoking_status VARCHAR(20), -- NON_SMOKER, SMOKER, FORMER_SMOKER
  bmi DECIMAL(5,2),
  last_updated TIMESTAMP DEFAULT NOW()
);

-- View for Analytics
CREATE VIEW view_member_demographics AS
SELECT id AS member_id, age, gender, region, plan_id, enrollment_date
FROM members m
JOIN member_plan_enrollments mpe ON m.id = mpe.member_id;
```

### 3.2 API Endpoints

#### 3.2.1 Client APIs
```typescript
// Authentication: Requires BRD-1 OAuth 2.0 token
Authorization: Bearer <BRD-1-generated-token>

// Client Management
POST   /api/clients              // Create client (client portal)
GET    /api/clients              // List clients (client portal, admin)
GET    /api/clients/:id          // Get client details (client portal)
PUT    /api/clients/:id          // Update client (client portal)
DELETE /api/clients/:id          // Soft delete client (admin)

// Billing Details (BRD-6)
GET    /api/clients/:id/billing-details
// Response: { clientId: string, currencyPreference: string, billingCycle: string }
```

#### 3.2.2 Member APIs
```typescript
// Member Management
POST   /api/members              // Create member (admin, client portal)
GET    /api/members              // List members (admin, client portal)
GET    /api/members/:id          // Get member details (member portal, admin)
PUT    /api/members/:id          // Update member (member portal, admin)
DELETE /api/members/:id          // Soft delete member (admin)

// Enrollment and Eligibility (BRD-3)
GET    /api/members/:id/eligibility
// Response: { memberId: string, eligibilityStatus: string, policyId: string }
// Used by provider portal, member portal

// Claims History (BRD-4)
GET    /api/members/:id/claims-history
// Response: { claims: { claimId: string, claimNumber: string, status: string, amount: number, submissionDate: Date }[] }
// Used by member portal

// Provider Network (BRD-5)
GET    /api/members/:id/network-tiers
// Response: { networkTier: string, availableProviders: number, preferredProviders: Provider[] }
// Used by provider portal, member portal

// Payment Methods (BRD-6)
GET    /api/members/:id/payment-methods
// Response: { methods: { type: string, eWalletType: string, cashPickup: string, bankAccountId: string }[] }
// Used by member portal

// Real-Time Metrics (BRD-7)
WS     /ws/members/realtime-metrics
// Stream: { totalMembers: number, enrollmentRate: number, churnRate: number }
// Used by client portal, admin dashboard

// Demographic Data (BRD-7)
GET    /api/members/reports/demographics
// Response: { members: { memberId: string, age: number, gender: string, region: string }[] }
// Used by lexicon apps, analytics dashboard

// Risk Data (BRD-7)
GET    /api/members/:id/risk-data
// Response: { memberId: string, chronicConditions: object, smokingStatus: string, bmi: number }
// Used by lexicon apps, member portal
```

---

## 4. Business Rules

### 4.1 Eligibility Rules
```typescript
// BR-ELG-01: Member eligibility requires active client contract and valid policy (BRD-3).
// BR-ELG-02: Plan changes allowed during open enrollment or qualifying events (BRD-3).
// BR-ELG-05: Provide COB status to BRD-4 via /api/members/:id/cob-status.
```

### 4.2 Billing Rules
```typescript
// BR-BIL-01: Provide currency_preference and billing_cycle data to BRD-6 via /api/clients/:id/billing-details.
```

### 4.3 Analytics Rules
```typescript
// BR-ANA-01: Provide demographic and health profile data for BRD-7 via /api/members/reports/demographics and /api/members/:id/risk-data.
```

### 4.4 Authentication Rules
```typescript
// BR-AUTH-01: All operations require authentication via BRD-1’s OAuth 2.0, linking to users.id.
// BR-AUTH-02: External apps (client portal, provider portal, member portal, lexicon apps) use BRD-1 RBAC roles (e.g., client_admin, member_user, provider_user).
```

---

## 5. Integration Requirements

### 5.1 Internal Integrations
- **BRD-1 (Multi-Apps-RBAC)**: OAuth 2.0 authentication, RBAC roles (e.g., `client_admin`, `member_user`, `provider_user`, `lexicon_user`).
- **BRD-3 (Policy)**: Policy validation via `policy_id` and `/api/policies/:id/eligibility-rules`.
- **BRD-4 (Claims)**: Claims history via `/api/members/:id/claims-history` and COB via `/api/members/:id/cob-status`.
- **BRD-5 (Provider)**: Network tiers via `/api/members/:id/network-tiers`.
- **BRD-6 (Financial)**: Billing details via `/api/clients/:id/billing-details` and payment methods via `/api/members/:id/payment-methods`.
- **BRD-7 (Analytics)**: Real-time metrics via `/ws/members/realtime-metrics`, demographics via `/api/members/reports/demographics`, risk data via `/api/members/:id/risk-data`.

### 5.2 External App Integrations
- **Client Portal**: Access client details, sub-client management, billing summaries.
- **Member Portal/Apps**: View/update member profile, payment methods, claims history, plan selection.
- **Provider Portal**: Verify member eligibility, view network tiers.
- **Lexicon Apps**: Access health profiles for clinical integration.
- **Future Apps**: Extensible APIs with RBAC roles for new applications.

### 5.3 External System Integrations
- **EHR Systems**: Optional HL7 FHIR for health profile data (BRD-7).
- **Payment Gateways**: Bank and e-wallet integration via BRD-6.

---

## 6. Security & Compliance

### 6.1 Data Security
- **Access Control**: Role-based access via BRD-1’s OAuth 2.0 (e.g., `client_admin`, `member_user`).
- **Encryption**: AES-256 via BRD-1 for data at rest and in transit.
- **Data Masking**: PII protection for BRD-7 analytics.
- **Audit Logging**: Via BRD-1 for all operations.

### 6.2 Regulatory Compliance
- **UU PDP**: Via BRD-1’s encryption and data masking.
- **OJK Regulations**: Via BRD-1’s audit logging and BRD-6/BRD-7 reporting.
- **Optional Standards**:
  - **HIPAA**: Via BRD-1’s PII protection and BRD-7’s anonymization.
  - **HL7 FHIR**: Via BRD-1’s API standards for BRD-7 interoperability.

---

## 7. Performance Requirements
- **API Response Time**: <3 seconds.
- **Concurrent Users**: 1,000 simultaneous users.
- **Data Volume**: 1M+ member records.
- **Real-Time Streaming**: <1-second latency for BRD-7 WebSocket.
- **Bulk Upload**: 100,000 records per batch in <5 minutes.

---

## 8. Implementation Plan

### 8.1 Development Phases
**Phase 1: Core Functionality (6 weeks)**  
- Week 1-2: Database schema, core APIs, external app endpoints.  
- Week 3-4: Client/member CRUD, enrollment workflows, client portal integration.  
- Week 5-6: Bulk upload, member portal integration.

**Phase 2: Advanced Features (6 weeks)**  
- Week 7-8: Claims history (BRD-4), provider network (BRD-5), provider portal integration.  
- Week 9-10: Billing (BRD-6), analytics (BRD-7), lexicon app integration.  
- Week 11-12: WebSocket implementation, future app extensibility.

**Phase 3: Integration & Testing (4 weeks)**  
- Week 13-14: BRD-1 authentication, BRD-4 COB, BRD-6 billing, BRD-7 analytics.  
- Week 15-16: Performance testing, security hardening, external app testing.

### 8.2 Resource Requirements
- **Backend Developer** (2): Database, APIs, WebSocket.
- **Frontend Developer** (1): Client/member/provider portals.
- **QA Engineer** (1): Integration and performance testing.
- **DevOps Engineer** (0.5): Deployment, external app integration.

---

## 9. Changelog
**Version 3.3 (05 Juli 2025)**  
- Removed `npwp_number` from `clients` table.  
- Retained `currency_preference` for multi-currency billing (BRD-6).  
- Added `user_id` to `clients` and `members` for BRD-1 authentication.  
- Added `member_payment_methods` table for BRD-6.  
- Added `age`, `gender`, `region` to `members` and created `view_member_demographics` for BRD-7.  
- Added `member_health_profile` table for BRD-7.  
- Added WebSocket endpoint `/ws/members/realtime-metrics` for BRD-7.  
- Added external app support (client portal, provider portal, lexicon apps, member portal/apps).  
- Aligned compliance with BRD-1’s security framework.  
- Updated roadmap with external app integrations.

---

**Document Status**: 📋 **PENDING FINAL REVIEW**  
**Next BRD**: BRD-3-Manajemen-Polis-Realistic  
**Dependencies**: BRD-1, BRD-3, BRD-4, BRD-5, BRD-6, BRD-7 (In Progress)  
**Timeline**: 16 weeks development