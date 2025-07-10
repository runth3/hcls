# FHIR Claims Integration with AI CDS Engine

## FHIR to AI Engine Transformation

### 1. FHIR Claim to Encounter Record Transformation

```typescript
interface FHIRClaimProcessor {
  async processFHIRClaim(fhirClaim: FHIRClaim): Promise<EncounterRecord> {
    // Extract diagnosis from referenced Condition
    const diagnoses = await this.extractDiagnoses(fhirClaim.diagnosisSequence);
    
    // Extract procedures from referenced Procedure resources
    const procedures = await this.extractProcedures(fhirClaim.item);
    
    // Map FHIR codes to internal concept_ids
    const mappedDiagnoses = await this.mapToConceptIds(diagnoses, 'DIAGNOSIS');
    const mappedProcedures = await this.mapToConceptIds(procedures, 'PROCEDURE');
    
    return {
      encounter_id: `ENC-${fhirClaim.id}`,
      encounter_date: new Date(fhirClaim.created),
      encounter_type: this.mapEncounterType(fhirClaim.type.coding[0].code),
      
      // Extract patient context from Patient resource
      patient_demographics: await this.extractPatientContext(fhirClaim.patient.reference),
      
      // Extract provider context
      provider_context: await this.extractProviderContext(fhirClaim.provider.reference),
      
      // Map to internal concept IDs
      diagnoses: mappedDiagnoses,
      procedures: mappedProcedures,
      
      // Extract costs
      costs: this.extractCosts(fhirClaim.item),
      
      // Contextual factors
      contextual_factors: await this.extractContextualFactors(fhirClaim)
    };
  }
  
  async mapToConceptIds(fhirCodes: FHIRCode[], conceptType: string): Promise<ConceptMapping[]> {
    const mappings = [];
    
    for (const code of fhirCodes) {
      // Search in medical_concepts table
      const concept = await this.findConceptByCode(code.system, code.code);
      
      if (concept) {
        mappings.push({
          concept_id: concept.concept_id,
          original_code: code.code,
          original_system: code.system
        });
      }
    }
    
    return mappings;
  }
  
  async findConceptByCode(system: string, code: string): Promise<MedicalConcept | null> {
    // Map FHIR system to our code mapping format
    const searchPattern = this.mapFHIRSystemToPattern(system, code);
    
    const result = await db.query(`
      SELECT concept_id, canonical_name, indonesian_name 
      FROM medical_concepts 
      WHERE code_mappings @> $1::jsonb
    `, [JSON.stringify([searchPattern])]);
    
    return result.rows[0] || null;
  }
  
  mapFHIRSystemToPattern(system: string, code: string): string {
    const systemMap = {
      'http://hl7.org/fhir/sid/icd-10': 'ICD-10',
      'http://hl7.org/fhir/sid/icd-9-cm': 'ICD-9-CM',
      'http://snomed.info/sct': 'SNOMED CT'
    };
    
    const mappedSystem = systemMap[system] || system;
    return `${mappedSystem}: ${code}`;
  }
}
```

### 2. Real-time FHIR Claim Processing with AI CDS

```typescript
interface FHIRClaimValidator {
  async validateClaimWithAI(fhirClaim: FHIRClaim): Promise<ClaimValidationResult> {
    // 1. Transform FHIR to internal format
    const encounterRecord = await this.fhirProcessor.processFHIRClaim(fhirClaim);
    
    // 2. Get AI recommendations for diagnosis
    const primaryDiagnosis = encounterRecord.diagnoses[0];
    const aiRecommendations = await this.getAIRecommendations(
      primaryDiagnosis.concept_id,
      encounterRecord.contextual_factors
    );
    
    // 3. Validate procedures against AI recommendations
    const procedureValidation = await this.validateProcedures(
      encounterRecord.procedures,
      aiRecommendations
    );
    
    // 4. Cost analysis
    const costAnalysis = await this.analyzeCosts(
      encounterRecord.costs,
      aiRecommendations
    );
    
    return {
      claim_id: fhirClaim.id,
      validation_status: procedureValidation.isValid ? 'APPROVED' : 'REVIEW_REQUIRED',
      ai_confidence: procedureValidation.confidence,
      clinical_appropriateness: procedureValidation.details,
      cost_analysis: costAnalysis,
      recommendations: aiRecommendations.alternatives
    };
  }
  
  async getAIRecommendations(diagnosisConceptId: string, context: any): Promise<AIRecommendations> {
    // GraphQL query to get clinical pathway
    const query = `
      query getClinicalPathway($diagnosisId: ID!, $context: ClinicalContext!) {
        getClinicalPathway(diagnosis_concept_id: $diagnosisId, context: $context) {
          primary_treatments {
            treatment { concept_id, canonical_name }
            priority_score
            median_cost
          }
          diagnostic_tests {
            test { concept_id, canonical_name }
            priority_score
            necessity_level
          }
        }
      }
    `;
    
    return await this.graphqlClient.query(query, {
      diagnosisId: diagnosisConceptId,
      context: {
        location: context.location,
        season: context.season,
        age_group: context.age_group
      }
    });
  }
}
```

