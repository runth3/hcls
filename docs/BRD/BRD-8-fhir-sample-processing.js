// FHIR Claim Processing Example
// Shows how FHIR claims integrate with AI CDS Engine

class FHIRClaimsProcessor {
  constructor() {
    this.conceptMapper = new ConceptMapper();
    this.aiEngine = new ClinicalAIEngine();
  }

  // Process the sample FHIR claim
  async processSampleClaim() {
    const fhirClaim = {
      "resourceType": "Claim",
      "id": "CLAIM-001",
      "status": "active",
      "type": {
        "coding": [{"system": "http://terminology.hl7.org/CodeSystem/claim-type", "code": "institutional"}]
      },
      "patient": {"reference": "Patient/PAT-001"},
      "created": "2025-07-10T10:00:00Z",
      "provider": {"reference": "Organization/RS-A-123"},
      "item": [{
        "sequence": 1,
        "service": {
          "coding": [{
            "system": "http://hl7.org/fhir/sid/icd-9-cm",
            "code": "47.09",
            "display": "Other appendectomy"
          }]
        },
        "servicedDate": "2025-07-09",
        "net": {"value": 15000000, "currency": "IDR"}
      }],
      "total": {"value": 15000000, "currency": "IDR"}
    };

    // 1. Map FHIR codes to internal concepts
    const mappedConcepts = await this.mapFHIRCodes(fhirClaim);
    console.log('Mapped Concepts:', mappedConcepts);

    // 2. Get AI recommendations
    const aiRecommendations = await this.getAIRecommendations(mappedConcepts);
    console.log('AI Recommendations:', aiRecommendations);

    // 3. Validate claim
    const validation = await this.validateClaim(fhirClaim, aiRecommendations);
    console.log('Validation Result:', validation);

    return validation;
  }

  async mapFHIRCodes(fhirClaim) {
    const mappings = [];
    
    // Map procedure codes from claim items
    for (const item of fhirClaim.item) {
      for (const coding of item.service.coding) {
        const concept = await this.findConceptByFHIRCode(coding.system, coding.code);
        if (concept) {
          mappings.push({
            fhir_code: coding.code,
            fhir_system: coding.system,
            concept_id: concept.concept_id,
            canonical_name: concept.canonical_name,
            indonesian_name: concept.indonesian_name
          });
        }
      }
    }

    return mappings;
  }

  async findConceptByFHIRCode(system, code) {
    // Map FHIR system to our internal format
    const systemMap = {
      'http://hl7.org/fhir/sid/icd-9-cm': 'ICD-9-CM',
      'http://hl7.org/fhir/sid/icd-10': 'ICD-10',
      'http://snomed.info/sct': 'SNOMED CT'
    };

    const mappedSystem = systemMap[system];
    const searchPattern = `${mappedSystem}: ${code}`;

    // Simulate database query
    const sampleConcepts = [
      {
        concept_id: 'PROC-APPNDCTMY-001',
        canonical_name: 'Appendectomy',
        indonesian_name: 'Apendektomi',
        code_mappings: ['ICD-9-CM: 47.09', 'SNOMED CT: 80146002']
      }
    ];

    return sampleConcepts.find(concept => 
      concept.code_mappings.includes(searchPattern)
    );
  }

  async getAIRecommendations(mappedConcepts) {
    // Simulate GraphQL query to get clinical pathway
    const procedureConcept = mappedConcepts[0];
    
    if (procedureConcept.concept_id === 'PROC-APPNDCTMY-001') {
      // AI knows appendectomy is typically for acute appendicitis
      return {
        expected_diagnosis: {
          concept_id: 'DIAG-APPND-001',
          canonical_name: 'Acute Appendicitis',
          indonesian_name: 'Apendisitis Akut',
          priority_score: 0.98
        },
        typical_cost_range: {
          min: 10000000,
          median: 12000000,
          max: 18000000,
          currency: 'IDR'
        },
        clinical_appropriateness: {
          score: 0.95,
          evidence_level: 'HIGH',
          notes: 'Standard surgical treatment for acute appendicitis'
        }
      };
    }

    return null;
  }

