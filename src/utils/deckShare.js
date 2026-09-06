/**
 * Deck serialization and share link utilities for PinyinLayer.
 * Serializes deck objects into compact, UTF-8 safe base64 URL parameters
 * and reconstructs deck objects from share links or raw payloads.
 */

/**
 * Encodes a deck object into a URL-safe base64 string.
 * @param {Object} deck - Deck object containing name and words array.
 * @returns {string} Encoded deck payload string.
 */
export function encodeDeckPayload(deck) {
  if (!deck || typeof deck !== 'object') return '';

  const payload = {
    v: 1,
    name: deck.name || 'Shared Deck',
    words: Array.isArray(deck.words)
      ? deck.words.map((w) => ({
          word: w.word,
          pinyin: w.pinyin || '',
          definitions: Array.isArray(w.definitions) ? w.definitions : [],
          status: w.status,
        }))
      : [],
  };

  try {
    const jsonStr = JSON.stringify(payload);
    const bytes = new TextEncoder().encode(jsonStr);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (err) {
    console.error('Failed to encode deck payload:', err);
    return '';
  }
}

/**
 * Decodes a share link or raw encoded string into a deck object.
 * Accepts full URLs (e.g., "https://pinyinlayer.netlify.app/?deck=..."),
 * query strings, or raw base64url payload strings.
 * @param {string} input - URL, query string, or base64url payload.
 * @returns {Object|null} Parsed deck object { name, words } or null if invalid.
 */
export function decodeDeckPayload(input) {
  if (!input || typeof input !== 'string') return null;

  let rawPayload = input.trim();

  // If full URL or query string, extract 'deck' parameter
  if (rawPayload.includes('?deck=') || rawPayload.includes('&deck=')) {
    try {
      const urlObj = new URL(rawPayload, 'https://localhost');
      const param = urlObj.searchParams.get('deck');
      if (param) {
        rawPayload = param;
      }
    } catch {
      // Fallback manual regex match
      const match = rawPayload.match(/[?&]deck=([^&]+)/);
      if (match && match[1]) {
        rawPayload = decodeURIComponent(match[1]);
      }
    }
  }

  try {
    // Reconstruct standard base64 from base64url
    let base64 = rawPayload.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }

    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const jsonStr = new TextDecoder().decode(bytes);
    const data = JSON.parse(jsonStr);

    if (data && typeof data === 'object' && Array.isArray(data.words)) {
      return {
        name: typeof data.name === 'string' && data.name.trim() ? data.name.trim() : 'Imported Deck',
        words: data.words
          .filter((w) => w && typeof w.word === 'string' && w.word.trim())
          .map((w) => ({
            word: w.word.trim(),
            pinyin: typeof w.pinyin === 'string' ? w.pinyin : '',
            definitions: Array.isArray(w.definitions) ? w.definitions : [],
            savedAt: Date.now(),
            ...(w.status ? { status: w.status } : {}),
          })),
      };
    }
  } catch (err) {
    console.error('Failed to decode deck payload:', err);
  }

  return null;
}

/**
 * Generates a complete shareable URL for a given deck.
 * @param {Object} deck - Deck object to generate link for.
 * @returns {string} Full shareable URL string.
 */
export function getDeckShareUrl(deck) {
  const payload = encodeDeckPayload(deck);
  if (!payload) return '';

  const origin = typeof window !== 'undefined' && window.location ? window.location.origin : 'https://pinyinlayer.netlify.app';
  const pathname = typeof window !== 'undefined' && window.location ? window.location.pathname : '/';

  return `${origin}${pathname}?deck=${payload}`;
}
