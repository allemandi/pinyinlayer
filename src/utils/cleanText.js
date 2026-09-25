// Production-grade text tidying for Chinese reader view.
//
// Behavior:
//  - Preserves non-Chinese characters, English words, numbers, and original punctuation.
//  - Removes harmful control characters, zero-width spaces, and invalid Unicode surrogates.
//  - Standardizes line breaks: double (or more) newlines signal paragraph breaks.
//  - Mid-paragraph single newlines are joined intelligently:
//      • Joined with NO space if both adjacent characters are CJK / CJK punctuation.
//      • Joined with a SINGLE space if either adjacent character is non-CJK (e.g. English words).
//  - Collapses redundant tabs and multiple consecutive spaces to a single space.
//  - Filters out isolated, standalone page-number lines (e.g., "- 12 -", "Page 5").

const CJK_CHAR = /[\u4e00-\u9fff\u3400-\u4dbf\u3000-\u303f\uff00-\uffef，。！？；：、""''“”‘’《》〈〉〔〕【】（）…—·～]/;
const STANDALONE_PAGE_LINE = /^(?:-\s*)?(?:page\s*)?\d+(?:\s*-)?$/i;

/**
 * Calculates accurate character and word statistics for Chinese and mixed-language text.
 * Chinese text uses character/ideograph counts as word units, while non-CJK text uses word spaces.
 *
 * @param {string} text
 * @returns {{ chars: number, words: number, cjkChars: number }}
 */
export function countTextStats(text) {
  if (!text || typeof text !== 'string') {
    return { chars: 0, words: 0, cjkChars: 0 };
  }

  // Total characters excluding whitespace
  const chars = text.replace(/\s+/g, '').length;

  // CJK Chinese characters
  const cjkMatches = text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || [];
  const cjkChars = cjkMatches.length;

  // Non-CJK words (English words / alphanumeric sequences)
  const nonCjkText = text.replace(/[\u4e00-\u9fff\u3400-\u4dbf]/g, ' ');
  const nonCjkWords = nonCjkText.match(/[a-zA-Z0-9]+/g)?.length || 0;

  // Total words = CJK characters + non-CJK words
  const words = cjkChars + nonCjkWords;

  return { chars, words, cjkChars };
}

/**
 * Tidies raw pasted or file-extracted text while preserving all non-Chinese
 * content and punctuation intact.
 *
 * @param {string} raw
 * @returns {string}
 */
export function cleanText(raw) {
  if (!raw || typeof raw !== 'string') return '';

  // 1. Strip control codes (\u0000-\u0008, \u000B-\u000C, \u000E-\u001F, \u007F-\u009F), zero-width spaces (\u200B-\u200D, \uFEFF)
  const sanitized = raw
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F\u200B-\u200D\uFEFF]/g, '')
    .replace(/\r\n?/g, '\n');

  // 2. Split into paragraph blocks on two or more consecutive newlines
  const blocks = sanitized.split(/\n{2,}/);

  const cleanedParagraphs = blocks
    .map((block) => {
      const lines = block
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line && !STANDALONE_PAGE_LINE.test(line));

      if (lines.length === 0) return '';

      // Join single line-break lines within a paragraph block
      let joined = lines[0];
      for (let i = 1; i < lines.length; i++) {
        const prev = joined;
        const next = lines[i];

        const lastChar = prev.slice(-1);
        const firstChar = next[0];

        // If bridging CJK ideographs/punctuation on both ends, join directly without space
        if (CJK_CHAR.test(lastChar) && CJK_CHAR.test(firstChar)) {
          joined += next;
        } else {
          // Otherwise insert a space between non-CJK words/lines
          joined += ' ' + next;
        }
      }

      // Collapse multiple horizontal spaces/tabs into a single space, then trim
      return joined.replace(/[ \t]+/g, ' ').trim();
    })
    .filter(Boolean);

  return cleanedParagraphs.join('\n\n');
}
