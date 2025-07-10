# Business Requirement Document (BRD) - AI-Powered Clinical Decision Support Engine

**Tanggal**: 11 Juli 2025  
**Versi**: 1.0  
**Dibuat oleh**: Tim Pengembangan TPA  
**Disetujui oleh**: 📋 **READY FOR DEVELOPMENT**  
**Modul**: BRD-8-AI-CDS-Engine  
**Dependencies**: BRD-4 (Claims), BRD-7 (Analytics), BRD-General-TPA v4.1

---

## 1. Pendahuluan

### 1.1 Tujuan Dokumen
Dokumen ini mendefinisikan kebutuhan bisnis dan persyaratan fungsional untuk **AI-Powered Clinical Decision Support Engine** yang terdiri dari 3 modul terintegrasi:
- **Modul 1 - Medical Concept Lexicon**: "Kamus Besar" sebagai single source of truth untuk terminologi medis
- **Modul 2 - Encounter Record Database**: "Buku Catatan Transaksi" untuk data klinis historis terstruktur  
- **Modul 3 - Clinical Pairing Knowledge Graph**: "Peta Hubungan Cerdas" dengan AI-learned clinical relationships

### 1.2 Ruang Lingkup
Sistem terintegrasi yang mencakup:
- **Manajemen Konsep Medis**: CRUD operations untuk konsep, sinonim, pemetaan kode, dan hubungan
- **Encounter Processing**: Penyimpanan dan analisis data encounter klinis dari FHIR claims
- **AI Learning Engine**: Machine learning untuk clinical decision support dan pattern recognition
- **FHIR Integration**: Interoperabilitas dengan sistem kesehatan eksternal
- **GraphQL API**: Query engine untuk clinical pathway recommendations

### 1.3 Definisi dan Istilah
- **Konsep**: Entitas medis unik dengan concept_id internal (diagnosis, prosedur, obat, dll.)
- **Sinonim**: Istilah alternatif yang merujuk konsep sama (termasuk Bahasa Indonesia)
- **Pemetaan Kode**: Hubungan concept_id internal dengan standar eksternal (ICD-10, SNOMED, dll.)
- **Clinical Pairing**: Hubungan antar konsep dengan AI confidence scores
- **Encounter**: Record klinis dari satu episode perawatan pasien
- **Contextual Intelligence**: AI insights berdasarkan lokasi, musim, dan faktor kontekstual

---

## 2. Tujuan Bisnis

### 2.1 Tujuan Utama
- **Standardisasi Data**: Single source of truth untuk terminologi medis, menghilangkan inkonsistensi
- **Interoperabilitas**: Pertukaran data akurat dengan sistem eksternal melalui pemetaan standar kode
- **AI-Enhanced Decisions**: Clinical decision support berbasis evidence dan machine learning
- **Cost Optimization**: Analisis biaya dan pathway optimization berdasarkan data historis
- **Contextual Intelligence**: Recommendations yang mempertimbangkan lokasi, musim, dan konteks lokal

### 2.2 Manfaat Bisnis
- **Efisiensi Kurasi**: Tools efisien untuk clinical experts mengelola knowledge base
- **Akurasi Klinis**: >95% akurasi dalam pemetaan terminologi dan recommendations
- **Compliance**: Mendukung regulasi kesehatan dan standar interoperabilitas
- **Continuous Learning**: AI yang semakin cerdas dari setiap encounter baru

---

## 3. Spesifikasi Fungsional - Tiga Modul Terintegrasi

### 3.1 Modul 1: Medical Concept Lexicon ("Kamus Besar")

#### 3.1.1 Fungsi Utama
**Single Source of Truth** untuk mendefinisikan dan menstandardisasi setiap konsep medis.

**Menjawab Pertanyaan**: "APA INI?"

#### 3.1.2 Spesifikasi Fungsional Detail

##### A. Manajemen Konsep (xaie_concepts)

| ID | Persyaratan | Prioritas |
|---|---|---|
| FUNC-CON-01 | **(Create)** Admin/Kurator dapat membuat konsep baru melalui formulir. Field wajib: canonical_name, concept_type. Sistem auto-generate human_readable_code unik. | Wajib |
| FUNC-CON-02 | **(Read)** Pengguna berwenang dapat melihat daftar konsep dalam tabel dengan pencarian, filter (concept_type, status), dan paginasi. | Wajib |
| FUNC-CON-03 | **(Read)** Setiap konsep memiliki halaman detail menampilkan semua atribut, sinonim, pemetaan kode, dan hubungan terkait. | Wajib |
| FUNC-CON-04 | **(Update)** Admin/Kurator dapat mengedit semua atribut konsep (canonical_name, definition, status). | Wajib |
| FUNC-CON-05 | **(Delete)** Hard delete tidak diizinkan. Hanya dapat mengubah status menjadi 'Deprecated' atau 'Archived'. | Wajib |

##### B. Manajemen Sinonim (xaie_synonyms)

| ID | Persyaratan | Prioritas |
|---|---|---|
| FUNC-SYN-01 | **(Create)** Pada halaman detail konsep, pengguna dapat menambahkan sinonim/terjemahan baru dengan term, language_code ('id'), dan term_type ('Vernacular'). | Wajib |
| FUNC-SYN-02 | **(Read)** Halaman detail konsep menampilkan daftar semua sinonim terkait dalam tabel yang dapat dicari. | Wajib |
| FUNC-SYN-03 | **(Update/Delete)** Pengguna dapat mengedit atau menonaktifkan (is_active = false) entri sinonim. | Wajib |
| FUNC-SYN-04 | Sistem menangani kasus satu term terhubung ke beberapa concept_id berbeda (menangani ambiguitas). | Wajib |

