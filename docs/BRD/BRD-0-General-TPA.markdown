# Business Requirement Document (BRD) - Aplikasi Third Party Administration (TPA)

**Tanggal**: 6 July 2025  
**Versi**: 5.7 (Updated to Remove Premiums, Focus on Claims Payments and Admin Fees)  
**Dibuat oleh**: Tim Pengembangan  
**Disetujui oleh**: [TBD - Pemangku Kepentingan]  
**Project Start**: 1 July 2025  
**Current Status**: ✅ PHASE 1-5 COMPLETED; PHASE 6 READY FOR IMPLEMENTATION  

---

## 1. Pendahuluan

### 1.1 Tujuan Dokumen
Dokumen ini mendefinisikan kebutuhan bisnis untuk aplikasi Third Party Administration (TPA) berbasis web menggunakan Next.js dengan arsitektur modular. Fitur utama meliputi:
- Bulk upload untuk data client, member, dan polis.
- Workflow membership terintegrasi: pendaftaran client, pembuatan polis, pengajuan klaim, validasi provider, hingga pembayaran klaim.
- **Unified product architecture** (`product_type`: indemnity, managed_care, aso) dengan JSONB configuration (BRD-3 v2.2).
- Fitur khusus TPA: Coordination of Benefits (COB), co-payment, deductibles, out-of-pocket maximums, reinsurance, stop-loss, subrogation, **pre-authorization**, **pre-hospitalization**, **call center interaction logging**.
- Ekstensi: **Client Portal**, **Member Portal/Mobile Apps**, **Hospital Portal**, **Call Center Apps**, statusehat, clinical pathway, **Satu Sehat webhook integration**, **Lexicon for claim pathways**, pembayaran lokal.
- Kepatuhan terhadap UU PDP, HIPAA, HL7/FHIR, OJK.

### 1.2 Latar Belakang
Platform terpusat untuk mengelola hubungan antara client, sub-client, HR manager, member, dependent, provider (incl. hospitals), broker/agent, dan auditor. Integrasi dengan BPJS Kesehatan, **Satu Sehat (webhooks)**, e-wallet (GoPay, OVO, DANA), dan WhatsApp memastikan relevansi lokal. **Call Center Apps** mencatat interaksi (telepon, WhatsApp, web form, langsung). Diuji dengan simulasi perusahaan nyata (Bank Mandiri, BUMN, Astra Group) untuk skala 200,000+ karyawan.

### 1.3 Ruang Lingkup
**Modul Inti (LIVE):**
- **Manajemen Pengguna**: RBAC + ABAC, 9 peran (BRD-1 v4.2, SRS-1 v2.3).
- **Manajemen Anggota**: Hierarki client, product catalog (BRD-2 v3.3).
- **Manajemen Polis**: Unified product architecture with admin fees for ASO (BRD-3 v2.2).
- **Manajemen Klaim**: Pre-auth, pre-hospitalization, COB, clinical pathway (BRD-4).
- **Manajemen Penyedia**: Capitation, provider scoring (BRD-5).
- **Manajemen Keuangan**: Claims payments, admin fees, e-wallet integration, tax compliance (BRD-6, Ready).

**Modul Ekstensi (Planned):**
- **Client Portal**, **Member Portal/Mobile Apps**, **Hospital Portal**, **Call Center Apps**, Satu Sehat, Lexicon, WhatsApp, Local Payment, Eligibility, Fraud Detection, etc.

**Fitur Khusus TPA:**
- **Pre-Authorization**: Validation via Client, Member, Hospital Portals, Call Center Apps, WhatsApp.
- **Pre-Hospitalization**: Clinical pathway validation, document uploads via portals, logged in Call Center Apps.
- **Call Center Apps**: Log incoming/outgoing interactions (phone, WhatsApp, web form, direct).
- Unified product architecture, COB, co-payment, deductibles, reinsurance, stop-loss.

### 1.4 Pemangku Kepentingan
- TPA Administrator, Client, Sub-Client, HR Manager, Member, Dependent, Broker/Agent, Provider (incl. hospitals), Regulator, Auditor, **Call Center Agents**.

