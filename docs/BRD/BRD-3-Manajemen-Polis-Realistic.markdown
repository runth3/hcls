# Business Requirement Document (BRD) - Realistic Version
**Modul**: Manajemen Polis (Policy Management)  
**Tanggal**: 1 Juli 2025  
**Versi**: 2.1 (Realistic & Achievable)  
**Referensi**: BRD-General-TPA v4.1  
**Status**: ✅ READY FOR DEVELOPMENT

**Team Assessment**: Gabungan Phase 1 & 2 - Achievable dalam 6 bulan

---

## 1. Pendahuluan

### 1.1 Tujuan Dokumen
Dokumen ini mendefinisikan kebutuhan bisnis **realistis** untuk Modul Manajemen Polis yang dapat dicapai oleh tim development dalam 6 bulan. Berdasarkan research global TPA, kami fokus pada fitur-fitur yang memberikan value tinggi dengan kompleksitas yang manageable.

### 1.2 Ruang Lingkup Realistis
**Core Policy Management:**
- 3-level policy hierarchy dengan inheritance
- Comprehensive benefit configuration (100+ parameters)
- Database-based versioning dengan audit trail
- Policy templates dan cloning

**Advanced Benefit Engine:**
- Flexible benefit rules dengan cost-sharing calculations
- Multi-tier network support
- Bulk operations dengan validation
- Policy comparison tools

**Integration Ready:**
- Member management integration
- Claims system integration
- Financial system integration
- Reporting dan analytics

---

## 2. Tujuan Bisnis Realistis

### 2.1 Achievable Goals
- **70% reduction** dalam policy setup time
- **99% accuracy** dalam policy configuration
- **1,000 policies** bulk processing dalam 60 detik
- **99.5% system uptime**
- **Seamless integration** dengan existing modules

### 2.2 Business Value
- **Operational Efficiency**: Automated policy management
- **Cost Reduction**: 50% reduction dalam admin costs
- **User Experience**: Intuitive policy configuration
- **Scalability**: Support 50,000+ policies
- **Compliance**: Indonesian regulation compliance

---

## 3. Insurance Product-Specific Functional Specifications

### 3.0 Insurance Product Types Support

| Product Type | Key Features | Cost-Sharing | Network Requirements |
|--------------|--------------|--------------|---------------------|
| **Indemnity** | Full reimbursement, any provider | Deductible, Coinsurance, Copay, OOP Max | No network restrictions |
| **Managed Care** | Network-based, gatekeeping | Copays, limited coinsurance | Required provider networks |
| **ASO** | Self-funded administration | Employer-defined | Flexible network arrangements |

#### **Product-Specific Parameters:**

**INDEMNITY Parameters:**
- ✅ Individual/Family Deductibles
- ✅ Coinsurance Percentages (0-100%)
- ✅ Copay Amounts (fixed/percentage)
- ✅ Out-of-Pocket Maximums
- ✅ Reasonable & Customary (R&C) limits
- ✅ COB coordination

**MANAGED CARE Parameters:**
- ✅ PCP (Primary Care Physician) requirements
- ✅ Referral management
- ✅ Preauthorization thresholds
- ✅ Network tier copays (Tier 1/2/3)
- ✅ Emergency care exceptions
- ✅ HMO/PPO/POS/EPO models

**ASO Parameters:**
- ✅ Stop-loss limits (individual/aggregate)
- ✅ Administrative fee structures
- ✅ Claims fund management
- ✅ Employer reporting requirements
- ✅ ERISA compliance features
- ✅ Self-funded claim reserves

### 3.1 Core Policy Management

| ID | Requirement | Priority |
|----|-------------|----------|
| FUNC-POL-01 | 3-level policy hierarchy dengan inheritance rules | Critical |
| FUNC-POL-02 | Policy CRUD dengan comprehensive validation | Critical |
| FUNC-POL-03 | Database versioning dengan change tracking | Critical |
| FUNC-POL-04 | Policy templates dengan customization | High |
| FUNC-POL-05 | Policy cloning dengan optimization | High |

### 3.2 Insurance Product-Specific Benefit Engine

| ID | Requirement | Priority | Product Support |
|----|-------------|----------|----------------|
| FUNC-BEN-01 | 100+ configurable benefit parameters dengan product validation | Critical | All Products |
| FUNC-BEN-02 | **INDEMNITY**: Full cost-sharing (deductible, coinsurance, copay, OOP max) | Critical | Indemnity |
| FUNC-BEN-03 | **MANAGED CARE**: Network tiers, PCP referrals, preauthorization | Critical | Managed Care |
| FUNC-BEN-04 | **ASO**: Stop-loss limits, admin fees, claims fund management | Critical | ASO |
| FUNC-BEN-05 | **COB**: Coordination of benefits dengan multiple policies | Critical | All Products |
| FUNC-BEN-06 | Benefit limits dan accumulation rules per product type | Critical | All Products |
| FUNC-BEN-07 | Waiting periods dan utilization controls | High | All Products |
| FUNC-BEN-08 | Product-specific validation rules dan business logic | High | All Products |