##### C. Manajemen Pemetaan Kode (xaie_code_mappings)

| ID | Persyaratan | Prioritas |
|---|---|---|
| FUNC-MAP-01 | **(Create)** Pada halaman detail konsep, pengguna dapat menambahkan pemetaan kode baru dengan memilih coding_system_name dari daftar standar (ICD-10, SNOMED CT, dll.) dan memasukkan code_value, code_description. | Wajib |
| FUNC-MAP-02 | **(Read)** Halaman detail konsep menampilkan semua pemetaan kode terkait. | Wajib |
| FUNC-MAP-03 | **(Update/Delete)** Pengguna dapat mengedit atau menghapus pemetaan kode yang ada. | Wajib |
| FUNC-MAP-04 | Sistem menangani kasus satu code_value dari sistem eksternal dipetakan ke beberapa concept_id internal (menangani ambiguitas kode umum). | Wajib |

##### D. Manajemen Hubungan Konsep (xaie_concept_relationships)

| ID | Persyaratan | Prioritas |
|---|---|---|
| FUNC-REL-01 | **(Create)** Pada halaman detail konsep, pengguna dapat membuat hubungan baru ke konsep lain dengan fitur pencarian untuk menemukan konsep target dan memilih relationship_type (IS_A, HAS_TREATMENT, dll.). | Tinggi |
| FUNC-REL-02 | **(Read)** Halaman detail konsep menampilkan daftar semua hubungan (sebagai sumber maupun target) yang dimiliki konsep tersebut. | Wajib |
| FUNC-REL-03 | **(Update)** Pengguna dapat mengedit atribut manual pada hubungan seperti notes. Pengeditan skor AI tidak diizinkan dari antarmuka ini. | Sedang |
| FUNC-REL-04 | **(Delete)** Pengguna dapat menonaktifkan (is_active = false) hubungan yang ada. | Wajib |

##### E. Fungsionalitas Pencarian

| ID | Persyaratan | Prioritas |
|---|---|---|
| FUNC-SRCH-01 | Sistem menyediakan bar pencarian global yang dapat mencari di seluruh Leksikon. | Wajib |
| FUNC-SRCH-02 | Pencarian mencakup canonical_name, human_readable_code, semua term di sinonim, dan semua code_value di pemetaan kode. | Wajib |
| FUNC-SRCH-03 | Pencarian toleran terhadap kesalahan ketik ringan (fuzzy search menggunakan pg_trgm). | Tinggi |
| FUNC-SRCH-04 | Hasil pencarian menampilkan nama konsep, tipe konsep, ringkasan singkat, dan dapat diklik untuk menuju halaman detail. | Wajib |

#### 3.1.3 Schema Medical Concept Lexicon
```typescript
interface MedicalConcept {
  // Identifiers
  concept_id: string;           // e.g., "DIAG-DBD-001", "PROC-HEMODIAL-001"
  human_readable_code: string;  // Same as concept_id for readability
  
  // Core Definition
  canonical_name: string;       // English canonical name
  indonesian_name: string;      // Indonesian canonical name
  concept_type: 'DIAGNOSIS' | 'PROCEDURE' | 'MEDICATION' | 'SYMPTOM' | 'LAB_TEST' | 'BODY_STRUCTURE' | 'ORGANISM' | 'SUBSTANCE' | 'QUALIFIER';
  
  // Linguistic Variations
  general_terms: string[];      // Common/layman terms in Indonesian
  
  // External Code Mappings (as strings for flexibility)
  code_mappings: string[];      // e.g., ["ICD-10: A90", "ICD-11: 1D40", "SNOMED CT: 1002005"]
  
  // Metadata
  created_at: Date;
  updated_at: Date;
  version: string;
}

// Sample Data Structure
const sampleConcepts = [
  {
    concept_id: "DIAG-DBD-001",
    canonical_name: "Dengue Fever",
    indonesian_name: "Demam Berdarah Dengue",
    concept_type: "DIAGNOSIS",
    general_terms: ["DBD", "Demam Denggi"],
    code_mappings: ["ICD-10: A90", "ICD-11: 1D40", "SNOMED CT: 1002005"]
  },
  {
    concept_id: "PROC-HEMODIAL-001",
    canonical_name: "Hemodialysis",
    indonesian_name: "Hemodialisis",
    concept_type: "PROCEDURE",
    general_terms: ["Cuci Darah", "Dialisis Ginjal", "HD"],
    code_mappings: ["ICD-9-CM: 39.95", "SNOMED CT: 34910008"]
  },
  {
    concept_id: "MED-PARAC-001",
    canonical_name: "Paracetamol",
    indonesian_name: "Parasetamol",
    concept_type: "MEDICATION",
    general_terms: ["Asetaminofen", "Sanmol", "Panadol"],
    code_mappings: ["ATC: N02BE01", "RxNorm: 161"]
  }
];
```

### 3.2 Modul 2: Encounter Record Database ("Buku Catatan Transaksi")

#### 3.2.1 Fungsi Utama
**Historical Record** dari setiap kejadian layanan kesehatan yang telah diproses.