---

## 2. Tujuan Bisnis
### 2.1 Tujuan Utama
- Otomatisasi administrasi (80% pengurangan waktu).
- Unified product architecture untuk fleksibilitas.
- **Call Center Apps** untuk log interaksi, mendukung pre-auth dan pre-hospitalization.
- **Client/Member/Hospital Portals** untuk user engagement.
- **Satu Sehat** dan **Lexicon** untuk integrasi dan claim pathways.
- Kepatuhan UU PDP, HIPAA, HL7/FHIR, OJK.

### 2.2 Manfaat Bisnis
- **Efisiensi**: 90% pengurangan tenaga kerja manual.
- **Skalabilitas**: 200,000+ karyawan, 50,000+ polis.
- **Pengalaman Pengguna**: NPS > 70 via portals, apps, call center.
- **Integrasi Lokal**: Satu Sehat, BPJS, e-wallet, WhatsApp.

---

## 3. Spesifikasi Fungsional
### 3.1 Modul dan Fitur
#### 3.1.4 Modul Manajemen Klaim (✅ LIVE)
- **Fitur**: Pengajuan klaim, **pre-authorization** (Managed Care), **pre-hospitalization** (clinical pathway), COB, co-payment, deductibles, subrogation. Interaksi logged via Call Center Apps.
- **BRD**: BRD-4.

#### 3.1.6 Modul Manajemen Keuangan (📋 Ready)
- **Fitur**:
  - Claims payments to providers via e-wallets (GoPay, OVO, DANA) or bank transfers.
  - Administrative fees for ASO plans, calculated via `configuration.aso_controls` (BRD-3).
  - Tax compliance (PPN, PPh 21, NPWP validation).
  - Financial reconciliation with claims (BRD-4) and policies (BRD-3).
- **Database Schema** (High-Level):
  ```sql
  CREATE TABLE claims_payments (
    id UUID PRIMARY KEY,
    claim_id UUID REFERENCES claims(id),
    provider_id UUID REFERENCES providers(id),
    amount DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'IDR',
    payment_date DATE,
    e_wallet_transaction_id UUID REFERENCES e_wallet_transactions(id),
    tax_details JSONB, -- e.g., {"ppn": 0.11, "pph21": 0.05, "npwp": "123456789"}
    status VARCHAR(50), -- pending, paid, rejected
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
  CREATE TABLE e_wallet_transactions (
    id UUID PRIMARY KEY,
    wallet_type VARCHAR(50), -- GoPay, OVO, DANA
    amount DECIMAL(15,2),
    npwp VARCHAR(20),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
  );
  CREATE TABLE admin_fees (
    id UUID PRIMARY KEY,
    policy_id UUID REFERENCES policies(id),
    client_id UUID REFERENCES clients(id),
    amount DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'IDR',
    due_date DATE,
    status VARCHAR(50), -- pending, paid, overdue
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
  ```
- **BRD**: BRD-6.

#### 3.1.14 Modul Portal Client (📋 Planned)
- **Fitur**: Dashboard untuk member management, claim utilization, pre-auth monitoring, pre-hospitalization tracking. Interaksi logged via Call Center Apps.
- **BRD**: BRD-PortalClient.

#### 3.1.15 Modul Portal Member/Mobile Apps (📋 Planned)
- **Fitur**: Claim submission, pre-auth requests, pre-hospitalization document uploads, statusehat. Interaksi logged via Call Center Apps.
- **BRD**: BRD-PortalMember, BRD-MobileApps.

#### 3.1.17 Modul Hospital Portal (📋 Planned)
- **Fitur**: Pre-auth, pre-hospitalization data submission, claims, Satu Sehat integration. Interaksi logged via Call Center Apps.
- **BRD**: BRD-HospitalPortal.

#### 3.1.25 Modul Call Center Apps (📋 Planned)
- **Fitur**:
  - Log incoming/outgoing interactions (phone, WhatsApp, web form, direct).
  - Categorize interactions (e.g., inquiry, complaint, pre-auth, claim status).
  - Integration with BRD-4 (claims), BRD-3 (policies), BRD-1 (authentication).
  - Audit trails for UU PDP/HIPAA.
