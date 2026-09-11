// Sentence-level translation for the definition popover. CC-CEDICT gives
// word-by-word meanings but not sentence context, so this calls a small
// free translation API (MyMemory — no key required, fine for the light,
// on-demand volume a reading tool generates).
//
// Swap the body of this function for your preferred provider (e.g. a
// serverless function that calls DeepL/Google/OpenAI) without touching any
// caller — that's the point of keeping it isolated here.

const ENDPOINT = 'https://api.mymemory.translated.net/get';
const translationCache = new Map();

function decodeHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

function cleanTranslationOutput(text) {
  if (!text) return '';
  let cleaned = decodeHtmlEntities(text).trim();
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith('“') && cleaned.endsWith('”'))) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned.replace(/\s+/g, ' ');
}

export async function translateSentence(sentence) {
  const trimmed = sentence?.trim();
  if (!trimmed) return '';

  if (translationCache.has(trimmed)) {
    return translationCache.get(trimmed);
  }

  const url = `${ENDPOINT}?q=${encodeURIComponent(trimmed)}&langpair=zh-CN|en`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Translation request failed');

  const data = await res.json();
  const rawText = data?.responseData?.translatedText;
  if (!rawText || /INVALID|MYMEMORY WARNING/i.test(rawText)) {
    throw new Error('Translation unavailable');
  }

  const cleanedText = cleanTranslationOutput(rawText);
  translationCache.set(trimmed, cleanedText);

  // Keep cache bounded to 100 entries max
  if (translationCache.size > 100) {
    const firstKey = translationCache.keys().next().value;
    translationCache.delete(firstKey);
  }

  return cleanedText;
}