  async validateClaim(fhirClaim, aiRecommendations) {
    const claimedAmount = fhirClaim.total.value;
    const expectedMedian = aiRecommendations.typical_cost_range.median;
    const variance = ((claimedAmount - expectedMedian) / expectedMedian * 100).toFixed(1);

    return {
      claim_id: fhirClaim.id,
      validation_status: Math.abs(variance) < 50 ? 'APPROVED' : 'REVIEW_REQUIRED',
      ai_confidence: aiRecommendations.clinical_appropriateness.score,
      
      clinical_validation: {
        procedure_appropriate: true,
        ai_reasoning: aiRecommendations.clinical_appropriateness.notes,
        evidence_level: aiRecommendations.clinical_appropriateness.evidence_level
      },
      
      cost_analysis: {
        claimed_amount: claimedAmount,
        expected_median: expectedMedian,
        variance_percentage: `${variance}%`,
        assessment: Math.abs(variance) < 25 ? 'WITHIN_NORMAL_RANGE' : 'ABOVE_AVERAGE'
      },
      
      recommendations: {
        action: Math.abs(variance) < 50 ? 'APPROVE' : 'MANUAL_REVIEW',
        notes: variance > 25 ? 'Cost higher than typical range, verify complexity' : 'Standard case'
      }
    };
  }

  // Store encounter for AI learning
  async storeEncounterForLearning(fhirClaim, validation) {
    const encounterRecord = {
      encounter_id: `ENC-${fhirClaim.id}`,
      encounter_date: new Date(fhirClaim.created),
      encounter_type: 'INPATIENT', // Based on institutional claim type
      
      // Simulated patient context (would come from Patient resource)
      patient_demographics: {
        age_group: '25-30',
        gender: 'M',
        location_city: 'Jakarta',
        location_province: 'DKI Jakarta'
      },
      
      // Procedures performed
      procedures: [{
        concept_id: 'PROC-APPNDCTMY-001',
        urgency: 'URGENT'
      }],
      
      // Costs
      costs: [{
        concept_id: 'PROC-APPNDCTMY-001',
        claimed_amount: fhirClaim.total.value,
        approved_amount: validation.validation_status === 'APPROVED' ? fhirClaim.total.value : null,
        currency: 'IDR'
      }],
      
      // Outcome (would be updated later)
      outcome: {
        discharge_status: 'IMPROVED' // Assumed for successful appendectomy
      },
      
      // Context
      contextual_factors: {
        season: 'DRY',
        outbreak_period: false,
        weekend_admission: false
      }
    };

    console.log('Storing encounter for AI learning:', encounterRecord);
    
    // This would update the clinical_pairings table
    await this.updateKnowledgeGraph(encounterRecord);
    
    return encounterRecord;
  }

  async updateKnowledgeGraph(encounter) {
    // Update relationship: Acute Appendicitis -> Appendectomy
    const relationship = {
      source_concept_id: 'DIAG-APPND-001', // Inferred diagnosis
      target_concept_id: 'PROC-APPNDCTMY-001', // Performed procedure
      relationship_type: 'HAS_TREATMENT',
      
      // Update AI scores based on successful case
      commonality_score: 0.95, // Very common treatment
      confidence_score: 0.98,  // High confidence
      evidence_level_score: 1.0, // Strong evidence
      priority_score: 0.97,
      
      // Cost information
      median_cost: encounter.costs[0].claimed_amount,
      
      // Outcome data
      success_rate: 0.95, // Assumed high success rate
      
      // Context
      total_encounters: 1 // This case
    };

    console.log('Updated knowledge graph relationship:', relationship);
    return relationship;
  }
}

// Example usage
async function runExample() {
  const processor = new FHIRClaimsProcessor();
  
  console.log('=== FHIR Claim Processing Example ===');
  
  try {
    const result = await processor.processSampleClaim();
    console.log('\n=== Final Result ===');
    console.log(JSON.stringify(result, null, 2));
    
    // Store for learning
    console.log('\n=== Storing for AI Learning ===');
    await processor.storeEncounterForLearning(
      {id: 'CLAIM-001', created: '2025-07-10T10:00:00Z', total: {value: 15000000}}, 
      result
    );
    
  } catch (error) {
    console.error('Error processing claim:', error);
  }
}

// Mock classes for demonstration
class ConceptMapper {
  // Implementation would connect to medical_concepts table
}

class ClinicalAIEngine {
  // Implementation would use GraphQL queries and ML models
}

// Run the example
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FHIRClaimsProcessor, runExample };
} else {
  runExample();
}