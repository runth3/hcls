-- Lexicon AI Service Database Schema
-- Production-ready schema for standalone medical intelligence service

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================================================
-- CORE TABLES (Enhanced from production xaie_* schema)
-- ===================================================================

-- Medical concepts (Module 1)
CREATE TABLE xaie_concepts (
    concept_id BIGSERIAL PRIMARY KEY,
    human_readable_code VARCHAR(100) UNIQUE,
    canonical_name TEXT NOT NULL,
    definition TEXT,
    concept_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending Review',
    version_lexicon INTEGER NOT NULL DEFAULT 1,
    custom_attributes JSONB,
    source_references JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Synonyms and translations
CREATE TABLE xaie_synonyms (
    synonym_id BIGSERIAL PRIMARY KEY,
    concept_id BIGINT NOT NULL REFERENCES xaie_concepts(concept_id) ON DELETE CASCADE,
    term TEXT NOT NULL,
    language_code VARCHAR(10) NOT NULL,
    term_type VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- External code mappings
CREATE TABLE xaie_code_mappings (
    mapping_id BIGSERIAL PRIMARY KEY,
    concept_id BIGINT NOT NULL REFERENCES xaie_concepts(concept_id) ON DELETE CASCADE,
    coding_system_name VARCHAR(100) NOT NULL,
    code_value VARCHAR(100) NOT NULL,
    code_description TEXT,
    UNIQUE (concept_id, coding_system_name, code_value)
);

-- FHIR mappings for interoperability
CREATE TABLE xaie_fhir_mappings (
    id BIGSERIAL PRIMARY KEY,
    concept_id BIGINT NOT NULL REFERENCES xaie_concepts(concept_id),
    fhir_resource_type VARCHAR(50),
    fhir_system VARCHAR(200),
    fhir_code VARCHAR(100),
    mapping_confidence FLOAT DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(concept_id, fhir_system, fhir_code)
);

-- Clinical relationships (Module 3)
CREATE TABLE xaie_concept_relationships (
    relationship_id BIGSERIAL PRIMARY KEY,
    source_concept_id BIGINT NOT NULL REFERENCES xaie_concepts(concept_id) ON DELETE CASCADE,
    target_concept_id BIGINT NOT NULL REFERENCES xaie_concepts(concept_id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL,
    commonality_score FLOAT,
    confidence_score FLOAT,
    evidence_level_score FLOAT,
    priority_score FLOAT,
    success_rate FLOAT,
    median_cost DECIMAL(15,2),
    total_encounters INTEGER DEFAULT 0,
    contextual_commonality JSONB,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_ml_update TIMESTAMPTZ,
    UNIQUE (source_concept_id, target_concept_id, relationship_type)
);

-- Contextual intelligence
CREATE TABLE xaie_contextual_scores (
    id BIGSERIAL PRIMARY KEY,
    relationship_id BIGINT REFERENCES xaie_concept_relationships(relationship_id),
    context_type VARCHAR(20),
    context_value VARCHAR(100),
    commonality_score FLOAT,
    encounter_count INTEGER,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(relationship_id, context_type, context_value)
);

-- Encounter records (Module 2)
CREATE TABLE xaie_encounters (
    encounter_id BIGSERIAL PRIMARY KEY,
    encounter_date DATE NOT NULL,
    encounter_type VARCHAR(20) NOT NULL,
    patient_hash VARCHAR(64) NOT NULL,
    patient_age_group VARCHAR(10),
    patient_gender CHAR(1),
    patient_city VARCHAR(100),
    patient_province VARCHAR(100),
    provider_id VARCHAR(100),
    provider_type VARCHAR(20),
    facility_level VARCHAR(20),
    discharge_status VARCHAR(20),
    length_of_stay INTEGER,
    readmission_30_days BOOLEAN DEFAULT FALSE,
    season VARCHAR(10),
    outbreak_period BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Encounter concepts
CREATE TABLE xaie_encounter_concepts (
    id BIGSERIAL PRIMARY KEY,
    encounter_id BIGINT REFERENCES xaie_encounters(encounter_id),
    concept_id BIGINT REFERENCES xaie_concepts(concept_id),
    concept_role VARCHAR(20),
    sequence_number INTEGER,
    severity VARCHAR(20),
    cost_amount DECIMAL(15,2),
    cost_currency VARCHAR(3) DEFAULT 'IDR'
);

-- ML predictions cache
CREATE TABLE xaie_ml_predictions (
    id BIGSERIAL PRIMARY KEY,
    input_hash VARCHAR(64) UNIQUE,
    prediction_type VARCHAR(50),
    input_data JSONB,
    prediction_result JSONB,
    confidence_score FLOAT,
    model_version VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- Audit log for AI scores
CREATE TABLE xaie_score_audit_log (
    audit_id BIGSERIAL PRIMARY KEY,
    relationship_id BIGINT NOT NULL REFERENCES xaie_concept_relationships(relationship_id),
    calculation_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    learning_engine_version VARCHAR(50),
    encounter_count_pairing BIGINT,
    volume_score FLOAT,
    consistency_score FLOAT,
    diversity_score FLOAT,
    evidence_score FLOAT,
    weights_used JSONB,
    calculated_commonality_score FLOAT,
    calculated_confidence_score FLOAT,
    calculated_priority_score FLOAT
);

-- ===================================================================
-- INDEXES FOR PERFORMANCE
-- ===================================================================

-- Concept indexes
CREATE INDEX idx_concepts_human_readable_code ON xaie_concepts(human_readable_code);
CREATE INDEX idx_concepts_concept_type ON xaie_concepts(concept_type);
CREATE INDEX idx_concepts_status ON xaie_concepts(status);

-- Synonym indexes for fuzzy search
CREATE INDEX idx_synonyms_term_trgm ON xaie_synonyms USING gin (term gin_trgm_ops);
CREATE INDEX idx_synonyms_concept_id ON xaie_synonyms(concept_id);

-- Code mapping indexes
CREATE INDEX idx_code_mappings_system_value ON xaie_code_mappings(coding_system_name, code_value);
CREATE INDEX idx_fhir_mappings_system_code ON xaie_fhir_mappings(fhir_system, fhir_code);

-- Relationship indexes
CREATE INDEX idx_relationships_source ON xaie_concept_relationships(source_concept_id, priority_score DESC);
CREATE INDEX idx_relationships_target ON xaie_concept_relationships(target_concept_id, priority_score DESC);
CREATE INDEX idx_relationships_type ON xaie_concept_relationships(relationship_type, is_active);

-- Contextual scores indexes
CREATE INDEX idx_contextual_scores_relationship ON xaie_contextual_scores(relationship_id);
CREATE INDEX idx_contextual_scores_context ON xaie_contextual_scores(context_type, context_value);

-- Encounter indexes
CREATE INDEX idx_encounters_date_location ON xaie_encounters(encounter_date, patient_city);
CREATE INDEX idx_encounters_context ON xaie_encounters(season, outbreak_period);
CREATE INDEX idx_encounter_concepts_role ON xaie_encounter_concepts(concept_role, concept_id);

-- ML prediction indexes
CREATE INDEX idx_ml_predictions_hash ON xaie_ml_predictions(input_hash);
CREATE INDEX idx_ml_predictions_type ON xaie_ml_predictions(prediction_type, created_at);

-- ===================================================================
-- TRIGGERS AND FUNCTIONS
-- ===================================================================

-- Auto-update timestamp function
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to concepts table
CREATE TRIGGER set_timestamp_on_xaie_concepts
BEFORE UPDATE ON xaie_concepts
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Auto-update relationship scores from encounters
CREATE OR REPLACE FUNCTION update_relationship_scores()
RETURNS TRIGGER AS $$
BEGIN
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

-- Trigger for auto-learning
CREATE TRIGGER update_ai_scores_trigger
    AFTER INSERT ON xaie_encounter_concepts
    FOR EACH ROW
    EXECUTE FUNCTION update_relationship_scores();

-- ===================================================================
-- SAMPLE DATA
-- ===================================================================

-- Insert sample concepts
INSERT INTO xaie_concepts (human_readable_code, canonical_name, concept_type, status) VALUES
('DIAG-DBD-001', 'Dengue Fever', 'DIAGNOSIS', 'Active'),
('LAB-CBC-001', 'Complete Blood Count', 'LAB_TEST', 'Active'),
('MED-PARAC-001', 'Paracetamol', 'MEDICATION', 'Active'),
('PROC-HEMODIAL-001', 'Hemodialysis', 'PROCEDURE', 'Active');

-- Insert synonyms
INSERT INTO xaie_synonyms (concept_id, term, language_code, term_type) VALUES
(1, 'Demam Berdarah Dengue', 'id', 'Official Translation'),
(1, 'DBD', 'id', 'Abbreviation'),
(2, 'Pemeriksaan Darah Lengkap', 'id', 'Official Translation'),
(2, 'DL', 'id', 'Abbreviation'),
(3, 'Parasetamol', 'id', 'Official Translation'),
(4, 'Hemodialisis', 'id', 'Official Translation'),
(4, 'Cuci Darah', 'id', 'Vernacular');

-- Insert code mappings
INSERT INTO xaie_code_mappings (concept_id, coding_system_name, code_value, code_description) VALUES
(1, 'ICD-10', 'A90', 'Dengue fever'),
(1, 'SNOMED CT', '1002005', 'Dengue fever'),
(2, 'LOINC', '57021-8', 'Complete blood count'),
(3, 'ATC', 'N02BE01', 'Paracetamol'),
(4, 'ICD-9-CM', '39.95', 'Hemodialysis');

-- Insert FHIR mappings
INSERT INTO xaie_fhir_mappings (concept_id, fhir_resource_type, fhir_system, fhir_code) VALUES
(1, 'Condition', 'http://hl7.org/fhir/sid/icd-10', 'A90'),
(2, 'Observation', 'http://loinc.org', '57021-8'),
(3, 'Medication', 'http://www.whocc.no/atc', 'N02BE01'),
(4, 'Procedure', 'http://hl7.org/fhir/sid/icd-9-cm', '39.95');

-- Insert sample relationships
INSERT INTO xaie_concept_relationships (
    source_concept_id, target_concept_id, relationship_type,
    commonality_score, confidence_score, evidence_level_score, priority_score,
    success_rate, median_cost, total_encounters,
    contextual_commonality, notes, is_active
) VALUES
(1, 2, 'HAS_DIAGNOSTIC_TEST', 0.99, 0.98, 0.98, 0.98, 0.95, 150000, 1500,
 '{"Manado_WET": 0.99, "Jakarta_DRY": 0.85}', 'CBC critical for dengue platelet monitoring', true),
(1, 3, 'HAS_TREATMENT', 0.90, 0.85, 0.75, 0.83, 0.88, 5000, 2000,
 '{"Manado_WET": 0.92, "Jakarta_DRY": 0.78}', 'Paracetamol for symptomatic fever management', true);

-- Insert contextual scores
INSERT INTO xaie_contextual_scores (relationship_id, context_type, context_value, commonality_score, encounter_count) VALUES
(1, 'LOCATION', 'Manado', 0.99, 200),
(1, 'SEASON', 'WET', 0.95, 300),
(2, 'LOCATION', 'Jakarta', 0.78, 150);