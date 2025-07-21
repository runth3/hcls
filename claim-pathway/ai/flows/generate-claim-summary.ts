
'use server';

/**
 * @fileOverview Generates a summary of a claim, extracting the most important information.
 *
 * - generateClaimSummary - A function that generates a claim summary.
 * - GenerateClaimSummaryInput - The input type for the generateClaimSummary function.
 * - GenerateClaimSummaryOutput - The return type for the generateClaimSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateClaimSummaryInputSchema = z.object({
  claimDetails: z
    .string()
    .describe('The detailed information and medical summary of the claim to be summarized. This may contain notes from physicians, lab results, etc.'),
});
export type GenerateClaimSummaryInput = z.infer<typeof GenerateClaimSummaryInputSchema>;

const GenerateClaimSummaryOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the claim details.'),
});
export type GenerateClaimSummaryOutput = z.infer<typeof GenerateClaimSummaryOutputSchema>;

export async function generateClaimSummary(input: GenerateClaimSummaryInput): Promise<GenerateClaimSummaryOutput> {
  return generateClaimSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateClaimSummaryPrompt',
  input: {schema: GenerateClaimSummaryInputSchema},
  output: {schema: GenerateClaimSummaryOutputSchema},
  prompt: `You are an expert claim summarizer. Please summarize the following claim details, extracting the most important information for an auditor. Pay attention to the core diagnosis, key procedures, and any narrative details from medical professionals mentioned in the text that might influence the claim's validity or context.

Claim Details: {{{claimDetails}}}`,
});

const generateClaimSummaryFlow = ai.defineFlow(
  {
    name: 'generateClaimSummaryFlow',
    inputSchema: GenerateClaimSummaryInputSchema,
    outputSchema: GenerateClaimSummaryOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) {
        console.error('Genkit prompt returned nullish output for generateClaimSummaryFlow');
        return { summary: "AI summary generation failed or returned no content." };
      }
      return output;
    } catch (error) {
      console.error("Error in generateClaimSummaryFlow:", error);
      // Return a fallback output in case of an error from the AI service
      return { summary: "AI summary is currently unavailable due to a service issue. Please try again later." };
    }
  }
);
