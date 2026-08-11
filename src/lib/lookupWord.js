// HSK-trimmed CC-CEDICT lookup. The dictionary is built from HSK vocabulary
// only (see scripts/build-data.mjs) and lazy-loaded on first tap.

let dictPromise;
function loadDict() {
  if (!dictPromise) {
    dictPromise = import('../data/dict.json').then((mod) => mod.default ?? mod);
  }
  return dictPromise;
}

/**
 * @param {string} word
 * @returns {Promise<{ t?: string, p: string, d: string[] }[] | null>}
 */
export async function lookupWord(word) {
  if (!word) return null;
  const dict = await loadDict();

  if (dict[word]) return dict[word];

  if (word.length > 1) {
    const perChar = Array.from(word)
      .map((char) => dict[char])
      .filter(Boolean)
      .flat();
    if (perChar.length) return perChar.slice(0, 2);
  }

  return null;
}
