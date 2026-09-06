/**
 * Production-Grade Security-Sanitized Deck Serialization & Sharing for PinyinLayer.
 * Handles encoding, URL parsing, bounds enforcement, protocol locking, and XSS sanitization.
 */

const MAX_DECK_NAME_LENGTH = 40;
const MAX_WORDS_PER_DECK = 200;
const MAX_WORD_LENGTH = 20;
const MAX_PINYIN_LENGTH = 60;
const MAX_DEFINITIONS_PER_WORD = 5;
const MAX_DEFINITION_LENGTH = 150;
const MAX_PAYLOAD_BYTES = 32 * 1024; // 32 KB

const BASE64_URL_REGEX = /^[A-Za-z0-9_-]+$/;

/**
 * Sanitizes input text to prevent XSS, HTML/XML tag injection, and control code issues.
 */
export function sanitizeText(str = '', maxLength = 100) {
  if (typeof str !== 'string') return '';

  return str
    .replace(/<[^>]*>/g, '') // Strip all HTML/script tags
    .replace(/[<>&'"\\`]/g, (char) => {
      switch (char) {
        case '<': return '‹';
        case '>': return '›';
        case '&': return '&';
        case "'": return '’';
        case '"': return '”';
        case '`': return '‘';
        case '\\': return '＼';
        default: return char;
      }
    })
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control codes
    .trim()
    .slice(0, maxLength);
}

/**
 * Encodes a deck object into a URL-safe base64 payload with strict bounds enforcement.
 * @param {Object} deck - Deck object containing name and words array.
 * @returns {string} Encoded base64url payload string.
 */
export function encodeDeckPayload(deck) {
  if (!deck || typeof deck !== 'object') return '';

  const sanitizedName = sanitizeText(deck.name || 'Shared Deck', MAX_DECK_NAME_LENGTH);
  const rawWords = Array.isArray(deck.words) ? deck.words.slice(0, MAX_WORDS_PER_DECK) : [];

  const sanitizedWords = rawWords
    .filter((w) => w && typeof w.word === 'string' && w.word.trim())
    .map((w) => {
      const sanitizedDefs = Array.isArray(w.definitions)
        ? w.definitions
            .slice(0, MAX_DEFINITIONS_PER_WORD)
            .map((d) => sanitizeText(d, MAX_DEFINITION_LENGTH))
            .filter(Boolean)
        : [];

      return {
        word: sanitizeText(w.word, MAX_WORD_LENGTH),
        pinyin: sanitizeText(w.pinyin || '', MAX_PINYIN_LENGTH),
        definitions: sanitizedDefs,
        status: w.status === 'passed' || w.status === 'failed' ? w.status : undefined,
      };
    });

  const payload = {
    v: 1,
    name: sanitizedName,
    words: sanitizedWords,
  };

  try {
    const jsonStr = JSON.stringify(payload);
    const bytes = new TextEncoder().encode(jsonStr);

    if (bytes.length > MAX_PAYLOAD_BYTES) {
      console.warn('Deck payload exceeds 32KB size limit');
      return '';
    }

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
 * Validates and decodes a share link or raw base64url string into a clean deck object.
 * Strictly locks protocols (http/https only) and rejects oversized/malicious input.
 * @param {string} input - URL, query string, or base64url payload.
 * @returns {Object|null} Sanitized deck object { name, words } or null if invalid.
 */
export function decodeDeckPayload(input) {
  if (!input || typeof input !== 'string') return null;

  let rawPayload = input.trim();

  // Handle URL strings safely with protocol locking
  if (rawPayload.includes('?deck=') || rawPayload.includes('&deck=')) {
    // Protocol safety check: reject dangerous URI schemes
    const lower = rawPayload.toLowerCase();
    if (
      lower.startsWith('javascript:') ||
      lower.startsWith('data:') ||
      lower.startsWith('file:') ||
      lower.startsWith('blob:') ||
      lower.startsWith('vbscript:')
    ) {
      console.warn('Rejected invalid URL protocol in deck link');
      return null;
    }

    try {
      const urlObj = new URL(rawPayload, 'https://localhost');
      if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:' && urlObj.protocol !== 'file:') {
        // Only allow safe web protocols
        if (!urlObj.href.startsWith('https://localhost')) {
          console.warn('Rejected unsafe protocol:', urlObj.protocol);
          return null;
        }
      }
      const param = urlObj.searchParams.get('deck');
      if (param) {
        rawPayload = param;
      }
    } catch {
      const match = rawPayload.match(/[?&]deck=([^&]+)/);
      if (match && match[1]) {
        rawPayload = decodeURIComponent(match[1]);
      }
    }
  }

  // Reject oversized payloads immediately
  if (rawPayload.length > MAX_PAYLOAD_BYTES * 2) {
    console.warn('Deck payload exceeds length limit');
    return null;
  }

  // Ensure base64url string characters are valid
  const cleanBase64Url = rawPayload.replace(/[^A-Za-z0-9_-]/g, '');
  if (!cleanBase64Url || !BASE64_URL_REGEX.test(cleanBase64Url)) {
    return null;
  }

  try {
    let base64 = cleanBase64Url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }

    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    if (bytes.length > MAX_PAYLOAD_BYTES) {
      console.warn('Decoded payload exceeds max byte limit');
      return null;
    }

    const jsonStr = new TextDecoder().decode(bytes);
    const data = JSON.parse(jsonStr, (key, value) => {
      // Prototype pollution defense
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return undefined;
      }
      return value;
    });

    if (data && typeof data === 'object' && Array.isArray(data.words)) {
      const sanitizedName = sanitizeText(
        typeof data.name === 'string' && data.name.trim() ? data.name : 'Imported Deck',
        MAX_DECK_NAME_LENGTH
      );

      const sanitizedWords = data.words
        .slice(0, MAX_WORDS_PER_DECK)
        .filter((w) => w && typeof w.word === 'string' && w.word.trim())
        .map((w) => {
          const sanitizedDefs = Array.isArray(w.definitions)
            ? w.definitions
                .slice(0, MAX_DEFINITIONS_PER_WORD)
                .map((d) => sanitizeText(d, MAX_DEFINITION_LENGTH))
                .filter(Boolean)
            : [];

          return {
            word: sanitizeText(w.word, MAX_WORD_LENGTH),
            pinyin: sanitizeText(w.pinyin || '', MAX_PINYIN_LENGTH),
            definitions: sanitizedDefs,
            savedAt: Date.now(),
            ...(w.status === 'passed' || w.status === 'failed' ? { status: w.status } : {}),
          };
        });

      return {
        name: sanitizedName,
        words: sanitizedWords,
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

  const origin =
    typeof window !== 'undefined' && window.location && window.location.origin !== 'null'
      ? window.location.origin
      : 'https://pinyinlayer.netlify.app';
  const pathname =
    typeof window !== 'undefined' && window.location ? window.location.pathname : '/';

  return `${origin}${pathname}?deck=${payload}`;
}
