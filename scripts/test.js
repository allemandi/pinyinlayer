import assert from 'node:assert';
import { cleanText } from '../src/utils/cleanText.js';
import { shouldShowPinyin } from '../src/utils/pinyinVisibility.js';
import { convertTextAsync, convertWordAsync } from '../src/utils/chineseConversion.js';
import { lookupWord } from '../src/utils/lookupWord.js';
import hskWords from '../src/data/hskWords.js';
import { encodeDeckPayload, decodeDeckPayload, getDeckShareUrl } from '../src/utils/deckShare.js';

async function run() {
  // Original checks
  const cleaned = cleanText('你好。\n\n世界。');
  assert.strictEqual(cleaned, '你好。\n\n世界。', 'cleanText should preserve Chinese punctuation and paragraph breaks');

  // Punctuation conversion tests
  const asciiPunctInput = '你好,世界!这是一个测试.真的吗?【是的】;“对”:(好的)...---~';
  const cleanedPunct = cleanText(asciiPunctInput);
  assert.strictEqual(
    cleanedPunct,
    '你好，世界！这是一个测试。真的吗？【是的】；“对”：（好的）……——～',
    'cleanText should convert ASCII punctuation to fullwidth Chinese equivalents'
  );

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
  const traditionalInput = '資訊是一個繁體字測試的句子';

  const toTraditional = await convertTextAsync(simplifiedInput, 'traditional');
  assert.strictEqual(toTraditional, '這是一個繁體字測試的句子', 'convertTextAsync should convert Simplified to Traditional');

  const toSimplified = await convertTextAsync(traditionalInput, 'simplified');
  assert.strictEqual(toSimplified, '资讯是一个繁体字测试的句子', 'convertTextAsync should convert Traditional to Simplified');

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

  // Synchronous conversion functions test
  const { loadConversionMaps, convertTextSync, convertWordSync } = await import('../src/utils/chineseConversion.js');
  const maps = await loadConversionMaps();
  assert.strictEqual(convertTextSync('测试', 'traditional', maps), '測試', 'convertTextSync converts text synchronously when maps are preloaded');
  assert.strictEqual(convertWordSync('测试', 'traditional', maps), '測試', 'convertWordSync converts words synchronously when maps are preloaded');

  // Vocab tagging state logic test
  let mockVocab = [
    { word: '你好', pinyin: 'nǐ hǎo', status: 'passed' },
    { word: '世界', pinyin: 'shì jiè', status: 'failed' }
  ];
  const tagStatus = (word, status) => {
    mockVocab = mockVocab.map((v) => (v.word === word ? { ...v, status } : v));
  };
  const clearStatuses = () => {
    mockVocab = mockVocab.map((v) => {
      const { status, ...rest } = v;
      return rest;
    });
  };

  tagStatus('你好', 'failed');
  assert.strictEqual(mockVocab.find((v) => v.word === '你好').status, 'failed', 'tagStatus should update vocab item status to failed');

  clearStatuses();
  assert.strictEqual(mockVocab.find((v) => v.word === '你好').status, undefined, 'clearStatuses should remove status tag from vocab items');

  // Deck Serialization and Sharing Tests
  const sampleDeck = {
    id: 'deck_123',
    name: 'HSK 4 Prep',
    words: [
      { word: '测试', pinyin: 'cè shì', definitions: ['to test', 'examination'] },
      { word: '学习', pinyin: 'xué xí', definitions: ['to study'] },
    ],
  };

  const encodedPayload = encodeDeckPayload(sampleDeck);
  assert.ok(typeof encodedPayload === 'string' && encodedPayload.length > 0, 'encodeDeckPayload should return a non-empty string');

  const shareUrl = getDeckShareUrl(sampleDeck);
  assert.ok(shareUrl.includes('?deck='), 'getDeckShareUrl should construct a full share URL containing ?deck= parameter');

  const decodedFromPayload = decodeDeckPayload(encodedPayload);
  assert.strictEqual(decodedFromPayload.name, 'HSK 4 Prep', 'decodeDeckPayload should accurately recover deck name');
  assert.strictEqual(decodedFromPayload.words.length, 2, 'decodeDeckPayload should recover all words');
  assert.strictEqual(decodedFromPayload.words[0].word, '测试', 'decodeDeckPayload should recover first word');

  const decodedFromUrl = decodeDeckPayload(shareUrl);
  assert.strictEqual(decodedFromUrl.name, 'HSK 4 Prep', 'decodeDeckPayload should parse full share URL');
  assert.strictEqual(decodedFromUrl.words.length, 2, 'decodeDeckPayload should recover words from full share URL');

  // Security Sanitization & Protocol Locking Tests
  const maliciousDeck = {
    name: '<script>alert("XSS")</script> Malicious Deck',
    words: [
      {
        word: '<img src=x onerror=alert(1)>测试',
        pinyin: 'cè<script> shì',
        definitions: ['<b onmouseover=alert(1)>def1</b>', 'normal def'],
      },
    ],
  };

  const encodedMalicious = encodeDeckPayload(maliciousDeck);
  const decodedMalicious = decodeDeckPayload(encodedMalicious);
  assert.ok(!decodedMalicious.name.includes('<script>'), 'decodeDeckPayload should strip HTML tags from deck name');
  assert.ok(!decodedMalicious.words[0].word.includes('<img'), 'decodeDeckPayload should sanitize word fields');
  assert.ok(!decodedMalicious.words[0].definitions[0].includes('<b'), 'decodeDeckPayload should sanitize definition HTML tags');

  // Protocol locking test
  const jsUri = 'javascript:alert(1)?deck=' + encodedPayload;
  assert.strictEqual(decodeDeckPayload(jsUri), null, 'decodeDeckPayload should reject javascript: protocol links');

  // Multi-Deck Copying / Moving Operations Test
  let mockDecks = [
    {
      id: 'default',
      name: 'Default Deck',
      words: [{ word: '苹果', pinyin: 'píng guǒ' }, { word: '香蕉', pinyin: 'xiāng jiāo' }],
    },
    {
      id: 'deck_hsk3',
      name: 'HSK 3 Fruits',
      words: [],
    },
  ];

  // Copy word '苹果' from default deck to deck_hsk3
  const sourceDeck = mockDecks.find((d) => d.id === 'default');
  const targetDeck = mockDecks.find((d) => d.id === 'deck_hsk3');
  const wordToCopy = sourceDeck.words.find((w) => w.word === '苹果');
  targetDeck.words.push(wordToCopy);

  assert.strictEqual(targetDeck.words.length, 1, 'Copying word should add item to target deck');
  assert.strictEqual(sourceDeck.words.length, 2, 'Copying word should leave item in source deck');

  // Move word '香蕉' from default deck to deck_hsk3
  sourceDeck.words = sourceDeck.words.filter((w) => w.word !== '香蕉');
  targetDeck.words.push({ word: '香蕉', pinyin: 'xiāng jiāo' });

  assert.strictEqual(sourceDeck.words.length, 1, 'Moving word should remove item from source deck');
  assert.strictEqual(targetDeck.words.length, 2, 'Moving word should add item to target deck');

  console.log('✅ All minimal tests passed');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
