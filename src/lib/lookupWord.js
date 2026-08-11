// CC-CEDICT lookup. The dictionary (src/data/dict.json) is ~120k headwords
// derived from CC-CEDICT (see src/data/README.md for provenance); it's
// dynamically imported so it only downloads once the reader actually needs
// a definition, not on first paint.

let dictPromise;
function loadDict() {
  if (!dictPromise) {
    dictPromise = import('../data/dict.json').then((mod) => mod.default ?? mod);
  }
  return dictPromise;
}

/**
 * @param {string} word - a segmented Chinese word or phrase
 * @returns {Promise<{ t?: string, p: string, d: string[] }[] | null>}
 *   Array of dictionary senses (traditional form if it differs, pinyin,
 *   English definitions), or null if nothing was found.
 */
export async function lookupWord(word) {
  if (!word) return null;
  const dict = await loadDict();

  if (dict[word]) return dict[word];

  // Multi-character phrases that aren't in CC-CEDICT as a headword: fall
  // back to looking up each character individually so the popover still
  // shows something useful instead of "no definition found".
  if (word.length > 1) {
    const perChar = Array.from(word)
      .map((char) => dict[char])
      .filter(Boolean)
      .flat();
    if (perChar.length) return perChar.slice(0, 3);
  }

  return null;
}
