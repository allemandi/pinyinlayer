// HSK-trimmed CC-CEDICT lookup. The dictionary is built from HSK vocabulary
// only (see scripts/build-data.mjs) and lazy-loaded on first tap.
import { loadConversionMaps } from './chineseConversion.js';

/**
 * Looks up definitions for a word or phrase. Matches both Simplified and Traditional
 * Chinese inputs by utilizing dynamic mappings.
 *
 * @param {string} word
 * @returns {Promise<{ t?: string, p: string, d: string[] }[] | null>}
 */
export async function lookupWord(word) {
  if (!word) return null;
  const { dict, tToSMap } = await loadConversionMaps();

  // 1. Direct match (Simplified or exact match)
  if (dict[word]) return dict[word];

  // 2. Try converting word to Simplified for lookup
  let simplifiedWord = '';
  for (const char of word) {
    simplifiedWord += tToSMap[char] || char;
  }
  if (dict[simplifiedWord]) return dict[simplifiedWord];

  // 3. Fallback: character-by-character lookup with conversion fallback
  if (word.length > 1) {
    const perChar = Array.from(word)
      .map((char) => {
        if (dict[char]) return dict[char];
        const simpChar = tToSMap[char];
        if (simpChar && dict[simpChar]) return dict[simpChar];
        return null;
      })
      .filter(Boolean)
      .flat();
    if (perChar.length) return perChar.slice(0, 2);
  }

  return null;
}
