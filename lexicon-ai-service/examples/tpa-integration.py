#!/usr/bin/env python3
"""
TPA Integration Example for Lexicon AI Service
Demonstrates how TPA system integrates with Lexicon AI Service APIs
"""

import asyncio
import aiohttp
import json
from typing import Dict, List, Optional
from datetime import datetime

class LexiconAIClient:
    """Client for Lexicon AI Service APIs"""
    
    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
        self.session = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession(
            headers={
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            }
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    # ===================================================================
    # MODULE 1: CONCEPT LEXICON INTEGRATION
    # ===================================================================
    
    async def search_concepts(self, query: str, concept_type: Optional[str] = None) -> List[Dict]:
        """Search medical concepts with fuzzy matching"""
        params = {'q': query}
        if concept_type:
            params['type'] = concept_type
        
        async with self.session.get(f'{self.base_url}/api/v1/concepts', params=params) as resp:
            data = await resp.json()
            return data.get('data', [])
    
    async def map_external_code(self, system: str, code: str) -> Optional[Dict]:
        """Map external code (ICD-10, SNOMED) to internal concept"""
        async with self.session.get(f'{self.base_url}/api/v1/mapping/{system}/{code}') as resp:
            if resp.status == 200:
                return await resp.json()
            return None
    
    async def get_concept_details(self, concept_id: int) -> Optional[Dict]:
        """Get detailed concept information"""
        async with self.session.get(f'{self.base_url}/api/v1/concepts/{concept_id}') as resp:
            if resp.status == 200:
                return await resp.json()
            return None
    
    # ===================================================================
    # MODULE 2: FHIR PROCESSING INTEGRATION
    # ===================================================================
    
    async def process_fhir_claim(self, fhir_claim: Dict) -> Dict:
        """Process FHIR claim and get AI analysis"""
        async with self.session.post(
            f'{self.base_url}/api/v1/fhir/claims',
            json=fhir_claim,
            headers={'Content-Type': 'application/fhir+json'}
        ) as resp:
            return await resp.json()
    
    # ===================================================================
    # MODULE 3: CLINICAL DECISION SUPPORT INTEGRATION
    # ===================================================================
    
    async def get_clinical_recommendations(self, diagnosis_id: int, patient_context: Dict) -> Dict:
        """Get AI-powered clinical recommendations"""
        request_data = {
            'diagnosis_concept_id': diagnosis_id,
            'patient_context': patient_context
        }
        
        async with self.session.post(
            f'{self.base_url}/api/v1/cds/recommendations',
            json=request_data
        ) as resp:
            return await resp.json()
    
    async def validate_treatment_plan(self, treatment_plan: Dict) -> Dict:
        """Validate treatment plan against AI knowledge"""
        async with self.session.post(
            f'{self.base_url}/api/v1/cds/validate',
            json=treatment_plan
        ) as resp:
            return await resp.json()
    
    async def get_clinical_pathway(self, diagnosis_id: int, location: str = None, season: str = None) -> Dict:
        """Get clinical pathway with contextual intelligence"""
        params = {}
        if location:
            params['location'] = location
        if season:
            params['season'] = season
        
        async with self.session.get(
            f'{self.base_url}/api/v1/cds/pathway/{diagnosis_id}',
            params=params
        ) as resp:
            return await resp.json()
    
    async def graphql_query(self, query: str, variables: Dict = None) -> Dict:
        """Execute GraphQL query for complex clinical data"""
        request_data = {'query': query}
        if variables:
            request_data['variables'] = variables
        
        async with self.session.post(
            f'{self.base_url}/api/v1/graphql',
            json=request_data
        ) as resp:
            return await resp.json()

class TPAClaimsProcessor:
    """TPA Claims Processor with Lexicon AI integration"""
    
    def __init__(self, lexicon_client: LexiconAIClient):
        self.lexicon = lexicon_client
    
    async def process_claim_with_ai(self, claim_data: Dict) -> Dict:
        """Enhanced claims processing with AI validation"""
        
        # 1. Map claim codes to internal concepts
        mapped_concepts = []
        for diagnosis in claim_data.get('diagnoses', []):
            concept = await self.lexicon.map_external_code('ICD-10', diagnosis['code'])
            if concept:
                mapped_concepts.append({
                    'original_code': diagnosis['code'],
                    'concept': concept['concept'],
                    'confidence': concept['mapping_confidence']
                })
        
        # 2. Get AI clinical recommendations
        if mapped_concepts:
            primary_diagnosis = mapped_concepts[0]['concept']
            patient_context = {
                'age_group': claim_data.get('patient_age_group'),
                'gender': claim_data.get('patient_gender'),
                'location': claim_data.get('patient_city'),
                'season': self._get_current_season()
            }
            
            recommendations = await self.lexicon.get_clinical_recommendations(
                primary_diagnosis['concept_id'],
                patient_context
            )
        else:
            recommendations = None
        
        # 3. Validate treatment plan
        if claim_data.get('procedures'):
            treatment_plan = {
                'diagnosis_concept_id': mapped_concepts[0]['concept']['concept_id'] if mapped_concepts else None,
                'procedures': [p['concept_id'] for p in claim_data.get('procedures', [])],
                'medications': [m['concept_id'] for m in claim_data.get('medications', [])]
            }
            
            validation = await self.lexicon.validate_treatment_plan(treatment_plan)
        else:
            validation = None
        
        # 4. Generate processing result
        return {
            'claim_id': claim_data['claim_id'],
            'mapped_concepts': mapped_concepts,
            'ai_recommendations': recommendations,
            'validation_result': validation,
            'processing_decision': self._make_processing_decision(validation, recommendations),
            'confidence_score': self._calculate_confidence(mapped_concepts, validation),
            'processed_at': datetime.now().isoformat()
        }
    
    def _get_current_season(self) -> str:
        """Determine current season (simplified)"""
        month = datetime.now().month
        return 'WET' if month in [11, 12, 1, 2, 3, 4] else 'DRY'
    
    def _make_processing_decision(self, validation: Dict, recommendations: Dict) -> str:
        """Make claim processing decision based on AI analysis"""
        if not validation:
            return 'MANUAL_REVIEW'
        
        if validation['is_valid'] and validation['confidence'] > 0.8:
            return 'AUTO_APPROVE'
        elif validation['confidence'] > 0.6:
            return 'REVIEW_REQUIRED'
        else:
            return 'MANUAL_REVIEW'
    
    def _calculate_confidence(self, mapped_concepts: List, validation: Dict) -> float:
        """Calculate overall confidence score"""
        if not mapped_concepts:
            return 0.0
        
        mapping_confidence = sum(c['confidence'] for c in mapped_concepts) / len(mapped_concepts)
        validation_confidence = validation['confidence'] if validation else 0.5
        
        return (mapping_confidence + validation_confidence) / 2

async def demo_tpa_integration():
    """Demonstrate TPA integration with Lexicon AI Service"""
    
    # Initialize Lexicon AI client
    async with LexiconAIClient(
        base_url='http://localhost:8000',
        api_key='demo-api-key'
    ) as lexicon:
        
        # Initialize TPA processor
        tpa_processor = TPAClaimsProcessor(lexicon)
        
        # Sample claim data
        sample_claim = {
            'claim_id': 'CLM-2025-001',
            'patient_age_group': '25-30',
            'patient_gender': 'M',
            'patient_city': 'Manado',
            'diagnoses': [
                {'code': 'A90', 'description': 'Dengue fever'}
            ],
            'procedures': [
                {'concept_id': 2}  # CBC test
            ],
            'medications': [
                {'concept_id': 3}  # Paracetamol
            ]
        }
        
        print("=== TPA Claims Processing with AI ===")
        
        # 1. Search for concepts
        print("\n1. Searching for 'DBD' concepts:")
        concepts = await lexicon.search_concepts('DBD', 'DIAGNOSIS')
        for concept in concepts[:3]:
            print(f"   - {concept['canonical_name']} ({concept['human_readable_code']})")
        
        # 2. Map external code
        print("\n2. Mapping ICD-10 code A90:")
        mapping = await lexicon.map_external_code('ICD-10', 'A90')
        if mapping:
            print(f"   - Mapped to: {mapping['concept']['canonical_name']}")
            print(f"   - Confidence: {mapping['mapping_confidence']}")
        
        # 3. Get clinical recommendations
        print("\n3. Getting clinical recommendations for Dengue Fever:")
        if mapping:
            recommendations = await lexicon.get_clinical_recommendations(
                mapping['concept']['concept_id'],
                {
                    'location': 'Manado',
                    'season': 'WET',
                    'age_group': '25-30'
                }
            )
            
            print(f"   - Diagnosis: {recommendations['diagnosis']['canonical_name']}")
            for rec in recommendations['recommendations'][:3]:
                print(f"   - {rec['concept']['canonical_name']} (Priority: {rec['priority_score']:.2f})")
        
        # 4. Process complete claim
        print("\n4. Processing complete claim with AI:")
        result = await tpa_processor.process_claim_with_ai(sample_claim)
        print(f"   - Decision: {result['processing_decision']}")
        print(f"   - Confidence: {result['confidence_score']:.2f}")
        print(f"   - Mapped concepts: {len(result['mapped_concepts'])}")
        
        # 5. GraphQL query example
        print("\n5. GraphQL clinical pathway query:")
        graphql_query = """
        query getClinicalPathway($diagnosisId: Int!, $context: ClinicalContextInput) {
            getClinicalPathway(diagnosisId: $diagnosisId, context: $context) {
                diagnosis {
                    canonical_name
                }
                treatments {
                    concept {
                        canonical_name
                    }
                    priority_score
                }
            }
        }
        """
        
        if mapping:
            graphql_result = await lexicon.graphql_query(
                graphql_query,
                {
                    'diagnosisId': mapping['concept']['concept_id'],
                    'context': {'location': 'Manado', 'season': 'WET'}
                }
            )
            
            if 'data' in graphql_result:
                pathway = graphql_result['data']['getClinicalPathway']
                print(f"   - Diagnosis: {pathway['diagnosis']['canonical_name']}")
                for treatment in pathway['treatments'][:2]:
                    print(f"   - Treatment: {treatment['concept']['canonical_name']} "
                          f"(Priority: {treatment['priority_score']:.2f})")

if __name__ == '__main__':
    # Run the demo
    asyncio.run(demo_tpa_integration())