**Menjawab Pertanyaan**: "APA YANG TELAH TERJADI?"

#### 3.2.2 Spesifikasi Fungsional Detail

##### A. FHIR Claims Processing

| ID | Persyaratan | Prioritas |
|---|---|---|
| FUNC-ENC-01 | Sistem dapat menerima dan memproses FHIR Claim resources secara real-time. | Wajib |
| FUNC-ENC-02 | Automatic mapping dari FHIR codes ke internal concept_id menggunakan xaie_fhir_mappings. | Wajib |
| FUNC-ENC-03 | De-identification otomatis data pasien dengan patient_hash untuk privacy compliance. | Wajib |
| FUNC-ENC-04 | Ekstraksi konteks klinis (lokasi, musim, outbreak period) dari FHIR resources. | Wajib |

##### B. Encounter Data Management

| ID | Persyaratan | Prioritas |
|---|---|---|
| FUNC-ENC-05 | Penyimpanan encounter data dalam struktur normalized (xaie_encounters, xaie_encounter_concepts). | Wajib |
| FUNC-ENC-06 | Tracking outcome data (discharge_status, readmission_30_days, complications). | Tinggi |
| FUNC-ENC-07 | Cost tracking per concept dalam encounter untuk financial analysis. | Wajib |
| FUNC-ENC-08 | Contextual factors recording (season, outbreak_period, weekend_admission). | Tinggi |

#### 3.2.3 Schema Encounter Records
```typescript
interface EncounterRecord {
  // Encounter Identity
  encounter_id: string;
  encounter_date: Date;
  encounter_type: 'INPATIENT' | 'OUTPATIENT' | 'EMERGENCY' | 'PREVENTIVE';
  
  // Patient Context (De-identified)
  patient_hash: string;         // De-identified patient ID
  patient_demographics: {
    age_group: string;          // "25-30", "31-35", etc.
    gender: 'M' | 'F';
    location_city: string;
    location_province: string;
  };
  
  // Provider Context
  provider_id: string;
  provider_type: 'HOSPITAL' | 'CLINIC' | 'SPECIALIST' | 'GP';
  provider_location: {
    city: string;
    province: string;
    facility_level: 'PRIMARY' | 'SECONDARY' | 'TERTIARY';
  };
  
  // Clinical Information (Referenced to Concept IDs)
  diagnoses: {
    concept_id: string;         // Reference to Medical Concept
    diagnosis_type: 'PRIMARY' | 'SECONDARY' | 'COMORBIDITY';
    severity: 'MILD' | 'MODERATE' | 'SEVERE';
  }[];
  
  procedures: {
    concept_id: string;         // Reference to Medical Concept
    procedure_date: Date;
    urgency: 'ELECTIVE' | 'URGENT' | 'EMERGENCY';
  }[];
  
  medications: {
    concept_id: string;         // Reference to Medical Concept
    dosage: string;
    duration_days: number;
    route: string;
  }[];
  
  // Financial Information
  costs: {
    concept_id: string;         // What was charged for
    claimed_amount: number;
    approved_amount: number;
    paid_amount: number;
    currency: 'IDR';
  }[];
  
  // Outcome Information
  outcome: {
    discharge_status: 'IMPROVED' | 'STABLE' | 'WORSENED' | 'DECEASED';
    length_of_stay?: number;    // For inpatient
    readmission_30_days?: boolean;
    complications?: string[];
  };
  
  // Contextual Factors
  contextual_factors: {
    season: 'DRY' | 'WET';
    outbreak_period?: boolean;  // During disease outbreak
    holiday_period?: boolean;
    weekend_admission?: boolean;
  };
}
```

### 3.3 Modul 3: Clinical Pairing Knowledge Graph ("Peta Hubungan Cerdas")

#### 3.3.1 Fungsi Utama
**AI-Learned Intelligence** tentang hubungan antar konsep medis dalam praktik dunia nyata.

**Menjawab Pertanyaan**: "BAGAIMANA SEBAIKNYA INI DITANGANI?"

#### 3.3.2 Spesifikasi Fungsional Detail

##### A. AI Learning Engine

| ID | Persyaratan | Prioritas |
|---|---|---|
| FUNC-AI-01 | Automatic learning dari encounter data untuk update relationship scores (commonality_score, confidence_score, evidence_level_score, priority_score). | Wajib |
| FUNC-AI-02 | Contextual intelligence berdasarkan lokasi, musim, age_group dengan xaie_contextual_scores. | Tinggi |
| FUNC-AI-03 | Cost analysis dan outcome prediction berdasarkan historical data. | Tinggi |
| FUNC-AI-04 | Complete audit trail melalui xaie_score_audit_log untuk transparency. | Wajib |

##### B. Clinical Decision Support

| ID | Persyaratan | Prioritas |
|---|---|---|
| FUNC-CDS-01 | GraphQL API untuk clinical pathway queries dengan contextual filtering. | Wajib |
| FUNC-CDS-02 | Real-time treatment recommendations berdasarkan diagnosis dan patient context. | Wajib |
| FUNC-CDS-03 | Drug interaction checking dan contraindication alerts. | Tinggi |
| FUNC-CDS-04 | Cost-effectiveness analysis untuk treatment options. | Sedang |

##### C. ML Prediction Cache

