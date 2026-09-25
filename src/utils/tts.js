/**
 * High-quality Web Speech API Text-to-Speech utility for Chinese reading.
 * Uses priority-based neural/natural voice selection and sentence-level
 * prosody chunking to eliminate robotic, monotone speech.
 */

export function isSpeechSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function stopSpeech() {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }
}

// Pre-load voices on load/change
let cachedVoices = [];

if (isSpeechSupported()) {
  const updateVoices = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
  updateVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }
}

/**
 * Returns the highest quality Chinese voice available on the user's OS/device.
 * Prefers natural, neural, premium, or enhanced voices (e.g., Google, Microsoft, Apple Ting-Ting).
 */
export function getBestChineseVoice(lang = 'zh-CN') {
  if (!isSpeechSupported()) return null;

  const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
  const langPrefix = lang.split('-')[0]; // 'zh'

  const zhVoices = voices.filter((v) => v.lang === lang || v.lang.startsWith(langPrefix));
  if (zhVoices.length === 0) return null;

  // Priority scoring for realistic, natural voices
  const getScore = (v) => {
    const name = v.name.toLowerCase();
    let score = 0;
    if (v.lang === lang) score += 10;
    if (name.includes('natural') || name.includes('neural')) score += 50;
    if (name.includes('premium') || name.includes('enhanced')) score += 40;
    if (name.includes('google')) score += 30;
    if (name.includes('microsoft') || name.includes('xiaoxiao') || name.includes('yunxi')) score += 30;
    if (name.includes('ting-ting') || name.includes('sin-ji') || name.includes('mei-jia')) score += 25;
    if (v.localService) score += 5; // Offline local OS voice
    return score;
  };

  zhVoices.sort((a, b) => getScore(b) - getScore(a));
  return zhVoices[0] || null;
}

/**
 * Splits text into natural speech clauses on Chinese/English sentence boundaries
 * so the TTS engine applies natural intonation and pauses instead of robotic block speech.
 */
function splitIntoSentences(text) {
  if (!text) return [];
  return text
    .split(/([。！？；;\n]+)/)
    .reduce((acc, part, idx, arr) => {
      if (idx % 2 === 0) {
        const punctuation = arr[idx + 1] || '';
        const sentence = (part + punctuation).trim();
        if (sentence) acc.push(sentence);
      }
      return acc;
    }, []);
}

/**
 * Speaks Chinese text with natural sentence pacing and optimal voice selection.
 */
export function speakText(text, lang = 'zh-CN', onEnd = null, onError = null) {
  if (!isSpeechSupported() || !text?.trim()) {
    if (onEnd) onEnd();
    return false;
  }

  stopSpeech();

  const chunks = splitIntoSentences(text);
  if (chunks.length === 0) {
    if (onEnd) onEnd();
    return false;
  }

  const voice = getBestChineseVoice(lang);
  let currentIdx = 0;

  const speakNextChunk = () => {
    if (currentIdx >= chunks.length) {
      if (onEnd) onEnd();
      return;
    }

    const chunkText = chunks[currentIdx];
    currentIdx += 1;

    const utterance = new SpeechSynthesisUtterance(chunkText);
    utterance.lang = lang;
    utterance.rate = 0.9; // Slightly relaxed speech rate for natural phrasing
    utterance.pitch = 1.0;

    if (voice) {
      utterance.voice = voice;
    }

    utterance.onend = () => {
      speakNextChunk();
    };

    utterance.onerror = (e) => {
      if (onError) onError(e);
      else if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  };

  speakNextChunk();
  return true;
}
