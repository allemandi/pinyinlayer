// pinyin-pro and segmentit both bundle sizeable lookup tables, so they're
// loaded on demand (first time text is actually sent to the reader) rather
// than in the initial bundle.
const CHINESE_CHAR = /[\u4e00-\u9fff\u3400-\u4dbf]/;

let enginePromise;
export function loadEngine() {
  if (!enginePromise) {
    enginePromise = Promise.all([import('pinyin-pro'), import('segmentit')])
      .then(([{ pinyin }, segmentitMod]) => {
        const Segment = segmentitMod.Segment || segmentitMod.default?.Segment;
        const useDefault = segmentitMod.useDefault || segmentitMod.default?.useDefault;
        return {
          pinyin,
          segmenter: useDefault(new Segment()),
        };
      })
      .catch((err) => {
        enginePromise = null;
        throw err;
      });
  }
  return enginePromise;
}

if (typeof window !== 'undefined') {
  loadEngine().catch(() => {});
}

/**
 * Breaks one cleaned paragraph into tap-able tokens synchronously using
 * a pre-loaded engine instance ({ pinyin, segmenter }).
 *
 * @param {string} paragraph
 * @param {{ pinyin: Function, segmenter: Object }} engine
 * @returns {{ text: string, chars: string[], pinyin: string[], isChinese: boolean }[]}
 */
export function tokenizeParagraphSync(paragraph, engine) {
  if (!paragraph || !engine) return [];

  const { pinyin, segmenter } = engine;
  const words = segmenter.doSegment(paragraph, { simple: true });

  return words.map((word) => {
    const isChinese = CHINESE_CHAR.test(word);
    const chars = Array.from(word);
    return {
      text: word,
      chars,
      isChinese,
      pinyin: isChinese ? pinyin(word, { type: 'array', toneType: 'symbol' }) : [],
    };
  });
}

/**
 * Breaks one cleaned paragraph into tap-able tokens (words/phrases, kept
 * together by segmentit's word-segmentation) and attaches per-character
 * pinyin to each. Non-Chinese tokens (punctuation, whitespace) pass through
 * untouched so the reader view can render them plainly.
 *
 * @param {string} paragraph
 * @returns {Promise<{ text: string, chars: string[], pinyin: string[], isChinese: boolean }[]>}
 */
export async function tokenizeParagraph(paragraph) {
  if (!paragraph) return [];
  const engine = await loadEngine();
  return tokenizeParagraphSync(paragraph, engine);
}
