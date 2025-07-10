-- Enhanced Production Schema for AI CDS Engine
-- Base: Your existing xaie_* tables + AI CDS enhancements

-- ===================================================================
-- ENHANCEMENT 1: Add AI-specific fields to existing tables
-- ===================================================================

-- Enhance xaie_concept_relationships with AI learning metadata
ALTER TABLE xaie_concept_relationships ADD COLUMN IF NOT EXISTS 
    success_rate FLOAT,
    complication_rate FLOAT,
    readmission_rate FLOAT,
    median_cost DECIMAL(15,2),
    cost_variance DECIMAL(15,2),
    total_encounters INTEGER DEFAULT 0,
    last_ml_update TIMESTAMPTZ;

-- Add contextual scores table for location/season patterns
CREATE TABLE IF NOT EXISTS xaie_contextual_scores (
    id BIGSERIAL PRIMARY KEY,
    relationship_id BIGINT REFERENCES xaie_concept_relationships(relationship_id),
    context_type VARCHAR(20), -- LOCATION, SEASON, AGE_GROUP, PROVIDER_TYPE
    context_value VARCHAR(100),
    commonality_score FLOAT,
    encounter_count INTEGER,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(relationship_id, context_type, context_value)
);

-- ===================================================================
-- ENHANCEMENT 2: Encounter Records (Module 2)
-- ===================================================================

