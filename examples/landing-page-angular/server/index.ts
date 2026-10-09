import { startFlowServer } from '@genkit-ai/express';
import { googleAI } from '@genkit-ai/google-genai';
import { genkit, z } from 'genkit';
import { DEFAULT_SYSTEM_PROMPT, defineRenderFlow } from 'genkitx-json-render';
// The Angular Material catalog without its components: loads no Angular, so it
// runs in Node. The client renders with `materialRegistry`, built from the same
// catalog, so the prompt, the validation and the render can't drift.
import { materialCatalog } from 'ngx-json-render-material/catalog';

// Reads GOOGLE_GENAI_API_KEY from the environment (see .env.example).
const ai = genkit({ plugins: [googleAI()] });

export const landingPage = defineRenderFlow(ai, {
  name: 'landingPage',
  catalog: materialCatalog,
  model: googleAI.model('gemini-2.5-flash'),
  inputSchema: z.object({ pitch: z.string().trim().min(4).max(400) }),
  buildPrompt: ({ pitch }) => `Generate a landing page for this pitch: ${pitch}`,
  instructions: {
    // Extend the plugin's default framing with this example's specifics.
    system: `${DEFAULT_SYSTEM_PROMPT} You are generating a marketing landing page for a startup pitch.`,
    rules: [
      'Use a vertical Stack as the root element.',
      'Open with a level 1 Heading, a supporting Text lead and a row of Chips for the audience.',
      'Show 3-5 benefits as Cards in a Grid, each with an Icon and a short Text.',
      'Close with a level 2 Heading and a filled Button.',
      'Keep copy punchy and specific to the pitch.',
    ],
  },
});

const port = Number(process.env.PORT ?? 3400);
startFlowServer({ flows: [landingPage], port, cors: { origin: true } });
console.log(`flow server on http://localhost:${port} (POST /landingPage)`);
