
import type { Claim, ClaimStatus, RiskLevel, ClaimSource, ClaimType, ClaimLineItem, MedicalConcept, ClinicalPairing, ClaimBatch, ClaimProcessingStatus, ClaimDataQualityReview, ClaimDataReviewStatus, ClaimDataReviewFlag, IdentifiedCriticalFinding } from './types';
import { subDays, formatISO, setHours, setMinutes, setSeconds } from 'date-fns';

const today = new Date('2025-06-01T17:00:00.000Z'); // Updated to June 1st, 2025, 5 PM UTC

// --- Mock Claim Batches ---
export const mockClaimBatches: ClaimBatch[] = [
  {
    id: 'BATCH-MANUAL-20250527-001', // Date reflects subDays(today, 5)
    ingestionTimestamp: formatISO(setHours(subDays(today, 5), 9)),
    sourceSystem: 'Manual Input',
    claimCountInBatch: 1,
    status: 'Completed',
  },
  {
    id: 'BATCH-API-HL7-20250522-001', // Date reflects subDays(today, 10)
    ingestionTimestamp: formatISO(setHours(subDays(today, 10), 14)),
    sourceSystem: 'API: HL7FHIR',
    claimCountInBatch: 1,
    status: 'Completed',
  },
  {
    id: 'BATCH-UPLOAD-20250530-001', // Date reflects subDays(today, 2)
    ingestionTimestamp: formatISO(setHours(subDays(today, 2), 11)),
    sourceSystem: 'File Upload',
    originalFileName: 'claims_may30_2025.csv',
    claimCountInBatch: 6, 
    status: 'Processing',
  },
  {
    id: 'BATCH-UPLOAD-20250531-001',
    ingestionTimestamp: formatISO(setHours(subDays(today, 1), 8)),
    sourceSystem: 'File Upload',
    originalFileName: 'siloam_claims_may31.xml',
    claimCountInBatch: 1,
    status: 'Completed',
  },
  {
    id: 'BATCH-API-CSX-20250531-001',
    ingestionTimestamp: formatISO(setHours(subDays(today, 1), 10)),
    sourceSystem: 'API: CoreSystemX',
    claimCountInBatch: 1,
    status: 'Completed',
  }
];


// --- Mock Medical Concepts ---
export const mockMedicalConcepts: MedicalConcept[] = [
  {
    id: 'CONCEPT_TYPHOID_FEVER',
    conceptName: 'Typhoid Fever',
    conceptType: 'Diagnosis',
    codes: {
      'ICD-10': ['A01.0'],
      'ICD-11': ['1A00.0'],
      'SNOMED_CT': ['76495006'],
      'Layman_Terms': ['typhoid', 'enteric fever']
    },
    description: 'A bacterial infection due to Salmonella typhi that causes symptoms which may vary from mild to severe and usually begin 6 to 30 days after exposure.',
  },
  {
    id: 'CONCEPT_ANTIBIOTIC_THERAPY',
    conceptName: 'Antibiotic Therapy',
    conceptType: 'Intervention',
    codes: {
      'ICD-9-CM_Procedure': ['99.21'], 
      'ICD-10-PCS': ['3E033BZ'], 
      'SNOMED_CT': ['186358002'], 
      'Layman_Terms': ['antibiotics', 'meds for infection']
    },
    description: 'Treatment using substances that kill or inhibit the growth of bacteria.',
  },
  {
    id: 'CONCEPT_ACUTE_APPENDICITIS',
    conceptName: 'Acute Appendicitis',
    conceptType: 'Diagnosis',
    codes: {
      'ICD-10': ['K35.80', 'K35.2', 'K35.3'], 
      'ICD-11': ['DB90.0'],
      'SNOMED_CT': ['74492003', '195850000'], 
      'Layman_Terms': ['appendicitis', 'inflamed appendix']
    },
    description: 'Inflammation of the appendix, a finger-like pouch attached to the large intestine.',
  },
  {
    id: 'CONCEPT_APPENDECTOMY',
    conceptName: 'Appendectomy',
    conceptType: 'Procedure',
    codes: {
      'ICD-9-CM_Procedure': ['47.01', '47.09'], 
      'ICD-10-PCS': ['0DTJ0ZZ', '0DTJ4ZZ'], 
      'CCI': ['1.NE.53.LA'], 
      'SNOMED_CT': ['80146002'], 
      'CPT': ['44950', '44970'], 
      'Layman_Terms': ['appendix removal', 'surgery for appendix']
    },
    description: 'Surgical removal of the appendix.',
  },
  {
    id: 'CONCEPT_AMI', 
    conceptName: 'Acute Myocardial Infarction',
    conceptType: 'Diagnosis',
    codes: {
      'ICD-10': ['I21.0', 'I21.1', 'I21.2', 'I21.3', 'I21.4'], 
      'SNOMED_CT': ['22298006'],
      'Layman_Terms': ['heart attack']
    },
    description: 'Medical emergency in which the blood supply to a part of the heart is interrupted.',
  },
  {
    id: 'CONCEPT_CABG', 
    conceptName: 'Coronary Artery Bypass Graft',
    conceptType: 'Procedure',
    codes: {
      'ICD-9-CM_Procedure': ['36.10', '36.11', '36.12', '36.13', '36.14'], 
      'ICD-10-PCS': ['021009W', '02100AW', '02100ZW'], 
      'CPT': ['33510', '33533'], 
      'SNOMED_CT': ['232717009'],
      'Layman_Terms': ['heart bypass surgery', 'CABG']
    },
    description: 'Surgical procedure to restore normal blood flow to an obstructed coronary artery.',
  },
  {
    id: 'CONCEPT_MALIGNANT_LUNG_NEOPLASM',
    conceptName: 'Malignant Lung Neoplasm',
    conceptType: 'Diagnosis',
    codes: {
      'ICD-10': ['C34.90'],
      'SNOMED_CT': ['363358000'],
      'Layman_Terms': ['lung cancer']
    },
    description: 'Cancer that originates in the tissues of the lungs or the cells lining the airways.',
  },
  {
    id: 'CONCEPT_LOBECTOMY_LUNG',
    conceptName: 'Lobectomy of Lung',
    conceptType: 'Procedure',
    codes: {
      'ICD-9-CM_Procedure': ['32.4'],
      'ICD-10-PCS': ['0BTB0ZZ'], 
      'CPT': ['32480'],
      'SNOMED_CT': ['39214006'],
      'Layman_Terms': ['lung lobe removal']
    },
    description: 'Surgical removal of a lobe of the lung.',
  },
  {
    id: 'CONCEPT_COMMON_COLD',
    conceptName: 'Common Cold',
    conceptType: 'Diagnosis',
    codes: {
      'ICD-10': ['J00'],
      'SNOMED_CT': ['82272006'],
      'Layman_Terms': ['cold', 'sniffles']
    },
    description: 'A common viral infectious disease of the upper respiratory tract.',
  },
  {
    id: 'CONCEPT_COMPREHENSIVE_METABOLIC_PANEL',
    conceptName: 'Comprehensive Metabolic Panel',
    conceptType: 'Procedure', 
    codes: {
      'CPT': ['80053'],
      'SNOMED_CT': ['271330001'],
      'Layman_Terms': ['CMP', 'blood test panel']
    },
    description: 'A blood test that measures 14 different substances in your blood. It provides important information about your body\'s chemical balance and metabolism.',
  },
  {
    id: 'CONCEPT_MRI_JOINT',
    conceptName: 'MRI of Joint',
    conceptType: 'Procedure',
    codes: {
      'CPT': ['73721'], 
      'SNOMED_CT': ['312857008'],
      'Layman_Terms': ['joint MRI']
    },
    description: 'Magnetic resonance imaging of a joint to visualize soft tissues like ligaments and tendons.',
  }
];