- **BRD**: BRD-CallCenter.

#### 3.1.8 Modul Integrasi Eksternal (📋 Planned)
- **Fitur**: HL7/FHIR, Satu Sehat webhooks for pre-auth/pre-hospitalization data, logged in Call Center Apps.
- **BRD**: BRD-Integrations.

#### 3.1.7 Modul ML-CDS Lexicon (📋 Planned)
- **Fitur**: AI-powered medical lexicons (ICD-10/11, SNOMED, CPT), semantic cross-mapping, GraphQL relationship engine, ML-based clinical decision support, treatment outcome prediction.
- **BRD**: BRD-8-ML-CDS-Lexicon.

---

## 4. Spesifikasi Non-Fungsional
- **Keamanan**: AES-256, RBAC + ABAC, audit logs for Call Center Apps, UU PDP/HIPAA/OJK.
- **Performa**: API < 2s (95%), claims payment < 2s, call log entry < 1s.
- **Skalabilitas**: Microservices, AWS, Redis for Call Center Apps and portals.
- **Usability**: Responsive, multibahasa, WCAG 2.1.
- **Integrasi**: Satu Sehat, BPJS, e-wallet, WhatsApp.

---

## 5. Asumsi dan Kendala
### 5.1 Asumsi
- Call Center Agents have stable internet.
- WhatsApp Business API supports high-volume messaging.
- Satu Sehat webhooks supported by hospitals.
- Clients provide valid NPWP for tax compliance.

### 5.2 Kendala
- Call Center Apps integration with multiple channels.
- High-volume interaction logging performance.
- Cost of e-wallet, WhatsApp API, Satu Sehat integration.

---

## 6. Risiko dan Mitigasi
| **Risiko** | **Dampak** | **Mitigasi** |
|------------|------------|--------------|
| Call Center Apps complexity | Delayed implementation | Reuse portal frameworks, modular design |
| High-volume interaction logs | Performance issues | Redis caching, optimized database |
| Missing BRD for Call Center | Misalignment | Draft BRD-CallCenter within 4 weeks |
| E-wallet integration delays | Payment disruptions | Early testing with Midtrans, Xendit, DOKU |

---

## 7. Rencana Implementasi
### 7.1 Teknologi
- **Frontend**: Next.js, Tailwind CSS.
- **Backend**: Next.js API Routes, Prisma, PostgreSQL.
- **Mobile**: React Native for Member/Hospital Apps.
- **Integrasi**: Satu Sehat webhooks, WhatsApp Business API, HL7/FHIR.
- **Call Center**: Web app with real-time logging, e-wallet integration.

### 7.2 Tahapan Pengembangan
- **Fase 1-5 (COMPLETED)**: Manajemen Pengguna, Anggota, Polis, Klaim, Penyedia.
- **Fase 6 (START NOW, 18 weeks)**: Manajemen Keuangan (BRD-6, claims payments, admin fees).
- **Fase 7 (12 months, Prioritize)**: Call Center Apps, Client Portal, Member Portal/Mobile Apps, Hospital Portal, Satu Sehat, Lexicon, WhatsApp, Local Payment, Eligibility, Fraud Detection.
- **Fase 8 (6 months)**: Predictive Analytics, Wellness Management.

**Parallel Tasks**:
- Draft **BRD-CallCenter**, **BRD-PortalClient**, **BRD-PortalMember**, **BRD-MobileApps**, **BRD-HospitalPortal**, **BRD-7 (Lexicon)**, **BRD-Integrations (Satu Sehat)**, **BRD-WhatsApp**, **BRD-Eligibility**, **BRD-FraudDetection** within 4-6 weeks.

### 7.3 Estimasi Sumber Daya
- **Tim**: 3 Frontend, 3 Backend, 2 Mobile, 1 ML, 1 DevOps, 1 UI/UX, 2 QA, 1 Integration Specialist, 1 Business Analyst.
- **Anggaran**: Fase 6: +30% for e-wallet, tax compliance; Fase 7: +60% for Call Center, portals, Satu Sehat.

---