### 3.3 Bulk Operations

| ID | Requirement | Priority |
|----|-------------|----------|
| FUNC-BULK-01 | CSV bulk upload dengan validation | Critical |
| FUNC-BULK-02 | Mass policy updates dengan impact analysis | Critical |
| FUNC-BULK-03 | Progress tracking dan error reporting | Critical |
| FUNC-BULK-04 | Template-based bulk creation | High |

### 3.4 Policy Analytics

| ID | Requirement | Priority |
|----|-------------|----------|
| FUNC-ANA-01 | Policy comparison tools | High |
| FUNC-ANA-02 | Basic policy analytics dashboard | High |
| FUNC-ANA-03 | Configuration impact analysis | Medium |
| FUNC-ANA-04 | Usage statistics dan reporting | Medium |

---

## 4. Database Schema (Realistic)

### 4.1 Core Policy Tables
```sql
-- Policies table (realistic scope)
CREATE TABLE policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_number VARCHAR(50) UNIQUE NOT NULL,
  policy_name VARCHAR(255) NOT NULL,
  policy_type VARCHAR(50) NOT NULL, -- individual, group, corporate
  category VARCHAR(100), -- medical, dental, vision, comprehensive
  parent_policy_id UUID REFERENCES policies(id),
  
  -- Policy details
  description TEXT,
  summary TEXT,
  terms_conditions TEXT,
  
  -- Dates
  effective_date DATE NOT NULL,
  termination_date DATE,
  renewal_date DATE,
  
  -- Financial
  base_premium DECIMAL(15,2),
  currency VARCHAR(3) DEFAULT 'IDR',
  
  -- Status
  status VARCHAR(50) DEFAULT 'draft',
  is_template BOOLEAN DEFAULT false,
  
  -- Audit
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Policy versions (database-based)
CREATE TABLE policy_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID NOT NULL REFERENCES policies(id),
  version_number VARCHAR(20) NOT NULL,
  effective_date DATE NOT NULL,
  termination_date DATE,
  changes_summary TEXT,
  configuration_snapshot JSONB,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(policy_id, version_number)
);
```

