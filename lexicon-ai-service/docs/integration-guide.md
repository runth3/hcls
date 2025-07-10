# Integration Guide - Lexicon AI Service

## Overview

This guide explains how to integrate the Lexicon AI Service with your TPA system and other healthcare applications.

## Architecture

```
┌─────────────────┐    HTTPS/REST    ┌─────────────────────────┐
│   TPA System    │ ──────────────► │  Lexicon AI Service     │
│                 │                 │                         │
│ - Claims Proc   │ ◄────────────── │ - Medical Concepts      │
│ - Member Mgmt   │   JSON/GraphQL  │ - AI Recommendations   │
│ - Analytics     │                 │ - Clinical Pathways     │
└─────────────────┘                 └─────────────────────────┘
```

## Authentication

### API Key Authentication
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     https://lexicon-api.company.com/api/v1/concepts
```

### JWT Token Authentication
```python
import jwt
import requests

# Generate JWT token
token = jwt.encode({
    'client_id': 'tpa-system',
    'exp': datetime.utcnow() + timedelta(hours=1)
}, 'your-secret-key', algorithm='HS256')

# Use in requests
headers = {'Authorization': f'Bearer {token}'}
response = requests.get('https://lexicon-api.company.com/api/v1/concepts', headers=headers)
```

## Integration Patterns

### 1. Real-time Claims Validation

```python
async def validate_claim_with_ai(claim_data):
    """Validate claim using Lexicon AI Service"""
    
    # Map diagnosis codes to concepts
    diagnosis_concepts = []
    for diagnosis in claim_data['diagnoses']:
        concept = await lexicon_client.map_external_code('ICD-10', diagnosis['code'])
        if concept:
            diagnosis_concepts.append(concept)
    
    # Get AI recommendations
    if diagnosis_concepts:
        recommendations = await lexicon_client.get_clinical_recommendations(
            diagnosis_concepts[0]['concept']['concept_id'],
            {
                'location': claim_data['patient_city'],
                'season': get_current_season(),
                'age_group': claim_data['patient_age_group']
            }
        )
        
        # Validate treatment plan
        treatment_plan = {
            'diagnosis_concept_id': diagnosis_concepts[0]['concept']['concept_id'],
            'procedures': [p['concept_id'] for p in claim_data['procedures']],
            'medications': [m['concept_id'] for m in claim_data['medications']]
        }
        
        validation = await lexicon_client.validate_treatment_plan(treatment_plan)
        
        return {
            'is_appropriate': validation['is_valid'],
            'confidence': validation['confidence'],
            'ai_recommendations': recommendations,
            'cost_analysis': calculate_cost_variance(claim_data, recommendations)
        }
```

### 2. Batch Processing Integration

```python
async def process_claims_batch(claims_list):
    """Process multiple claims with AI analysis"""
    
    results = []
    
    # Process in batches to avoid rate limiting
    batch_size = 10
    for i in range(0, len(claims_list), batch_size):
        batch = claims_list[i:i + batch_size]
        
        # Process batch concurrently
        tasks = [validate_claim_with_ai(claim) for claim in batch]
        batch_results = await asyncio.gather(*tasks)
        
        results.extend(batch_results)
        
        # Rate limiting
        await asyncio.sleep(1)
    
    return results
```

### 3. GraphQL Complex Queries

```python
async def get_comprehensive_clinical_data(diagnosis_code):
    """Get comprehensive clinical data using GraphQL"""
    
    query = """
    query getComprehensiveClinicalData($diagnosisCode: String!, $context: ClinicalContextInput) {
        conceptByCode(system: "ICD-10", code: $diagnosisCode) {
            concept_id
            canonical_name
            synonyms {
                term
                language_code
            }
        }
        
        getClinicalPathway(diagnosisId: $conceptId, context: $context) {
            treatments {
                concept {
                    canonical_name
                    code_mappings {
                        coding_system_name
                        code_value
                    }
                }
                priority_score
                success_rate
                median_cost
            }
            
            diagnosticTests {
                concept {
                    canonical_name
                }
                priority_score
                necessity_level
            }
            
            contextualInsights {
                location_specific_notes
                seasonal_recommendations
                cost_variations
            }
        }
    }
    """
    
    variables = {
        'diagnosisCode': diagnosis_code,
        'context': {
            'location': 'Manado',
            'season': 'WET'
        }
    }
    
    result = await lexicon_client.graphql_query(query, variables)
    return result['data']