## 8. Metrik Keberhasilan
- **Claims Payments**: 95% processed < 2s via e-wallets.
- **Call Center Apps**: 95% interactions logged < 1s, 90% inquiry resolution < 5 min.
- **Pre-Authorization**: 95% processed < 2s via portals/call center.
- **Pre-Hospitalization**: 90% data validated via clinical pathways.
- **Portal Adoption**: 60% clients/members using portals/apps in 6 months.
- **NPS**: > 70 for call center and portal usability.

---

## 9. Lampiran
### 9.1 Contoh Struktur CSV
- **Claims Payment**: `claimId,providerId,amount,paymentDate,eWalletTransactionId,taxDetails`
- **Call Center Log**: `interactionId,channel,callerId,timestamp,agentId,category,details,status`

### 9.2 Referensi BRD Modul
| **Modul** | **BRD Ref** | **Status** | **Fitur Utama** |
|-----------|-------------|------------|-----------------|
| Manajemen Pengguna | BRD-1 v4.2 | ✅ LIVE | RBAC + ABAC, 9 peran |
| Manajemen Anggota | BRD-2 v3.3 | ✅ LIVE | Hierarki client, siklus member |
| Manajemen Polis | BRD-3 v2.2 | ✅ LIVE | Unified product architecture, admin fees |
| Manajemen Klaim | BRD-4 | ✅ LIVE | Pre-auth, pre-hospitalization, COB |
| Manajemen Penyedia | BRD-5 | ✅ LIVE | Capitation, provider scoring |
| Manajemen Keuangan | BRD-6 | 📋 Ready | Claims payments, admin fees, e-wallet, tax compliance |
| ML-CDS Lexicon | BRD-8 | 📋 Planned | AI medical lexicons, semantic mapping, clinical decision support |
| Call Center Apps | BRD-CallCenter | 📋 Planned | Interaction logging (phone, WhatsApp, web form, direct) |
| Hospital Portal | BRD-HospitalPortal | 📋 Planned | Pre-auth, pre-hospitalization, claims |
| Portal Client | BRD-PortalClient | 📋 Planned | Member management, pre-auth monitoring |
| Portal Member/Mobile Apps | BRD-PortalMember, BRD-MobileApps | 📋 Planned | Claim submission, pre-auth, pre-hospitalization |
| Integrasi Eksternal | BRD-Integrations | 📋 Planned | Satu Sehat webhooks, HL7/FHIR |
| WhatsApp Integration | BRD-WhatsApp | 📋 Planned | Pre-auth, notifications |

---

## 10. Development Priority & Roadmap
- **Fase 6 (START NOW, 18 weeks)**: Manajemen Keuangan (BRD-6, claims payments, admin fees).
- **Fase 7 (12 months, Prioritize)**: Call Center Apps, Client Portal, Member Portal/Mobile Apps, Hospital Portal, Satu Sehat, Lexicon, WhatsApp, Local Payment, Eligibility, Fraud Detection.
- **Fase 8 (6 months)**: Predictive Analytics, Wellness Management.

**Parallel Tasks**:
- Draft **BRD-CallCenter**, **BRD-PortalClient**, **BRD-PortalMember**, **BRD-MobileApps**, **BRD-HospitalPortal**, **BRD-7 (Lexicon)**, **BRD-Integrations (Satu Sehat)**, **BRD-WhatsApp**, **BRD-Eligibility**, **BRD-FraudDetection** within 4-6 weeks.

---

## 11. Production Deployment Status
- **Modul LIVE**: Manajemen Pengguna, Anggota, Polis, Klaim, Penyedia.
- **Siap Pengembangan**: Manajemen Keuangan (BRD-6, claims payments, admin fees).
- **Direncanakan**: Call Center Apps, Client Portal, Member Portal/Mobile Apps, Hospital Portal, Satu Sehat, Lexicon, etc.
- **Pasar Indonesia**: Validasi NIK, NPWP, Satu Sehat integration, BPJS.

---

## 12. Persetujuan
**Disetujui oleh**: [TBD - Pemangku Kepentingan]  
**Tanggal Persetujuan**: [TBD]