### 4.2 Enhanced Benefit Configuration (Insurance Product Support)
```sql
-- Enhanced policies table with insurance product types
ALTER TABLE policies ADD COLUMN product_type VARCHAR(50) NOT NULL DEFAULT 'indemnity'; -- indemnity, managed_care, aso
ALTER TABLE policies ADD COLUMN network_model VARCHAR(50); -- hmo, ppo, pos, epo (for managed_care)
ALTER TABLE policies ADD COLUMN funding_arrangement VARCHAR(50); -- fully_insured, self_funded, level_funded (for ASO)

-- Benefit categories with insurance product mapping
CREATE TABLE benefit_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_code VARCHAR(20) UNIQUE NOT NULL,
  category_name VARCHAR(255) NOT NULL,
  description TEXT,
  applicable_products TEXT[] DEFAULT '{"indemnity","managed_care","aso"}', -- Which products support this category
  is_active BOOLEAN DEFAULT true
);

-- Benefit types with product-specific configurations
CREATE TABLE benefit_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES benefit_categories(id),
  type_code VARCHAR(20) UNIQUE NOT NULL,
  type_name VARCHAR(255) NOT NULL,
  description TEXT,
  unit_of_measure VARCHAR(50),
  applicable_products TEXT[] DEFAULT '{"indemnity","managed_care","aso"}',
  requires_network BOOLEAN DEFAULT false, -- True for managed care benefits
  supports_cob BOOLEAN DEFAULT true, -- Coordination of Benefits support
  is_active BOOLEAN DEFAULT true
);

-- Comprehensive policy benefits with insurance product parameters
CREATE TABLE policy_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID NOT NULL REFERENCES policies(id),
  benefit_type_id UUID NOT NULL REFERENCES benefit_types(id),
  
  -- Basic Coverage
  is_covered BOOLEAN DEFAULT true,
  coverage_percentage DECIMAL(5,2) DEFAULT 100.00,
  
  -- Financial Limits
  annual_limit DECIMAL(15,2),
  lifetime_limit DECIMAL(15,2),
  per_occurrence_limit DECIMAL(15,2),
  per_day_limit DECIMAL(10,2),
  
  -- INDEMNITY SPECIFIC: Cost Sharing
  deductible_individual DECIMAL(10,2) DEFAULT 0,
  deductible_family DECIMAL(10,2) DEFAULT 0,
  deductible_type VARCHAR(20) DEFAULT 'calendar_year', -- calendar_year, per_occurrence, embedded
  coinsurance_percentage DECIMAL(5,2) DEFAULT 0,
  coinsurance_max_individual DECIMAL(10,2), -- Maximum coinsurance amount
  copay_amount DECIMAL(10,2) DEFAULT 0,
  copay_type VARCHAR(20) DEFAULT 'fixed', -- fixed, percentage, tiered
  out_of_pocket_max_individual DECIMAL(15,2),
  out_of_pocket_max_family DECIMAL(15,2),
  
  -- MANAGED CARE SPECIFIC: Network Controls
  requires_pcp_referral BOOLEAN DEFAULT false, -- Primary Care Physician referral
  requires_preauth BOOLEAN DEFAULT false,
  preauth_threshold DECIMAL(10,2), -- Amount above which preauth is required
  in_network_coverage DECIMAL(5,2) DEFAULT 100.00,
  out_network_coverage DECIMAL(5,2) DEFAULT 0.00, -- Often 0% for HMO
  emergency_coverage DECIMAL(5,2) DEFAULT 100.00, -- Emergency always covered
  
  -- ASO SPECIFIC: Administrative Controls
  stop_loss_individual DECIMAL(15,2), -- Individual stop-loss limit
  stop_loss_aggregate DECIMAL(15,2), -- Aggregate stop-loss limit
  admin_fee_percentage DECIMAL(5,4), -- Administrative fee percentage
  claims_fund_limit DECIMAL(15,2), -- Self-funded claims limit
  
  -- COB (Coordination of Benefits) Parameters
  cob_enabled BOOLEAN DEFAULT true,
  cob_order VARCHAR(20) DEFAULT 'primary', -- primary, secondary, tertiary
  cob_method VARCHAR(20) DEFAULT 'non_duplication', -- non_duplication, maintenance_of_benefits
  
  -- Utilization Management
  waiting_period_days INTEGER DEFAULT 0,
  waiting_period_waiver TEXT[], -- Conditions that waive waiting period
  visit_limit_annual INTEGER,
  visit_limit_lifetime INTEGER,
  concurrent_review BOOLEAN DEFAULT false,
  retrospective_review BOOLEAN DEFAULT false,
  
  -- Provider Network Tiers (for managed care)
  tier_1_copay DECIMAL(10,2), -- In-network preferred
  tier_2_copay DECIMAL(10,2), -- In-network standard
  tier_3_copay DECIMAL(10,2), -- Out-of-network
  tier_1_coinsurance DECIMAL(5,2),
  tier_2_coinsurance DECIMAL(5,2),
  tier_3_coinsurance DECIMAL(5,2),
  
  -- Accumulation Rules
  accumulates_to_deductible BOOLEAN DEFAULT true,
  accumulates_to_oop_max BOOLEAN DEFAULT true,
  cross_accumulation BOOLEAN DEFAULT false, -- Accumulate across benefit types
  
  -- Effective dates and versioning
  effective_date DATE NOT NULL,
  termination_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(policy_id, benefit_type_id, effective_date)
);

-- COB (Coordination of Benefits) Rules
CREATE TABLE cob_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID NOT NULL REFERENCES policies(id),
  rule_name VARCHAR(100) NOT NULL,
  rule_type VARCHAR(50) NOT NULL, -- birthday_rule, gender_rule, employment_rule
  rule_description TEXT,
  priority_order INTEGER,
  is_active BOOLEAN DEFAULT true
);

-- Product-specific validation rules
CREATE TABLE product_validation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_type VARCHAR(50) NOT NULL,
  rule_name VARCHAR(100) NOT NULL,
  rule_condition TEXT NOT NULL, -- JSON condition
  error_message TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true
);
```

---

## 5. API Endpoints (Realistic)

### 5.1 Policy Management
```typescript
// Core Policy Operations
GET    /api/policies                     // List with filtering
POST   /api/policies                     // Create new policy
GET    /api/policies/:id                 // Get policy details
PUT    /api/policies/:id                 // Update policy
DELETE /api/policies/:id                 // Soft delete
POST   /api/policies/:id/clone           // Clone policy

// Policy Hierarchy
GET    /api/policies/:id/children        // Get child policies
POST   /api/policies/:id/children        // Create child policy
PUT    /api/policies/:id/parent          // Set parent policy

// Policy Versions
GET    /api/policies/:id/versions        // Get versions
POST   /api/policies/:id/versions        // Create version
GET    /api/policies/:id/versions/:version // Get specific version

// Templates
GET    /api/policy-templates             // List templates
POST   /api/policy-templates             // Create template
POST   /api/policy-templates/:id/apply   // Apply template
```

### 5.2 Insurance Product-Specific Benefit APIs
```typescript
// Product-Aware Benefit Management
GET    /api/benefit-categories           // List categories with product filters
GET    /api/benefit-types                // List types by product compatibility
GET    /api/policies/:id/benefits        // Get benefits with product-specific params
PUT    /api/policies/:id/benefits        // Update with product validation
POST   /api/policies/:id/benefits/validate // Product-specific validation

// Insurance Product Calculations
POST   /api/benefits/calculate/indemnity    // Indemnity cost-sharing calculation
POST   /api/benefits/calculate/managed-care // Managed care copay/network calculation
POST   /api/benefits/calculate/aso          // ASO stop-loss/admin fee calculation
POST   /api/benefits/cob-calculation        // COB coordination calculation
POST   /api/benefits/compare                // Product-aware comparison

// Product-Specific Features
GET    /api/policies/:id/cob-rules          // COB rules management
POST   /api/policies/:id/stop-loss          // ASO stop-loss configuration
GET    /api/policies/:id/network-tiers      // Managed care network tiers
POST   /api/benefits/preauth-check          // Preauthorization validation
```

