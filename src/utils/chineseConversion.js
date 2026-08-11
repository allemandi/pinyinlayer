let mapsPromise = null;

export function loadConversionMaps() {
  if (!mapsPromise) {
    if (typeof window === 'undefined') {
      // Node.js environment (e.g. running tests)
      mapsPromise = import('node:fs').then((fs) => {
        const path = new URL('../data/dict.json', import.meta.url);
        const dict = JSON.parse(fs.readFileSync(path, 'utf8'));
        const sToTMap = {};
        const tToSMap = {};

        for (const s of Object.keys(dict)) {
          const v = dict[s];
          const t = v[0]?.t;
          if (t && t !== s) {
            const d = v[0]?.d?.[0] || '';
            // Ignore old, obscure, or erroneous variants
            if (
              d.includes('variant of') ||
              d.includes('old variant of') ||
              d.includes('ancient variant') ||
              d.includes('erroneous variant')
            ) {
              continue;
            }
            sToTMap[s] = t;
            tToSMap[t] = s;
          }
        }
        return { dict, sToTMap, tToSMap };
      });
    } else {
      // Browser environment (Vite)
      mapsPromise = import('../data/dict.json').then((mod) => {
        const dict = mod.default ?? mod;
        const sToTMap = {};
        const tToSMap = {};

        for (const s of Object.keys(dict)) {
          const v = dict[s];
          const t = v[0]?.t;
          if (t && t !== s) {
            const d = v[0]?.d?.[0] || '';
            // Ignore old, obscure, or erroneous variants
            if (
              d.includes('variant of') ||
              d.includes('old variant of') ||
              d.includes('ancient variant') ||
              d.includes('erroneous variant')
            ) {
              continue;
            }
            sToTMap[s] = t;
            tToSMap[t] = s;
          }
        }
        return { dict, sToTMap, tToSMap };
      });
    }
  }
  return mapsPromise;
}

/**
 * Converts a string of Chinese text character by character based on format.
 * Loads dictionary dynamically to keep the initial JS bundle size minimal.
 *
 * @param {string} text
 * @param {'simplified' | 'traditional' | 'original'} toFormat
 * @returns {Promise<string>}
 */
export async function convertTextAsync(text, toFormat) {
  if (!text || toFormat === 'original') return text;
  const { sToTMap, tToSMap } = await loadConversionMaps();

  let result = '';
  for (const char of text) {
    if (toFormat === 'traditional') {
      result += sToTMap[char] || char;
    } else if (toFormat === 'simplified') {
      result += tToSMap[char] || char;
    } else {
      result += char;
    }
  }
  return result;
}

/**
 * Converts a specific Chinese word or phrase based on format.
 * Attempts a full-word match first, then falls back character by character.
 * Loads dictionary dynamically to keep the initial JS bundle size minimal.
 *
 * @param {string} word
 * @param {'simplified' | 'traditional' | 'original'} toFormat
 * @returns {Promise<string>}
 */
export async function convertWordAsync(word, toFormat) {
  if (!word || toFormat === 'original') return word;
  const { dict, sToTMap, tToSMap } = await loadConversionMaps();

  if (toFormat === 'traditional') {
    // Check if the word is a direct key in our dict and has a traditional mapping
    if (dict[word] && dict[word][0]?.t) {
      const d = dict[word][0]?.d?.[0] || '';
      if (
        !d.includes('variant of') &&
        !d.includes('old variant of') &&
        !d.includes('ancient variant') &&
        !d.includes('erroneous variant')
      ) {
        return dict[word][0].t;
      }
    }
    // Fallback: character-by-character
    let result = '';
    for (const char of word) {
      result += sToTMap[char] || char;
    }
    return result;
  } else if (toFormat === 'simplified') {
    // Check if the traditional form maps back to this word
    if (tToSMap[word]) return tToSMap[word];
    // Fallback: character-by-character
    let result = '';
    for (const char of word) {
      result += tToSMap[char] || char;
    }
    return result;
  }
  return word;
}