| ID | Persyaratan | Prioritas |
|---|---|---|
| FUNC-ML-01 | Caching sistem untuk ML predictions dengan xaie_ml_predictions untuk performance optimization. | Tinggi |
| FUNC-ML-02 | Model versioning dan A/B testing support untuk continuous improvement. | Sedang |
| FUNC-ML-03 | Batch processing untuk bulk prediction requests. | Sedang |

#### 3.3.3 Schema Knowledge Graph
```typescript
interface ClinicalPairing {
  // Relationship Identity
  pairing_id: string;
  source_concept_id: string;    // From Medical Concept
  target_concept_id: string;    // To Medical Concept
  relationship_type: 'HAS_TREATMENT' | 'REQUIRES_MEDICATION' | 'NEEDS_IMAGING' | 
                    'CONTRAINDICATED_WITH' | 'ALTERNATIVE_TO' | 'PRECEDES' | 'FOLLOWS';
  
  // AI-Learned Scores
  commonality_score: number;    // 0-1: How common this pairing is
  confidence_score: number;     // 0-1: AI confidence in the data
  evidence_level_score: number; // 0-1: Strength of scientific evidence
  priority_score: number;       // 0-1: Final recommendation score
  
  // Contextual Intelligence
  contextual_commonality: {
    by_location: Map<string, number>;     // City/Province specific
    by_season: Map<'DRY'|'WET', number>; // Seasonal patterns
    by_age_group: Map<string, number>;   // Age-specific patterns
    by_provider_type: Map<string, number>; // Provider-specific patterns
  };
  
  // Financial Intelligence
  typical_cost_range: {
    min_cost: number;
    max_cost: number;
    median_cost: number;
    cost_variance: number;
  };
  
  // Outcome Intelligence
  outcome_statistics: {
    success_rate: number;         // 0-1
    complication_rate: number;    // 0-1
    readmission_rate: number;     // 0-1
    patient_satisfaction: number; // 0-1
  };
  
  // Evidence Metadata
  evidence_metadata: {
    total_encounters: number;     // How many cases support this
    last_updated: Date;
    data_quality_score: number;   // 0-1
    geographic_coverage: string[]; // Which areas have data
  };
}
```

### 2.4 GraphQL Query Engine untuk Knowledge Graph

#### 2.4.1 Clinical Pathway Queries
```graphql
type Query {
  # Get treatment pathway for diagnosis
  getClinicalPathway(
    diagnosisConceptId: String!
    patientAge: String
    location: String
    season: String
  ): ClinicalPathway!
  
  # Get contextual recommendations
  getContextualRecommendations(
    diagnosisConceptId: String!
    context: ContextFilter!
  ): [ClinicalRecommendation!]!
  
  # Find similar cases
  findSimilarCases(
    encounterProfile: EncounterProfile!
    limit: Int = 10
  ): [SimilarCase!]!
}

type ClinicalPathway {
  diagnosis: MedicalConcept!
  
  # Primary treatment options
  primaryTreatments: [TreatmentOption!]!
  
  # Required medications
  requiredMedications: [MedicationOption!]!
  
  # Recommended imaging
  recommendedImaging: [ImagingOption!]!
  
  # Alternative pathways
  alternatives: [AlternativePathway!]!
  
  # Contextual insights
  contextualInsights: ContextualInsights!
}

type TreatmentOption {
  procedure: MedicalConcept!
  priority_score: Float!
  commonality_score: Float!
  success_rate: Float!
  typical_cost: CostRange!
  contextual_notes: String
}

# Example Query
query getDBDTreatment {
  getClinicalPathway(
    diagnosisConceptId: "CONCEPT_DBD_001"
    patientAge: "25-30"
    location: "Manado"
    season: "WET"
  ) {
    diagnosis { canonical_name }
    primaryTreatments {
      procedure { canonical_name }
      priority_score
      success_rate
      typical_cost { median_cost }
    }
    contextualInsights {
      seasonal_notes
      location_specific_recommendations
    }
  }
}
```

### 2.5 AI Learning Engine