### 5.3 Bulk Operations
```typescript
// Bulk Operations
POST   /api/policies/bulk-create         // Bulk create
PUT    /api/policies/bulk-update         // Bulk update
POST   /api/policies/mass-change         // Mass changes
GET    /api/policies/bulk-jobs           // List jobs
GET    /api/policies/bulk-jobs/:id       // Job status

// Analysis
POST   /api/policies/impact-analysis     // Impact analysis
POST   /api/policies/comparison          // Policy comparison
```

---

## 6. Implementation Roadmap (Realistic)

### **PHASE 1+2 COMBINED: Achievable Excellence (24 Weeks)**

#### **Weeks 1-8: Core Foundation**
- [ ] **Policy CRUD**: Complete policy management dengan validation
- [ ] **3-Level Hierarchy**: Parent-child relationships dengan inheritance
- [ ] **Database Versioning**: Change tracking dengan audit trail
- [ ] **Basic Benefit Engine**: 50+ configurable parameters
- [ ] **Policy Templates**: Template system dengan customization

#### **Weeks 9-16: Advanced Features**
- [ ] **Enhanced Benefit Rules**: 100+ parameters dengan cost-sharing
- [ ] **Multi-tier Networks**: In-network vs out-network configuration
- [ ] **Bulk Operations**: CSV upload dengan comprehensive validation
- [ ] **Policy Comparison**: Multi-dimensional comparison tools
- [ ] **Impact Analysis**: Change impact assessment

#### **Weeks 17-20: Integration & Analytics**
- [ ] **Module Integration**: Member, Claims, Financial integration
- [ ] **Analytics Dashboard**: Policy performance metrics
- [ ] **Reporting System**: Comprehensive policy reports
- [ ] **API Documentation**: Complete API documentation

#### **Weeks 21-24: Testing & Production**
- [ ] **Comprehensive Testing**: 90% test coverage
- [ ] **Performance Optimization**: Handle 10,000+ policies
- [ ] **Security Hardening**: Production-ready security
- [ ] **Production Deployment**: Staging dan production setup

---

## 7. Success Criteria (Realistic)

### **Technical KPIs (Achievable)**
- [ ] **Policy Setup Time**: 70% reduction
- [ ] **API Performance**: < 500ms (95th percentile)
- [ ] **Bulk Operations**: 1,000 policies in 60 seconds
- [ ] **System Uptime**: > 99.5%
- [ ] **Test Coverage**: > 90%
- [ ] **Security**: Zero critical vulnerabilities

### **Business KPIs (Achievable)**
- [ ] **Configuration Accuracy**: > 99%
- [ ] **User Satisfaction**: > 4.5/5
- [ ] **Error Rate**: < 1%
- [ ] **Time-to-Market**: 60% improvement
- [ ] **Support Tickets**: 70% reduction
- [ ] **Cost Reduction**: 50% admin cost reduction
- [ ] **Product Validation**: 100% accuracy dalam product-specific rule validation
- [ ] **COB Calculation**: 99% accuracy dalam coordination of benefits calculations
- [ ] **Cost-Sharing Accuracy**: 99.5% accuracy dalam deductible/coinsurance/copay calculations

### **Integration KPIs**
- [ ] **Module Integration**: 100% dengan Member & Claims
- [ ] **Data Accuracy**: 99% data consistency
- [ ] **API Reliability**: 99.5% API uptime
- [ ] **User Adoption**: 90% admin user adoption

---

## 8. Insurance Product Business Rules

### 8.1 Product-Specific Business Rules

#### **INDEMNITY Product Rules**
- **BR-IND-01**: Deductible harus di-meet sebelum coinsurance berlaku
- **BR-IND-02**: Out-of-pocket maximum includes deductible + coinsurance
- **BR-IND-03**: Copay tidak accumulate ke deductible (kecuali dikonfigurasi)
- **BR-IND-04**: COB calculation: non-duplication method untuk avoid overpayment
- **BR-IND-05**: R&C (Reasonable & Customary) limits apply untuk out-of-network
- **BR-IND-06**: Emergency services covered at in-network level regardless of provider

#### **MANAGED CARE Product Rules**
- **BR-MC-01**: PCP referral required untuk specialist visits (HMO model)
- **BR-MC-02**: Preauthorization required untuk services above threshold
- **BR-MC-03**: Out-of-network coverage = 0% untuk HMO, reduced untuk PPO
- **BR-MC-04**: Emergency care covered at highest tier regardless of network
- **BR-MC-05**: Preventive care covered 100% in-network tanpa deductible
- **BR-MC-06**: Network tier copays override coinsurance calculations
- **BR-MC-07**: POS model requires PCP but allows out-network dengan higher cost

