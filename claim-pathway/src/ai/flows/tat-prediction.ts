
'use server';
/**
 * @fileOverview An AI agent for predicting claim processing times.
 *
 * - predictTat - A function that handles the TAT prediction process.
 * - PredictTatInput - The input type for the predictTat function.
 * - PredictTatOutput - The return type for the predictTat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictTatInputSchema = z.object({
  claimDetails: z
    .string()
    .describe('Detailed information and medical summary about the claim, including codes, procedures, diagnoses, and any notes from physicians.'),
  memberDetails: z.string().describe('Details about the member associated with the claim.'),
  providerDetails: z.string().describe('Details about the provider who submitted the claim.'),
  claimHistory: z.string().describe('History of previous claims for the member.'),
});
export type PredictTatInput = z.infer<typeof PredictTatInputSchema>;

const PredictTatOutputSchema = z.object({
  predictedTat: z
    .string()
    .describe('The predicted turnaround time for the claim in days or weeks.'),
  confidenceScore: z
    .number()
    .describe('A score between 0 and 1 indicating the confidence level of the prediction.'),
  factors: z
    .string()
    .describe('The key factors influencing the TAT prediction, such as claim complexity or provider history.'),
});
export type PredictTatOutput = z.infer<typeof PredictTatOutputSchema>;

export async function predictTat(input: PredictTatInput): Promise<PredictTatOutput> {
  return predictTatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictTatPrompt',
  input: {schema: PredictTatInputSchema},
  output: {schema: PredictTatOutputSchema},
  prompt: `You are an expert claim processing time predictor. You will be given information about a claim, the member, the provider, and the member's claim history. Based on this information, you will predict the turnaround time (TAT).

Key Factors to Consider:
1.  **Claim Complexity**: Simple claims (e.g., routine check-up) have a shorter TAT. Complex surgeries have a longer TAT.
2.  **Data Quality & Credibility**: Analyze the 'claimDetails'. A claim with clear, complete information and notes from a specialist will likely have a shorter TAT. A claim with vague, contradictory, or missing information will have a longer TAT as it will require manual review.
3.  **Member & Provider History**: A member with a clean claim history or a provider in good standing might lead to a shorter TAT. Conversely, a history of flagged claims will increase TAT.
4.  **Flags & Audits**: If the claim has characteristics of potential Fraud, Waste, or Abuse (FWA), the TAT will be significantly longer.

Claim Details (Medical Summary): {{{claimDetails}}}
Member Details: {{{memberDetails}}}
Provider Details: {{{providerDetails}}}
Claim History: {{{claimHistory}}}

Based on these factors, predict the TAT, your confidence level (0-1), and list the primary factors that influenced your prediction.
`,
});

const predictTatFlow = ai.defineFlow(
  {
    name: 'predictTatFlow',
    inputSchema: PredictTatInputSchema,
    outputSchema: PredictTatOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) {
        console.error('Genkit prompt returned nullish output for predictTatFlow');
        return {
          predictedTat: "N/A",
          confidenceScore: 0,
          factors: "AI TAT prediction failed or returned no content."
        };
      }
      return output;
    } catch (error) {
      console.error("Error in predictTatFlow:", error);
      return {
        predictedTat: "Unavailable",
        confidenceScore: 0,
        factors: "AI service for TAT prediction is currently unavailable. Please try again later."
      };
    }
  }
);