// --- Mock Clinical Pairings ---
export const mockClinicalPairings: ClinicalPairing[] = [
  {
    id: 'PAIR_TYPHOID_ANTIBIOTICS',
    primaryConceptId: 'CONCEPT_TYPHOID_FEVER',
    relatedConceptId: 'CONCEPT_ANTIBIOTIC_THERAPY',
    pairingCategory: 'Medical Management',
    relationshipType: 'TreatmentFor',
    isCritical: false,
    commonalityScore: 0.95,
    confidenceScore: 0.98,
    sourceType: ['Clinical Guideline', 'Expert Consensus'],
    sourceDetails: ['WHO Guidelines on Typhoid', 'Infectious Disease Society Recommendations'],
    notes: 'Primary treatment. Specific antibiotic choice may vary based on local resistance patterns.',
    lastReviewed: formatISO(subDays(today, 30)),
    status: 'Active',
  },
  {
    id: 'PAIR_APPENDICITIS_APPENDECTOMY',
    primaryConceptId: 'CONCEPT_ACUTE_APPENDICITIS',
    relatedConceptId: 'CONCEPT_APPENDECTOMY',
    pairingCategory: 'Surgical Intervention',
    relationshipType: 'TreatmentFor',
    isCritical: true,
    criticalityReason: 'Acute appendicitis often requires prompt surgical removal to prevent rupture and peritonitis.',
    commonalityScore: 0.99,
    confidenceScore: 0.99,
    sourceType: ['Clinical Guideline', 'Surgical Textbooks'],
    sourceDetails: ['American College of Surgeons Guidelines', 'Schwartz\'s Principles of Surgery'],
    notes: 'Appendectomy is the standard treatment for acute appendicitis.',
    lastReviewed: formatISO(subDays(today, 15)),
    status: 'Active',
  },
  {
    id: 'PAIR_AMI_CABG',
    primaryConceptId: 'CONCEPT_AMI',
    relatedConceptId: 'CONCEPT_CABG',
    pairingCategory: 'Surgical Intervention',
    relationshipType: 'TreatmentFor',
    isCritical: true,
    criticalityReason: 'Acute Myocardial Infarction (especially STEMI) may require urgent CABG if percutaneous coronary intervention (PCI) is not suitable or fails, or if there is extensive coronary artery disease.',
    commonalityScore: 0.60, 
    confidenceScore: 0.90,
    sourceType: ['Clinical Guideline', 'Cardiology Expert Consensus'],
    sourceDetails: ['ACC/AHA Guidelines for STEMI Management'],
    notes: 'CABG is a critical intervention for specific AMI cases.',
    lastReviewed: formatISO(subDays(today, 60)),
    status: 'Active',
  },
  {
    id: 'PAIR_LUNG_CANCER_LOBECTOMY',
    primaryConceptId: 'CONCEPT_MALIGNANT_LUNG_NEOPLASM',
    relatedConceptId: 'CONCEPT_LOBECTOMY_LUNG',
    pairingCategory: 'Surgical Intervention',
    relationshipType: 'TreatmentFor',
    isCritical: true,
    criticalityReason: 'Malignant lung neoplasm often requires surgical resection like lobectomy for curative intent in suitable candidates.',
    commonalityScore: 0.70,
    confidenceScore: 0.95,
    sourceType: ['Oncology Clinical Guideline', 'Thoracic Surgery Standards'],
    sourceDetails: ['NCCN Guidelines for Non-Small Cell Lung Cancer'],
    notes: 'Lobectomy is a common surgical treatment for early-stage lung cancer.',
    lastReviewed: formatISO(subDays(today, 45)),
    status: 'Active',
  }
];

