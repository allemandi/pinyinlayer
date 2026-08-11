import assert from 'node:assert';
import { cleanText } from '../src/utils/cleanText.js';
import { shouldShowPinyin } from '../src/utils/pinyinVisibility.js';
import hskWords from '../src/data/hskWords.js';

async function run() {
  const cleaned = cleanText('你好。\n\n世界。');
  assert.strictEqual(cleaned, '你好。\n\n世界。', 'cleanText should preserve Chinese punctuation and paragraph breaks');

  const sample = Object.entries(hskWords).find(([, level]) => Number.isInteger(level));
  assert.ok(sample, 'hskWords must contain at least one entry with a numeric level');

  const [sampleWord, sampleLevel] = sample;
  const token = { text: sampleWord, chars: Array.from(sampleWord) };

  assert.strictEqual(shouldShowPinyin(true, 'all', token), true);
  assert.strictEqual(shouldShowPinyin(true, sampleLevel, token), false);
  assert.strictEqual(shouldShowPinyin(true, sampleLevel - 1, token), true);

  console.log('✅ All minimal tests passed');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
