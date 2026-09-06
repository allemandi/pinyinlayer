/**
 * Security-sanitized Deck serialization and share link utilities for PinyinLayer.
 * Handles encoding, URL extraction, payload limits, and XSS sanitization
 * for sharing deck links safely across instances.
 */

const MAX_DECK_NAME_LENGTH = 60;
const MAX_WORDS_PER_DECK = 500;
const MAX_WORD_LENGTH = 30;
const MAX_PINYIN_LENGTH = 100;
const MAX_DEFINITIONS_PER_WORD = 10;
const MAX_DEFINITION_LENGTH = 300;
const MAX_PAYLOAD_BYTES = 64 * 1024; // 64 KB

/**
 * Sanitizes input text to prevent XSS, HTML injection, and control code issues.
 */
function sanitizeText(str = '', maxLength = 100) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[<>&'"]/g, (char) => {
      switch (char) {
        case '<': return '‹';
        case '>': return '›';
        case '&': return '&';
        case "'": return '’';
        case '"': return '”';
        default: return char;
      }
    })
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // remove control chars
    .trim()
    .slice(0, maxLength);
}

/**
 * Encodes a deck object into a URL-safe base64 string with bounds checking.
 * @param {Object} deck - Deck object containing name and words array.
 * @returns {string} Encoded deck payload string.
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
      console.warn('Deck payload exceeds maximum size limit (64KB)');
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
 * Decodes a share link or raw encoded string into a sanitized deck object.
 * Rejects oversized or malicious payloads.
 * @param {string} input - URL, query string, or base64url payload.
 * @returns {Object|null} Sanitized deck object { name, words } or null if invalid.
 */
export function decodeDeckPayload(input) {
  if (!input || typeof input !== 'string') return null;

  let rawPayload = input.trim();

  // Handle URL or query string input
  if (rawPayload.includes('?deck=') || rawPayload.includes('&deck=')) {
    try {
      const urlObj = new URL(rawPayload, 'https://localhost');
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

  // Prevent processing arbitrarily massive string inputs
  if (rawPayload.length > MAX_PAYLOAD_BYTES * 2) {
    console.warn('Imported deck payload exceeds length threshold');
    return null;
  }

  try {
    let base64 = rawPayload.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }

    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    if (bytes.length > MAX_PAYLOAD_BYTES) {
      console.warn('Decoded deck exceeds 64KB size limit');
      return null;
    }

    const jsonStr = new TextDecoder().decode(bytes);
    const data = JSON.parse(jsonStr, (key, value) => {
      // Prevent prototype pollution attacks
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return undefined;
      }
      return value;
    });

    if (data && typeof data === 'object' && Array.isArray(data.words)) {
      const sanitizedDeckName = sanitizeText(
        typeof data.name === 'string' && data.name.trim() ? data.name : 'Imported Deck',
        MAX_DECK_NAME_LENGTH
      );

      const sanitizedWords = data.words
        .slice(0, MAX_WORDS_PER_DECK)
        .filter((w) => w && typeof w.word === 'string' && w.word.trim())
        .map((w) => ({
          word: sanitizeText(w.word, MAX_WORD_LENGTH),
          pinyin: sanitizeText(w.pinyin || '', MAX_PINYIN_LENGTH),
          definitions: Array.isArray(w.definitions)
            ? w.definitions
                .slice(0, MAX_DEFINITIONS_PER_WORD)
                .map((d) => sanitizeText(d, MAX_DEFINITION_LENGTH))
                .filter(Boolean)
            : [],
          savedAt: Date.now(),
          ...(w.status === 'passed' || w.status === 'failed' ? { status: w.status } : {}),
        }));

      return {
        name: sanitizedDeckName,
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
    typeof window !== 'undefined' && window.location
      ? window.location.origin
      : 'https://pinyinlayer.netlify.app';
  const pathname =
    typeof window !== 'undefined' && window.location ? window.location.pathname : '/';

  return `${origin}${pathname}?deck=${payload}`;
}
