
export interface Document {
  name: string;
  url: string;
  category: 'KTP' | 'SEP' | 'Diagnosis Sheet' | 'Invoice' | 'Medical Record' | 'Other';
}

export interface AuditEvent {
  timestamp: string; // ISO date string
  event: string;
  user: string; // or userId
  details?: string;
  previousState?: Partial<Claim>;
  newState?: Partial<Claim>;
}

export type ClaimStatus =
  | 'Submitted'
  | 'Pending Review'
  | 'Under Review'
  | 'Additional Info Required'
  | 'Approved'
  | 'Partially Approved'
  | 'Denied'
  | 'Appealed'
  | 'Closed'
  | 'Flagged for Audit';

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type ClaimSource = 'Manual' | 'System' | 'External' | 'EDI X12' | 'HL7 FHIR' | 'API Integration' | 'File Upload' | string;
export type ClaimType = 'Professional (CMS-1500)' | 'Institutional (UB-04)' | 'Dental (ADA)' | 'Pharmacy' | 'Vision' | 'Other' | string;

export interface ClaimLineItem {
  id: string; // Unique ID for the line item, e.g., "L001"
  serviceDate: string; // ISO date string
  procedureCode: string; // Can be from various systems
  procedureDescription?: string;
  diagnosisCodes: string[]; // Array of applicable diagnosis codes (e.g. ["J45.909"]) for this line item
  modifiers?: string[]; // e.g., ["25", "LT"]
  units: number;
  chargeAmount: number;
  approvedAmount?: number;
  status?: 'Approved' | 'Denied' | 'Pending' | 'Adjusted'; // Line-specific status
}

export type ClaimProcessingStatus = 'Raw' | 'EnrichmentPending' | 'Enriched' | 'ReviewRequired' | 'Processed' | 'Archived';

export interface ClaimBatch {
  id: string; // e.g., BATCH-20231027-001
  ingestionTimestamp: string; // ISO date string
  sourceSystem: 'Manual Input' | 'File Upload' | 'API: CoreSystemX' | 'API: HL7FHIR' | 'Other'; // More specific than claimSource
  originalFileName?: string; // If from file upload
  claimCountInBatch: number;
  status: 'PendingProcessing' | 'Processing' | 'Completed' | 'Error';
  notes?: string;
}

// --- Claim Data Quality Review Specific Types ---
export const AllClaimDataReviewStatuses = [
  'No Decision Yet',
  'Accepted as Clean Data',
  'Flagged for FWA Investigation',
  'Requires Data Correction',
  'Exclude from AI Training'
] as const;
export type ClaimDataReviewStatus = typeof AllClaimDataReviewStatuses[number];


export const AllClaimDataReviewFlags = [
  'Potential Fraud',
  'Potential Abuse',
  'Potential Waste',
  'Inconsistent Data',
  'Missing Critical Information',
  'Pattern Anomaly',
  'Data Entry Error',
  'Unbundling'
] as const;
export type ClaimDataReviewFlag = typeof AllClaimDataReviewFlags[number];

export interface ClaimDataQualityReview {
  status: ClaimDataReviewStatus;
  flags: ClaimDataReviewFlag[];
  notes: string;
  reviewedBy?: string; // User who made the decision
  reviewDate?: string; // ISO Date
}
// --- End Claim Data Quality Review Specific Types ---

export interface Claim {
  id: string;
  claimNumber: string;
  patientName: string;
  memberId: string;
  submissionDate: string; // ISO date string
  lastUpdateDate: string; // ISO date string
  status: ClaimStatus; // Operational status (Approved, Denied, etc.) - This is the status from the source system
  riskLevel: RiskLevel;
  predictedTATDays: number;

  policyNumber: string;
  policyHolderName: string;

  providerName: string;
  providerId: string;

  claimAmount: number;
  approvedAmount?: number;
  currency: string;

  diagnosisCodes: { code: string; description: string; }[];
  procedureCodes: { code: string; description: string; }[];

  medicationCodes?: { code: string; description: string; quantity: number }[];

  lineItems?: ClaimLineItem[];
  relatedClaims?: string[];

  claimDetailsFull: string;
  medicalRecordSummary?: string; // Summary of relevant EMR/EHR data
  memberDetailsContext: string;
  providerDetailsContext: string;
  claimHistorySummary: string;

  documents: Document[];
  notes?: { timestamp: string; user: string; text: string }[];
  assignedTo?: string;
  auditTrail: AuditEvent[];

  batchId?: string; // Links to a ClaimBatch
  processingStatus: ClaimProcessingStatus; // Internal status for IntelliPath's pipeline
  dataQualityReview?: ClaimDataQualityReview; // Stores the human assessment of data quality for AI
}

// For AI function outputs
export interface ClaimSummaryAI {
  summary: string;
}

export interface FraudDetectionAI {
  isFraudulent: boolean;
  fraudProbability: number; // 0-1
  fraudReason: string;
  recommendedAction?: string;
}

export interface TatPredictionAI {
  predictedTat: string; // e.g., "5-7 business days"
  confidenceScore: number; // 0-1
  factors: string; // Key factors influencing the prediction
}

export interface CriticalityAssessmentAI {
  isCritical: boolean;
  reason: string;
  suggestedPathway: 'Critical' | 'Non-Critical' | 'Undetermined';
}

export interface PatientChronologyAI {
  chronology: {
    eventDate: string;
    eventName: string;
    source: string;
    details?: string;
    isPredicted: boolean;
  }[];
}

// --- Knowledge Base Models ---

export interface MedicalConcept {
  id: string;
  conceptName: string;
  conceptType: 'Diagnosis' | 'Procedure' | 'Intervention' | 'Medication' | 'Finding' | 'Observation';
  codes: Record<string, string[]>;
  description?: string;
  synonyms?: string[];
  attributes?: Record<string, any>;
}

export interface ClinicalPairing {
  id: string;
  primaryConceptId: string;
  relatedConceptId: string;
  pairingCategory?: string;
  relationshipType: 'TreatmentFor' | 'Indicates' | 'ContraindicationFor' | 'AssociatedWith' | 'Causes' | string;
  isCritical?: boolean;
  criticalityReason?: string;
  commonalityScore?: number;
  confidenceScore?: number;
  sourceType?: string[];
  sourceDetails?: string[];
  notes?: string;
  lastReviewed?: string;
  status?: 'Active' | 'Inactive' | 'PendingReview';
}

export interface IdentifiedCriticalFinding {
  id: string;
  claimId?: string;
  assessedOn: string;
  diagnosisInformation: string[];
  procedureOrInterventionInformation: string[];
  reason: string;
  source: 'AI_Assessment' | 'Manual_Entry' | 'Claim_Review' | 'System_Rule';
  clinicalPairingId?: string;
}

// --- Supporting Models (Consumed from other systems) ---
export interface Policy {
  id:string;
  policyNumber: string;
  policyType: string;
  coverageStartDate: string;
  coverageEndDate: string;
  groupName?: string;
  groupNumber?: string;
  coverageDetails?: string;
}

export interface Provider {
  id: string;
  providerName: string;
  npi?: string;
  specialty?: string;
  address?: string;
  contactInfo?: string;
  networkStatus?: 'In-Network' | 'Out-of-Network';
  accreditation?: string[];
}

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender?: 'Male' | 'Female' | 'Other' | 'Unknown';
  contactInfo?: string;
  address?: string;
  policyIds: string[];
}

    
