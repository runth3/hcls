#!/usr/bin/env python3
"""
Test script for Lexicon AI Service POC
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_health_check():
    """Test health check endpoint"""
    print("🏥 Testing Health Check...")
    response = requests.get(f"{BASE_URL}/api/v1/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    print()

def test_concept_search():
    """Test concept search functionality"""
    print("🔍 Testing Concept Search...")
    
    test_queries = ["DBD", "darah lengkap", "paracetamol", "demam"]
    
    for query in test_queries:
        response = requests.get(f"{BASE_URL}/api/v1/concepts/search", params={"q": query})
        data = response.json()
        print(f"Query: '{query}' -> Found {data['total']} results")
        
        if data['results']:
            top_result = data['results'][0]
            print(f"  Top match: {top_result['canonical_name']} ({top_result['indonesian_name']}) - Score: {top_result['match_score']:.3f}")
        print()

def test_clinical_recommendations():
    """Test clinical decision support"""
    print("🧠 Testing Clinical Recommendations...")
    
    test_cases = [
        {"diagnosis_id": 1, "context": {"location": "Manado", "season": "WET"}},
        {"diagnosis_id": 1, "context": {"location": "Jakarta", "season": "DRY"}},
    ]
    
    for case in test_cases:
        response = requests.post(
            f"{BASE_URL}/api/v1/cds/recommendations",
            json=case
        )
        data = response.json()
        
        print(f"Diagnosis: {data['diagnosis']['indonesian_name']}")
        print(f"Context: {case['context']}")
        print(f"Recommendations ({data['total_recommendations']}):")
        
        for rec in data['recommendations']:
            print(f"  - {rec['concept']['indonesian_name']} (Priority: {rec['priority_score']:.2f})")
            print(f"    Reason: {rec['reason']}")
        print()

def test_fhir_processing():
    """Test FHIR claim processing"""
    print("📋 Testing FHIR Claim Processing...")
    
    sample_claim = {
        "resourceType": "Claim",
        "id": "CLAIM-POC-001",
        "patient_reference": "Patient/PAT-001",
        "diagnosis_codes": ["A90"],  # Dengue fever
        "procedure_codes": []
    }
    
    response = requests.post(
        f"{BASE_URL}/api/v1/fhir/claims",
        json=sample_claim
    )
    data = response.json()
    
    print(f"Claim ID: {data['claim_id']}")
    print(f"Processing Status: {data['processing_status']}")
    print(f"Confidence Score: {data['confidence_score']}")
    print(f"Mapped Concepts: {len(data['mapped_concepts'])}")
    print(f"AI Recommendations: {len(data['ai_recommendations'])}")
    
    if data['ai_recommendations']:
        print("Top Recommendations:")
        for rec in data['ai_recommendations'][:2]:
            print(f"  - {rec['concept']['indonesian_name']} (Priority: {rec['priority_score']:.2f})")
    print()

def test_ml_predictions():
    """Test ML prediction demo"""
    print("🤖 Testing ML Predictions...")
    
    test_cases = [
        {"diagnosis": "DBD", "location": "Manado"},
        {"diagnosis": "DBD", "location": "Jakarta"},
        {"diagnosis": "ISPA", "location": "Surabaya"}
    ]
    
    for case in test_cases:
        response = requests.get(
            f"{BASE_URL}/api/v1/ml/predict",
            params=case
        )
        data = response.json()
        
        print(f"Diagnosis: {data['diagnosis']} in {data['location']}")
        print(f"Risk Score: {data['risk_score']:.2f} ({data['risk_category']})")
        print(f"Recommendations: {', '.join(data['recommendations'])}")
        print()

def run_comprehensive_test():
    """Run all tests"""
    print("🚀 Starting Lexicon AI Service POC Tests")
    print("=" * 50)
    
    try:
        test_health_check()
        test_concept_search()
        test_clinical_recommendations()
        test_fhir_processing()
        test_ml_predictions()
        
        print("✅ All tests completed successfully!")
        
    except requests.exceptions.ConnectionError:
        print("❌ Error: Cannot connect to the API server.")
        print("Make sure the server is running: uvicorn main:app --reload --port 8000")
    except Exception as e:
        print(f"❌ Error during testing: {e}")

if __name__ == "__main__":
    run_comprehensive_test()