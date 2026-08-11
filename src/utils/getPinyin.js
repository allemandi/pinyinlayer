// pinyin-pro and segmentit both bundle sizeable lookup tables, so they're
// loaded on demand (first time text is actually sent to the reader) rather
// than in the initial bundle.
const CHINESE_CHAR = /[\u4e00-\u9fff\u3400-\u4dbf]/;

let enginePromise;
function loadEngine() {
  if (!enginePromise) {
    enginePromise = Promise.all([import('pinyin-pro'), import('segmentit')]).then(
      ([{ pinyin }, { useDefault, Segment }]) => ({
        pinyin,
        segmenter: useDefault(new Segment()),
      })
    );
  }
  return enginePromise;
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

  const { pinyin, segmenter } = await loadEngine();
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
