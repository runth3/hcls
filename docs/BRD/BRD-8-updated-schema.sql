-- Updated BRD-8 Database Schema
-- Using existing production schema structure (xaie_* tables)

-- ===================================================================
-- PRODUCTION SCHEMA ALIGNMENT
-- ===================================================================

-- Use existing xaie_concepts structure
-- (Already exists in production - no changes needed)

-- Sample data for AI CDS using existing schema
INSERT INTO xaie_concepts (human_readable_code, canonical_name, definition, concept_type, status) VALUES
('DIAG-DBD-001', 'Dengue Fever', 'Acute febrile illness caused by dengue virus', 'DIAGNOSIS', 'Active'),
('DIAG-HYPTN-001', 'Essential Hypertension', 'Primary hypertension without identifiable cause', 'DIAGNOSIS', 'Active'),
('PROC-HEMODIAL-001', 'Hemodialysis', 'Renal replacement therapy using artificial kidney', 'PROCEDURE', 'Active'),
('MED-PARAC-001', 'Paracetamol', 'Analgesic and antipyretic medication', 'MEDICATION', 'Active'),
('LAB-CBC-001', 'Complete Blood Count', 'Comprehensive blood panel test', 'LAB_TEST', 'Active');

-- Insert Indonesian synonyms using existing xaie_synonyms table
INSERT INTO xaie_synonyms (concept_id, term, language_code, term_type) VALUES
-- DBD synonyms
((SELECT concept_id FROM xaie_concepts WHERE human_readable_code = 'DIAG-DBD-001'), 'Demam Berdarah Dengue', 'id', 'Official Translation'),
((SELECT concept_id FROM xaie_concepts WHERE human_readable_code = 'DIAG-DBD-001'), 'DBD', 'id', 'Abbreviation'),
((SELECT concept_id FROM xaie_concepts WHERE human_readable_code = 'DIAG-DBD-001'), 'Demam Denggi', 'id', 'Vernacular'),

-- Hypertension synonyms
((SELECT concept_id FROM xaie_concepts WHERE human_readable_code = 'DIAG-HYPTN-001'), 'Hipertensi Esensial', 'id', 'Official Translation'),
((SELECT concept_id FROM xaie_concepts WHERE human_readable_code = 'DIAG-HYPTN-001'), 'Tekanan Darah Tinggi', 'id', 'Vernacular'),

-- Hemodialysis synonyms
((SELECT concept_id FROM xaie_concepts WHERE human_readable_code = 'PROC-HEMODIAL-001'), 'Hemodialisis', 'id', 'Official Translation'),
((SELECT concept_id FROM xaie_concepts WHERE human_readable_code = 'PROC-HEMODIAL-001'), 'Cuci Darah', 'id', 'Vernacular'),

-- Paracetamol synonyms
((SELECT concept_id FROM xaie_concepts WHERE human_readable_code = 'MED-PARAC-001'), 'Parasetamol', 'id', 'Official Translation'),
((SELECT concept_id FROM xaie_concepts WHERE human_readable_code = 'MED-PARAC-001'), 'Panadol', 'id', 'Brand Name');

-- Insert code mappings using existing xaie_code_mappings table
INSERT INTO xaie_code_mappings (concept_id, coding_system_name, code_value, code_description) VALUES
-- DBD mappings
((SELECT concept_id FROM xaie_concepts WHERE human_readable_code = 'DIAG-DBD-001'), 'ICD-10', 'A90', 'Dengue fever'),
((SELECT concept_id FROM xaie_concepts WHERE human_readable_code = 'DIAG-DBD-001'), 'ICD-11', '1D40', 'Dengue fever'),
((SELECT concept_id FROM xaie_concepts WHERE human_readable_code = 'DIAG-DBD-001'), 'SNOMED CT', '1002005', 'Dengue fever'),

-- Hypertension mappings
((SELECT concept_id FROM xaie_concepts WHERE human_readable_code = 'DIAG-HYPTN-001'), 'ICD-10', 'I10', 'Essential hypertension'),
((SELECT concept_id FROM xaie_concepts WHERE human_readable_code = 'DIAG-HYPTN-001'), 'SNOMED CT', '38341003', 'Essential hypertension'),

-- Hemodialysis mappings
((SELECT concept_id FROM xaie_concepts WHERE human_readable_code = 'PROC-HEMODIAL-001'), 'ICD-9-CM', '39.95', 'Hemodialysis'),
((SELECT concept_id FROM xaie_concepts WHERE human_readable_code = 'PROC-HEMODIAL-001'), 'SNOMED CT', '34910008', 'Hemodialysis'),

-- Paracetamol mappings
((SELECT concept_id FROM xaie_concepts WHERE human_readable_code = 'MED-PARAC-001'), 'ATC', 'N02BE01', 'Paracetamol'),
((SELECT concept_id FROM xaie_concepts WHERE human_readable_code = 'MED-PARAC-001'), 'RxNorm', '161', 'Acetaminophen');