const mockClaims: Claim[] = [
  // Newest claims first
  {
    id: 'CLAIM010',
    claimNumber: 'CN-2025-05-010',
    patientName: 'Dewi Anggraini',
    memberId: 'MEM-ABUSE-002',
    submissionDate: formatISO(setMinutes(setHours(subDays(today, 2), 11), 15)),
    lastUpdateDate: formatISO(setMinutes(setHours(subDays(today, 1), 16), 30)),
    status: 'Flagged for Audit',
    processingStatus: 'ReviewRequired',
    riskLevel: 'High',
    predictedTATDays: 11,
    policyNumber: 'POL-CORP-E-555',
    policyHolderName: 'PT Jasa Konsultasi',
    providerName: 'Klinik Harapan Ibu',
    providerId: 'PROV-KHI-001',
    claimAmount: 25000000,
    currency: 'IDR',
    diagnosisCodes: [{ code: 'O82.0', description: 'Caesarean delivery without indication' }],
    procedureCodes: [
        { code: '59510', description: 'Routine obstetric care including antepartum care, cesarean delivery, and postpartum care' },
        { code: '49255', description: 'Omentectomy, epiploectomy, resection of omentum' }
    ],
    claimSource: 'File Upload',
    claimType: 'Institutional (UB-04)',
    batchId: 'BATCH-UPLOAD-20250530-001',
    claimDetailsFull: 'Pasien Dewi Anggraini menjalani operasi caesar. Klaim mencakup biaya terpisah untuk C-section dan omentectomy. Catatan perawat jaga menyebutkan tidak ada indikasi medis yang jelas untuk operasi caesar.',
    medicalRecordSummary: 'EMR Note (Nurse): Patient admitted for elective C-section. No signs of fetal distress noted in observation logs. Vital signs stable pre-op.',
    memberDetailsContext: 'Dewi Anggraini, Wanita, 31 tahun. Polis aktif selama 2 tahun.',
    providerDetailsContext: 'Klinik Harapan Ibu, klinik bersalin. Beberapa klaim terakhir menunjukkan pola penagihan yang tinggi.',
    claimHistorySummary: 'Klaim sebelumnya untuk pemeriksaan rutin.',
    documents: [],
    auditTrail: [
        { timestamp: formatISO(setMinutes(setHours(subDays(today, 2), 11), 15)), event: 'Claim Ingested from File', user: 'System (Batch)' },
        { timestamp: formatISO(setMinutes(setHours(subDays(today, 1), 16), 32)), event: 'AI Abuse Alert: Unbundling Detected', user: 'IntelliPath AI', details: 'Omentectomy (49255) is likely bundled with C-Section (59510). Source of medical info is from nurse notes.' }
    ],
    dataQualityReview: {
      status: 'Flagged for FWA Investigation',
      flags: ['Potential Abuse', 'Unbundling', 'Inconsistent Data'],
      notes: 'AI menandai potensi penyalahgunaan karena unbundling. Omentectomy (49255) biasanya termasuk dalam paket global untuk C-section (59510). Sumber info medis dari perawat jaga, yang kurang kredibel dibandingkan spesialis. Disarankan untuk meminta klarifikasi dari dokter spesialis yang bertanggung jawab.',
      reviewedBy: 'IntelliPath AI',
      reviewDate: formatISO(setMinutes(setHours(subDays(today, 1), 16), 32))
    },
  },
  {
    id: 'CLAIM009',
    claimNumber: 'CN-2025-05-009',
    patientName: 'Fitriani Sari',
    memberId: 'MEM-ABUSE-001',
    submissionDate: formatISO(setMinutes(setHours(subDays(today, 2), 11), 20)),
    lastUpdateDate: formatISO(setMinutes(setHours(subDays(today, 1), 9), 45)),
    status: 'Flagged for Audit',
    processingStatus: 'ReviewRequired',
    riskLevel: 'High',
    predictedTATDays: 11,
    policyNumber: 'POL-CORP-D-444',
    policyHolderName: 'PT Niaga Sentosa',
    providerName: 'RSIA Bunda Sejati',
    providerId: 'PROV-RSIABS-001',
    claimAmount: 25000000,
    currency: 'IDR',
    diagnosisCodes: [{ code: 'O82.0', description: 'Caesarean delivery without indication' }],
    procedureCodes: [
        { code: '59510', description: 'Routine obstetric care including antepartum care, cesarean delivery, and postpartum care' },
        { code: '49255', description: 'Omentectomy, epiploectomy, resection of omentum' }
    ],
    claimSource: 'File Upload',
    claimType: 'Institutional (UB-04)',
    batchId: 'BATCH-UPLOAD-20250530-001',
    claimDetailsFull: 'Patient Fitriani Sari underwent a cesarean section. The claim includes separate charges for the C-section and an omentectomy. Medical notes review from specialist obstetrician indicates: "Tidak ada lilitan tali pusar, Tidak ada placenta previa, Tidak ada letak sungsang." This information, sourced from specialist obstetrician notes, suggests a lack of strong medical indication for a C-section.',
    medicalRecordSummary: 'EMR Note (Obstetrician Specialist): Patient requested elective C-section. Fetal monitoring normal. No cord entanglement, no placenta previa, no breech presentation observed on final ultrasound. Discussed risks/benefits with patient. Proceeded with C-section as per patient preference.',
    memberDetailsContext: 'Fitriani Sari, Female, 29 years old. Policy active for 3 years.',
    providerDetailsContext: 'RSIA Bunda Sejati, a maternity hospital. Has shown patterns of upcoding in the past.',
    claimHistorySummary: 'Previous claims for routine check-ups.',
    documents: [],
    auditTrail: [
        { timestamp: formatISO(setMinutes(setHours(subDays(today, 2), 11), 21)), event: 'Claim Ingested from File', user: 'System (Batch)' },
        { timestamp: formatISO(setMinutes(setHours(subDays(today, 1), 9), 46)), event: 'AI Abuse Alert: Unbundling Detected', user: 'IntelliPath AI', details: 'Omentectomy (49255) is likely bundled with C-Section (59510).' }
    ],
    dataQualityReview: {
      status: 'Flagged for FWA Investigation',
      flags: ['Potential Abuse', 'Unbundling'],
      notes: 'AI flagged for potential abuse due to unbundling. Omentectomy (49255) is typically included in the global package for a Cesarean delivery (59510) and should not be billed separately. This has inflated the claim value above the regional average. Requires review by Medical Advisor.',
      reviewedBy: 'IntelliPath AI',
      reviewDate: formatISO(setMinutes(setHours(subDays(today, 1), 9), 46))
    },
  },
  {
    id: 'CLAIM006',
    claimNumber: 'CN-2025-05-006',
    patientName: 'Maryanto',
    memberId: 'MEM-FRAUD-001',
    submissionDate: formatISO(setMinutes(setHours(subDays(today, 1), 8), 5)),
    lastUpdateDate: formatISO(setMinutes(setHours(today, 9), 15)),
    status: 'Flagged for Audit',
    processingStatus: 'ReviewRequired',
    riskLevel: 'High',
    predictedTATDays: 14,
    policyNumber: 'POL-CORP-A-111',
    policyHolderName: 'PT Cipta Karya',
    providerName: 'RS Siloam Lippo Village',
    providerId: 'PROV-SLV-001',
    claimAmount: 31234566,
    currency: 'IDR',
    diagnosisCodes: [{ code: 'M17.11', description: 'Unilateral primary osteoarthritis, right knee' }],
    procedureCodes: [{ code: '27447', description: 'Arthroplasty, knee, condyle and plateau' }],
    claimSource: 'File Upload',
    claimType: 'Institutional (UB-04)',
    batchId: 'BATCH-UPLOAD-20250531-001',
    claimDetailsFull: 'Claim for knee arthroplasty for patient Maryanto at RS Siloam Lippo Village.',
    medicalRecordSummary: 'EMR Note (Orthopedic Surgeon): Patient with severe right knee osteoarthritis, failed conservative treatment. Pre-op assessment confirms suitability for total knee arthroplasty.',
    memberDetailsContext: 'Maryanto, Male, 58 years old. Policy active for 2 years.',
    providerDetailsContext: 'RS Siloam Lippo Village, large hospital group.',
    claimHistorySummary: 'No major claims in the last year.',
    documents: [],
    auditTrail: [
        { timestamp: formatISO(setMinutes(setHours(subDays(today, 1), 8), 5)), event: 'Claim Ingested from File', user: 'System (Batch)' },
        { timestamp: formatISO(setMinutes(setHours(today, 9), 16)), event: 'AI Fraud Alert: Identical Amount', user: 'IntelliPath AI', details: 'Identical claim value found for claim CN-2025-05-007.' }
    ],
    dataQualityReview: {
      status: 'Flagged for FWA Investigation',
      flags: ['Potential Fraud', 'Pattern Anomaly'],
      notes: 'AI flagged: Identical claim amount (IDR 31,234,566) as claim CN-2025-05-007 at a different provider for a different patient. This is highly suspicious and requires manual investigation of physical claim documents.',
      reviewedBy: 'IntelliPath AI',
      reviewDate: formatISO(setMinutes(setHours(today, 9), 16))
    },
    relatedClaims: ['CLAIM007']
  },
  {
    id: 'CLAIM007',
    claimNumber: 'CN-2025-05-007',
    patientName: 'Catherine',
    memberId: 'MEM-FRAUD-002',
    submissionDate: formatISO(setMinutes(setHours(subDays(today, 1), 10), 30)),
    lastUpdateDate: formatISO(setMinutes(setHours(today, 9), 15)),
    status: 'Flagged for Audit',
    processingStatus: 'ReviewRequired',
    riskLevel: 'High',
    predictedTATDays: 14,
    policyNumber: 'POL-CORP-B-222',
    policyHolderName: 'PT Global Sejahtera',
    providerName: 'RS Mayapada',
    providerId: 'PROV-MYP-001',
    claimAmount: 31234566,
    currency: 'IDR',
    diagnosisCodes: [{ code: 'M16.11', description: 'Unilateral primary osteoarthritis, right hip' }],
    procedureCodes: [{ code: '27130', description: 'Arthroplasty, acetabular and proximal femoral prosthetic replacement' }],
    claimSource: 'API: CoreSystemX',
    claimType: 'Institutional (UB-04)',
    batchId: 'BATCH-API-CSX-20250531-001',
    claimDetailsFull: 'Claim for hip arthroplasty for patient Catherine at RS Mayapada.',
    medicalRecordSummary: 'EMR Note (Orthopedic Surgeon): Patient with severe right hip osteoarthritis, limited mobility. Pre-op X-rays confirm diagnosis. Total hip arthroplasty performed without complications.',
    memberDetailsContext: 'Catherine, Female, 62 years old. Policy active for 5 years.',
    providerDetailsContext: 'RS Mayapada, large hospital group.',
    claimHistorySummary: 'History of consultations for osteoarthritis.',
    documents: [],
    auditTrail: [
        { timestamp: formatISO(setMinutes(setHours(subDays(today, 1), 10), 30)), event: 'Claim Ingested from API', user: 'System (API)' },
        { timestamp: formatISO(setMinutes(setHours(today, 9), 16)), event: 'AI Fraud Alert: Identical Amount', user: 'IntelliPath AI', details: 'Identical claim value found for claim CN-2025-05-006.' }
    ],
    dataQualityReview: {
      status: 'Flagged for FWA Investigation',
      flags: ['Potential Fraud', 'Pattern Anomaly'],
      notes: 'AI flagged: Identical claim amount (IDR 31,234,566) as claim CN-2025-05-006 at a different provider for a different patient. This is highly suspicious and requires manual investigation of physical claim documents.',
      reviewedBy: 'IntelliPath AI',
      reviewDate: formatISO(setMinutes(setHours(today, 9), 16))
    },
    relatedClaims: ['CLAIM006']
  },
  {
    id: 'CLAIM003',
    claimNumber: 'CN-2025-05-003',
    patientName: 'Rizky Pratama',
    memberId: 'MEM-24680',
    submissionDate: formatISO(setMinutes(setHours(subDays(today, 2), 11), 25)),
    lastUpdateDate: formatISO(setMinutes(setHours(today, 10), 0)),
    status: 'Flagged for Audit', 
    processingStatus: 'ReviewRequired',
    riskLevel: 'High',
    predictedTATDays: 10,
    policyNumber: 'POL-DEF-003',
    policyHolderName: 'PT Maju Bersama',
    providerName: 'RS Medika Utama',
    providerId: 'PROV-RMU-003',
    claimAmount: 25000000,
    currency: 'IDR',
    diagnosisCodes: [{ code: 'S72.001A', description: 'Fracture of head of right femur, initial encounter for closed fracture' }],
    procedureCodes: [{ code: '27236', description: 'Percutaneous skeletal fixation of femoral neck fracture' }],
    claimSource: 'External',
    claimType: 'Institutional (UB-04)',
    batchId: 'BATCH-UPLOAD-20250530-001',
    lineItems: [ /* ... */ ],
    claimDetailsFull: 'Patient Rizky Pratama admitted to RS Medika Utama for femoral neck fracture. Underwent percutaneous skeletal fixation. Claim includes surgery, hospitalization, and medication costs.',
    memberDetailsContext: 'Rizky Pratama, Male, 28 years old. New policy, active for 3 months (relative to 2025-06-01). No prior claim history.',
    providerDetailsContext: 'RS Medika Utama, specialized orthopedic hospital. High claim volume. Some past billing irregularities noted.',
    claimHistorySummary: 'No previous claims.',
    documents: [ /* ... */ ],
    auditTrail: [ /* ... */ ],
    dataQualityReview: {
        status: 'Flagged for FWA Investigation',
        flags: ['Potential Fraud', 'Pattern Anomaly'],
        notes: 'AI flagged for high fraud probability (new policy, high amount). Data also suggests provider billing pattern requires scrutiny before using for training.',
        reviewedBy: 'AI System (Initial Flag)',
        reviewDate: formatISO(setMinutes(setHours(today, 10), 0))
    }
  },
  {
    id: 'CLAIM008',
    claimNumber: 'CN-2025-05-008',
    patientName: 'Eko Prasetyo',
    memberId: 'MEM-WASTE-001',
    submissionDate: formatISO(setMinutes(setHours(subDays(today, 4), 18), 0)),
    lastUpdateDate: formatISO(setMinutes(setHours(subDays(today, 1), 14), 10)),
    status: 'Flagged for Audit',
    processingStatus: 'ReviewRequired',
    riskLevel: 'High',
    predictedTATDays: 12,
    policyNumber: 'POL-CORP-C-333',
    policyHolderName: 'Perusahaan Maju Jaya',
    providerName: 'Klinik Medika Sejahtera',
    providerId: 'PROV-KMS-001',
    claimAmount: 15500000,
    currency: 'IDR',
    diagnosisCodes: [{ code: 'J02.9', description: 'Acute pharyngitis, unspecified' }],
    procedureCodes: [
        { code: '99284', description: 'Emergency dept visit, high severity' },
        { code: '99221', description: 'Initial hospital care' },
        { code: 'J0171', description: 'Injection, ceftriaxone sodium, per 250 mg' },
        { code: '85027', description: 'Complete (CBC), automated' },
        { code: '80076', description: 'Hepatic function panel' },
        { code: '86431', description: 'Rheumatoid factor; qualitative' },
        { code: '86140', description: 'C-reactive protein' },
        { code: '87081', description: 'Culture, presumptive, screening only' },
        { code: '83036', description: 'Hemoglobin A1c' },
        { code: '82550', description: 'Creatine kinase (CK), (CPK); total' },
        { code: '84484', description: 'Troponin, quantitative' }
    ],
    claimSource: 'File Upload',
    claimType: 'Institutional (UB-04)',
    batchId: 'BATCH-UPLOAD-20250530-001',
    claimDetailsFull: 'Patient Eko Prasetyo admitted via ER for acute pharyngitis. Received inpatient care, IV antibiotics, and a comprehensive set of lab tests. All lab results from provided documents are within normal limits.',
    medicalRecordSummary: 'EMR Note (General Practitioner): Patient presents with sore throat and fever. Admitted for observation. Lab panel ordered to rule out complications. All lab results WNL (Within Normal Limits).',
    memberDetailsContext: 'Eko Prasetyo, Male, 32 years old. Policy active for 1 year.',
    providerDetailsContext: 'Klinik Medika Sejahtera. Small clinic with a recent spike in inpatient admissions for minor diagnoses.',
    claimHistorySummary: 'No prior claims.',
    documents: [],
    auditTrail: [
        { timestamp: formatISO(setMinutes(setHours(subDays(today, 4), 18), 0)), event: 'Claim Ingested from File', user: 'System (Batch)' },
        { timestamp: formatISO(setMinutes(setHours(subDays(today, 1), 14), 12)), event: 'AI Waste/Overutilization Alert', user: 'IntelliPath AI', details: 'Extensive testing and inpatient care for a minor diagnosis (Pharyngitis).' }
    ],
    dataQualityReview: {
      status: 'Flagged for FWA Investigation',
      flags: ['Potential Waste', 'Potential Abuse'],
      notes: 'AI flagged for potential waste/overutilization. Diagnosis of uncomplicated pharyngitis (J02.9) does not typically justify inpatient admission, IV antibiotics, and an extensive battery of unrelated lab tests (cardiac, metabolic, rheumatic). All lab results were reportedly normal. Requires review by a Medical Advisor.',
      reviewedBy: 'IntelliPath AI',
      reviewDate: formatISO(setMinutes(setHours(subDays(today, 1), 14), 12))
    },
  },
  {
    id: 'CLAIM001',
    claimNumber: 'CN-2025-05-001',
    patientName: 'Budi Santoso',
    memberId: 'MEM-12345',
    submissionDate: formatISO(setMinutes(setHours(subDays(today, 5), 9), 30)),
    lastUpdateDate: formatISO(setMinutes(setHours(subDays(today, 1), 10), 5)),
    status: 'Pending Review', 
    processingStatus: 'Enriched', 
    riskLevel: 'Medium',
    predictedTATDays: 5,
    policyNumber: 'POL-ABC-001',
    policyHolderName: 'PT Sejahtera Abadi',
    providerName: 'RS Harapan Kita',
    providerId: 'PROV-HK-001',
    claimAmount: 1500000,
    currency: 'IDR',
    diagnosisCodes: [{ code: 'J45.909', description: 'Unspecified asthma with exacerbation' }],
    procedureCodes: [{ code: '99213', description: 'Office outpatient visit est, mod complexity' }],
    claimSource: 'Manual', 
    claimType: 'Professional (CMS-1500)',
    batchId: 'BATCH-MANUAL-20250527-001',
    lineItems: [
      {
        id: 'L001',
        serviceDate: formatISO(subDays(today, 5)),
        procedureCode: '99213',
        procedureDescription: 'Office outpatient visit, est, mod complexity',
        diagnosisCodes: ['J45.909'],
        units: 1,
        chargeAmount: 800000,
        status: 'Pending',
      },
      {
        id: 'L002',
        serviceDate: formatISO(subDays(today, 5)),
        procedureCode: 'J1030',
        procedureDescription: 'Injection, methylprednisolone acetate, 80 mg',
        diagnosisCodes: ['J45.909'],
        units: 1,
        chargeAmount: 700000,
        status: 'Pending',
      }
    ],
    claimDetailsFull: 'Patient Budi Santoso visited RS Harapan Kita on [Date] for asthma exacerbation. Received consultation and medication. Claim includes doctor fees and pharmacy charges.',
    memberDetailsContext: 'Budi Santoso, Male, 35 years old. Policy active since 2022. No recent high-value claims. Standard plan coverage.',
    providerDetailsContext: 'RS Harapan Kita, general hospital, accredited. Moderate claim volume. No history of fraudulent activity.',
    claimHistorySummary: 'Previous claims: 2 minor consultations in the last 2 years, both approved quickly.',
    documents: [
      { name: 'KTP_Budi_S.pdf', url: '#', category: 'KTP' },
      { name: 'SEP_CLAIM001_2025.pdf', url: '#', category: 'SEP' },
      { name: 'Diagnosis_Sheet_Asthma_2025.pdf', url: '#', category: 'Diagnosis Sheet' },
    ],
    auditTrail: [
      { timestamp: formatISO(setMinutes(setHours(subDays(today, 5), 9), 30)), event: 'Claim Submitted', user: 'System (Portal)' },
      { timestamp: formatISO(setMinutes(setHours(subDays(today, 4), 11), 0)), event: 'Initial Validation Passed', user: 'Rule Engine' },
      { timestamp: formatISO(setMinutes(setHours(subDays(today, 1), 10), 5)), event: 'Assigned for IntelliPath Review', user: 'System', details: 'Assigned to John Doe for data quality check' },
    ],
    dataQualityReview: { 
      status: 'No Decision Yet',
      flags: [],
      notes: 'Awaiting data quality review.',
      reviewedBy: 'System',
      reviewDate: formatISO(setMinutes(setHours(subDays(today, 1), 10), 5))
    }
  },
  {
    id: 'CLAIM005',
    claimNumber: 'CN-2025-05-005',
    patientName: 'Agus Wijaya',
    memberId: 'MEM-99887',
    submissionDate: formatISO(setMinutes(setHours(subDays(today, 7), 10), 0)),
    lastUpdateDate: formatISO(setMinutes(setHours(subDays(today, 1), 15), 0)),
    status: 'Approved', 
    processingStatus: 'Processed', 
    riskLevel: 'High', 
    predictedTATDays: 2, 
    policyNumber: 'POL-JKL-005',
    policyHolderName: 'Warung Makan Sederhana',
    providerName: 'Klinik Cepat Sehat',
    providerId: 'PROV-KCS-005',
    claimAmount: 7500000,
    approvedAmount: 7500000,
    currency: 'IDR',
    diagnosisCodes: [{ code: 'J00', description: 'Common cold' }],
    procedureCodes: [
      { code: '80053', description: 'Comprehensive metabolic panel' },
      { code: '73721', description: 'MRI, lower extremity, non-contrast (ankle)' }, 
      { code: '99214', description: 'Office outpatient visit, est, mod-high complexity' } 
    ],
    claimSource: 'File Upload', 
    claimType: 'Professional (CMS-1500)',
    batchId: 'BATCH-UPLOAD-20250530-001',
    lineItems: [
      { id: 'L005-1', serviceDate: formatISO(subDays(today, 7)), procedureCode: '99214', diagnosisCodes: ['J00'], units: 1, chargeAmount: 1500000, status: 'Approved' },
      { id: 'L005-2', serviceDate: formatISO(subDays(today, 7)), procedureCode: '80053', diagnosisCodes: ['J00'], units: 1, chargeAmount: 2500000, status: 'Approved' },
      { id: 'L005-3', serviceDate: formatISO(subDays(today, 7)), procedureCode: '73721', diagnosisCodes: ['J00'], units: 1, chargeAmount: 3500000, status: 'Approved' },
    ],
    claimDetailsFull: 'Patient Agus Wijaya presented with symptoms of common cold. Received office visit, comprehensive blood panel, and an MRI of the ankle. Claim submitted by Klinik Cepat Sehat.',
    memberDetailsContext: 'Agus Wijaya, Male, 45 years old. Policy active for 5 years. Occasional minor claims for outpatient visits.',
    providerDetailsContext: 'Klinik Cepat Sehat, new clinic with low overall volume but several recent high-cost claims for routine diagnoses.',
    claimHistorySummary: 'Primarily low-cost claims for common illnesses in the past.',
    documents: [ { name: 'Referral_Scan_2025.pdf', url:'#', category: 'Medical Record'} ],
    auditTrail: [
      { timestamp: formatISO(setMinutes(setHours(subDays(today, 7), 10), 0)), event: 'Claim Submitted via File Upload', user: 'System (Batch Upload)' },
      { timestamp: formatISO(setMinutes(setHours(subDays(today, 6), 14), 30)), event: 'Initial Validation Passed', user: 'Rule Engine' },
      { timestamp: formatISO(setMinutes(setHours(subDays(today, 5), 9), 0)), event: 'AI Enrichment Completed', user: 'IntelliPath AI' },
      { timestamp: formatISO(setMinutes(setHours(subDays(today, 1), 15), 5)), event: 'Data Quality Review Flagged for FWA', user: 'Analyst User (Rina)', details: 'Marked as potential waste and abuse due to unnecessary high-cost diagnostics for common cold.'}
    ],
    dataQualityReview: {
        status: 'Flagged for FWA Investigation',
        flags: ['Potential Waste', 'Potential Abuse', 'Pattern Anomaly'],
        notes: 'Excessive and medically unnecessary diagnostic tests (CMP, MRI ankle) for a common cold (J00). High complexity visit for a simple diagnosis. This claim is not suitable for AI training as is and requires FWA investigation.',
        reviewedBy: 'Rina P. (Analyst)',
        reviewDate: formatISO(setMinutes(setHours(subDays(today, 1), 15), 5))
    }
  },
  {
    id: 'CLAIM002',
    claimNumber: 'CN-2025-05-002',
    patientName: 'Siti Aminah',
    memberId: 'MEM-67890',
    submissionDate: formatISO(setMinutes(setHours(subDays(today, 10), 14), 0)),
    lastUpdateDate: formatISO(setMinutes(setHours(subDays(today, 2), 17), 0)),
    status: 'Approved', 
    processingStatus: 'Processed',
    riskLevel: 'Low',
    predictedTATDays: 3,
    policyNumber: 'POL-XYZ-002',
    policyHolderName: 'CV Jaya Makmur',
    providerName: 'Klinik Sehat Selalu',
    providerId: 'PROV-KSS-002',
    claimAmount: 750000,
    approvedAmount: 750000,
    currency: 'IDR',
    diagnosisCodes: [{ code: 'M54.5', description: 'Low back pain' }],
    procedureCodes: [{ code: '97110', description: 'Therapeutic exercises' }],
    claimSource: 'HL7 FHIR',
    claimType: 'Professional (CMS-1500)',
    batchId: 'BATCH-API-HL7-20250522-001',
    lineItems: [ /* ... */ ],
    claimDetailsFull: 'Patient Siti Aminah underwent physiotherapy for low back pain at Klinik Sehat Selalu. Claim covers 3 sessions of therapeutic exercises.',
    memberDetailsContext: 'Siti Aminah, Female, 42 years old. Policy active since 2020. History of similar claims, all approved.',
    providerDetailsContext: 'Klinik Sehat Selalu, physiotherapy clinic, accredited. Low claim volume. Good standing.',
    claimHistorySummary: 'Previous claims: 1 series of physiotherapy last year for similar condition, approved.',
    documents: [ /* ... */ ],
    auditTrail: [ { timestamp: formatISO(setMinutes(setHours(subDays(today, 10), 14), 1)), event: 'Claim Ingested via HL7 FHIR API', user: 'System (API)' } ],
    dataQualityReview: {
      status: 'Accepted as Clean Data',
      flags: [],
      notes: 'Standard physiotherapy claim, data appears clean and consistent.',
      reviewedBy: 'AI System (Auto-Check)',
      reviewDate: formatISO(setMinutes(setHours(subDays(today, 9), 8), 0))
    },
    relatedClaims: ['CLAIM-PREV-2024-0987']
  },
  {
    id: 'CLAIM004',
    claimNumber: 'CN-2025-05-004',
    patientName: 'Dewi Lestari',
    memberId: 'MEM-13579',
    submissionDate: formatISO(setMinutes(setHours(subDays(today, 15), 16), 0)),
    lastUpdateDate: formatISO(setMinutes(setHours(subDays(today, 3), 13), 20)),
    status: 'Additional Info Required', 
    processingStatus: 'Raw', 
    riskLevel: 'Medium',
    predictedTATDays: 7,
    policyNumber: 'POL-GHI-004',
    policyHolderName: 'Yayasan Pendidikan Cerdas',
    providerName: 'RS Sentosa Jaya',
    providerId: 'PROV-RSJ-004',
    claimAmount: 5500000,
    currency: 'IDR',
    diagnosisCodes: [{ code: 'K29.70', description: 'Gastritis, unspecified, without bleeding' }],
    procedureCodes: [{ code: '44.13', description: 'Gastroscopy through artificial stoma' }], 
    claimSource: 'System', 
    claimType: 'Institutional (UB-04)',
    batchId: 'BATCH-UPLOAD-20250530-001',
    lineItems: [ /* ... */ ],
    claimDetailsFull: 'Patient Dewi Lestari reported for gastritis. Underwent gastroscopy. Provider submitted claim via system integration. Additional documentation for procedure necessity requested.',
    memberDetailsContext: 'Dewi Lestari, Female, 50 years old. Long-term policy holder. Generally good health.',
    providerDetailsContext: 'RS Sentosa Jaya, large general hospital. High claim volume. Integrated via API for claim submission.',
    claimHistorySummary: 'One claim 3 years ago for minor surgery, approved.',
    documents: [ /* ... */ ],
    auditTrail: [ /* ... */ ],
    dataQualityReview: {
        status: 'Requires Data Correction',
        flags: ['Missing Critical Information', 'Inconsistent Data'],
        notes: 'Gastroscopy for gastritis without clear indication/biopsy results. Needs clarification before it can be considered clean training data.',
        reviewedBy: 'Bambang S.',
        reviewDate: formatISO(setMinutes(setHours(subDays(today, 3), 13), 20))
    }
  }
];

