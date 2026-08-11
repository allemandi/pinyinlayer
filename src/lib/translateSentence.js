// Sentence-level translation for the definition popover. CC-CEDICT gives
// word-by-word meanings but not sentence context, so this calls a small
// free translation API (MyMemory — no key required, fine for the light,
// on-demand volume a reading tool generates).
//
// Swap the body of this function for your preferred provider (e.g. a
// serverless function that calls DeepL/Google/OpenAI) without touching any
// caller — that's the point of keeping it isolated here.

const ENDPOINT = 'https://api.mymemory.translated.net/get';

export async function translateSentence(sentence) {
  const trimmed = sentence?.trim();
  if (!trimmed) return '';

  const url = `${ENDPOINT}?q=${encodeURIComponent(trimmed)}&langpair=zh-CN|en`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Translation request failed');

  const data = await res.json();
  const text = data?.responseData?.translatedText;
  if (!text || /INVALID|MYMEMORY WARNING/i.test(text)) {
    throw new Error('Translation unavailable');
  }
  return text;
}
