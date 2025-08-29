import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { evaluator, evaluateAnalysis } from '../hooks/evaluator';

const ALLOWED_TONES = ['Aggressive', 'Casual', 'Neutral', 'Positive', 'Formal', 'Urgent'];

(async () => {
  const msg = process.argv[2] ?? 'Hello from terminal';
  const MAX_CHARS = 150;

  try {
    // Structured evaluation
    const result = await evaluateAnalysis(msg, { maxChars: MAX_CHARS });
    console.log('Structured Result:', {
      tone: result.tone,
      analysis: result.analysis,
      rawLength: result.raw.length,
      formatted: result.formatted,
      formattedLength: result.formatted.length,
    });

    // Assertions
    if (!result.tone || !result.analysis) {
      throw new Error('Parsed tone or analysis is empty');
    }
    if (!result.formatted.includes('tone:') || !result.formatted.includes('analysis:')) {
      throw new Error('Formatted output missing required sections');
    }
    if (result.formatted.length > MAX_CHARS) {
      throw new Error(`Formatted output exceeds ${MAX_CHARS} characters`);
    }
    if (!ALLOWED_TONES.includes(result.tone)) {
      throw new Error(`Tone not in allowed set: ${result.tone}`);
    }

    // Backward-compatible check: formatted-string helper
    const out = await evaluator(msg);
    console.log('Formatted Output:', out, `\nLength: ${out.length}`);
    if (!out.includes('tone:') || !out.includes('analysis:')) {
      throw new Error('evaluator() output missing required sections');
    }
    if (out.length > MAX_CHARS) {
      throw new Error(`evaluator() output exceeds ${MAX_CHARS} characters`);
    }
    const toneMatch = out.match(/tone:\s*([A-Za-z]+)/);
    const outTone = toneMatch?.[1];
    if (!outTone || !ALLOWED_TONES.includes(outTone)) {
      throw new Error(`evaluator() tone not in allowed set: ${outTone ?? 'N/A'}`);
    }

    console.log('✅ testEvaluator.ts passed');
  } catch (err) {
    console.error('❌ testEvaluator.ts failed:', err);
    process.exit(1);
  }
})();