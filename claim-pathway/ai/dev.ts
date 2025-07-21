
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-claim-summary.ts';
import '@/ai/flows/claim-fraud-detection.ts';
import '@/ai/flows/tat-prediction.ts';
import '@/ai/flows/assess-claim-criticality.ts';
import '@/ai/flows/enrich-claim-data-flow.ts';
import '@/ai/flows/generate-patient-chronology.ts';
