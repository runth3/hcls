
#git remote add origin https://github.com/runth3/prototype_pathway.git
git push -u origin main IntelliPath: AI-Powered Medical Pairing & Pathway System

IntelliPath is a NextJS-based application designed to streamline and enhance medical claims processing through AI-driven data enrichment, analysis, and intelligent pathway suggestions. It serves as a sophisticated frontend for managing claim data from various sources, enriching it using Genkit AI, and preparing it for deeper analysis and decision-making.

## Core Concepts & Workflow

IntelliPath is built around the idea of an intelligent data pipeline:

1.  **Data Ingestion & Batching**: Claims can originate from multiple sources:
    *   Manual input via the application.
    *   File uploads (various formats).
    *   API integrations (e.g., HL7 FHIR, other TPA/core systems).
    *   Manual inputs from medical advisors or health experts.
    Incoming claims are organized into **batches** for traceability, tracking their source, ingestion time, and initial processing status.

2.  **AI-Powered Data Enrichment & Cleaning (Genkit)**:
    *   Raw claim data often arrives incomplete or inconsistent.
    *   IntelliPath utilizes **Genkit AI flows** to:
        *   **Enrich Data**: Predict missing information (e.g., service dates if not provided), generate plausible provider details (like full addresses and types based on names), and derive contextual information (e.g., submission season from a date).
        *   **Assess Data Quality**: Evaluate the initial quality of the claim data, flagging it as 'Clean' or 'Requires Review' if anomalies, ambiguities, or missing critical information are detected.
        *   **Preliminary Analysis**: Perform initial assessments like checking claim amount plausibility against described services.

3.  **Data Storage (Planned Architecture)**:
    *   **PostgreSQL**: Will serve as the primary relational database for storing master data, including:
        *   Enriched and cleaned claim details.
        *   `MedicalConcept`s (diagnoses, procedures, interventions, medications).
        *   User information and system configurations.
    *   **Apache AGE (PostgreSQL Extension)**: Will be used to create and manage a knowledge graph of `ClinicalPairing`s, representing the relationships, commonalities, and criticalities between different medical concepts.

4.  **External AI System for Core Pairing & Pathway Decisions**:
    *   The enriched data stored in PostgreSQL/AGE is designed to be consumed by a separate, more powerful AI system. This external system will perform the core medical pairing analysis, calculate complex AI results, and determine optimal pathways.

5.  **IntelliPath Frontend Role**:
    *   **User Interface**: Provides a modern, intuitive interface for all interactions.
    *   **Data Input & Simulation**: Allows users to simulate manual claim entry, demonstrating the AI enrichment process.
    *   **Knowledge Base Management**: Enables curation of `MedicalConcept`s and visualization of `ClinicalPairing`s.
    *   **Presentation of Insights**: Displays AI-generated insights (summaries, fraud alerts, TAT predictions, criticality assessments) and the results from the external AI system (conceptual at this stage).
    *   **Monitoring & Administration**: Provides views for audit trails, system configuration, and reporting.

## Key Features & Modules

The application is structured into several key areas:

*   **Dashboard (`/dashboard`)**: An overview of system activity, key metrics, and quick access to recent or flagged claims.
*   **Claim Batches (`/batches`)**:
    *   Lists all ingested claim batches, filterable by date.
    *   Shows the source system, ingestion time, and total claims per batch.
    *   Provides a breakdown of claims within each batch by their processing status (Raw, Enriched, Review Required, Processed).
    *   Links to a detailed view of claims within a specific batch.
*   **Batch Detail Page (`/batches/[id]`)**: Displays detailed information for a selected batch and lists all associated claims.
*   **Claims Management (`/claims`)**:
    *   Comprehensive table view of all claims.
    *   Displays claim source, type, operational status, and internal processing status.
    *   Allows navigation to individual claim details.
*   **Claim Detail Page (`/claims/[id]`)**:
    *   In-depth view of a single claim, including patient, provider, policy information, diagnosis/procedure codes.
    *   Displays AI-generated insights:
        *   Claim Summary
        *   Fraud Detection Analysis
        *   Turnaround Time (TAT) Prediction
        *   Criticality Assessment (based on diagnosis/procedure conceptual pairing)
    *   Shows attached documents and an audit trail for the claim.
*   **Simulate Claim Data Enrichment (`/claims/new`)**:
    *   A form to input hypothetical claim data.
    *   Demonstrates the `enrichClaimDataFlow` (Genkit) which:
        *   Predicts missing service dates.
        *   Generates plausible provider addresses and types.
        *   Derives submission season.
        *   Assesses overall data quality (flagging as 'Clean' or 'RequiresReview').
        *   Provides an assessment of the claim amount's plausibility.
*   **Criticality Assessment Tool (`/criticality-assessment`)**:
    *   Allows users to input diagnosis and procedure information (codes or terms).
    *   Uses the `assessClaimCriticalityFlow` (Genkit) to determine if the conceptual pairing is critical and provides a reason.
*   **Critical Findings Log (`/critical-findings`)**: Displays a log of pairings that have been identified as conceptually critical.
*   **Knowledge Base Management (`/knowledge-base`)**:
    *   Manages the core intelligence of the system.
    *   **Medical Concept Lexicon**: View and add abstract medical concepts (diagnoses, procedures, etc.) and their mappings to various coding systems (ICD-10, SNOMED CT, CPT, layman's terms).
    *   **Clinical Pairing Knowledge Graph**: View defined relationships between medical concepts, including their commonality and criticality.
*   **Audit Trail (`/audit`)**: (Conceptual) A comprehensive log of system events, user actions, and AI decisions.
*   **Reporting & Analytics (`/reports`)**: (Placeholder) For future system performance reports, AI accuracy, and data trends.
*   **Integrations (`/integrations`)**: (Placeholder) For managing API connections with external systems.
*   **Administration (`/admin`)**: (Placeholder) For system-wide configuration and user management.

## Implemented Genkit AI Flows

*   `enrichClaimDataFlow`: Enriches raw claim input, predicts missing data, and assesses initial data quality and amount plausibility.
*   `assessClaimCriticalityFlow`: Assesses if a combination of diagnosis and procedure/intervention information is conceptually critical.
*   `generateClaimSummary`: Generates a concise summary of claim details.
*   `detectClaimFraud`: Analyzes claim, member, and provider details to flag potential fraud.
*   `predictTat`: Predicts the turnaround time for claim processing.

## Technology Stack

*   **Framework**: Next.js (App Router)
*   **Language**: TypeScript
*   **UI Components**: ShadCN UI
*   **Styling**: Tailwind CSS
*   **AI Integration**: Genkit (for local/on-frontend AI flows)
*   **Database (Planned)**: PostgreSQL with Apache AGE extension

## Getting Started

To get started with development:

1.  Ensure you have Node.js and npm/yarn installed.
2.  Clone the repository.
3.  Install dependencies: `npm install` or `yarn install`.
4.  Set up your environment variables:
    *   Create a `.env.local` file in the root directory.
    *   Add your `GOOGLE_API_KEY` for Genkit AI features:
        ```
        GOOGLE_API_KEY=your_google_api_key_here
        ```
5.  Run the development server: `npm run dev` or `yarn dev`.
    *   The application will be available at `http://localhost:9002`.
    *   The Genkit development server (for inspecting flows) can be run separately if needed: `npm run genkit:dev`.

This README provides a snapshot of IntelliPath's current capabilities and its planned evolution.