// --- Critical Findings Log (dates updated) ---
const todayCriticalFindings = new Date('2025-06-01T00:00:00.000Z');
export const mockCriticalFindings: IdentifiedCriticalFinding[] = [
  {
    id: "cf-001",
    assessedOn: formatISO(subDays(todayCriticalFindings, 2)),
    diagnosisInformation: ["ICD-10: I21.3"], 
    procedureOrInterventionInformation: ["ICD-9-CM: 36.10"], 
    reason: "Acute STEMI diagnosis (mapped from I21.3) paired with coronary artery bypass graft procedure (mapped from 36.10) indicates a highly urgent and life-threatening situation.",
    source: "AI_Assessment",
    claimId: "CLAIM00X_2025", // Example updated claim ID
    clinicalPairingId: "PAIR_MYOCARDIAL_INFARCTION_CABG"
  },
  {
    id: "cf-002",
    assessedOn: formatISO(subDays(todayCriticalFindings, 5)),
    diagnosisInformation: ["SNOMED_CT: C34.90"], 
    procedureOrInterventionInformation: ["ICD-9-CM: 32.5"], 
    reason: "Diagnosis of lung cancer concept (mapped from C34.90) combined with a major surgical procedure concept like lobectomy (mapped from 32.5) signifies a complex and severe condition.",
    source: "AI_Assessment",
  },
  {
    id: "cf-003",
    assessedOn: formatISO(subDays(todayCriticalFindings, 10)),
    diagnosisInformation: ["Layman: Traumatic brain injury"], 
    procedureOrInterventionInformation: ["Term: Cranial sinus drainage"], 
    reason: "Traumatic brain injury concept paired with surgical intervention on the cranial sinus points to a critical emergency.",
    source: "Manual_Entry",
  },
  {
    id: "cf-004",
    assessedOn: formatISO(subDays(todayCriticalFindings, 1)),
    diagnosisInformation: ["ICD-10: N18.6"], 
    procedureOrInterventionInformation: ["Intervention: Hemodialysis"], 
    reason: "End-stage renal disease concept requiring hemodialysis represents a chronic, life-sustaining treatment for a critical organ failure.",
    source: "System_Rule",
  },
];


