// CC-CEDICT lookup. The dictionary is loaded on demand.
import { loadConversionMaps } from './chineseConversion.js';

/**
 * Checks if a definition string is purely a surname or abbreviation reference.
 *
 * @param {string} def
 * @returns {boolean}
 */
function isSurnameOrAbbr(def) {
  if (!def) return false;
  const s = def.trim();
  return /^surname\s+/i.test(s) || /^surname$/i.test(s) || /^abbr\.\s+for\s+/i.test(s);
}

/**
 * Filter character senses to prefer standard real-word meanings over surname/abbreviation entries.
 *
 * @param {{ t?: string, p: string, d: string[] }[]} senses
 * @returns {{ t?: string, p: string, d: string[] }[]}
 */
function filterSenses(senses) {
  if (!senses || !senses.length) return [];
  const nonSurname = senses.filter((s) => s.d && s.d.some((def) => !isSurnameOrAbbr(def)));
  return nonSurname.length > 0 ? nonSurname : senses;
}

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
  if (dict[word]) return filterSenses(dict[word]);

  // 2. Try converting word to Simplified for lookup
  let simplifiedWord = '';
  for (const char of word) {
    simplifiedWord += tToSMap[char] || char;
  }
  if (dict[simplifiedWord]) return filterSenses(dict[simplifiedWord]);

  // 3. Fallback: character-by-character lookup with conversion fallback
  if (word.length > 1) {
    const perChar = Array.from(word)
      .map((char) => {
        let senses = dict[char];
        if (!senses) {
          const simpChar = tToSMap[char];
          if (simpChar && dict[simpChar]) senses = dict[simpChar];
        }
        if (senses) {
          const filtered = filterSenses(senses);
          return filtered.length ? filtered : senses;
        }
        return null;
      })
      .filter(Boolean)
      .flat();
    if (perChar.length) return perChar.slice(0, 2);
  }

  return null;
}