#### **ASO Product Rules**
- **BR-ASO-01**: Individual stop-loss triggered per member per year
- **BR-ASO-02**: Aggregate stop-loss calculated across all members
- **BR-ASO-03**: Administrative fees calculated on premium atau claims volume
- **BR-ASO-04**: Employer responsible untuk claims fund adequacy
- **BR-ASO-05**: ERISA reporting requirements untuk self-funded plans
- **BR-ASO-06**: Claims reserves must be maintained untuk incurred but not reported (IBNR)

#### **COB (Coordination of Benefits) Rules**
- **BR-COB-01**: Birthday rule: Parent dengan earlier birthday = primary untuk children
- **BR-COB-02**: Employment rule: Employee's own coverage = primary
- **BR-COB-03**: Gender rule: Father's coverage = primary (if applicable)
- **BR-COB-04**: Non-duplication method: Secondary pays lesser of (claim amount - primary payment) atau secondary benefit
- **BR-COB-05**: Maintenance of benefits: Secondary pays up to what it would pay as primary
- **BR-COB-06**: Medicare coordination: Medicare = primary untuk age 65+ (unless active employment)

### 8.2 Product Validation Matrix

| Parameter | Indemnity | Managed Care | ASO | Validation Rule |
|-----------|-----------|--------------|-----|----------------|
| Deductible | ✅ Required | ⚠️ Optional | ✅ Required | Must be > 0 if enabled |
| Coinsurance | ✅ 0-100% | ⚠️ Limited use | ✅ 0-100% | Cannot exceed 100% |
| Copay | ✅ Optional | ✅ Primary | ✅ Optional | Fixed amount > 0 |
| Network Tiers | ❌ N/A | ✅ Required | ⚠️ Optional | Must define tier structure |
| PCP Referral | ❌ N/A | ✅ HMO Required | ❌ N/A | Boolean flag |
| Preauth | ⚠️ Optional | ✅ Common | ⚠️ Optional | Threshold amount |
| Stop-Loss | ❌ N/A | ❌ N/A | ✅ Required | Individual + Aggregate |
| COB | ✅ Supported | ✅ Supported | ✅ Supported | Must define priority |

### 8.3 Cost-Sharing Calculation Logic

#### **Indemnity Calculation Flow:**
```typescript
function calculateIndemnityBenefit(claimAmount: number, memberAccumulation: Accumulation) {
  // 1. Apply deductible
  const remainingDeductible = Math.max(0, deductible - memberAccumulation.deductible);
  const deductibleApplied = Math.min(claimAmount, remainingDeductible);
  const amountAfterDeductible = claimAmount - deductibleApplied;
  
  // 2. Apply coinsurance
  const coinsuranceAmount = amountAfterDeductible * (coinsurancePercentage / 100);
  const memberCoinsurance = amountAfterDeductible - coinsuranceAmount;
  
  // 3. Apply out-of-pocket maximum
  const totalMemberCost = deductibleApplied + memberCoinsurance;
  const remainingOOP = Math.max(0, oopMax - memberAccumulation.oop);
  const finalMemberCost = Math.min(totalMemberCost, remainingOOP);
  
  return {
    coveredAmount: claimAmount - finalMemberCost,
    memberResponsibility: finalMemberCost,
    deductibleApplied,
    coinsuranceApplied: memberCoinsurance
  };
}
```

#### **Managed Care Calculation Flow:**
```typescript
function calculateManagedCareBenefit(claimAmount: number, networkTier: string, serviceType: string) {
  // 1. Check if service requires referral/preauth
  if (requiresReferral && !hasValidReferral) {
    return { coveredAmount: 0, reason: 'Missing PCP referral' };
  }
  
  // 2. Apply network-based copay
  const copayAmount = getNetworkTierCopay(networkTier, serviceType);
  
  // 3. For services above copay, apply coinsurance if configured
  const amountAboveCopay = Math.max(0, claimAmount - copayAmount);
  const coinsuranceAmount = amountAboveCopay * (getNetworkCoinsurance(networkTier) / 100);
  
  return {
    coveredAmount: claimAmount - copayAmount - (amountAboveCopay - coinsuranceAmount),
    memberResponsibility: copayAmount + (amountAboveCopay - coinsuranceAmount)
  };
}
```

#### **COB Calculation Flow:**
```typescript
function calculateCOBBenefit(claimAmount: number, primaryBenefit: number, secondaryPolicy: Policy) {
  const remainingAmount = claimAmount - primaryBenefit;
  
  if (secondaryPolicy.cobMethod === 'non_duplication') {
    // Secondary pays lesser of remaining amount or what it would pay as primary
    const secondaryAsPrimary = calculatePrimaryBenefit(claimAmount, secondaryPolicy);
    return Math.min(remainingAmount, secondaryAsPrimary);
  } else if (secondaryPolicy.cobMethod === 'maintenance_of_benefits') {
    // Secondary pays up to what it would pay as primary
    const secondaryAsPrimary = calculatePrimaryBenefit(claimAmount, secondaryPolicy);
    return Math.max(0, secondaryAsPrimary - primaryBenefit);
  }
}
```

---

## 9. Risk Mitigation

### **Technical Risks**
- **Complex Benefit Rules**: Start dengan 50 parameters, expand gradually
- **Performance Issues**: Implement caching dan database optimization
- **Integration Complexity**: Phase integration dengan thorough testing

