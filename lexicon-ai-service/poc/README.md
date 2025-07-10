# Lexicon AI Service - Proof of Concept

## 🚀 Quick Start

This POC demonstrates core AI capabilities for Indonesian healthcare:

### Features Demonstrated
- **🔍 Fuzzy Medical Concept Search** (Indonesian + English)
- **🧠 AI Clinical Recommendations** (Context-aware)
- **📋 FHIR Claim Processing** (Basic validation)
- **🤖 ML Predictions** (Indonesian healthcare patterns)

## Setup & Run

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Start the API server
python main.py
# or
uvicorn main:app --reload --port 8000

# 3. Test the POC
python test_poc.py
```

## API Endpoints

### 🔍 Search Medical Concepts
```bash
curl "http://localhost:8000/api/v1/concepts/search?q=DBD"
curl "http://localhost:8000/api/v1/concepts/search?q=darah%20lengkap"
```

### 🧠 Get Clinical Recommendations
```bash
curl -X POST "http://localhost:8000/api/v1/cds/recommendations" \
  -H "Content-Type: application/json" \
  -d '{
    "diagnosis_id": 1,
    "context": {
      "location": "Manado",
      "season": "WET"
    }
  }'
```

### 📋 Process FHIR Claim
```bash
curl -X POST "http://localhost:8000/api/v1/fhir/claims" \
  -H "Content-Type: application/json" \
  -d @sample_fhir_claim.json
```

### 🤖 ML Prediction Demo
```bash
curl "http://localhost:8000/api/v1/ml/predict?diagnosis=DBD&location=Manado"
```

## Sample Responses

### Concept Search Response
```json
{
  "query": "DBD",
  "results": [
    {
      "concept_id": 1,
      "canonical_name": "Dengue Fever",
      "indonesian_name": "Demam Berdarah Dengue",
      "concept_type": "DIAGNOSIS",
      "synonyms": ["DBD", "Demam Denggi", "Dengue"],
      "match_score": 0.95
    }
  ],
  "total": 1
}
```

### Clinical Recommendations Response
```json
{
  "diagnosis": {
    "concept_id": 1,
    "canonical_name": "Dengue Fever",
    "indonesian_name": "Demam Berdarah Dengue"
  },
  "recommendations": [
    {
      "concept": {
        "concept_id": 2,
        "canonical_name": "Complete Blood Count",
        "indonesian_name": "Pemeriksaan Darah Lengkap"
      },
      "priority_score": 0.98,
      "confidence": 0.9,
      "reason": "Pemeriksaan Darah Lengkap penting untuk monitoring kondisi pasien - tinggi di Manado saat musim hujan"
    }
  ],
  "context": {
    "location": "Manado",
    "season": "WET"
  }
}
```

### ML Prediction Response
```json
{
  "diagnosis": "DBD",
  "location": "Manado",
  "season": "WET",
  "risk_score": 0.85,
  "risk_category": "HIGH",
  "recommendations": [
    "Tingkatkan monitoring trombosit",
    "Waspada peningkatan kasus di Manado"
  ]
}
```

## Key AI Features Demonstrated

### 1. **Indonesian Medical Context**
- Seasonal patterns (wet/dry season)
- Regional variations (Manado vs Jakarta)
- Local terminology (DBD, DL, etc.)

### 2. **Fuzzy Search**
- Handles typos and variations
- Multi-language support
- Synonym matching

### 3. **Contextual AI**
- Location-based recommendations
- Seasonal risk adjustments
- Evidence-based scoring

### 4. **FHIR Integration**
- Standard healthcare data format
- Automatic code mapping
- AI-powered validation

## Next Steps for Full Implementation

1. **Database Integration**: Replace in-memory data with PostgreSQL
2. **AWS Services**: Add SageMaker, Comprehend Medical, Bedrock
3. **Authentication**: JWT tokens and API keys
4. **Caching**: Redis for performance
5. **Monitoring**: CloudWatch integration
6. **Production**: Docker deployment

## Architecture

```
POC FastAPI Server
├── Concept Search Engine (TF-IDF + Cosine Similarity)
├── Clinical Decision Engine (Rule-based + Context)
├── FHIR Processor (Basic validation + mapping)
└── ML Predictor (Simulated Indonesian patterns)
```

This POC validates the core AI concepts before full AWS implementation!