CREATE TABLE IF NOT EXISTS xaie_encounters (
    encounter_id BIGSERIAL PRIMARY KEY,
    encounter_date DATE NOT NULL,
    encounter_type VARCHAR(20) NOT NULL,
    
    -- Patient context (de-identified)
    patient_hash VARCHAR(64) NOT NULL,
    patient_age_group VARCHAR(10),
    patient_gender CHAR(1),
    patient_city VARCHAR(100),
    patient_province VARCHAR(100),
    
    -- Provider context
    provider_id VARCHAR(100),
    provider_type VARCHAR(20),
    facility_level VARCHAR(20),
    
    -- Clinical outcome
    discharge_status VARCHAR(20),
    length_of_stay INTEGER,
    readmission_30_days BOOLEAN DEFAULT FALSE,
    
    -- Context factors
    season VARCHAR(10),
    outbreak_period BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS xaie_encounter_concepts (
    id BIGSERIAL PRIMARY KEY,
    encounter_id BIGINT REFERENCES xaie_encounters(encounter_id),
    concept_id BIGINT REFERENCES xaie_concepts(concept_id),
    concept_role VARCHAR(20), -- DIAGNOSIS, PROCEDURE, MEDICATION, LAB_TEST
    sequence_number INTEGER,
    severity VARCHAR(20),
    cost_amount DECIMAL(15,2),
    cost_currency VARCHAR(3) DEFAULT 'IDR'
);

-- ===================================================================
-- ENHANCEMENT 3: FHIR Integration Support
-- ===================================================================

CREATE TABLE IF NOT EXISTS xaie_fhir_mappings (
    id BIGSERIAL PRIMARY KEY,
    concept_id BIGINT REFERENCES xaie_concepts(concept_id),
    fhir_resource_type VARCHAR(50), -- Patient, Condition, Procedure, Medication
    fhir_system VARCHAR(200),
    fhir_code VARCHAR(100),
    mapping_confidence FLOAT DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(concept_id, fhir_system, fhir_code)
);

-- ===================================================================
-- ENHANCEMENT 4: ML Model Cache & Predictions
-- ===================================================================

CREATE TABLE IF NOT EXISTS xaie_ml_predictions (
    id BIGSERIAL PRIMARY KEY,
    input_hash VARCHAR(64) UNIQUE,
    prediction_type VARCHAR(50), -- TREATMENT_RECOMMENDATION, COST_PREDICTION, OUTCOME_PREDICTION
    input_data JSONB,
    prediction_result JSONB,
    confidence_score FLOAT,
    model_version VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- ===================================================================
-- ENHANCEMENT 5: Performance Indexes
-- ===================================================================

-- Contextual scores indexes
CREATE INDEX IF NOT EXISTS idx_contextual_scores_relationship ON xaie_contextual_scores(relationship_id);
CREATE INDEX IF NOT EXISTS idx_contextual_scores_context ON xaie_contextual_scores(context_type, context_value);

-- Encounter indexes
CREATE INDEX IF NOT EXISTS idx_encounters_date_location ON xaie_encounters(encounter_date, patient_city);
CREATE INDEX IF NOT EXISTS idx_encounters_context ON xaie_encounters(season, outbreak_period);
CREATE INDEX IF NOT EXISTS idx_encounter_concepts_role ON xaie_encounter_concepts(concept_role, concept_id);

-- FHIR mapping indexes
CREATE INDEX IF NOT EXISTS idx_fhir_mappings_system_code ON xaie_fhir_mappings(fhir_system, fhir_code);

-- ML prediction indexes
CREATE INDEX IF NOT EXISTS idx_ml_predictions_hash ON xaie_ml_predictions(input_hash);
CREATE INDEX IF NOT EXISTS idx_ml_predictions_type ON xaie_ml_predictions(prediction_type, created_at);

-- ===================================================================
-- ENHANCEMENT 6: Sample Data Integration
-- ===================================================================

-- Insert sample concepts using your existing structure
INSERT INTO xaie_concepts (human_readable_code, canonical_name, concept_type, status) VALUES
('DIAG-DBD-001', 'Dengue Fever', 'DIAGNOSIS', 'Active'),
('LAB-CBC-001', 'Complete Blood Count', 'LAB_TEST', 'Active'),
('MED-PARAC-001', 'Paracetamol', 'MEDICATION', 'Active')
ON CONFLICT (human_readable_code) DO NOTHING;

-- Insert synonyms
INSERT INTO xaie_synonyms (concept_id, term, language_code, term_type) 
SELECT c.concept_id, 'Demam Berdarah Dengue', 'id', 'Official Translation'
FROM xaie_concepts c WHERE c.human_readable_code = 'DIAG-DBD-001'
ON CONFLICT DO NOTHING;

-- Insert FHIR mappings
INSERT INTO xaie_fhir_mappings (concept_id, fhir_resource_type, fhir_system, fhir_code)
SELECT c.concept_id, 'Condition', 'http://hl7.org/fhir/sid/icd-10', 'A90'
FROM xaie_concepts c WHERE c.human_readable_code = 'DIAG-DBD-001'
ON CONFLICT DO NOTHING;

-- Insert enhanced relationships with AI scores
INSERT INTO xaie_concept_relationships (
    source_concept_id, target_concept_id, relationship_type,
    commonality_score, confidence_score, evidence_level_score, priority_score,
    success_rate, median_cost, total_encounters,
    contextual_commonality, notes, is_active
)
SELECT 
    s.concept_id, t.concept_id, 'HAS_DIAGNOSTIC_TEST',
    0.99, 0.98, 0.98, 0.98,
    0.95, 150000, 1500,
    '{"Manado_WET": 0.99, "Jakarta_DRY": 0.85}',
    'CBC critical for dengue platelet monitoring',
    true
FROM xaie_concepts s, xaie_concepts t
WHERE s.human_readable_code = 'DIAG-DBD-001' 
  AND t.human_readable_code = 'LAB-CBC-001'
ON CONFLICT (source_concept_id, target_concept_id, relationship_type) DO NOTHING;

-- Insert contextual scores
INSERT INTO xaie_contextual_scores (relationship_id, context_type, context_value, commonality_score, encounter_count)
SELECT r.relationship_id, 'LOCATION', 'Manado', 0.99, 200
FROM xaie_concept_relationships r
JOIN xaie_concepts s ON r.source_concept_id = s.concept_id
WHERE s.human_readable_code = 'DIAG-DBD-001'
ON CONFLICT (relationship_id, context_type, context_value) DO NOTHING;

-- ===================================================================
-- ENHANCEMENT 7: AI Learning Functions
-- ===================================================================

-- Function to update relationship scores from encounters
CREATE OR REPLACE FUNCTION update_relationship_scores()
RETURNS TRIGGER AS $$
BEGIN
    -- Update total encounters and success rate
    UPDATE xaie_concept_relationships 
    SET total_encounters = total_encounters + 1,
        last_ml_update = NOW()
    WHERE source_concept_id IN (
        SELECT concept_id FROM xaie_encounter_concepts 
        WHERE encounter_id = NEW.encounter_id AND concept_role = 'DIAGNOSIS'
    )
    AND target_concept_id IN (
        SELECT concept_id FROM xaie_encounter_concepts 
        WHERE encounter_id = NEW.encounter_id AND concept_role IN ('PROCEDURE', 'MEDICATION', 'LAB_TEST')
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update AI scores when new encounters added
CREATE TRIGGER update_ai_scores_trigger
    AFTER INSERT ON xaie_encounter_concepts
    FOR EACH ROW
    EXECUTE FUNCTION update_relationship_scores();