```

## Error Handling

### Retry Logic
```python
import asyncio
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=4, max=10)
)
async def resilient_api_call(endpoint, data):
    """API call with retry logic"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(endpoint, json=data) as response:
                if response.status == 429:  # Rate limited
                    await asyncio.sleep(60)
                    raise Exception("Rate limited")
                
                response.raise_for_status()
                return await response.json()
                
    except aiohttp.ClientError as e:
        print(f"API call failed: {e}")
        raise
```

### Graceful Degradation
```python
async def get_recommendations_with_fallback(diagnosis_id, context):
    """Get recommendations with fallback to cached data"""
    try:
        # Try AI service first
        return await lexicon_client.get_clinical_recommendations(diagnosis_id, context)
        
    except Exception as e:
        print(f"AI service unavailable: {e}")
        
        # Fallback to cached recommendations
        cached_result = await get_cached_recommendations(diagnosis_id)
        if cached_result:
            return cached_result
        
        # Final fallback to basic rules
        return get_basic_recommendations(diagnosis_id)
```

## Performance Optimization

### Caching Strategy
```python
import redis
import json
from datetime import timedelta

class LexiconCache:
    def __init__(self):
        self.redis_client = redis.Redis(host='localhost', port=6379, db=0)
    
    async def get_cached_concept(self, concept_id):
        """Get concept from cache"""
        cached = self.redis_client.get(f"concept:{concept_id}")
        if cached:
            return json.loads(cached)
        return None
    
    async def cache_concept(self, concept_id, concept_data, ttl_hours=24):
        """Cache concept data"""
        self.redis_client.setex(
            f"concept:{concept_id}",
            timedelta(hours=ttl_hours),
            json.dumps(concept_data)
        )
    
    async def get_cached_recommendations(self, diagnosis_id, context_hash):
        """Get cached recommendations"""
        cache_key = f"recommendations:{diagnosis_id}:{context_hash}"
        cached = self.redis_client.get(cache_key)
        if cached:
            return json.loads(cached)
        return None
```

### Connection Pooling
```python
import aiohttp
from aiohttp import TCPConnector

class LexiconAIClient:
    def __init__(self, base_url, api_key):
        self.base_url = base_url
        self.api_key = api_key
        
        # Connection pooling
        connector = TCPConnector(
            limit=100,  # Total connection pool size
            limit_per_host=30,  # Per-host connection limit
            ttl_dns_cache=300,  # DNS cache TTL
            use_dns_cache=True
        )
        
        self.session = aiohttp.ClientSession(
            connector=connector,
            timeout=aiohttp.ClientTimeout(total=30),
            headers={'Authorization': f'Bearer {api_key}'}
        )
```

## Monitoring Integration

### Health Checks
```python
async def check_lexicon_service_health():
    """Check if Lexicon AI Service is healthy"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f'{LEXICON_BASE_URL}/health') as response:
                if response.status == 200:
                    health_data = await response.json()
                    return {
                        'status': 'healthy',
                        'response_time': health_data.get('response_time'),
                        'database_status': health_data.get('database_status'),
                        'ai_models_status': health_data.get('ai_models_status')
                    }
                else:
                    return {'status': 'unhealthy', 'error': f'HTTP {response.status}'}
    except Exception as e:
        return {'status': 'unhealthy', 'error': str(e)}
```

### Metrics Collection
```python
import time
from prometheus_client import Counter, Histogram, Gauge

# Metrics
lexicon_api_calls = Counter('lexicon_api_calls_total', 'Total API calls to Lexicon service', ['endpoint', 'status'])
lexicon_response_time = Histogram('lexicon_api_response_seconds', 'Response time for Lexicon API calls', ['endpoint'])
lexicon_ai_confidence = Gauge('lexicon_ai_confidence_score', 'AI confidence scores', ['prediction_type'])

