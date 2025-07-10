# Lexicon AI Service - Medical Intelligence Platform

**Version**: 1.0  
**Date**: January 2025  
**Status**: Ready for Development  

## Overview

Standalone AI-powered medical intelligence service that provides clinical decision support through external APIs. Serves as the "medical brain" for healthcare applications including TPA systems.

## Architecture

```
External API Service (Separate from TPA)
├── Medical Concept Lexicon (Module 1)
├── Encounter Records (Module 2) 
└── Knowledge Graph AI (Module 3)
```

## Key Features

- **Medical Terminology Management**: Single source of truth for medical concepts
- **AI Clinical Decision Support**: Evidence-based treatment recommendations
- **FHIR Integration**: Healthcare interoperability standard
- **Contextual Intelligence**: Location, season, and context-aware insights
- **GraphQL API**: Flexible query interface for clinical pathways

## Technology Stack

- **Backend**: Python/FastAPI
- **Database**: PostgreSQL with AI extensions
- **ML/AI**: TensorFlow, scikit-learn
- **API**: GraphQL + REST
- **Infrastructure**: Docker, AI-optimized hosting

## Development Structure

```
lexicon-ai-service/
├── docs/           # Complete documentation
├── database/       # Schema and migrations
├── api/           # API specifications
├── ml-models/     # AI/ML components
├── deployment/    # Docker and infrastructure
└── examples/      # Integration examples
```

## Quick Start

1. Review documentation in `/docs`
2. Set up database using `/database` scripts
3. Deploy using `/deployment` configurations
4. Test integration with `/examples`

## Integration

This service integrates with TPA systems via API calls:
- **TPA → Lexicon**: Clinical decisions, validations
- **Lexicon → TPA**: Learning from claims data

See `/docs/integration-guide.md` for details.

## Reference

Original BRD-8 documentation remains in `/hcls/docs/BRD/` for TPA integration reference.