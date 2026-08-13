import assert from 'node:assert';
import { cleanText } from '../src/utils/cleanText.js';
import { shouldShowPinyin } from '../src/utils/pinyinVisibility.js';
import { convertTextAsync, convertWordAsync } from '../src/utils/chineseConversion.js';
import { lookupWord } from '../src/utils/lookupWord.js';
import hskWords from '../src/data/hskWords.js';

async function run() {
  // Original checks
  const cleaned = cleanText('你好。\n\n世界。');
  assert.strictEqual(cleaned, '你好。\n\n世界。', 'cleanText should preserve Chinese punctuation and paragraph breaks');

  const sample = Object.entries(hskWords).find(([, level]) => Number.isInteger(level));
  assert.ok(sample, 'hskWords must contain at least one entry with a numeric level');

  const [sampleWord, sampleLevel] = sample;
  const token = { text: sampleWord, chars: Array.from(sampleWord) };

  assert.strictEqual(shouldShowPinyin(true, 'all', token), true);
  assert.strictEqual(shouldShowPinyin(true, sampleLevel, token), false);
  assert.strictEqual(shouldShowPinyin(true, sampleLevel - 1, token), true);

  // HSK Filter with Traditional / Original (using simpText and simpChars)
  const traditionalToken = {
    text: '測試',
    chars: ['測', '試'],
    simpText: '测试',
    simpChars: ['测', '试']
  };
  // 测试 / 測試 is HSK 4 ("测试":4)
  assert.strictEqual(shouldShowPinyin(true, 4, traditionalToken), false, 'Should hide pinyin for Traditional HSK 4 word when HSK filter is 4');
  assert.strictEqual(shouldShowPinyin(true, 3, traditionalToken), true, 'Should show pinyin for Traditional HSK 4 word when HSK filter is 3');

  // Character formatting & conversion tests
  const simplifiedInput = '这是一个繁体字测试的句子';
  const traditionalInput = '這是一個繁體字測試的句子';

  const toTraditional = await convertTextAsync(simplifiedInput, 'traditional');
  assert.strictEqual(toTraditional, '這是一個繁體字測試的句子', 'convertTextAsync should convert Simplified to Traditional');

  const toSimplified = await convertTextAsync(traditionalInput, 'simplified');
  assert.strictEqual(toSimplified, '这是一个繁体字测试的句子', 'convertTextAsync should convert Traditional to Simplified');

  const originalText = await convertTextAsync(traditionalInput, 'original');
  assert.strictEqual(originalText, traditionalInput, 'convertTextAsync with original format should not alter text');

  // Word level conversion
  const tradWord = await convertWordAsync('测试', 'traditional');
  assert.strictEqual(tradWord, '測試', 'convertWordAsync should correctly convert a full word to Traditional');

  const simpWord = await convertWordAsync('測試', 'simplified');
  assert.strictEqual(simpWord, '测试', 'convertWordAsync should correctly convert a full word to Simplified');

  // Lookup tests for Traditional inputs
  const results = await lookupWord('繁體字');
  assert.ok(results && results.length > 0, 'lookupWord should successfully resolve definitions for Traditional inputs');
  assert.strictEqual(results[0].p, 'fan2 ti3 zi4', 'lookupWord should retrieve the correct pinyin for Traditional input');

  console.log('✅ All minimal tests passed');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
