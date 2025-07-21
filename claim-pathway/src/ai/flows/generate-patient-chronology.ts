
'use server';
/**
 * @fileOverview An AI agent for generating a chronological timeline of a patient's service journey.
 *
 * - generatePatientChronology - A function that synthesizes various claim data points into a timeline.
 * - GeneratePatientChronologyInput - The input type for the function.
 * - GeneratePatientChronologyOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChronologyEventSchema = z.object({
  eventDate: z.string().describe('The full ISO timestamp (YYYY-MM-DDTHH:mm:ss.sssZ) or date (YYYY-MM-DD) of the event.'),
  eventName: z.string().describe('A concise description of the event.'),
  source: z.string().describe("The source of the information (e.g., 'Claim Submission', 'Medical Record', 'Audit Trail', 'AI Prediction')."),
  details: z.string().optional().describe('Additional details about the event.'),
  isPredicted: z.boolean().describe('True if this event is an AI prediction based on logical gaps, false if it is from provided data.'),
});

const GeneratePatientChronologyInputSchema = z.object({
    submissionDate: z.string().describe('The date the claim was submitted.'),
    serviceDates: z.array(z.string()).describe('A list of known service dates from line items.'),
    claimDetailsFull: z.string().describe('The full narrative of the claim.'),
    medicalRecordSummary: z.string().optional().describe('Summary from the patient\'s medical record.'),
    auditTrail: z.array(z.object({
        timestamp: z.string(),
        event: z.string(),
        user: z.string(),
        details: z.string().optional(),
    })).describe('The audit trail of the claim processing.'),
});
export type GeneratePatientChronologyInput = z.infer<typeof GeneratePatientChronologyInputSchema>;

const GeneratePatientChronologyOutputSchema = z.object({
  chronology: z.array(ChronologyEventSchema).describe('A chronologically sorted list of patient service events.'),
});
export type GeneratePatientChronologyOutput = z.infer<typeof GeneratePatientChronologyOutputSchema>;


export async function generatePatientChronology(input: GeneratePatientChronologyInput): Promise<GeneratePatientChronologyOutput> {
  return generatePatientChronologyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePatientChronologyPrompt',
  input: {schema: GeneratePatientChronologyInputSchema},
  output: {schema: GeneratePatientChronologyOutputSchema},
  prompt: `You are an expert medical data analyst. Your task is to construct a clear, chronological timeline of a patient's journey based on the provided claim data.
Synthesize information from the 'claimDetailsFull', 'medicalRecordSummary', and 'auditTrail'.

Instructions:
1.  Identify all key events mentioned in the provided data. Extract or infer the date and time for each event.
2.  Events include: patient admission, specific procedures, consultations, medication administration, key observations from notes, discharge, and claim processing milestones from the audit trail.
3.  Sort all identified events chronologically from oldest to newest.
4.  If there are logical gaps in the timeline (e.g., a gap between surgery and discharge), predict a plausible intermediate event (e.g., "Post-operative recovery period"). For any predicted event, you MUST set 'isPredicted' to true and briefly state the basis for the prediction in the 'details' field.
5.  For each event, specify the 'source' of the information (e.g., 'Medical Record', 'Claim Submission', 'Audit Trail', 'AI Prediction').
6.  Return the final timeline as an array of events.

Claim Submission Date: {{{submissionDate}}}

Known Service Dates:
{{#each serviceDates}}
- {{{this}}}
{{/each}}

Claim Details Narrative:
{{{claimDetailsFull}}}

Medical Record Summary:
{{{medicalRecordSummary}}}

Claim Processing Audit Trail:
{{#each auditTrail}}
- {{timestamp}}: {{event}} by {{user}} (Details: {{details}})
{{/each}}
`,
});

const generatePatientChronologyFlow = ai.defineFlow(
  {
    name: 'generatePatientChronologyFlow',
    inputSchema: GeneratePatientChronologyInputSchema,
    outputSchema: GeneratePatientChronologyOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) {
        console.error('Genkit prompt returned nullish output for generatePatientChronologyFlow');
        return { chronology: [] };
      }
      // Ensure the output is sorted one last time, as AI might not be perfect.
      output.chronology.sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
      return output;
    } catch (error) {
      console.error("Error in generatePatientChronologyFlow:", error);
      return { 
          chronology: [{
              eventDate: new Date().toISOString(),
              eventName: 'Error generating timeline',
              source: 'System',
              details: 'The AI service for chronology generation is currently unavailable.',
              isPredicted: false
          }]
      };
    }
  }
);