#### 2.5.1 Pattern Learning dari Encounter Records
```python
class AILearningEngine:
    def __init__(self):
        self.pattern_learner = ClinicalPatternLearner()
        self.relationship_builder = RelationshipBuilder()
        self.context_analyzer = ContextualAnalyzer()
    
    def learn_from_encounters(self, encounter_records: List[EncounterRecord]) -> None:
        """Learn clinical patterns from encounter history"""
        
        # 1. Learn basic co-occurrence patterns
        cooccurrence_patterns = self.extract_cooccurrence_patterns(encounter_records)
        
        # 2. Learn contextual patterns
        contextual_patterns = self.extract_contextual_patterns(encounter_records)
        
        # 3. Learn outcome patterns
        outcome_patterns = self.extract_outcome_patterns(encounter_records)
        
        # 4. Build/update knowledge graph
        self.update_knowledge_graph(cooccurrence_patterns, contextual_patterns, outcome_patterns)
    
    def extract_cooccurrence_patterns(self, encounters: List[EncounterRecord]) -> Dict:
        """Extract which concepts appear together"""
        patterns = defaultdict(lambda: defaultdict(int))
        
        for encounter in encounters:
            # Diagnosis -> Procedure patterns
            for diag in encounter.diagnoses:
                for proc in encounter.procedures:
                    patterns['DIAGNOSIS_PROCEDURE'][f"{diag.concept_id}->{proc.concept_id}"] += 1
            
            # Diagnosis -> Medication patterns
            for diag in encounter.diagnoses:
                for med in encounter.medications:
                    patterns['DIAGNOSIS_MEDICATION'][f"{diag.concept_id}->{med.concept_id}"] += 1
        
        return patterns
    
    def extract_contextual_patterns(self, encounters: List[EncounterRecord]) -> Dict:
        """Extract context-specific patterns"""
        contextual_data = defaultdict(lambda: defaultdict(lambda: defaultdict(int)))
        
        for encounter in encounters:
            context_key = f"{encounter.patient_demographics.location_city}_{encounter.contextual_factors.season}"
            
            for diag in encounter.diagnoses:
                for proc in encounter.procedures:
                    relationship = f"{diag.concept_id}->{proc.concept_id}"
                    contextual_data[context_key]['DIAGNOSIS_PROCEDURE'][relationship] += 1
        
        return contextual_data
    
    def calculate_ai_scores(self, relationship_data: Dict) -> ClinicalPairing:
        """Calculate AI confidence scores for relationships"""
        total_occurrences = sum(relationship_data.values())
        
        # Commonality: How often this happens
        commonality_score = min(total_occurrences / 1000, 1.0)  # Normalize to 0-1
        
        # Confidence: Based on data quality and volume
        confidence_score = self.calculate_confidence(total_occurrences, relationship_data)
        
        # Evidence level: Based on outcome success
        evidence_level_score = self.calculate_evidence_level(relationship_data)
        
        # Priority: Weighted combination
        priority_score = (commonality_score * 0.3 + 
                         confidence_score * 0.4 + 
                         evidence_level_score * 0.3)
        
        return {
            'commonality_score': commonality_score,
            'confidence_score': confidence_score,
            'evidence_level_score': evidence_level_score,
            'priority_score': priority_score
        }
```

#### 2.2.2 Clinical Pattern Learning
```python
class ClinicalPatternLearner:
    def __init__(self):
        self.pattern_model = RandomForestClassifier(n_estimators=100)
        self.outcome_predictor = GradientBoostingRegressor()
    
    def learn_treatment_patterns(self, claims_history: List[Claim]) -> TreatmentPatterns:
        """Learn optimal treatment patterns from claims data"""
        
        # Feature engineering
        features = self.extract_clinical_features(claims_history)
        outcomes = self.extract_outcomes(claims_history)
        
        # Train pattern recognition model
        self.pattern_model.fit(features, outcomes)
        
        # Generate treatment recommendations
        patterns = {}
        for diagnosis in self.get_unique_diagnoses(claims_history):
            similar_cases = self.find_similar_cases(diagnosis, claims_history)
            successful_treatments = self.identify_successful_treatments(similar_cases)
            
            patterns[diagnosis] = TreatmentPattern(
                diagnosis=diagnosis,
                recommended_procedures=successful_treatments.procedures,
                recommended_medications=successful_treatments.medications,
                expected_cost=successful_treatments.average_cost,
                success_rate=successful_treatments.success_rate,
                evidence_strength=len(similar_cases)
            )
        
        return patterns
    
    def predict_clinical_outcome(self, diagnosis: str, treatment_plan: List[str]) -> OutcomePrediction:
        """Predict clinical outcome for given treatment plan"""
        features = self.encode_treatment_plan(diagnosis, treatment_plan)
        
        predicted_outcome = self.outcome_predictor.predict([features])[0]
        confidence = self.calculate_prediction_confidence(features)
        
        return OutcomePrediction(
            success_probability=predicted_outcome,
            confidence=confidence,
            risk_factors=self.identify_risk_factors(features),
            alternative_treatments=self.suggest_alternatives(diagnosis, treatment_plan)
        )
```

---

## 3. Clinical Decision Support Engine

### 3.1 Real-time CDS APIs

#### 3.1.1 Clinical Recommendation Engine
```typescript
interface CDSEngine {
  // Get treatment recommendations for diagnosis
  async getRecommendations(diagnosisCode: string, patientContext: PatientContext): Promise<ClinicalRecommendations> {
    const lexicon = await this.getLexicon(diagnosisCode);
    const similarCases = await this.findSimilarCases(diagnosisCode, patientContext);
    const mlPredictions = await this.getMLPredictions(diagnosisCode, patientContext);
    
    return {
      primaryRecommendations: mlPredictions.highConfidence,
      alternativeOptions: mlPredictions.alternatives,
      contraindications: lexicon.contraindications,
      costAnalysis: this.calculateCostImpact(mlPredictions),
      evidenceLevel: this.calculateEvidenceStrength(similarCases)
    };
  }
  
  // Validate treatment plan
  async validateTreatmentPlan(plan: TreatmentPlan): Promise<ValidationResult> {
    const validations = await Promise.all([
      this.checkDrugInteractions(plan.medications),
      this.validateProcedureSequence(plan.procedures),
      this.checkContraindications(plan.diagnosis, plan.treatments),
      this.assessCostEffectiveness(plan)
    ]);
    
    return {
      isValid: validations.every(v => v.isValid),
      warnings: validations.flatMap(v => v.warnings),
      suggestions: validations.flatMap(v => v.suggestions),
      riskScore: this.calculateRiskScore(validations)
    };
  }
}
```

