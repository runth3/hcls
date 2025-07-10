-- Sample Clinical Relationships Data
-- Based on the provided relationship examples

-- Insert sample clinical pairings
INSERT INTO clinical_pairings (
  pairing_id, source_concept_id, target_concept_id, relationship_type,
  commonality_score, confidence_score, evidence_level_score, priority_score,
  median_cost, total_encounters, created_at
) VALUES

-- Diagnosis to Treatment relationships
('PAIR-001', 'DIAG-HYPTN-001', 'MED-AMLOD-001', 'HAS_TREATMENT', 
 0.85, 0.90, 1.0, 0.9, 25000, 1500, NOW()),

('PAIR-002', 'DIAG-DMT2-001', 'MED-METFO-001', 'HAS_TREATMENT',
 0.90, 0.95, 1.0, 0.95, 15000, 2000, NOW()),

('PAIR-003', 'DIAG-ISPA-001', 'MED-PARAC-001', 'HAS_TREATMENT',
 0.95, 0.85, 0.6, 0.8, 5000, 3000, NOW()),

('PAIR-004', 'DIAG-GASTRTS-001', 'MED-ANTACID-001', 'HAS_TREATMENT',
 0.92, 0.88, 0.6, 0.9, 12000, 1200, NOW()),

-- Diagnosis to Diagnostic Test relationships  
('PAIR-005', 'DIAG-TB-001', 'PROC-CHESTXRAY-001', 'HAS_DIAGNOSTIC_TEST',
 0.90, 0.95, 0.95, 0.95, 75000, 800, NOW()),

('PAIR-006', 'DIAG-DBD-001', 'LAB-CBC-001', 'HAS_DIAGNOSTIC_TEST',
 0.99, 0.98, 0.98, 0.98, 150000, 1500, NOW()),

-- Diagnosis to Symptom relationships
('PAIR-007', 'DIAG-HYPTN-001', 'SYMP-HEADACHE-001', 'HAS_SYMPTOM',
 0.50, 0.60, 0.70, 0.6, 0, 500, NOW()),

('PAIR-008', 'DIAG-GASTRTS-001', 'SYMP-NAUSEA-001', 'HAS_SYMPTOM',
 0.85, 0.80, 0.75, 0.8, 0, 900, NOW());

-- Insert contextual scores for location-specific patterns
INSERT INTO pairing_contextual_scores (
  pairing_id, context_type, context_value, commonality_score, encounter_count
) VALUES
-- DBD lab test more common in endemic areas
('PAIR-006', 'LOCATION', 'Manado', 0.99, 200),
('PAIR-006', 'LOCATION', 'Jakarta', 0.85, 150),
('PAIR-006', 'SEASON', 'WET', 0.95, 300),
('PAIR-006', 'SEASON', 'DRY', 0.70, 100),

-- Hypertension treatment patterns by location
('PAIR-001', 'LOCATION', 'Jakarta', 0.90, 400),
('PAIR-001', 'LOCATION', 'Surabaya', 0.85, 300),
('PAIR-001', 'AGE_GROUP', '45-50', 0.92, 250),
('PAIR-001', 'AGE_GROUP', '51-60', 0.95, 400);