async def monitored_api_call(endpoint, data):
    """API call with metrics collection"""
    start_time = time.time()
    
    try:
        result = await lexicon_client.post(endpoint, data)
        
        # Record success metrics
        lexicon_api_calls.labels(endpoint=endpoint, status='success').inc()
        lexicon_response_time.labels(endpoint=endpoint).observe(time.time() - start_time)
        
        # Record AI confidence if available
        if 'confidence' in result:
            lexicon_ai_confidence.labels(prediction_type=endpoint).set(result['confidence'])
        
        return result
        
    except Exception as e:
        # Record error metrics
        lexicon_api_calls.labels(endpoint=endpoint, status='error').inc()
        raise
```

## Security Best Practices

### API Key Management
```python
import os
from cryptography.fernet import Fernet

class SecureConfig:
    def __init__(self):
        self.encryption_key = os.environ.get('ENCRYPTION_KEY')
        self.cipher = Fernet(self.encryption_key) if self.encryption_key else None
    
    def get_api_key(self):
        """Get decrypted API key"""
        encrypted_key = os.environ.get('LEXICON_API_KEY_ENCRYPTED')
        if encrypted_key and self.cipher:
            return self.cipher.decrypt(encrypted_key.encode()).decode()
        return os.environ.get('LEXICON_API_KEY')
```

### Request Validation
```python
from pydantic import BaseModel, validator
from typing import Optional, List

class ClinicalRequest(BaseModel):
    diagnosis_concept_id: int
    patient_context: dict
    
    @validator('diagnosis_concept_id')
    def validate_concept_id(cls, v):
        if v <= 0:
            raise ValueError('Concept ID must be positive')
        return v
    
    @validator('patient_context')
    def validate_context(cls, v):
        required_fields = ['location', 'age_group']
        for field in required_fields:
            if field not in v:
                raise ValueError(f'Missing required field: {field}')
        return v

async def validate_and_process_request(request_data):
    """Validate request before sending to Lexicon service"""
    try:
        validated_request = ClinicalRequest(**request_data)
        return await lexicon_client.get_clinical_recommendations(
            validated_request.diagnosis_concept_id,
            validated_request.patient_context
        )
    except ValueError as e:
        raise ValidationError(f"Invalid request: {e}")
```

## Testing Integration

### Unit Tests
```python
import pytest
from unittest.mock import AsyncMock, patch

@pytest.mark.asyncio
async def test_clinical_recommendations():
    """Test clinical recommendations integration"""
    
    # Mock Lexicon AI client
    mock_client = AsyncMock()
    mock_client.get_clinical_recommendations.return_value = {
        'diagnosis': {'canonical_name': 'Dengue Fever'},
        'recommendations': [
            {
                'concept': {'canonical_name': 'Complete Blood Count'},
                'priority_score': 0.98,
                'confidence_score': 0.95
            }
        ]
    }
    
    # Test the integration
    with patch('your_module.lexicon_client', mock_client):
        result = await get_clinical_recommendations(1, {'location': 'Manado'})
        
        assert result['diagnosis']['canonical_name'] == 'Dengue Fever'
        assert len(result['recommendations']) == 1
        assert result['recommendations'][0]['priority_score'] == 0.98
```

### Integration Tests
```python
@pytest.mark.integration
async def test_end_to_end_claim_processing():
    """Test complete claim processing flow"""
    
    sample_claim = {
        'claim_id': 'TEST-001',
        'diagnoses': [{'code': 'A90'}],
        'patient_city': 'Manado',
        'patient_age_group': '25-30'
    }
    
    # Process claim
    result = await process_claim_with_ai(sample_claim)
    
    # Verify results
    assert result['claim_id'] == 'TEST-001'
    assert 'processing_decision' in result
    assert 'confidence_score' in result
    assert result['confidence_score'] > 0
```

This integration guide provides comprehensive examples for integrating the Lexicon AI Service with your TPA system and other healthcare applications.