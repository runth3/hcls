# Database Schema Comparison: Your Implementation vs BRD Design

## Key Differences & Improvements in Your Schema

### 1. Medical Concepts Structure

**Your Implementation (Better):**
```sql
-- Separate tables for better normalization
xaie_concepts (core concept data)
xaie_synonyms (all alternative terms)
xaie_code_mappings (external code mappings)

-- Advantages:
- Better normalization
- Flexible synonym management
- Audit trail with version_lexicon
- Custom attributes in JSONB
- Status management (Active/Pending/Deprecated)
```

**My BRD Design (Simpler but less flexible):**
```sql
-- Single table with JSONB arrays
medical_concepts (everything in one table)
general_terms JSONB
code_mappings JSONB

-- Limitations:
- Less normalized
- Harder to query individual synonyms
- No version control
- No status management
```

### 2. Relationship Management

**Your Implementation (More Robust):**
```sql
xaie_concept_relationships
- Separate contextual_commonality JSONB
- Audit trail support
- is_active flag for relationship lifecycle
- Notes field for clinical justification

xaie_score_audit_log
- Complete audit trail for AI score calculations
- Transparency in AI decision making
- Version tracking of learning engine
```

**My BRD Design (Missing audit features):**
```sql
clinical_pairings
- Basic relationship storage
- No comprehensive audit trail
- Limited transparency
```

## Updated BRD Schema to Match Your Implementation

### Core Tables (Aligned with Your Design)
```sql
-- Use your exact structure
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

CREATE TABLE xaie_synonyms (
    synonym_id BIGSERIAL PRIMARY KEY,
    concept_id BIGINT NOT NULL REFERENCES xaie_concepts(concept_id) ON DELETE CASCADE,
    term TEXT NOT NULL,
    language_code VARCHAR(10) NOT NULL,
    term_type VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE xaie_code_mappings (
    mapping_id BIGSERIAL PRIMARY KEY,
    concept_id BIGINT NOT NULL REFERENCES xaie_concepts(concept_id) ON DELETE CASCADE,
    coding_system_name VARCHAR(100) NOT NULL,
    code_value VARCHAR(100) NOT NULL,
    code_description TEXT,
    UNIQUE (concept_id, coding_system_name, code_value)
);

CREATE TABLE xaie_concept_relationships (
    relationship_id BIGSERIAL PRIMARY KEY,
    source_concept_id BIGINT NOT NULL REFERENCES xaie_concepts(concept_id) ON DELETE CASCADE,
    target_concept_id BIGINT NOT NULL REFERENCES xaie_concepts(concept_id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL,
    commonality_score FLOAT,
    confidence_score FLOAT,
    evidence_level_score FLOAT,
    priority_score FLOAT,
    contextual_commonality JSONB,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (source_concept_id, target_concept_id, relationship_type)
);
```

## Sample Data Insertion (Your Schema)

```sql
-- Insert sample concepts
INSERT INTO xaie_concepts (human_readable_code, canonical_name, concept_type, status) VALUES
('DIAG-DBD-001', 'Dengue Fever', 'DIAGNOSIS', 'Active'),
('PROC-HEMODIAL-001', 'Hemodialysis', 'PROCEDURE', 'Active'),
('MED-PARAC-001', 'Paracetamol', 'MEDICATION', 'Active');

-- Insert synonyms
INSERT INTO xaie_synonyms (concept_id, term, language_code, term_type) VALUES
(1, 'Demam Berdarah Dengue', 'id', 'Official Translation'),
(1, 'DBD', 'id', 'Abbreviation'),
(1, 'Demam Denggi', 'id', 'Vernacular'),
(2, 'Hemodialisis', 'id', 'Official Translation'),
(2, 'Cuci Darah', 'id', 'Vernacular'),
(3, 'Parasetamol', 'id', 'Official Translation'),
(3, 'Panadol', 'id', 'Brand Name');

-- Insert code mappings
INSERT INTO xaie_code_mappings (concept_id, coding_system_name, code_value, code_description) VALUES
(1, 'ICD-10', 'A90', 'Dengue fever'),
(1, 'ICD-11', '1D40', 'Dengue fever'),
(1, 'SNOMED CT', '1002005', 'Dengue fever'),
(2, 'ICD-9-CM', '39.95', 'Hemodialysis'),
(2, 'SNOMED CT', '34910008', 'Hemodialysis'),
(3, 'ATC', 'N02BE01', 'Paracetamol'),
(3, 'RxNorm', '161', 'Acetaminophen');

-- Insert relationships
INSERT INTO xaie_concept_relationships (
    source_concept_id, target_concept_id, relationship_type,
    commonality_score, confidence_score, evidence_level_score, priority_score,
    contextual_commonality, notes
) VALUES
(1, 3, 'HAS_TREATMENT', 0.85, 0.90, 0.75, 0.83,
 '{"Manado_WET": 0.92, "Jakarta_DRY": 0.78}',
 'Paracetamol commonly used for symptomatic treatment of dengue fever');
```

## API Updates for Your Schema

```typescript
interface ConceptService {
  // Search using your normalized structure
  async searchConcepts(query: string, language: string = 'id'): Promise<Concept[]> {
    return await db.query(`
      SELECT DISTINCT c.concept_id, c.human_readable_code, c.canonical_name, c.concept_type
      FROM xaie_concepts c
      LEFT JOIN xaie_synonyms s ON c.concept_id = s.concept_id
      WHERE c.canonical_name ILIKE $1 
         OR s.term ILIKE $1
         AND s.language_code = $2
         AND c.status = 'Active'
    `, [`%${query}%`, language]);
  }

  // Find by external code using your mapping table
  async findByExternalCode(system: string, code: string): Promise<Concept | null> {
    return await db.query(`
      SELECT c.*, cm.code_value, cm.code_description
      FROM xaie_concepts c
      JOIN xaie_code_mappings cm ON c.concept_id = cm.concept_id
      WHERE cm.coding_system_name = $1 AND cm.code_value = $2
        AND c.status = 'Active'
    `, [system, code]);
  }

  // Get relationships with audit info
  async getRelationships(conceptId: number): Promise<Relationship[]> {
    return await db.query(`
      SELECT r.*, 
             sc.canonical_name as source_name,
             tc.canonical_name as target_name,
             sal.calculation_timestamp as last_calculated
      FROM xaie_concept_relationships r
      JOIN xaie_concepts sc ON r.source_concept_id = sc.concept_id
      JOIN xaie_concepts tc ON r.target_concept_id = tc.concept_id
      LEFT JOIN xaie_score_audit_log sal ON r.relationship_id = sal.relationship_id
      WHERE r.source_concept_id = $1 AND r.is_active = true
      ORDER BY r.priority_score DESC
    `, [conceptId]);
  }
}
```

## Advantages of Your Implementation

1. **Better Data Integrity**: Normalized structure with proper foreign keys
2. **Audit Trail**: Complete tracking of AI score calculations
3. **Flexibility**: JSONB for custom attributes and contextual data
4. **Lifecycle Management**: Status and version control for concepts
5. **Performance**: Proper indexing with pg_trgm for fuzzy search
6. **Transparency**: Audit log shows how AI makes decisions

Your schema is production-ready and much more robust than my initial BRD design. The BRD should be updated to reflect this superior architecture.