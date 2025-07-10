#!/usr/bin/env python3
"""
Lexicon AI Service - Proof of Concept
Minimal implementation demonstrating core AI capabilities
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import json
import asyncio

app = FastAPI(title="Lexicon AI Service POC", version="1.0.0")

# ===================================================================
# DATA MODELS
# ===================================================================

class Concept(BaseModel):
    concept_id: int
    canonical_name: str
    indonesian_name: str
    concept_type: str
    synonyms: List[str] = []

class ClinicalRequest(BaseModel):
    diagnosis_id: int
    context: Dict[str, str] = {}

class Recommendation(BaseModel):
    concept: Concept
    priority_score: float
    confidence: float
    reason: str

class FHIRClaim(BaseModel):
    resourceType: str = "Claim"
    id: str
    patient_reference: str
    diagnosis_codes: List[str]
    procedure_codes: List[str] = []

# ===================================================================
# SAMPLE DATA (Simulating Database)
# ===================================================================

SAMPLE_CONCEPTS = [
    {
        "concept_id": 1,
        "canonical_name": "Dengue Fever",
        "indonesian_name": "Demam Berdarah Dengue",
        "concept_type": "DIAGNOSIS",
        "synonyms": ["DBD", "Demam Denggi", "Dengue"]
    },
    {
        "concept_id": 2,
        "canonical_name": "Complete Blood Count",
        "indonesian_name": "Pemeriksaan Darah Lengkap",
        "concept_type": "LAB_TEST",
        "synonyms": ["CBC", "DL", "Darah Lengkap"]
    },
    {
        "concept_id": 3,
        "canonical_name": "Paracetamol",
        "indonesian_name": "Parasetamol",
        "concept_type": "MEDICATION",
        "synonyms": ["Panadol", "Acetaminophen", "Sanmol"]
    },
    {
        "concept_id": 4,
        "canonical_name": "Platelet Count",
        "indonesian_name": "Hitung Trombosit",
        "concept_type": "LAB_TEST",
        "synonyms": ["PLT", "Trombosit"]
    }
]

# Clinical relationships (simulating AI-learned data)
CLINICAL_RELATIONSHIPS = {
    1: [  # Dengue Fever
        {"target_id": 2, "type": "HAS_DIAGNOSTIC_TEST", "priority": 0.98, "context_boost": {"Manado_WET": 0.15}},
        {"target_id": 3, "type": "HAS_TREATMENT", "priority": 0.85, "context_boost": {"Jakarta_DRY": 0.10}},
        {"target_id": 4, "type": "HAS_DIAGNOSTIC_TEST", "priority": 0.95, "context_boost": {"WET": 0.20}}
    ]
}

# ===================================================================
# AI SERVICES
# ===================================================================

class ConceptSearchEngine:
    def __init__(self):
        self.concepts = SAMPLE_CONCEPTS
        self.vectorizer = TfidfVectorizer()
        self._build_search_index()
    
    def _build_search_index(self):
        """Build search index for fuzzy matching"""
        search_texts = []
        for concept in self.concepts:
            text = f"{concept['canonical_name']} {concept['indonesian_name']} {' '.join(concept['synonyms'])}"
            search_texts.append(text.lower())
        
        self.search_matrix = self.vectorizer.fit_transform(search_texts)
    
    def search(self, query: str, limit: int = 10) -> List[Dict]:
        """Fuzzy search for medical concepts"""
        query_vector = self.vectorizer.transform([query.lower()])
        similarities = cosine_similarity(query_vector, self.search_matrix)[0]
        
        results = []
        for i, score in enumerate(similarities):
            if score > 0.1:  # Minimum similarity threshold
                concept = self.concepts[i].copy()
                concept['match_score'] = float(score)
                results.append(concept)
        
        return sorted(results, key=lambda x: x['match_score'], reverse=True)[:limit]

class ClinicalDecisionEngine:
    def __init__(self):
        self.relationships = CLINICAL_RELATIONSHIPS
        self.concepts = {c['concept_id']: c for c in SAMPLE_CONCEPTS}
    
    def get_recommendations(self, diagnosis_id: int, context: Dict) -> List[Dict]:
        """Get AI-powered clinical recommendations"""
        if diagnosis_id not in self.relationships:
            return []
        
        recommendations = []
        for rel in self.relationships[diagnosis_id]:
            target_concept = self.concepts[rel['target_id']]
            
            # Calculate contextual priority boost
            priority = rel['priority']
            context_key = f"{context.get('location', '')}_{context.get('season', '')}"
            
            if context_key in rel.get('context_boost', {}):
                priority += rel['context_boost'][context_key]
            elif context.get('season') in rel.get('context_boost', {}):
                priority += rel['context_boost'][context.get('season')]
            
            priority = min(priority, 1.0)  # Cap at 1.0
            
            # Generate reasoning
            reason = self._generate_reasoning(target_concept, rel['type'], context)
            
            recommendations.append({
                'concept': target_concept,
                'priority_score': priority,
                'confidence': 0.9,  # Simulated confidence
                'reason': reason
            })
        
        return sorted(recommendations, key=lambda x: x['priority_score'], reverse=True)
    
    def _generate_reasoning(self, concept: Dict, rel_type: str, context: Dict) -> str:
        """Generate clinical reasoning (simulating Bedrock)"""
        location = context.get('location', 'Indonesia')
        season = context.get('season', '')
        
        reasoning_templates = {
            'HAS_DIAGNOSTIC_TEST': f"{concept['indonesian_name']} penting untuk monitoring kondisi pasien",
            'HAS_TREATMENT': f"{concept['indonesian_name']} efektif untuk penanganan simptomatik"
        }
        
        base_reason = reasoning_templates.get(rel_type, f"{concept['indonesian_name']} direkomendasikan")
        
        # Add contextual information
        if location == "Manado" and season == "WET":
            base_reason += f" - tinggi di {location} saat musim hujan"
        elif season == "WET":
            base_reason += " - penting saat musim hujan"
        
        return base_reason

class FHIRProcessor:
    def __init__(self):
        self.search_engine = ConceptSearchEngine()
        self.cds_engine = ClinicalDecisionEngine()
    
    def process_claim(self, fhir_claim: Dict) -> Dict:
        """Process FHIR claim and return AI analysis"""
        
        # Map diagnosis codes to concepts
        mapped_concepts = []
        for diag_code in fhir_claim.get('diagnosis_codes', []):
            # Simulate ICD-10 to concept mapping
            if diag_code == 'A90':  # Dengue fever
                mapped_concepts.append({'concept_id': 1, 'code': diag_code, 'confidence': 0.95})
        
        # Get AI recommendations for primary diagnosis
        recommendations = []
        if mapped_concepts:
            primary_diagnosis = mapped_concepts[0]['concept_id']
            context = {'location': 'Jakarta', 'season': 'WET'}  # Simulated context
            recommendations = self.cds_engine.get_recommendations(primary_diagnosis, context)
        
        return {
            'claim_id': fhir_claim.get('id'),
            'mapped_concepts': mapped_concepts,
            'ai_recommendations': recommendations,
            'processing_status': 'ANALYZED',
            'confidence_score': 0.92
        }

# ===================================================================
# INITIALIZE SERVICES
# ===================================================================

search_engine = ConceptSearchEngine()
cds_engine = ClinicalDecisionEngine()
fhir_processor = FHIRProcessor()

# ===================================================================
# API ENDPOINTS
# ===================================================================

@app.get("/")
async def root():
    return {"message": "Lexicon AI Service POC", "version": "1.0.0"}

@app.get("/api/v1/concepts/search")
async def search_concepts(q: str, limit: int = 10):
    """Search medical concepts with fuzzy matching"""
    results = search_engine.search(q, limit)
    return {"query": q, "results": results, "total": len(results)}

@app.get("/api/v1/concepts/{concept_id}")
async def get_concept(concept_id: int):
    """Get concept details"""
    concept = next((c for c in SAMPLE_CONCEPTS if c['concept_id'] == concept_id), None)
    if not concept:
        raise HTTPException(status_code=404, detail="Concept not found")
    return concept

@app.post("/api/v1/cds/recommendations")
async def get_clinical_recommendations(request: ClinicalRequest):
    """Get AI-powered clinical recommendations"""
    recommendations = cds_engine.get_recommendations(request.diagnosis_id, request.context)
    
    diagnosis_concept = next((c for c in SAMPLE_CONCEPTS if c['concept_id'] == request.diagnosis_id), None)
    
    return {
        "diagnosis": diagnosis_concept,
        "recommendations": recommendations,
        "context": request.context,
        "total_recommendations": len(recommendations)
    }

@app.post("/api/v1/fhir/claims")
async def process_fhir_claim(claim: FHIRClaim):
    """Process FHIR claim with AI analysis"""
    result = fhir_processor.process_claim(claim.dict())
    return result

@app.get("/api/v1/ml/predict")
async def ml_prediction_demo(diagnosis: str = "DBD", location: str = "Manado"):
    """Demo ML prediction for Indonesian healthcare context"""
    
    # Simulate ML model prediction
    seasonal_risk = {
        "DBD": {"WET": 0.85, "DRY": 0.25},
        "ISPA": {"WET": 0.45, "DRY": 0.70}
    }
    
    location_multiplier = {"Manado": 1.2, "Jakarta": 1.0, "Surabaya": 0.9}
    
    base_risk = seasonal_risk.get(diagnosis, {"WET": 0.5, "DRY": 0.5})["WET"]  # Assume wet season
    adjusted_risk = base_risk * location_multiplier.get(location, 1.0)
    adjusted_risk = min(adjusted_risk, 1.0)
    
    return {
        "diagnosis": diagnosis,
        "location": location,
        "season": "WET",
        "risk_score": adjusted_risk,
        "risk_category": "HIGH" if adjusted_risk > 0.7 else "MEDIUM" if adjusted_risk > 0.4 else "LOW",
        "recommendations": [
            "Tingkatkan monitoring trombosit" if diagnosis == "DBD" else "Perhatikan gejala pernapasan",
            f"Waspada peningkatan kasus di {location}"
        ]
    }

@app.get("/api/v1/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "services": {
            "concept_search": "operational",
            "clinical_decision_support": "operational", 
            "fhir_processor": "operational",
            "ml_predictions": "operational"
        },
        "data": {
            "total_concepts": len(SAMPLE_CONCEPTS),
            "clinical_relationships": len(CLINICAL_RELATIONSHIPS)
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)