### **Business Risks**
- **Product Complexity**: Insurance product rules complexity bisa overwhelming - mitigasi dengan phased implementation
- **COB Calculation Errors**: Complex COB rules bisa menyebabkan calculation errors - extensive testing required
- **Regulatory Compliance**: Different products have different regulatory requirements - built-in validation needed
- **Integration Complexity**: Careful coordination dengan Claims module untuk cost-sharing calculations
- **Data Migration**: Existing policies need proper product type classification
- **User Training**: Staff need training pada different product types dan rules
- **Performance**: Complex calculations bisa impact performance - optimization required

---

## 9. Inter-Module Integration & Boundaries

### **9.1 Policy Management Integration Matrix**

#### **→ Member/Client Management Module**
```typescript
// POLICY MODULE PROVIDES:
✅ Policy eligibility rules untuk member enrollment
✅ Benefit entitlements untuk member dashboard
✅ Coverage details untuk member portal
✅ Premium calculation basis untuk billing

// POLICY MODULE RECEIVES:
✅ Member enrollment data untuk policy assignment
✅ Client hierarchy untuk policy inheritance
✅ Member tier information untuk benefit customization
✅ Life event triggers untuk policy adjustments

// CLEAR BOUNDARIES:
❌ Policy TIDAK handle member registration (Member Module)
❌ Policy TIDAK manage client billing (Financial Module)
✅ Policy HANYA provide benefit rules dan coverage details
```

#### **→ Claims Management Module**
```typescript
// POLICY MODULE PROVIDES:
✅ Real-time benefit verification untuk claims validation
✅ Coverage percentage dan limits untuk claims calculation
✅ Deductible, coinsurance, copay rules untuk cost-sharing
✅ Prior authorization requirements untuk claims approval
✅ Network tier information untuk provider validation

// POLICY MODULE RECEIVES:
✅ Claims utilization data untuk benefit tracking
✅ Accumulation data untuk out-of-pocket calculations
✅ Provider performance data untuk network optimization

// CLEAR BOUNDARIES:
❌ Policy TIDAK process claims (Claims Module)
❌ Policy TIDAK calculate actual claim amounts (Claims Module)
✅ Policy HANYA provide benefit rules dan coverage parameters
```

#### **→ Provider Management Module**
```typescript
// POLICY MODULE PROVIDES:
✅ Network tier definitions untuk provider classification
✅ Coverage variations per provider tier
✅ Benefit restrictions per provider type
✅ Geographic coverage rules untuk provider networks

// POLICY MODULE RECEIVES:
✅ Provider network assignments untuk coverage validation
✅ Provider performance scores untuk tier adjustments
✅ Provider specialty information untuk benefit matching

// CLEAR BOUNDARIES:
❌ Policy TIDAK manage provider contracts (Provider Module)
❌ Policy TIDAK handle provider payments (Financial Module)
✅ Policy HANYA define network rules dan coverage variations
```

#### **→ Financial Management Module**
```typescript
// POLICY MODULE PROVIDES:
✅ Premium calculation parameters
✅ Cost-sharing rules untuk financial calculations
✅ Benefit limits untuk financial planning
✅ Policy effective dates untuk billing cycles

// POLICY MODULE RECEIVES:
✅ Payment status untuk policy activation
✅ Financial performance data untuk policy optimization
✅ Cost analysis untuk benefit adjustments

// CLEAR BOUNDARIES:
❌ Policy TIDAK process payments (Financial Module)
❌ Policy TIDAK generate invoices (Financial Module)
✅ Policy HANYA provide financial parameters dan rules
```

### **9.2 Data Flow Integration Patterns**

#### **Policy Assignment Flow**
```mermaid
sequenceDiagram
    participant C as Client Module
    participant M as Member Module
    participant P as Policy Module
    participant F as Financial Module
    
    C->>P: Request available policies
    P->>P: Check client eligibility
    P->>M: Validate member tier
    M->>P: Return member classification
    P->>C: Return eligible policies
    C->>P: Assign policy to members
    P->>F: Trigger premium calculation
    F->>P: Confirm financial setup
    P->>M: Update member coverage
```

#### **Claims Validation Flow**
```mermaid
sequenceDiagram
    participant Cl as Claims Module
    participant P as Policy Module
    participant Pr as Provider Module
    participant M as Member Module
    
    Cl->>P: Request benefit verification
    P->>M: Check member eligibility
    M->>P: Return eligibility status
    P->>Pr: Validate provider network
    Pr->>P: Return network tier
    P->>P: Calculate coverage percentage
    P->>Cl: Return benefit validation
```

### **9.3 API Integration Specifications**

#### **Policy-to-Member Integration**
```typescript
// Policy Module exposes:
GET /api/policies/:id/eligibility-rules    // Member eligibility criteria
GET /api/policies/:id/benefit-summary      // Member benefit overview
POST /api/policies/validate-member         // Validate member for policy
GET /api/policies/:id/coverage-details     // Coverage for member portal

// Policy Module consumes:
GET /api/members/:id/tier-information      // Member tier for benefit calc
GET /api/members/:id/enrollment-status    // Current enrollment status
POST /api/members/:id/life-events         // Life event notifications
```

