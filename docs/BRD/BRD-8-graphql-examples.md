# GraphQL Query Examples for Clinical Relationships

## 1. Get DBD Clinical Pathway (Manado, Wet Season)

```graphql
query getDBDPathway {
  getClinicalPathway(
    diagnosis_concept_id: "DIAG-DBD-001"
    context: { 
      location: "Manado", 
      season: "WET" 
    }
  ) {
    diagnosis {
      canonical_name
      indonesian_name
      general_terms
    }
    primary_treatments {
      treatment {
        concept_id
        canonical_name
        indonesian_name
      }
      priority_score
      commonality_score
      median_cost
      contextual_notes
    }
    diagnostic_tests {
      test {
        concept_id
        canonical_name
        indonesian_name
      }
      priority_score
      necessity_level
      median_cost
    }
    contextual_insights {
      location_specific_notes
      seasonal_recommendations
    }
  }
}
```

**Expected Response:**
```json
{
  "data": {
    "getClinicalPathway": {
      "diagnosis": {
        "canonical_name": "Dengue Fever",
        "indonesian_name": "Demam Berdarah Dengue",
        "general_terms": ["DBD", "Demam Denggi"]
      },
      "primary_treatments": [
        {
          "treatment": {
            "concept_id": "MED-PARAC-001",
            "canonical_name": "Paracetamol",
            "indonesian_name": "Parasetamol"
          },
          "priority_score": 0.85,
          "commonality_score": 0.90,
          "median_cost": 5000,
          "contextual_notes": "Standard symptomatic treatment for fever"
        }
      ],
      "diagnostic_tests": [
        {
          "test": {
            "concept_id": "LAB-CBC-001",
            "canonical_name": "Complete Blood Count",
            "indonesian_name": "Pemeriksaan Darah Lengkap"
          },
          "priority_score": 0.98,
          "necessity_level": "CRITICAL",
          "median_cost": 150000
        }
      ],
      "contextual_insights": {
        "location_specific_notes": "Higher incidence in Manado during wet season",
        "seasonal_recommendations": "Monitor platelet count more frequently during outbreak periods"
      }
    }
  }
}
```

## 2. Get Hypertension Treatment Recommendations

```graphql
query getHypertensionTreatments {
  getTreatmentRecommendations(
    diagnosis_concept_id: "DIAG-HYPTN-001"
    context: { 
      age_group: "45-50", 
      location: "Jakarta" 
    }
    limit: 3
  ) {
    treatment {
      concept_id
      canonical_name
      indonesian_name
      general_terms
    }
    priority_score
    commonality_score
    evidence_level_score
    median_cost
    success_rate
    contextual_notes
  }
}
```

**Expected Response:**
```json
{
  "data": {
    "getTreatmentRecommendations": [
      {
        "treatment": {
          "concept_id": "MED-AMLOD-001",
          "canonical_name": "Amlodipine",
          "indonesian_name": "Amlodipin",
          "general_terms": ["Obat Darah Tinggi", "Norvask", "Tensivask"]
        },
        "priority_score": 0.9,
        "commonality_score": 0.85,
        "evidence_level_score": 1.0,
        "median_cost": 25000,
        "success_rate": 0.82,
        "contextual_notes": "First-line treatment, well-tolerated in Indonesian population"
      }
    ]
  }
}
```

## 3. Search Medical Concepts

```graphql
query searchDBD {
  searchConcepts(
    query: "DBD"
    concept_type: DIAGNOSIS
  ) {
    concept_id
    canonical_name
    indonesian_name
    general_terms
    code_mappings
  }
}
```

## 4. Get Concept with All Relationships

```graphql
query getConceptWithRelationships {
  getConcept(concept_id: "DIAG-HYPTN-001") {
    concept_id
    canonical_name
    indonesian_name
    
    treatments {
      target_concept {
        canonical_name
        indonesian_name
      }
      priority_score
      commonality_score
      evidence_level_score
      median_cost
      contextual_scores {
        context_type
        context_value
        commonality_score
      }
    }
    
    symptoms {
      target_concept {
        canonical_name
        indonesian_name
      }
      commonality_score
    }
  }
}
```

## 5. Complex Clinical Decision Query

```graphql
query complexClinicalDecision {
  # Get diabetes treatment pathway
  diabetes: getClinicalPathway(
    diagnosis_concept_id: "DIAG-DMT2-001"
    context: { age_group: "50-55", location: "Surabaya" }
  ) {
    primary_treatments {
      treatment { canonical_name, indonesian_name }
      priority_score
      median_cost
    }
  }
  
  # Get hypertension treatment for comparison
  hypertension: getClinicalPathway(
    diagnosis_concept_id: "DIAG-HYPTN-001"
    context: { age_group: "50-55", location: "Surabaya" }
  ) {
    primary_treatments {
      treatment { canonical_name, indonesian_name }
      priority_score
      median_cost
    }
  }
}
```

## 6. Contextual Intelligence Query

```graphql
query contextualIntelligence {
  getClinicalPathway(
    diagnosis_concept_id: "DIAG-DBD-001"
    context: { 
      location: "Manado", 
      season: "WET", 
      outbreak_period: true 
    }
  ) {
    diagnostic_tests {
      test { canonical_name }
      priority_score
      contextual_scores {
        context_type
        context_value
        commonality_score
        encounter_count
      }
    }
    contextual_insights {
      location_specific_notes
      seasonal_recommendations
      cost_variations
    }
  }
}
```

## 7. Cost Analysis Query

```graphql
query costAnalysis {
  getTreatmentRecommendations(
    diagnosis_concept_id: "DIAG-GASTRO-001"
    context: { location: "Jakarta" }
  ) {
    treatment {
      canonical_name
      indonesian_name
    }
    median_cost
    cost_range {
      min_cost
      max_cost
      median_cost
    }
    contextual_scores(context_type: LOCATION) {
      context_value
      commonality_score
    }
  }
}
```