#### 3.1.2 GraphQL Clinical Queries
```graphql
# Get comprehensive clinical pathway
query getClinicalPathway($diagnosisCode: String!, $patientAge: Int!, $comorbidities: [String!]) {
  clinicalPathway(diagnosis: $diagnosisCode, patientAge: $patientAge, comorbidities: $comorbidities) {
    diagnosis {
      code
      description
      severity
    }
    
    recommendedTreatments {
      procedure {
        code
        description
        averageCost
      }
      medications {
        code
        description
        dosage
        duration
      }
      imaging {
        code
        description
        necessity
      }
      confidence
      evidenceLevel
    }
    
    riskFactors {
      factor
      severity
      mitigation
    }
    
    expectedOutcome {
      successRate
      averageDuration
      costRange
    }
  }
}

# Get drug interaction analysis
query checkDrugInteractions($medications: [String!]!) {
  drugInteractions(medications: $medications) {
    severity
    description
    recommendation
    alternatives {
      medication
      reason
    }
  }
}
```

### 3.2 ML Model Integration

#### 3.2.1 Treatment Outcome Predictor
```python
class TreatmentOutcomePredictor:
    def __init__(self):
        self.models = {
            'success_rate': self.load_model('treatment_success'),
            'cost_prediction': self.load_model('cost_predictor'),
            'duration_prediction': self.load_model('duration_predictor'),
            'complication_risk': self.load_model('complication_predictor')
        }
    
    def predict_treatment_outcome(self, diagnosis: str, treatment_plan: List[str], patient_profile: dict) -> TreatmentPrediction:
        """Predict treatment outcome using ensemble models"""
        
        features = self.prepare_features(diagnosis, treatment_plan, patient_profile)
        
        predictions = {
            'success_rate': self.models['success_rate'].predict_proba(features)[0][1],
            'estimated_cost': self.models['cost_prediction'].predict(features)[0],
            'estimated_duration': self.models['duration_prediction'].predict(features)[0],
            'complication_risk': self.models['complication_risk'].predict_proba(features)[0][1]
        }
        
        # Calculate overall recommendation score
        recommendation_score = self.calculate_recommendation_score(predictions)
        
        return TreatmentPrediction(
            success_probability=predictions['success_rate'],
            estimated_cost=predictions['estimated_cost'],
            estimated_duration=predictions['estimated_duration'],
            complication_risk=predictions['complication_risk'],
            recommendation_score=recommendation_score,
            confidence_interval=self.calculate_confidence_interval(features),
            similar_cases_count=self.count_similar_cases(features)
        )
```

---

## 4. Database Schema

### 4.1 Lexicon Tables
```sql
-- Core lexicon table
CREATE TABLE medical_lexicons (
  id UUID PRIMARY KEY,
  type VARCHAR(20) NOT NULL, -- DIAGNOSIS, PROCEDURE, TREATMENT, MEDICATION, IMAGING
  primary_code VARCHAR(50) NOT NULL,
  primary_system VARCHAR(20) NOT NULL,
  preferred_term VARCHAR(500) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  severity VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Cross-mapping table
CREATE TABLE lexicon_mappings (
  id UUID PRIMARY KEY,
  source_lexicon_id UUID REFERENCES medical_lexicons(id),
  target_code VARCHAR(50) NOT NULL,
  target_system VARCHAR(20) NOT NULL,
  mapping_confidence DECIMAL(3,2), -- 0.00-1.00
  mapping_type VARCHAR(20), -- EXACT, APPROXIMATE, BROADER, NARROWER
  created_at TIMESTAMP DEFAULT NOW()
);

-- Relationships table
CREATE TABLE lexicon_relationships (
  id UUID PRIMARY KEY,
  source_lexicon_id UUID REFERENCES medical_lexicons(id),
  target_lexicon_id UUID REFERENCES medical_lexicons(id),
  relationship_type VARCHAR(30), -- TREATS, DIAGNOSES, REQUIRES, CONTRAINDICATED, ALTERNATIVE
  strength DECIMAL(3,2), -- 0.00-1.00
  ml_confidence DECIMAL(3,2),
  claims_evidence_count INTEGER DEFAULT 0,
  success_rate DECIMAL(3,2),
  cost_effectiveness DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Claims insights table
CREATE TABLE lexicon_claims_insights (
  id UUID PRIMARY KEY,
  lexicon_id UUID REFERENCES medical_lexicons(id),
  total_claims INTEGER DEFAULT 0,
  average_cost DECIMAL(15,2),
  success_rate DECIMAL(3,2),
  common_procedures JSONB, -- Array of procedure codes
  common_medications JSONB, -- Array of medication codes
  outcome_patterns JSONB, -- ML-derived patterns
  last_updated TIMESTAMP DEFAULT NOW()
);

-- ML model predictions cache
CREATE TABLE ml_predictions_cache (
  id UUID PRIMARY KEY,
  input_hash VARCHAR(64) UNIQUE, -- Hash of input parameters
  model_name VARCHAR(50),
  prediction_result JSONB,
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);
```

