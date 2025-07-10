// Enhanced API using your production schema + AI CDS capabilities

interface EnhancedConceptService {
  // Use your existing xaie_concepts structure
  async searchConcepts(query: string, language: string = 'id'): Promise<Concept[]> {
    return await db.query(`
      SELECT DISTINCT c.concept_id, c.human_readable_code, c.canonical_name, c.concept_type, c.status
      FROM xaie_concepts c
      LEFT JOIN xaie_synonyms s ON c.concept_id = s.concept_id
      WHERE (c.canonical_name ILIKE $1 OR s.term ILIKE $1)
        AND s.language_code = $2 AND c.status = 'Active'
    `, [`%${query}%`, language]);
  }

  // Enhanced FHIR code mapping
  async findByFHIRCode(system: string, code: string): Promise<Concept | null> {
    return await db.query(`
      SELECT c.*, fm.fhir_system, fm.fhir_code, fm.mapping_confidence
      FROM xaie_concepts c
      JOIN xaie_fhir_mappings fm ON c.concept_id = fm.concept_id
      WHERE fm.fhir_system = $1 AND fm.fhir_code = $2 AND c.status = 'Active'
    `, [system, code]);
  }

  // Get AI-enhanced relationships with contextual scores
  async getAIRecommendations(conceptId: number, context: ClinicalContext): Promise<AIRecommendation[]> {
    return await db.query(`
      SELECT r.*, 
             tc.canonical_name, tc.human_readable_code,
             cs.commonality_score as contextual_score,
             r.success_rate, r.median_cost, r.total_encounters
      FROM xaie_concept_relationships r
      JOIN xaie_concepts tc ON r.target_concept_id = tc.concept_id
      LEFT JOIN xaie_contextual_scores cs ON r.relationship_id = cs.relationship_id
        AND cs.context_type = 'LOCATION' AND cs.context_value = $2
      WHERE r.source_concept_id = $1 AND r.is_active = true
      ORDER BY COALESCE(cs.commonality_score, r.commonality_score) DESC
    `, [conceptId, context.location]);
  }
}

interface EnhancedFHIRProcessor {
  async processFHIRClaim(fhirClaim: FHIRClaim): Promise<ProcessingResult> {
    // 1. Map FHIR codes to concepts using enhanced mapping
    const mappedConcepts = await this.mapFHIRCodes(fhirClaim);
    
    // 2. Get AI recommendations with contextual intelligence
    const aiRecommendations = await this.getContextualRecommendations(mappedConcepts);
    
    // 3. Store encounter for continuous learning
    const encounterId = await this.storeEncounter(fhirClaim, mappedConcepts);
    
    // 4. Cache ML predictions
    await this.cachePrediction(fhirClaim, aiRecommendations);
    
    return {
      validation: this.validateClaim(fhirClaim, aiRecommendations),
      encounter_id: encounterId,
      ai_confidence: aiRecommendations.confidence
    };
  }

  async mapFHIRCodes(fhirClaim: FHIRClaim): Promise<ConceptMapping[]> {
    const mappings = [];
    
    for (const item of fhirClaim.item) {
      for (const coding of item.service.coding) {
        const concept = await db.query(`
          SELECT c.concept_id, c.human_readable_code, c.canonical_name,
                 fm.mapping_confidence
          FROM xaie_concepts c
          JOIN xaie_fhir_mappings fm ON c.concept_id = fm.concept_id
          WHERE fm.fhir_system = $1 AND fm.fhir_code = $2
        `, [coding.system, coding.code]);
        
        if (concept.rows[0]) {
          mappings.push({
            concept_id: concept.rows[0].concept_id,
            fhir_code: coding.code,
            confidence: concept.rows[0].mapping_confidence
          });
        }
      }
    }
    
    return mappings;
  }

  async storeEncounter(fhirClaim: FHIRClaim, concepts: ConceptMapping[]): Promise<number> {
    // Store in your xaie_encounters table
    const encounter = await db.query(`
      INSERT INTO xaie_encounters (
        encounter_date, encounter_type, patient_hash,
        patient_city, season, outbreak_period
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING encounter_id
    `, [
      fhirClaim.created,
      'INSTITUTIONAL',
      this.hashPatientId(fhirClaim.patient.reference),
      this.extractCity(fhirClaim),
      this.getCurrentSeason(),
      false
    ]);

    const encounterId = encounter.rows[0].encounter_id;

    // Store concept relationships
    for (const concept of concepts) {
      await db.query(`
        INSERT INTO xaie_encounter_concepts (
          encounter_id, concept_id, concept_role, cost_amount
        ) VALUES ($1, $2, $3, $4)
      `, [encounterId, concept.concept_id, concept.role, concept.cost]);
    }

    return encounterId;
  }