export const getMockClaims = (): Claim[] => mockClaims;

export const getMockClaimById = (id: string): Claim | undefined =>
  mockClaims.find(claim => claim.id === id);

export const getRecentClaims = (count: number = 5): Claim[] =>
  [...mockClaims]
    .sort((a,b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime())
    .slice(0, count);

export const getFlaggedClaims = (count: number = 5): Claim[] =>
  mockClaims.filter(claim => claim.riskLevel === 'High' || claim.riskLevel === 'Critical' || claim.status === 'Flagged for Audit')
    .sort((a,b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime())
    .slice(0, count);

export const getClaimsByStatus = (status: ClaimStatus): Claim[] =>
    mockClaims.filter(claim => claim.status === status);

export const getClaimsByRiskLevel = (riskLevel: RiskLevel): Claim[] =>
    mockClaims.filter(claim => claim.riskLevel === riskLevel);

export const claimSources: ClaimSource[] = ['Manual', 'System', 'External', 'EDI X12', 'HL7 FHIR', 'API Integration'];
export const claimTypes: ClaimType[] = ['Professional (CMS-1500)', 'Institutional (UB-04)', 'Dental (ADA)', 'Pharmacy', 'Vision', 'Other'];

export const getMockMedicalConcepts = (): MedicalConcept[] => mockMedicalConcepts;
export const getMockClinicalPairings = (): ClinicalPairing[] => mockClinicalPairings;

export function getConceptNameById (conceptId: string, concepts: MedicalConcept[] = mockMedicalConcepts): string {
  const concept = concepts.find(c => c.id === conceptId);
  return concept ? concept.conceptName : 'Unknown Concept';
};

export const getMockCriticalFindings = (): IdentifiedCriticalFinding[] => mockCriticalFindings;

    

    




