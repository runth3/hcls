# Separate Architecture: Lexicon as External API Service

## Architecture Overview

```
┌─────────────────┐    API Calls    ┌─────────────────────────┐
│   TPA System    │ ──────────────► │  Lexicon AI Service     │
│                 │                 │                         │
│ - Claims Proc   │ ◄────────────── │ - Medical Concepts      │
│ - Member Mgmt   │   Responses     │ - AI Recommendations   │
│ - Provider Mgmt │                 │ - Clinical Pathways     │
│ - Analytics     │                 │ - FHIR Integration      │
└─────────────────┘                 └─────────────────────────┘
       │                                       │
       │                                       │
       ▼                                       ▼
┌─────────────────┐                 ┌─────────────────────────┐
│ TPA Database    │                 │ Lexicon Database        │
│                 │                 │                         │
│ - claims        │                 │ - xaie_concepts         │
│ - members       │                 │ - xaie_synonyms         │
│ - policies      │                 │ - xaie_code_mappings    │
│ - providers     │                 │ - xaie_relationships    │
└─────────────────┘                 │ - xaie_encounters       │
                                    │ - xaie_ml_predictions   │
                                    └─────────────────────────┘
```

## Benefits of Separation

### 1. **Independent Scaling**
```yaml
TPA System:
  - Focus: Business operations
  - Scale: User load, transaction volume
  
Lexicon Service:
  - Focus: AI/ML processing
  - Scale: Computational power, ML workloads
```

### 2. **Technology Independence**
```yaml
TPA System:
  - Tech: Next.js, PostgreSQL
  - Deploy: Standard web app
  
Lexicon Service:
  - Tech: Python/FastAPI, ML frameworks
  - Deploy: AI-optimized infrastructure
```

### 3. **Clear Boundaries**
```typescript
// TPA System calls Lexicon API
const clinicalDecision = await lexiconAPI.getClinicalRecommendations({
  diagnosisCode: 'A90',
  patientContext: { location: 'Manado', season: 'WET' }
});

// Lexicon can pull TPA claims for learning
const claimsData = await tpaAPI.getClaimsForLearning({
  dateRange: '2025-01-01 to 2025-01-31'
});
```

## API Integration Points

### TPA → Lexicon API Calls
```typescript
interface LexiconAPI {
  // Clinical decision support
  getClinicalRecommendations(request: ClinicalRequest): Promise<Recommendations>;
  
  // Code mapping
  mapExternalCode(system: string, code: string): Promise<ConceptMapping>;
  
  // Validation
  validateTreatmentPlan(plan: TreatmentPlan): Promise<ValidationResult>;
  
  // Cost analysis
  predictTreatmentCost(diagnosis: string, context: Context): Promise<CostPrediction>;
}
```

### Lexicon → TPA API Calls
```typescript
interface TPAAPI {
  // Learning data
  getClaimsForLearning(filter: ClaimsFilter): Promise<ClaimData[]>;
  
  // Validation feedback
  submitValidationFeedback(claimId: string, feedback: Feedback): Promise<void>;
  
  // Analytics integration
  getClaimsAnalytics(query: AnalyticsQuery): Promise<AnalyticsData>;
}
```

## Deployment Architecture

### Separate Services
```yaml
# TPA System
tpa-system:
  image: tpa-app:latest
  ports: ["3000:3000"]
  environment:
    - LEXICON_API_URL=https://lexicon-api.company.com
    - LEXICON_API_KEY=${LEXICON_API_KEY}

# Lexicon AI Service  
lexicon-service:
  image: lexicon-ai:latest
  ports: ["8000:8000"]
  environment:
    - TPA_API_URL=https://tpa-api.company.com
    - TPA_API_KEY=${TPA_API_KEY}
  resources:
    - GPU support for ML workloads
```

### Database Separation
```sql
-- TPA Database (existing)
CREATE DATABASE tpa_production;

-- Lexicon Database (new, separate)
CREATE DATABASE lexicon_ai;
```

## Implementation Benefits

### 1. **Development Independence**
- TPA team focuses on business logic
- AI team focuses on medical intelligence
- Parallel development possible

### 2. **Deployment Flexibility**
- TPA: Standard web hosting
- Lexicon: AI-optimized infrastructure (GPU, ML frameworks)
- Independent release cycles

### 3. **Security Isolation**
- TPA handles business data
- Lexicon handles de-identified medical data
- Clear data governance boundaries

### 4. **Scalability**
- TPA scales for user load
- Lexicon scales for AI processing
- Cost optimization per service type

## Updated BRD Scope

**BRD-8 becomes**: Lexicon AI Service (External API)
- **Scope**: Medical intelligence service
- **Consumers**: TPA System, future healthcare apps
- **Focus**: AI/ML capabilities, medical knowledge

**TPA System BRDs**: Enhanced with Lexicon integration
- **BRD-4 (Claims)**: Calls Lexicon for validation
- **BRD-7 (Analytics)**: Uses Lexicon insights
- **New APIs**: Integration endpoints

This separation creates a **reusable medical intelligence platform** that can serve multiple healthcare applications beyond just TPA!