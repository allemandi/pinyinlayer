/**
 * Web Speech API Text-to-Speech utility for Chinese reading assistance.
 */

export function isSpeechSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function stopSpeech() {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }
}

let activeUtterance = null;

export function speakText(text, lang = 'zh-CN', onEnd = null, onError = null) {
  if (!isSpeechSupported() || !text?.trim()) {
    if (onEnd) onEnd();
    return false;
  }

  stopSpeech();

  const utterance = new SpeechSynthesisUtterance(text.trim());
  utterance.lang = lang;
  utterance.rate = 0.95; // Slightly relaxed speech rate for clarity

  // Find preferred voice matching the language tag
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    const matchedVoice = voices.find(
      (v) => v.lang === lang || v.lang.startsWith(lang.split('-')[0])
    );
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
  }

  utterance.onend = () => {
    activeUtterance = null;
    if (onEnd) onEnd();
  };

  utterance.onerror = (e) => {
    activeUtterance = null;
    if (onError) onError(e);
    else if (onEnd) onEnd();
  };

  activeUtterance = utterance;
  window.speechSynthesis.speak(utterance);
  return true;
}