#### **Policy-to-Claims Integration**
```typescript
// Policy Module exposes:
POST /api/policies/benefit-verification    // Real-time benefit check
GET /api/policies/:id/cost-sharing-rules  // Deductible/coinsurance rules
GET /api/policies/:id/coverage-limits     // Annual/lifetime limits
POST /api/policies/prior-auth-check       // Prior authorization rules

// Policy Module consumes:
POST /api/claims/utilization-update       // Claims utilization data
GET /api/claims/:memberId/accumulations   // YTD accumulation data
```

#### **Policy-to-Provider Integration**
```typescript
// Policy Module exposes:
GET /api/policies/:id/network-tiers        // Network tier definitions
GET /api/policies/:id/provider-coverage   // Coverage by provider type
POST /api/policies/validate-provider      // Provider network validation

// Policy Module consumes:
GET /api/providers/:id/network-status     // Provider network assignment
GET /api/providers/:id/performance-score  // Provider quality metrics
```

### **9.4 Database Integration Points**

#### **Shared Reference Tables**
```sql
-- Shared between Policy and Claims
CREATE TABLE medical_codes (
  id UUID PRIMARY KEY,
  code_type VARCHAR(20), -- icd10, cpt, hcpcs
  code VARCHAR(20) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT true
);

-- Policy benefits reference medical codes
ALTER TABLE policy_benefits ADD COLUMN covered_codes UUID[] REFERENCES medical_codes(id);
ALTER TABLE policy_benefits ADD COLUMN excluded_codes UUID[] REFERENCES medical_codes(id);
```

#### **Cross-Module Foreign Keys**
```sql
-- Policy references Client (but doesn't manage client data)
ALTER TABLE policies ADD COLUMN client_id UUID REFERENCES clients(id);

-- Policy benefits reference Provider networks (but doesn't manage providers)
ALTER TABLE policy_benefits ADD COLUMN network_tier_id UUID REFERENCES provider_network_tiers(id);

-- Policy tracks Member assignments (but doesn't manage member data)
CREATE TABLE policy_member_assignments (
  id UUID PRIMARY KEY,
  policy_id UUID REFERENCES policies(id),
  member_id UUID REFERENCES members(id),
  effective_date DATE NOT NULL,
  termination_date DATE,
  assignment_type VARCHAR(50) -- primary, secondary, cobra
);
```

### **9.5 Business Logic Boundaries**

#### **What Policy Module OWNS:**
```typescript
interface PolicyModuleResponsibilities {
  // ✅ OWNS - Policy Configuration
  defineBenefitRules(): BenefitRules;
  setCoveragePercentages(): CoverageRules;
  configureDeductibles(): CostSharingRules;
  setNetworkTiers(): NetworkConfiguration;
  
  // ✅ OWNS - Policy Validation
  validatePolicyConfiguration(): ValidationResult;
  checkBenefitConsistency(): ConsistencyCheck;
  validateRegulatoryCompliance(): ComplianceStatus;
  
  // ✅ OWNS - Policy Templates
  createPolicyTemplate(): PolicyTemplate;
  applyTemplate(): Policy;
  customizeTemplate(): CustomPolicy;
}
```

#### **What Policy Module DOES NOT Own:**
```typescript
interface PolicyModuleBoundaries {
  // ❌ DOES NOT OWN - Member Management
  registerMember(): void; // → Member Module
  updateMemberProfile(): void; // → Member Module
  processMemberEnrollment(): void; // → Member Module
  
  // ❌ DOES NOT OWN - Claims Processing
  submitClaim(): void; // → Claims Module
  approveClaim(): void; // → Claims Module
  calculateClaimAmount(): void; // → Claims Module
  
  // ❌ DOES NOT OWN - Provider Management
  credentialProvider(): void; // → Provider Module
  negotiateContracts(): void; // → Provider Module
  processProviderPayments(): void; // → Financial Module
  
  // ❌ DOES NOT OWN - Financial Transactions
  processPayments(): void; // → Financial Module
  generateInvoices(): void; // → Financial Module
  calculateCommissions(): void; // → Financial Module
}
```

### **9.6 Integration Testing Strategy**

#### **Cross-Module Integration Tests**
```typescript
// Test Policy-Member Integration
describe('Policy-Member Integration', () => {
  it('should validate member eligibility for policy assignment', async () => {
    const member = await createTestMember();
    const policy = await createTestPolicy();
    const eligibility = await policyService.validateMemberEligibility(member.id, policy.id);
    expect(eligibility.isEligible).toBe(true);
  });
});

// Test Policy-Claims Integration
describe('Policy-Claims Integration', () => {
  it('should provide accurate benefit verification for claims', async () => {
    const policy = await createTestPolicy();
    const claimRequest = createTestClaimRequest();
    const verification = await policyService.verifyBenefits(policy.id, claimRequest);
    expect(verification.coveragePercentage).toBeGreaterThan(0);
  });
});
```

