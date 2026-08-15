let mapsPromise = null;

function buildMapsFromDict(dict) {
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
}

export function loadConversionMaps() {
  if (!mapsPromise) {
    if (typeof window === 'undefined') {
      // Node.js environment (e.g. running tests)
      const fsImport = 'node:fs';
      mapsPromise = import(/* @vite-ignore */ fsImport).then((fs) => {
        const path = new URL('../data/dict.json', import.meta.url);
        const dict = JSON.parse(fs.readFileSync(path, 'utf8'));
        return buildMapsFromDict(dict);
      });
    } else {
      // Browser environment (Vite)
      mapsPromise = import('../data/dict.json').then((mod) => {
        const dict = mod.default ?? mod;
        return buildMapsFromDict(dict);
      });
    }
  }
  return mapsPromise;
}

/**
 * Synchronous conversion for text given loaded conversion maps.
 */
export function convertTextSync(text, toFormat, maps) {
  if (!text || toFormat === 'original' || !maps) return text;
  const { sToTMap, tToSMap } = maps;

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
 * Synchronous conversion for a single word given loaded conversion maps.
 */
export function convertWordSync(word, toFormat, maps) {
  if (!word || toFormat === 'original' || !maps) return word;
  const { dict, sToTMap, tToSMap } = maps;

  if (toFormat === 'traditional') {
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
    let result = '';
    for (const char of word) {
      result += sToTMap[char] || char;
    }
    return result;
  } else if (toFormat === 'simplified') {
    if (tToSMap[word]) return tToSMap[word];
    let result = '';
    for (const char of word) {
      result += tToSMap[char] || char;
    }
    return result;
  }
  return word;
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
  const maps = await loadConversionMaps();
  return convertTextSync(text, toFormat, maps);
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
  const maps = await loadConversionMaps();
  return convertWordSync(word, toFormat, maps);
}