### 4.2 Modul 2: Encounter Record Database Tables
```sql
-- Historical encounter records ("Buku Catatan Transaksi")
CREATE TABLE encounter_records (
  encounter_id UUID PRIMARY KEY,
  encounter_date DATE NOT NULL,
  encounter_type VARCHAR(20) NOT NULL, -- INPATIENT, OUTPATIENT, EMERGENCY, PREVENTIVE
  
  -- De-identified patient context
  patient_hash VARCHAR(64) NOT NULL, -- De-identified patient ID
  patient_age_group VARCHAR(10), -- "25-30", "31-35", etc.
  patient_gender CHAR(1), -- M, F
  patient_city VARCHAR(100),
  patient_province VARCHAR(100),
  
  -- Provider context
  provider_id UUID,
  provider_type VARCHAR(20), -- HOSPITAL, CLINIC, SPECIALIST, GP
  provider_city VARCHAR(100),
  provider_province VARCHAR(100),
  facility_level VARCHAR(20), -- PRIMARY, SECONDARY, TERTIARY
  
  -- Outcome information
  discharge_status VARCHAR(20), -- IMPROVED, STABLE, WORSENED, DECEASED
  length_of_stay INTEGER, -- For inpatient
  readmission_30_days BOOLEAN DEFAULT FALSE,
  complications JSONB, -- Array of complication codes
  
  -- Contextual factors
  season VARCHAR(10), -- DRY, WET
  outbreak_period BOOLEAN DEFAULT FALSE,
  holiday_period BOOLEAN DEFAULT FALSE,
  weekend_admission BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Encounter diagnoses
CREATE TABLE encounter_diagnoses (
  id UUID PRIMARY KEY,
  encounter_id UUID REFERENCES encounter_records(encounter_id),
  concept_id UUID REFERENCES medical_concepts(concept_id),
  diagnosis_type VARCHAR(20), -- PRIMARY, SECONDARY, COMORBIDITY
  severity VARCHAR(20), -- MILD, MODERATE, SEVERE
  sequence_number INTEGER
);

-- Encounter procedures
CREATE TABLE encounter_procedures (
  id UUID PRIMARY KEY,
  encounter_id UUID REFERENCES encounter_records(encounter_id),
  concept_id UUID REFERENCES medical_concepts(concept_id),
  procedure_date DATE,
  urgency VARCHAR(20), -- ELECTIVE, URGENT, EMERGENCY
  sequence_number INTEGER
);

-- Encounter medications
CREATE TABLE encounter_medications (
  id UUID PRIMARY KEY,
  encounter_id UUID REFERENCES encounter_records(encounter_id),
  concept_id UUID REFERENCES medical_concepts(concept_id),
  dosage VARCHAR(100),
  duration_days INTEGER,
  route VARCHAR(50),
  sequence_number INTEGER
);

-- Encounter costs
CREATE TABLE encounter_costs (
  id UUID PRIMARY KEY,
  encounter_id UUID REFERENCES encounter_records(encounter_id),
  concept_id UUID REFERENCES medical_concepts(concept_id), -- What was charged for
  claimed_amount DECIMAL(15,2),
  approved_amount DECIMAL(15,2),
  paid_amount DECIMAL(15,2),
  currency VARCHAR(3) DEFAULT 'IDR'
);
```

### 4.3 Modul 3: Clinical Pairing Knowledge Graph Tables
```sql
-- Clinical pairings ("Peta Hubungan Cerdas")
CREATE TABLE clinical_pairings (
  pairing_id UUID PRIMARY KEY,
  source_concept_id UUID REFERENCES medical_concepts(concept_id),
  target_concept_id UUID REFERENCES medical_concepts(concept_id),
  relationship_type VARCHAR(30), -- HAS_TREATMENT, REQUIRES_MEDICATION, NEEDS_IMAGING, etc.
  
  -- AI-learned scores
  commonality_score DECIMAL(5,4), -- 0.0000-1.0000
  confidence_score DECIMAL(5,4),
  evidence_level_score DECIMAL(5,4),
  priority_score DECIMAL(5,4),
  
  -- Financial intelligence
  min_cost DECIMAL(15,2),
  max_cost DECIMAL(15,2),
  median_cost DECIMAL(15,2),
  cost_variance DECIMAL(15,2),
  
  -- Outcome statistics
  success_rate DECIMAL(5,4),
  complication_rate DECIMAL(5,4),
  readmission_rate DECIMAL(5,4),
  patient_satisfaction DECIMAL(5,4),
  
  -- Evidence metadata
  total_encounters INTEGER DEFAULT 0,
  data_quality_score DECIMAL(5,4),
  last_updated TIMESTAMP DEFAULT NOW(),
  
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(source_concept_id, target_concept_id, relationship_type)
);

-- Contextual commonality scores
CREATE TABLE pairing_contextual_scores (
  id UUID PRIMARY KEY,
  pairing_id UUID REFERENCES clinical_pairings(pairing_id),
  context_type VARCHAR(20), -- LOCATION, SEASON, AGE_GROUP, PROVIDER_TYPE
  context_value VARCHAR(100), -- "Manado", "WET", "25-30", "HOSPITAL"
  commonality_score DECIMAL(5,4),
  encounter_count INTEGER,
  last_updated TIMESTAMP DEFAULT NOW(),
  UNIQUE(pairing_id, context_type, context_value)
);
```

---

## 5. API Specifications