-- Insert clinical relationships using existing xaie_concept_relationships table
INSERT INTO xaie_concept_relationships (
    source_concept_id, target_concept_id, relationship_type,
    commonality_score, confidence_score, evidence_level_score, priority_score,
    contextual_commonality, notes, is_active
) VALUES
-- DBD -> CBC (diagnostic test)
(
    (SELECT concept_id FROM xaie_concepts WHERE human_readable_code = 'DIAG-DBD-001'),
    (SELECT concept_id FROM xaie_concepts WHERE human_readable_code = 'LAB-CBC-001'),
    'HAS_DIAGNOSTIC_TEST',
    0.99, 0.98, 0.98, 0.98,
    '{"Manado_WET": 0.99, "Jakarta_DRY": 0.85, "outbreak_period": 0.95}',
    'CBC critical for monitoring platelet count in dengue fever',
    true
),

-- DBD -> Paracetamol (treatment)
(
    (SELECT concept_id FROM xaie_concepts WHERE human_readable_code = 'DIAG-DBD-001'),
    (SELECT concept_id FROM xaie_concepts WHERE human_readable_code = 'MED-PARAC-001'),
    'HAS_TREATMENT',
    0.90, 0.85, 0.75, 0.83,
    '{"Manado_WET": 0.92, "Jakarta_DRY": 0.78}',
    'Paracetamol for symptomatic fever management in dengue',
    true
),

-- Hypertension -> Paracetamol (contraindicated - example)
(
    (SELECT concept_id FROM xaie_concepts WHERE human_readable_code = 'DIAG-HYPTN-001'),
    (SELECT concept_id FROM xaie_concepts WHERE human_readable_code = 'MED-PARAC-001'),
    'CONTRAINDICATED_WITH',
    0.15, 0.70, 0.80, 0.25,
    '{"elderly": 0.25, "renal_impairment": 0.40}',
    'Use with caution in hypertensive patients with renal involvement',
    true
);

-- ===================================================================
-- ENCOUNTER RECORDS SCHEMA (Additional tables for Module 2)
-- ===================================================================

-- Encounter records table (Module 2: "Buku Catatan Transaksi")
CREATE TABLE IF NOT EXISTS xaie_encounter_records (
    encounter_id BIGSERIAL PRIMARY KEY,
    encounter_date DATE NOT NULL,
    encounter_type VARCHAR(20) NOT NULL,
    
    -- De-identified patient context
    patient_hash VARCHAR(64) NOT NULL,
    patient_age_group VARCHAR(10),
    patient_gender CHAR(1),
    patient_city VARCHAR(100),
    patient_province VARCHAR(100),
    
    -- Provider context
    provider_id VARCHAR(100),
    provider_type VARCHAR(20),
    provider_city VARCHAR(100),
    provider_province VARCHAR(100),
    facility_level VARCHAR(20),
    
    -- Outcome information
    discharge_status VARCHAR(20),
    length_of_stay INTEGER,
    readmission_30_days BOOLEAN DEFAULT FALSE,
    complications JSONB,
    
    -- Contextual factors
    season VARCHAR(10),
    outbreak_period BOOLEAN DEFAULT FALSE,
    holiday_period BOOLEAN DEFAULT FALSE,
    weekend_admission BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Encounter diagnoses
CREATE TABLE IF NOT EXISTS xaie_encounter_diagnoses (
    id BIGSERIAL PRIMARY KEY,
    encounter_id BIGINT REFERENCES xaie_encounter_records(encounter_id),
    concept_id BIGINT REFERENCES xaie_concepts(concept_id),
    diagnosis_type VARCHAR(20),
    severity VARCHAR(20),
    sequence_number INTEGER
);

-- Encounter procedures
CREATE TABLE IF NOT EXISTS xaie_encounter_procedures (
    id BIGSERIAL PRIMARY KEY,
    encounter_id BIGINT REFERENCES xaie_encounter_records(encounter_id),
    concept_id BIGINT REFERENCES xaie_concepts(concept_id),
    procedure_date DATE,
    urgency VARCHAR(20),
    sequence_number INTEGER
);

-- Encounter medications
CREATE TABLE IF NOT EXISTS xaie_encounter_medications (
    id BIGSERIAL PRIMARY KEY,
    encounter_id BIGINT REFERENCES xaie_encounter_records(encounter_id),
    concept_id BIGINT REFERENCES xaie_concepts(concept_id),
    dosage VARCHAR(100),
    duration_days INTEGER,
    route VARCHAR(50),
    sequence_number INTEGER
);

-- Encounter costs
CREATE TABLE IF NOT EXISTS xaie_encounter_costs (
    id BIGSERIAL PRIMARY KEY,
    encounter_id BIGINT REFERENCES xaie_encounter_records(encounter_id),
    concept_id BIGINT REFERENCES xaie_concepts(concept_id),
    claimed_amount DECIMAL(15,2),
    approved_amount DECIMAL(15,2),
    paid_amount DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'IDR'
);

-- ===================================================================
-- ADDITIONAL INDEXES FOR PERFORMANCE
-- ===================================================================

-- Indexes for encounter tables
CREATE INDEX IF NOT EXISTS idx_encounter_records_date ON xaie_encounter_records(encounter_date);
CREATE INDEX IF NOT EXISTS idx_encounter_records_location ON xaie_encounter_records(patient_city, patient_province);
CREATE INDEX IF NOT EXISTS idx_encounter_records_context ON xaie_encounter_records(season, outbreak_period);

-- Indexes for relationship queries
CREATE INDEX IF NOT EXISTS idx_relationships_source ON xaie_concept_relationships(source_concept_id, priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_relationships_target ON xaie_concept_relationships(target_concept_id, priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_relationships_type ON xaie_concept_relationships(relationship_type, is_active);