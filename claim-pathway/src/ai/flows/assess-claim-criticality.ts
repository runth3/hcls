
'use server';
/**
 * @fileOverview An AI agent for assessing claim criticality based on diagnosis and procedure/intervention information.
 * It aims to be flexible with input coding systems (ICD-10, ICD-9-CM, SNOMED CT, layman's terms, etc.)
 * by attempting to map inputs to a conceptual knowledge base.
 *
 * - assessClaimCriticality - A function that handles the claim criticality assessment.
 * - AssessClaimCriticalityInput - The input type for the assessClaimCriticality function.
 * - AssessClaimCriticalityOutput - The return type for the assessClaimCriticality function.
 */

import {ai} from '@/ai/genkit';
import {z}from 'genkit';

// Input now accepts generic arrays of strings for diagnosis and procedure information.
// The AI prompt will guide interpretation.
const AssessClaimCriticalityInputSchema = z.object({
  diagnosisInformation: z
    .array(z.string())
    .min(1)
    .describe(
      'An array of diagnosis codes or terms associated with the claim (e.g., ["I21.3"], ["SNOMED_CT:74492003"], ["acute appendicitis"]). These can be from various coding systems or natural language.'
    ),
  procedureOrInterventionInformation: z
    .array(z.string())
    .min(1)
    .describe(
      'An array of procedure/intervention codes or terms associated with the claim (e.g., ["36.10"], ["CPT:99213"], ["antibiotic therapy"], ["appendectomy"]). These can be from various coding systems or natural language.'
    ),
});
export type AssessClaimCriticalityInput = z.infer<
  typeof AssessClaimCriticalityInputSchema
>;

const AssessClaimCriticalityOutputSchema = z.object({
  isCritical: z
    .boolean()
    .describe('Whether the claim is determined to be critical based on the conceptual pairing of diagnosis and procedure/intervention information.'),
  reason: z
    .string()
    .describe('The primary reason for the criticality assessment, explaining the interaction of the inferred medical concepts.'),
  suggestedPathway: z
    .enum(['Critical', 'Non-Critical', 'Undetermined'])
    .describe('The suggested pathway based on the criticality assessment.'),
});
export type AssessClaimCriticalityOutput = z.infer<
  typeof AssessClaimCriticalityOutputSchema
>;

export async function assessClaimCriticality(
  input: AssessClaimCriticalityInput
): Promise<AssessClaimCriticalityOutput> {
  return assessClaimCriticalityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'assessClaimCriticalityPrompt',
  input: {schema: AssessClaimCriticalityInputSchema},
  output: {schema: AssessClaimCriticalityOutputSchema},
  prompt: `You are an expert medical claims adjudicator specializing in determining claim criticality.
Your knowledge base contains 'MedicalConcepts' and 'ClinicalPairings'.

You will be given 'diagnosisInformation' and 'procedureOrInterventionInformation' for a claim. These inputs can be codes or natural language terms.

Your task is to:
1. Interpret the provided 'diagnosisInformation' and 'procedureOrInterventionInformation'. Attempt to map them to the most relevant MedicalConcepts.
2. Once you have inferred the core MedicalConcepts, evaluate the pairing between the inferred diagnosis concept(s) and the inferred procedure/intervention concept(s).
3. Consult your knowledge of ClinicalPairings. A claim is CRITICAL if the conceptual pairing suggests a highly severe, complex, urgent, or life-threatening medical situation. Your assessment should focus on the *interaction* and *implication* of these conceptual pairings.
4. Also consider any narrative details within the information provided. For example, if a note from a specialist confirms an urgent condition, this increases the likelihood of criticality.

Examples of CRITICAL conceptual pairings:
- Diagnosis Concept "Acute Myocardial Infarction" paired with Procedure Concept "Coronary Artery Bypass Graft".
- Diagnosis Concept "Malignant Lung Neoplasm" paired with Procedure Concept "Lobectomy of Lung".
- Diagnosis Concept "Traumatic Subdural Hemorrhage" paired with Procedure Concept "Craniotomy".

Examples of NON-CRITICAL conceptual pairings:
- Diagnosis Concept "Common Cold" paired with Intervention Concept "Rest and Hydration".

Provided Claim Information:
Diagnosis Information:
{{#each diagnosisInformation}}
- {{{this}}}
{{/each}}

Procedure/Intervention Information:
{{#each procedureOrInterventionInformation}}
- {{{this}}}
{{/each}}

Based on your assessment of these conceptual pairings and any supporting narrative:
1. Determine if the claim is critical ('isCritical').
2. Provide a concise 'reason' for your determination, specifically explaining how the combination of the inferred diagnosis and procedure/intervention concepts led to your conclusion.
3. Suggest the pathway ('suggestedPathway') as 'Critical' or 'Non-Critical'. If unable to determine, use 'Undetermined'.
`,
});

const assessClaimCriticalityFlow = ai.defineFlow(
  {
    name: 'assessClaimCriticalityFlow',
    inputSchema: AssessClaimCriticalityInputSchema,
    outputSchema: AssessClaimCriticalityOutputSchema,
  },
  async (input) => {
    const promptInput = {
      diagnosisInformation: input.diagnosisInformation,
      procedureOrInterventionInformation: input.procedureOrInterventionInformation,
    };
    try {
      const {output} = await prompt(promptInput);
      if (!output) {
          console.error('Genkit prompt returned nullish output for assessClaimCriticalityFlow');
          return {
            isCritical: false,
            reason: "AI criticality assessment failed or returned no content.",
            suggestedPathway: 'Undetermined'
          };
      }
      if (output.suggestedPathway === undefined) { // Ensure suggestedPathway is set if AI doesn't explicitly
         output.suggestedPathway = output.isCritical ? 'Critical' : 'Non-Critical';
      }
      return output;
    } catch (error) {
      console.error("Error in assessClaimCriticalityFlow:", error);
      return {
        isCritical: false,
        reason: "AI service for criticality assessment is currently unavailable. Please try again later.",
        suggestedPathway: 'Undetermined'
      };
    }
  }
);