  async cachePrediction(input: any, result: any): Promise<void> {
    const inputHash = this.generateHash(input);
    
    await db.query(`
      INSERT INTO xaie_ml_predictions (
        input_hash, prediction_type, input_data, prediction_result,
        confidence_score, model_version, expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (input_hash) DO UPDATE SET
        prediction_result = EXCLUDED.prediction_result,
        confidence_score = EXCLUDED.confidence_score,
        created_at = NOW()
    `, [
      inputHash,
      'CLINICAL_VALIDATION',
      JSON.stringify(input),
      JSON.stringify(result),
      result.confidence,
      '1.0',
      new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    ]);
  }
}

interface EnhancedGraphQLResolver {
  // Enhanced clinical pathway with your audit trail
  async getClinicalPathway(diagnosisId: number, context: ClinicalContext): Promise<ClinicalPathway> {
    const relationships = await db.query(`
      SELECT r.*, tc.canonical_name, tc.human_readable_code,
             cs.commonality_score as contextual_score,
             sal.calculation_timestamp, sal.learning_engine_version
      FROM xaie_concept_relationships r
      JOIN xaie_concepts tc ON r.target_concept_id = tc.concept_id
      LEFT JOIN xaie_contextual_scores cs ON r.relationship_id = cs.relationship_id
        AND cs.context_type = 'LOCATION' AND cs.context_value = $2
      LEFT JOIN xaie_score_audit_log sal ON r.relationship_id = sal.relationship_id
      WHERE r.source_concept_id = $1 AND r.is_active = true
      ORDER BY r.priority_score DESC
    `, [diagnosisId, context.location]);

    return {
      diagnosis: await this.getConcept(diagnosisId),
      treatments: relationships.rows.filter(r => r.relationship_type === 'HAS_TREATMENT'),
      diagnosticTests: relationships.rows.filter(r => r.relationship_type === 'HAS_DIAGNOSTIC_TEST'),
      contextualInsights: this.buildContextualInsights(relationships.rows, context)
    };
  }

  // Use your audit log for transparency
  async getAIDecisionAudit(relationshipId: number): Promise<AuditTrail[]> {
    return await db.query(`
      SELECT sal.*, r.relationship_type,
             sc.canonical_name as source_name,
             tc.canonical_name as target_name
      FROM xaie_score_audit_log sal
      JOIN xaie_concept_relationships r ON sal.relationship_id = r.relationship_id
      JOIN xaie_concepts sc ON r.source_concept_id = sc.concept_id
      JOIN xaie_concepts tc ON r.target_concept_id = tc.concept_id
      WHERE sal.relationship_id = $1
      ORDER BY sal.calculation_timestamp DESC
    `, [relationshipId]);
  }
}

// Enhanced types matching your schema
interface Concept {
  concept_id: number;
  human_readable_code: string;
  canonical_name: string;
  concept_type: string;
  status: string;
  version_lexicon: number;
  custom_attributes?: any;
}

interface AIRecommendation {
  relationship_id: number;
  target_concept: Concept;
  relationship_type: string;
  priority_score: number;
  commonality_score: number;
  contextual_score?: number;
  success_rate?: number;
  median_cost?: number;
  total_encounters: number;
  audit_trail: AuditTrail[];
}

interface ClinicalContext {
  location?: string;
  season?: string;
  age_group?: string;
  outbreak_period?: boolean;
}

// Example usage with your production schema
const enhancedService = new EnhancedConceptService();

// Search using your normalized structure
const concepts = await enhancedService.searchConcepts('DBD', 'id');
// Returns concepts with full audit trail and version control

// Get AI recommendations with contextual intelligence
const recommendations = await enhancedService.getAIRecommendations(1, {
  location: 'Manado',
  season: 'WET',
  outbreak_period: true
});
// Returns AI recommendations with your audit log transparency