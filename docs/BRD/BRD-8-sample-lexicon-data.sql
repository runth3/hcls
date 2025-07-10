-- Sample Medical Concept Lexicon Data
-- Based on the provided sample structure

-- Create table with exact structure matching sample data
CREATE TABLE medical_concepts (
  concept_id VARCHAR(50) PRIMARY KEY,
  canonical_name VARCHAR(500) NOT NULL,
  indonesian_name VARCHAR(500) NOT NULL,
  concept_type VARCHAR(20) NOT NULL,
  general_terms JSONB,
  code_mappings JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample data exactly as provided
INSERT INTO medical_concepts (concept_id, canonical_name, indonesian_name, concept_type, general_terms, code_mappings) VALUES
-- Diagnoses
('DIAG-ISPA-001', 'Acute Upper Respiratory Infection', 'Infeksi Saluran Pernapasan Akut', 'DIAGNOSIS', 
 '["ISPA", "Batuk Pilek", "Radang Tenggorokan"]', '["ICD-10: J06.9", "ICD-11: 1E05", "SNOMED CT: 54350005"]'),
('DIAG-HYPTN-001', 'Essential (Primary) Hypertension', 'Hipertensi Esensial', 'DIAGNOSIS',
 '["Hipertensi", "Tekanan Darah Tinggi"]', '["ICD-10: I10", "ICD-11: BA00.Z", "SNOMED CT: 38341003"]'),
('DIAG-GASTRO-001', 'Diarrhea and Gastroenteritis', 'Diare dan Gastroenteritis', 'DIAGNOSIS',
 '["Diare", "Muntaber", "Mencret"]', '["ICD-10: A09.9", "ICD-11: 1A0Z", "SNOMED CT: 409966002"]'),
('DIAG-DBD-001', 'Dengue Fever', 'Demam Berdarah Dengue', 'DIAGNOSIS',
 '["DBD", "Demam Denggi"]', '["ICD-10: A90", "ICD-11: 1D40", "SNOMED CT: 1002005"]'),
('DIAG-DMT2-001', 'Type 2 Diabetes Mellitus', 'Diabetes Melitus Tipe 2', 'DIAGNOSIS',
 '["DM Tipe 2", "Penyakit Gula", "Kencing Manis"]', '["ICD-10: E11.9", "ICD-11: 5A11", "SNOMED CT: 44054006"]'),

-- Procedures
('PROC-HEMODIAL-001', 'Hemodialysis', 'Hemodialisis', 'PROCEDURE',
 '["Cuci Darah", "Dialisis Ginjal", "HD"]', '["ICD-9-CM: 39.95", "SNOMED CT: 34910008"]'),
('PROC-CHESTXRAY-001', 'Chest X-ray', 'Rontgen Dada', 'PROCEDURE',
 '["Rontgen Thorax", "Foto Thorax", "CXR"]', '["ICD-9-CM: 87.44", "SNOMED CT: 168991006"]'),
('PROC-APPNDCTMY-001', 'Appendectomy', 'Apendektomi', 'PROCEDURE',
 '["Operasi Usus Buntu", "Angkat Usus Buntu"]', '["ICD-9-CM: 47.09", "SNOMED CT: 80146002"]'),

-- Medications
('MED-PARAC-001', 'Paracetamol', 'Parasetamol', 'MEDICATION',
 '["Asetaminofen", "Sanmol", "Panadol"]', '["ATC: N02BE01", "RxNorm: 161"]'),
('MED-AMOX-001', 'Amoxicillin', 'Amoksisilin', 'MEDICATION',
 '["Amoksilin", "Amoxsan", "Intermoxil"]', '["ATC: J01CA04", "RxNorm: 723"]'),
('MED-METFO-001', 'Metformin', 'Metformin', 'MEDICATION',
 '["Obat Diabetes", "Glucophage", "Forbetes"]', '["ATC: A10BA02", "RxNorm: 6809"]'),

-- Symptoms
('SYMP-HEADACHE-001', 'Headache', 'Sakit Kepala', 'SYMPTOM',
 '["Pusing", "Nyeri Kepala", "Cephalgia"]', '["ICD-10: R51", "SNOMED CT: 25064002"]'),
('SYMP-NAUSEA-001', 'Nausea', 'Mual', 'SYMPTOM',
 '["Rasa Ingin Muntah", "Enek"]', '["ICD-10: R11.0", "SNOMED CT: 422587007"]'),

-- Lab Tests
('LAB-CBC-001', 'Complete Blood Count', 'Pemeriksaan Darah Lengkap', 'LAB_TEST',
 '["Darah Lengkap", "CBC", "DL"]', '["LOINC: 57021-8", "SNOMED CT: 26604007"]'),
('LAB-URINALYS-001', 'Urinalysis', 'Urinalisis', 'LAB_TEST',
 '["Tes Urin", "Tes Air Kencing", "Pemeriksaan Urin"]', '["LOINC: 24356-8", "SNOMED CT: 27171005"]');

-- Create indexes for fast searching
CREATE INDEX idx_concepts_type ON medical_concepts(concept_type);
CREATE INDEX idx_concepts_search ON medical_concepts 
USING GIN((canonical_name || ' ' || indonesian_name || ' ' || general_terms::text));
CREATE INDEX idx_concepts_code_mappings ON medical_concepts USING GIN(code_mappings);

-- Query examples
-- Search by Indonesian term
SELECT concept_id, canonical_name, indonesian_name 
FROM medical_concepts 
WHERE general_terms @> '["DBD"]';

-- Search by ICD-10 code
SELECT concept_id, canonical_name, indonesian_name 
FROM medical_concepts 
WHERE code_mappings @> '["ICD-10: A90"]';

-- Get all medications
SELECT concept_id, canonical_name, indonesian_name, general_terms
FROM medical_concepts 
WHERE concept_type = 'MEDICATION';