---

## 10. Future Enhancement Roadmap

### **Phase 3: AI & Machine Learning (Year 2)**
- [ ] **AI-Powered Policy Optimization**: ML recommendations untuk policy configuration
- [ ] **Predictive Analytics**: Utilization forecasting dengan machine learning
- [ ] **Intelligent Templates**: AI-generated policy templates berdasarkan client profile
- [ ] **Smart Validation**: Advanced validation dengan pattern recognition
- [ ] **Automated Compliance**: ML-powered regulatory compliance checking

### **Phase 4: Advanced Enterprise Features (Year 2-3)**
- [ ] **Multi-Dimensional Hierarchy**: Expand ke 7-level policy inheritance
- [ ] **500+ Benefit Parameters**: Advanced benefit configuration engine
- [ ] **Real-time Processing**: Sub-second policy validation dan updates
- [ ] **Blockchain Audit Trails**: Immutable policy change tracking
- [ ] **Advanced Analytics**: Population health integration

### **Phase 5: Global TPA Standards (Year 3+)**
- [ ] **Multi-Jurisdictional Compliance**: Support untuk multiple countries
- [ ] **Clinical Integration**: Evidence-based medicine protocols
- [ ] **Value-Based Care**: Outcome-based benefit adjustments
- [ ] **Provider Performance Scoring**: Network optimization
- [ ] **IoT Health Integration**: Real-time health data incorporation

### **Phase 6: Innovation & Emerging Tech (Year 3+)**
- [ ] **Quantum Computing Ready**: Future-proof architecture
- [ ] **Advanced AI Chatbots**: Natural language policy configuration
- [ ] **AR/VR Interfaces**: Next-generation user experience
- [ ] **Smart Contracts**: Automated policy execution
- [ ] **Predictive Compliance**: Proactive regulatory adaptation

### **Investment Requirements for Future Phases**

#### **Phase 3 (AI/ML) - Additional Resources Needed:**
- **ML Engineer**: 1 full-time specialist
- **Data Scientist**: 1 part-time consultant
- **Cloud ML Services**: AWS SageMaker atau Google AI Platform
- **Training Data**: Historical policy dan claims data
- **Timeline**: 6-12 months
- **Budget**: +60% dari current development cost

#### **Phase 4 (Enterprise) - Significant Investment:**
- **Senior Architects**: 2 enterprise-level developers
- **DevOps Specialist**: 1 full-time untuk real-time processing
- **Security Expert**: 1 consultant untuk blockchain implementation
- **Enterprise Infrastructure**: High-performance computing resources
- **Timeline**: 12-18 months
- **Budget**: +150% dari current development cost

#### **Phase 5-6 (Global/Innovation) - Major Investment:**
- **Specialized Team**: 5-10 experts dalam various domains
- **Legal/Regulatory**: Multi-jurisdictional compliance experts
- **Medical Experts**: Clinical integration specialists
- **Research Partnership**: Collaboration dengan universities/research institutes
- **Timeline**: 2-3 years
- **Budget**: +300% dari current development cost

### **ROI Projections for Future Enhancements**

#### **Phase 3 ROI (AI/ML)**
- **Operational Efficiency**: +25% improvement
- **Error Reduction**: 99.9% accuracy (vs 99%)
- **Market Differentiation**: Premium pricing capability
- **Expected ROI**: 200% dalam 2 tahun

#### **Phase 4 ROI (Enterprise)**
- **Enterprise Client Acquisition**: 5x larger deals
- **Market Leadership**: Top 3 regional TPA positioning
- **Revenue Growth**: 300% increase dalam enterprise segment
- **Expected ROI**: 400% dalam 3 tahun

#### **Phase 5-6 ROI (Global/Innovation)**
- **Global Market Entry**: International expansion capability
- **Industry Leadership**: Technology innovation recognition
- **Valuation Increase**: 10x company valuation potential
- **Expected ROI**: 1000%+ dalam 5 tahun

---

**📋 REALISTIC BRD STATUS: ACHIEVABLE & READY**

**✅ Realistic Scope Defined**  
**✅ Team Capabilities Assessed**  
**✅ 6-Month Timeline Confirmed**  
**✅ Technical Architecture Ready**  
**✅ Integration Points Identified**  
**✅ Success Criteria Achievable**  
**✅ Future Enhancement Roadmap Created**

**🎯 Current Target**: Strong Regional TPA Capabilities  
**🚀 Future Vision**: Global TPA Leadership  
**⏱️ Phase 1-2 Timeline**: 24 Weeks (6 Months)  
**🔮 Long-term Roadmap**: 5-Year Innovation Journey  
**👥 Team**: Current Development Team + Future Specialists  
**💰 Budget**: Phase 1-2 Within Current Resources, Future Phases Require Investment  

*BRD v2.1 Realistic - Achievable Excellence with Future Vision*  
*Current Phase: ✅ FEASIBLE*  
*Future Phases: 📋 PLANNED*  
*Development Ready: ✅ LET'S BUILD THE FOUNDATION* 🚀