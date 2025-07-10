# API Examples for 3-Module AI CDS Engine

## Module 1: Medical Concept Lexicon APIs ("Kamus Besar")

### Search Medical Concepts
```typescript
// Search by Indonesian term
GET /api/lexicon/search?q=DBD&type=DIAGNOSIS
// Returns: DIAG-DBD-001 with all mappings

// Search by ICD code
GET /api/lexicon/search?code=A90&system=ICD-10
// Returns: DIAG-DBD-001 (Dengue Fever)

// Get concept details
GET /api/lexicon/DIAG-DBD-001
// Returns:
{
  "concept_id": "DIAG-DBD-001",
  "canonical_name": "Dengue Fever",
  "indonesian_name": "Demam Berdarah Dengue",
  "concept_type": "DIAGNOSIS",
  "general_terms": ["DBD", "Demam Denggi"],
  "code_mappings": ["ICD-10: A90", "ICD-11: 1D40", "SNOMED CT: 1002005"]
}
```

## Module 2: Encounter Records APIs ("Buku Catatan Transaksi")

### Record Clinical Encounter
```typescript
POST /api/encounters
{
  "encounter_date": "2025-01-15",
  "encounter_type": "OUTPATIENT",
  "patient_demographics": {
    "age_group": "25-30",
    "gender": "M",
    "location_city": "Manado",
    "location_province": "Sulawesi Utara"
  },
  "diagnoses": [
    {
      "concept_id": "DIAG-DBD-001",
      "diagnosis_type": "PRIMARY",
      "severity": "MODERATE"
    }
  ],
  "procedures": [
    {
      "concept_id": "LAB-CBC-001",
      "urgency": "URGENT"
    }
  ],
  "medications": [
    {
      "concept_id": "MED-PARAC-001",
      "dosage": "500mg",
      "duration_days": 5
    }
  ],
  "contextual_factors": {
    "season": "WET",
    "outbreak_period": true
  }
}
```

## Module 3: Clinical Knowledge Graph APIs ("Peta Hubungan Cerdas")

### Get Clinical Recommendations
```typescript
// Get treatment pathway for DBD in Manado during wet season
POST /api/cds/recommendations
{
  "diagnosis_concept_id": "DIAG-DBD-001",
  "context": {
    "location": "Manado",
    "season": "WET",
    "age_group": "25-30"
  }
}

// Returns AI-learned recommendations:
{
  "diagnosis": {
    "concept_id": "DIAG-DBD-001",
    "canonical_name": "Dengue Fever"
  },
  "recommendations": [
    {
      "concept_id": "LAB-CBC-001",
      "relationship_type": "REQUIRES_LAB_TEST",
      "priority_score": 0.95,
      "commonality_score": 0.89,
      "contextual_commonality": {
        "Manado_WET": 0.92
      },
      "typical_cost": {
        "median_cost": 150000,
        "currency": "IDR"
      }
    },
    {
      "concept_id": "MED-PARAC-001",
      "relationship_type": "HAS_TREATMENT",
      "priority_score": 0.87,
      "success_rate": 0.85,
      "evidence_level_score": 0.90
    }
  ]
}
```

### GraphQL Clinical Pathway Query
```graphql
query getDBDPathway {
  getClinicalPathway(
    diagnosisConceptId: "DIAG-DBD-001"
    context: {
      location: "Manado"
      season: "WET"
    }
  ) {
    diagnosis {
      canonical_name
      indonesian_name
    }
    primaryTreatments {
      concept {
        concept_id
        canonical_name
        indonesian_name
      }
      priority_score
      success_rate
      typical_cost {
        median_cost
      }
    }
    requiredLabTests {
      concept {
        concept_id
        canonical_name
      }
      commonality_score
    }
    contextualInsights {
      seasonal_notes
      location_specific_recommendations
    }
  }
}
```

## Integration with TPA Claims Processing

### Enhanced Claims Validation
```typescript
// Validate claim using AI CDS
POST /api/claims/validate-with-cds
{
  "claim_id": "CLM-2025-001",
  "diagnoses": ["DIAG-DBD-001"],
  "procedures": ["LAB-CBC-001", "PROC-CHESTXRAY-001"],
  "medications": ["MED-PARAC-001"],
  "patient_context": {
    "age_group": "25-30",
    "location": "Manado",
    "season": "WET"
  }
}

// Returns AI validation:
{
  "validation_result": "APPROVED",
  "confidence_score": 0.92,
  "clinical_appropriateness": {
    "lab_cbc": {
      "appropriate": true,
      "priority_score": 0.95,
      "reason": "Standard for DBD monitoring"
    },
    "chest_xray": {
      "appropriate": false,
      "priority_score": 0.15,
      "reason": "Not typically required for uncomplicated DBD",
      "alternative_recommendation": "Consider only if respiratory symptoms present"
    }
  },
  "cost_analysis": {
    "expected_cost": 450000,
    "claimed_cost": 650000,
    "variance": "45% above expected",
    "recommendation": "Review chest X-ray necessity"
  }
}
```