### 5.1 Lexicon Management APIs
```typescript
// Lexicon CRUD operations
GET    /api/lexicon/search?q={query}&type={type}     // Search lexicons
GET    /api/lexicon/{id}                             // Get lexicon details
POST   /api/lexicon                                  // Create lexicon
PUT    /api/lexicon/{id}                             // Update lexicon
DELETE /api/lexicon/{id}                             // Delete lexicon

// Cross-mapping operations
GET    /api/lexicon/{id}/mappings                    // Get cross-mappings
POST   /api/lexicon/{id}/mappings                    // Create mapping
GET    /api/lexicon/map/{sourceCode}/{targetSystem} // Cross-map terminology

// Relationship operations
GET    /api/lexicon/{id}/relationships               // Get relationships
POST   /api/lexicon/relationships                    // Create relationship
GET    /api/lexicon/pathway/{diagnosisCode}          // Get clinical pathway
```

### 5.2 Clinical Decision Support APIs
```typescript
// CDS recommendations
POST   /api/cds/recommendations                      // Get treatment recommendations
POST   /api/cds/validate-plan                       // Validate treatment plan
GET    /api/cds/drug-interactions                    // Check drug interactions
GET    /api/cds/contraindications/{diagnosisCode}    // Get contraindications

// ML predictions
POST   /api/ml/predict-outcome                       // Predict treatment outcome
POST   /api/ml/predict-cost                          // Predict treatment cost
GET    /api/ml/similar-cases                         // Find similar cases
POST   /api/ml/learn-patterns                        // Trigger pattern learning
```

---

## 6. Integration with TPA Modules

### 6.1 Claims Processing Integration (BRD-4)
```typescript
interface EnhancedClaimsProcessing {
  async processClaimWithCDS(claim: TPAClaim): Promise<ClaimProcessingResult> {
    // Get clinical context from lexicon
    const clinicalContext = await this.getClinicalContext(claim.diagnosisCodes);
    
    // Validate treatment appropriateness
    const cdsValidation = await this.validateTreatmentPlan({
      diagnosis: claim.diagnosisCodes,
      procedures: claim.procedureCodes,
      medications: claim.medicationCodes
    });
    
    // Check for potential issues
    const issues = await Promise.all([
      this.checkDrugInteractions(claim.medicationCodes),
      this.validateProcedureSequence(claim.procedureCodes),
      this.assessCostEffectiveness(claim)
    ]);
    
    return {
      recommendation: cdsValidation.isValid ? 'APPROVE' : 'REVIEW',
      confidence: cdsValidation.confidence,
      clinicalJustification: cdsValidation.reasoning,
      potentialIssues: issues.filter(i => i.severity > 'LOW'),
      alternativeTreatments: cdsValidation.alternatives,
      costAnalysis: cdsValidation.costImpact
    };
  }
}
```

### 6.2 Analytics Enhancement (BRD-7)
```typescript
interface ClinicalAnalyticsDashboard {
  // Add clinical insights to existing analytics
  clinicalMetrics: {
    treatmentEffectiveness: {
      diagnosisCode: string;
      treatmentSuccess: number;
      averageCost: number;
      patientSatisfaction: number;
    }[];
    
    prescriptionPatterns: {
      mostPrescribed: MedicationInsight[];
      drugInteractionAlerts: number;
      genericSubstitutionRate: number;
    };
    
    clinicalPathwayAdherence: {
      pathwayCompliance: number;
      deviationReasons: string[];
      outcomeImpact: number;
    };
  };
}
```

---

## 7. Implementation Plan

### 7.1 Phase 1: Core Lexicon System (6 weeks)
**Week 1-2: Database & Basic APIs**
- Medical lexicon database schema
- Basic CRUD APIs for lexicons
- Cross-mapping functionality

**Week 3-4: ML Semantic Mapping**
- Semantic similarity models
- Cross-terminology mapping AI
- Relationship learning algorithms

**Week 5-6: GraphQL Engine**
- GraphQL schema for medical concepts
- Relationship query engine
- Performance optimization

### 7.2 Phase 2: Clinical Decision Support (8 weeks)
**Week 7-8: CDS Engine**
- Treatment recommendation engine
- Clinical validation rules
- Drug interaction checking

**Week 9-10: ML Prediction Models**
- Treatment outcome prediction
- Cost forecasting models
- Pattern learning from claims

**Week 11-12: Integration APIs**
- CDS API development
- Real-time recommendation engine
- Caching and performance optimization

**Week 13-14: TPA Integration**
- Claims processing integration
- Analytics dashboard enhancement
- Testing and validation

### 7.3 Phase 3: Advanced Features (4 weeks)
**Week 15-16: Advanced ML**
- Ensemble prediction models
- Continuous learning pipeline
- Model monitoring and retraining

**Week 17-18: Production Deployment**
- Performance testing
- Security validation
- Documentation and training

---

## 8. Success Metrics

### 8.1 Technical KPIs
- **Lexicon Coverage**: 95% of medical codes mapped
- **Mapping Accuracy**: >90% semantic mapping accuracy
- **API Performance**: <500ms response time for CDS queries
- **ML Model Accuracy**: >85% treatment outcome prediction

### 8.2 Clinical KPIs
- **Treatment Appropriateness**: 30% improvement in clinical guideline adherence
- **Cost Optimization**: 20% reduction in unnecessary procedures
- **Drug Safety**: 50% reduction in drug interaction incidents
- **Clinical Outcomes**: 15% improvement in treatment success rates

---

**Document Status**: ✅ **READY FOR DEVELOPMENT**  
**Dependencies**: BRD-4 (Claims), BRD-7 (Analytics), AWS HealthLake  
**Timeline**: 18 weeks development  
**Budget**: $120,000 development + $8,000/month operational costs