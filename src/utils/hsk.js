import hskWords from '../data/hskWords.js';

/**
 * Returns the HSK level for a word or phrase.
 * If the exact word is listed in hskWords, its HSK level is returned.
 * For unlisted multi-character phrases, the level is derived as the maximum
 * HSK level among its constituent characters.
 *
 * @param {string} text - The word or phrase to look up.
 * @returns {number | undefined} The HSK level (1-7), or undefined if unknown.
 */
export function getHskLevel(text) {
  if (!text) return undefined;
  if (hskWords[text] !== undefined) return hskWords[text];

  if (text.length > 1) {
    const charLevels = Array.from(text)
      .map((char) => hskWords[char])
      .filter((level) => level !== undefined);
    if (charLevels.length > 0) {
      return Math.max(...charLevels);
    }
  }

  return undefined;
}
