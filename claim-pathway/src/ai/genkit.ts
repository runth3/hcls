
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  // This warning will appear in the Next.js server console during startup or first use.
  console.warn(
    'WARNING: GOOGLE_API_KEY is not set in environment variables. AI features may not work or may result in errors. Ensure your .env file is correctly configured with GOOGLE_API_KEY.'
  );
}

export const ai = genkit({
  // Pass the apiKey if it exists, otherwise an empty object to let the plugin use its default lookup.
  // If apiKey is defined (e.g. from .env loaded by Next.js), it will be used directly.
  // If apiKey is undefined, googleAI({}) allows the plugin to search for GEMINI_API_KEY, etc.
  plugins: [googleAI(apiKey ? {apiKey} : {})],
  model: 'googleai/gemini-2.0-flash',
});
