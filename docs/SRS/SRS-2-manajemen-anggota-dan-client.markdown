# System Requirement Specification (SRS) - Modul Manajemen Anggota dan Klien TPA

**Date**: 05 July 2025  
**Version**: 1.0  
**Created by**: TPA Development Team  
**Status**: DRAFT  
**Module**: SRS-2-Member-Client-Management  
**Dependencies**: SRS-1 (Multi-Apps-RBAC)

---

## 1. Introduction
This SRS details the technical implementation of BRD-2 v3.3, covering client and member management, bulk upload, and integrations with internal (BRD-1, BRD-3, BRD-4, BRD-5, BRD-6, BRD-7) and external apps (client portal, provider portal, lexicon apps, member portal/apps, future apps).

## 2. System Architecture
- **Database**: PostgreSQL 15 with snake_case naming.
- **APIs**: RESTful with kebab-case endpoints, secured via BRD-1 OAuth 2.0.
- **WebSocket**: For BRD-7 real-time metrics.
- **Frontend**: React with Tailwind CSS (CDN: https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css).
- **External Apps**: Role-based API access for client portal, provider portal, lexicon apps, member portal/apps.

## 3. Database Schema
```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id), -- BRD-1
  client_code VARCHAR(20) UNIQUE NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  currency_preference VARCHAR(3) DEFAULT 'IDR', -- BRD-6
  address TEXT,
  contact_email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id), -- BRD-1
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

CREATE TABLE member_health_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id),
  chronic_conditions JSONB,
  smoking_status VARCHAR(20),
  bmi DECIMAL(5,2),
  last_updated TIMESTAMP DEFAULT NOW()
);

CREATE VIEW view_member_demographics AS
SELECT id AS member_id, age, gender, region, plan_id, enrollment_date
FROM members m
JOIN member_plan_enrollments mpe ON m.id = mpe.member_id;
```

## 4. API Endpoints
```typescript
// Client APIs
GET /api/clients/:id/billing-details
// Response: { clientId: string, currencyPreference: string, billingCycle: string }
// Used by client portal, BRD-6

// Member APIs
GET /api/members/:id
// Response: { memberId: string, firstName: string, lastName: string, eligibilityStatus: string }
// Used by member portal, provider portal

GET /api/members/:id/payment-methods
// Response: { methods: { type: string, eWalletType: string, cashPickup: string, bankAccountId: string }[] }
// Used by member portal, BRD-6

WS /ws/members/realtime-metrics
// Stream: { totalMembers: number, enrollmentRate: number, churnRate: number }
// Used by client portal, BRD-7

GET /api/members/reports/demographics
// Response: { members: { memberId: string, age: number, gender: string, region: string }[] }
// Used by lexicon apps, BRD-7
```

## 5. External App Integration
- **Client Portal**: React SPA with endpoints `/api/clients/:id`, `/api/clients/:id/billing-details`.
- **Member Portal/Apps**: Mobile-friendly React app with `/api/members/:id`, `/api/members/:id/payment-methods`.
- **Provider Portal**: Secure endpoints `/api/members/:id/eligibility`, `/api/members/:id/network-tiers`.
- **Lexicon Apps**: HL7 FHIR-compatible endpoint `/api/members/:id/risk-data`.
- **Future Apps**: Extensible RBAC roles (`future_app_user`) and API versioning.

## 6. Implementation Details
- **Tech Stack**: Node.js, Express, Prisma, PostgreSQL, React.
- **Performance**: <3-second API response, 100K record bulk upload in <5 minutes.
- **Security**: AES-256 encryption via BRD-1, audit logging for all operations.
- **RBAC Roles**: `client_admin`, `member_user`, `provider_user`, `lexicon_user`, `future_app_user`.

## 7. Testing Plan
- **Unit Tests**: 90% coverage for business logic.
- **Integration Tests**: Validate BRD-6, BRD-7, and external app endpoints.
- **Performance Tests**: Simulate 1,000 concurrent users across portals.