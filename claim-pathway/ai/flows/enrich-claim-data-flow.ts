
'use server';
/**
 * @fileOverview An AI agent for enriching simulated claim data and assessing its initial quality.
 *
 * - enrichClaimData - A function that takes raw claim input and returns an enriched version along with a data quality assessment.
 * - EnrichClaimDataInput - The input type for the enrichClaimData function.
 * - EnrichClaimDataOutput - The return type for the enrichClaimData function.
 */

import {ai}from '@/ai/genkit';
import {z}from 'zod';

// Schema for the raw input from the simulation form
const EnrichClaimDataInputSchema = z.object({
  patientName: z.string(),
  memberId: z.string(),
  policyNumber: z.string(),
  providerName: z.string(),
  claimAmount: z.number(),
  submissionDate: z.string().describe("The date the claim was submitted, in YYYY-MM-DD format."),
  serviceDate: z.string().optional().describe("The date services were rendered, in YYYY-MM-DD format. Optional."),
  claimSource: z.string().describe("The source of the claim batch, e.g., 'Manual Input', 'API Upload', 'EDI Batch'."),
  claimType: z.string(),
  diagnosisInfo: z.string().describe("Diagnosis codes or terms, comma-separated."),
  procedureInfo: z.string().describe("Procedure/intervention codes or terms, comma-separated."),
  claimScenarioDetails: z.string().optional(),
});
export type EnrichClaimDataInput = z.infer<typeof EnrichClaimDataInputSchema>;

// Schema for the enriched output
const EnrichClaimDataOutputSchema = z.object({
  patientName: z.string(),
  memberId: z.string(),
  policyNumber: z.string(),
  providerName: z.string(),
  providerFullAddress: z.string().describe("Plausible full address for the provider, as if looked up from an external directory."),
  providerType: z.string().describe("Plausible type of the provider (e.g., 'General Hospital', 'Specialty Clinic'), as if looked up."),
  claimAmount: z.number(),
  submissionDate: z.string(),
  serviceDate: z.string().describe("The date services were rendered. If originally missing, this will be a predicted date."),
  predictedServiceDate: z.boolean().describe("True if the serviceDate was predicted by the AI, false otherwise."),
  claimSource: z.string(),
  claimType: z.string(),
  diagnosisInfo: z.string(),
  procedureInfo: z.string(),
  claimScenarioDetails: z.string().optional(),
  submissionSeason: z.string().describe("The season (e.g., 'Spring', 'Summer', 'Autumn', 'Winter') derived from the submissionDate."),
  enrichedNotes: z.string().describe("Any notes or comments from the AI about the enrichment process."),
  aiDataQualityAssessment: z.enum(['Clean', 'RequiresReview']).describe("AI's assessment of the initial data quality after enrichment attempts."),
  aiReviewNotes: z.string().describe("AI's notes if data quality is 'RequiresReview', explaining why."),
  aiAmountAssessmentNotes: z.string().describe("AI's assessment of the claimAmount in relation to the services described, noting plausibility or potential need for line item review."),
});
export type EnrichClaimDataOutput = z.infer<typeof EnrichClaimDataOutputSchema>;

export async function enrichClaimData(input: EnrichClaimDataInput): Promise<EnrichClaimDataOutput> {
  return enrichClaimDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'enrichClaimDataPrompt',
  input: {schema: EnrichClaimDataInputSchema},
  output: {schema: EnrichClaimDataOutputSchema},
  prompt: `You are an expert data enrichment and quality assessment AI for healthcare claims.
You will receive simulated claim data. Your task is to:
1.  If 'serviceDate' is missing or empty, predict a plausible 'serviceDate' based on the 'submissionDate'. It should be on or before the 'submissionDate'. Set 'predictedServiceDate' to true if you predict it, otherwise false. If 'serviceDate' is provided, use it and set 'predictedServiceDate' to false.
2.  For the given 'providerName', generate a plausible 'providerFullAddress' and 'providerType' (e.g., "General Hospital", "Specialty Clinic", "Private Practice"). Imagine you are looking this up in a directory.
3.  Based on the 'submissionDate' (format YYYY-MM-DD), determine the 'submissionSeason' in the Northern Hemisphere (Spring: Mar-May, Summer: Jun-Aug, Autumn: Sep-Nov, Winter: Dec-Feb).
4.  Populate all original fields from the input into the output.
5.  Assess the overall quality of the provided input data after your enrichment attempts.
    - If the input data (patientName, memberId, policyNumber, providerName, claimAmount, submissionDate, diagnosisInfo, procedureInfo) seems reasonably complete and unambiguous, and your enrichment attempts were successful, set 'aiDataQualityAssessment' to 'Clean'. Set 'aiReviewNotes' to "Data appears suitable for further processing."
    - If critical information is missing and cannot be plausibly inferred (e.g., providerName is too vague for address lookup, diagnosis/procedure info is nonsensical), or if there are significant contradictions, set 'aiDataQualityAssessment' to 'RequiresReview'.
    - In 'aiReviewNotes', briefly explain why review is required if applicable (e.g., "Provider name too generic for address lookup," "Diagnosis information unclear," "Claim amount seems unusually high/low for the procedures listed.").
6.  Based on the 'diagnosisInfo', 'procedureInfo', and the total 'claimAmount', provide an assessment in 'aiAmountAssessmentNotes' regarding the plausibility of the 'claimAmount'. For example, note if it seems unusually high or low for the described services, or if it appears reasonable. State if a detailed line item review would be beneficial for a more accurate assessment.
7.  Add any relevant general 'enrichedNotes' about the process, for example, if you predicted a date or details about the provider lookup simulation.

Input Data:
Patient Name: {{{patientName}}}
Member ID: {{{memberId}}}
Policy Number: {{{policyNumber}}}
Provider Name: {{{providerName}}}
Claim Amount: {{{claimAmount}}}
Submission Date: {{{submissionDate}}}
Service Date: {{{serviceDate}}}
Claim Source: {{{claimSource}}}
Claim Type: {{{claimType}}}
Diagnosis Info: {{{diagnosisInfo}}}
Procedure Info: {{{procedureInfo}}}
Claim Scenario Details: {{{claimScenarioDetails}}}

Return the enriched data and quality assessment conforming to the EnrichClaimDataOutputSchema.
`,
});

const enrichClaimDataFlow = ai.defineFlow(
  {
    name: 'enrichClaimDataFlow',
    inputSchema: EnrichClaimDataInputSchema,
    outputSchema: EnrichClaimDataOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    // Ensure predictedServiceDate is explicitly set if not by AI
    if (output && output.predictedServiceDate === undefined && input.serviceDate) {
        output.predictedServiceDate = false;
    } else if (output && output.predictedServiceDate === undefined && !input.serviceDate) {
        // This case should ideally be handled by the AI based on the prompt
        // but as a fallback, if AI missed it and serviceDate was null.
        output.predictedServiceDate = true; 
        // output.serviceDate would also need to be set by AI or have a fallback.
    }
    // Fallback for AI quality assessment if somehow missed by the model
    if (output && !output.aiDataQualityAssessment) {
        output.aiDataQualityAssessment = 'RequiresReview';
        output.aiReviewNotes = 'AI quality assessment was not explicitly provided by the model; defaulting to requires review.';
    }
    if (output && !output.aiAmountAssessmentNotes) {
        output.aiAmountAssessmentNotes = 'AI assessment of claim amount was not explicitly provided by the model.';
    }
    return output!;
  }
);
