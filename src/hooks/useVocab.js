import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';

/**
 * Manages the personal vocab list (saved words + phrases), persisted to
 * localStorage. Each entry: { word, pinyin, definitions, savedAt, status }.
 */
export function useVocab() {
  const [vocab, setVocab] = useLocalStorage('pinyinlayer:vocab', []);

  const savedWords = useMemo(() => new Set(vocab.map((v) => v.word)), [vocab]);

  const isSaved = useCallback((word) => savedWords.has(word), [savedWords]);

  const add = useCallback(
    (entry) => {
      const { sentence, ...rest } = entry;
      setVocab((prev) =>
        prev.some((v) => v.word === entry.word)
          ? prev
          : [{ ...rest, savedAt: Date.now() }, ...prev]
      );
    },
    [setVocab]
  );

  const remove = useCallback(
    (word) => setVocab((prev) => prev.filter((v) => v.word !== word)),
    [setVocab]
  );

  const toggle = useCallback(
    (entry) => (isSaved(entry.word) ? remove(entry.word) : add(entry)),
    [isSaved, add, remove]
  );

  const tagStatus = useCallback(
    (word, status) => {
      setVocab((prev) =>
        prev.map((v) => (v.word === word ? { ...v, status } : v))
      );
    },
    [setVocab]
  );

  const clearStatuses = useCallback(() => {
    setVocab((prev) =>
      prev.map((v) => {
        const { status, ...rest } = v;
        return rest;
      })
    );
  }, [setVocab]);

  return { vocab, add, remove, toggle, isSaved, tagStatus, clearStatuses };
}