### 3. Sample FHIR Claim Processing

```typescript
// Example: Process appendectomy claim
const fhirClaim = {
  "resourceType": "Claim",
  "id": "CLAIM-001",
  "status": "active",
  "patient": { "reference": "Patient/PAT-001" },
  "provider": { "reference": "Organization/RS-A-123" },
  "item": [{
    "sequence": 1,
    "service": {
      "coding": [{
        "system": "http://hl7.org/fhir/sid/icd-9-cm",
        "code": "47.09",
        "display": "Other appendectomy"
      }]
    },
    "net": { "value": 15000000, "currency": "IDR" }
  }]
};

// Process with AI CDS
const result = await fhirClaimValidator.validateClaimWithAI(fhirClaim);

// Expected AI response:
{
  "claim_id": "CLAIM-001",
  "validation_status": "APPROVED",
  "ai_confidence": 0.95,
  "clinical_appropriateness": {
    "appendectomy": {
      "appropriate": true,
      "priority_score": 0.98,
      "reason": "Standard treatment for acute appendicitis"
    }
  },
  "cost_analysis": {
    "claimed_amount": 15000000,
    "expected_median": 12000000,
    "variance": "+25%",
    "assessment": "Within acceptable range for institutional setting"
  }
}
```

### 4. FHIR Code Mapping Examples

```sql
-- Map FHIR ICD-10 K35.8 to internal concept
SELECT concept_id, canonical_name, indonesian_name 
FROM medical_concepts 
WHERE code_mappings @> '["ICD-10: K35.8"]'::jsonb;
-- Returns: DIAG-APPND-001, "Acute Appendicitis", "Apendisitis Akut"

-- Map FHIR ICD-9-CM 47.09 to internal concept  
SELECT concept_id, canonical_name, indonesian_name 
FROM medical_concepts 
WHERE code_mappings @> '["ICD-9-CM: 47.09"]'::jsonb;
-- Returns: PROC-APPNDCTMY-001, "Appendectomy", "Apendektomi"
```

### 5. Integration with Existing TPA Claims Processing

```typescript
interface EnhancedClaimsProcessor {
  async processIncomingClaim(fhirClaim: FHIRClaim): Promise<ClaimProcessingResult> {
    // 1. Standard TPA validation
    const standardValidation = await this.standardClaimsValidator.validate(fhirClaim);
    
    // 2. AI-powered clinical validation
    const aiValidation = await this.fhirClaimValidator.validateClaimWithAI(fhirClaim);
    
    // 3. Store encounter record for learning
    const encounterRecord = await this.fhirProcessor.processFHIRClaim(fhirClaim);
    await this.storeEncounterRecord(encounterRecord);
    
    // 4. Update AI knowledge graph
    await this.updateKnowledgeGraph(encounterRecord);
    
    // 5. Combined decision
    return {
      claim_id: fhirClaim.id,
      final_decision: this.combineValidationResults(standardValidation, aiValidation),
      processing_notes: {
        standard_validation: standardValidation,
        ai_validation: aiValidation,
        learning_updated: true
      }
    };
  }
  
  async updateKnowledgeGraph(encounter: EncounterRecord): Promise<void> {
    // Update clinical pairings based on new encounter
    for (const diagnosis of encounter.diagnoses) {
      for (const procedure of encounter.procedures) {
        await this.updateClinicalPairing(
          diagnosis.concept_id,
          procedure.concept_id,
          'HAS_TREATMENT',
          encounter.contextual_factors
        );
      }
    }
  }
}
```

### 6. Benefits of FHIR Integration

#### Immediate Benefits:
- **No Complex Parsing**: Direct code extraction from standardized FHIR resources
- **Automatic Mapping**: FHIR codes directly map to internal concept_ids
- **Rich Context**: Complete patient, provider, encounter context available
- **Interoperability**: Ready for hospital system integration

#### AI Learning Enhancement:
- **Clean Data Input**: Structured FHIR data improves AI training quality
- **Contextual Learning**: Rich FHIR context enhances relationship learning
- **Real-time Updates**: Each FHIR claim updates the knowledge graph
- **Evidence Building**: FHIR outcomes data strengthens AI confidence scores

#### Example Learning Cycle:
```typescript
// FHIR Claim comes in → AI validates → Stores encounter → Updates relationships
// Next similar claim → AI is smarter with updated confidence scores
```

This integration makes your AI CDS engine FHIR-native and ready for real healthcare interoperability while continuously learning from structured clinical data.