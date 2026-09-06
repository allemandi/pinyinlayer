import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocalStorage } from './useLocalStorage.js';
import { decodeDeckPayload } from '../utils/deckShare.js';

const DEFAULT_DECK_ID = 'default';

function generateDeckId() {
  return `deck_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

/**
 * Initializes decks with backward compatibility for legacy `pinyinlayer:vocab`.
 */
function getInitialDecks() {
  try {
    const storedDecks = window.localStorage.getItem('pinyinlayer:decks');
    if (storedDecks) {
      const parsed = JSON.parse(storedDecks);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }

    // Migrate from legacy pinyinlayer:vocab if available
    const legacyVocabStr = window.localStorage.getItem('pinyinlayer:vocab');
    const legacyVocab = legacyVocabStr ? JSON.parse(legacyVocabStr) : [];

    return [
      {
        id: DEFAULT_DECK_ID,
        name: 'Default Deck',
        words: Array.isArray(legacyVocab) ? legacyVocab : [],
        createdAt: Date.now(),
      },
    ];
  } catch {
    return [
      {
        id: DEFAULT_DECK_ID,
        name: 'Default Deck',
        words: [],
        createdAt: Date.now(),
      },
    ];
  }
}

/**
 * Manages multi-deck vocabulary collections persisted in LocalStorage.
 */
export function useVocab() {
  const [decks, setDecks] = useLocalStorage('pinyinlayer:decks', getInitialDecks());
  const [defaultDeckId, setDefaultDeckIdState] = useLocalStorage(
    'pinyinlayer:defaultDeckId',
    DEFAULT_DECK_ID
  );
  const [activeDeckId, setActiveDeckIdState] = useState(() => {
    return defaultDeckId || DEFAULT_DECK_ID;
  });

  // Ensure decks is always a valid array
  const safeDecks = useMemo(() => {
    return Array.isArray(decks) && decks.length > 0
      ? decks
      : [
          {
            id: DEFAULT_DECK_ID,
            name: 'Default Deck',
            words: [],
            createdAt: Date.now(),
          },
        ];
  }, [decks]);

  // Ensure defaultDeckId points to a valid deck
  useEffect(() => {
    if (safeDecks.length > 0 && !safeDecks.some((d) => d.id === defaultDeckId)) {
      setDefaultDeckIdState(safeDecks[0].id);
    }
  }, [safeDecks, defaultDeckId, setDefaultDeckIdState]);

  // Ensure activeDeckId points to a valid deck
  const activeDeck = useMemo(() => {
    return (
      safeDecks.find((d) => d.id === activeDeckId) ||
      safeDecks.find((d) => d.id === defaultDeckId) ||
      safeDecks[0]
    );
  }, [safeDecks, activeDeckId, defaultDeckId]);

  const defaultDeck = useMemo(() => {
    return (
      safeDecks.find((d) => d.id === defaultDeckId) ||
      safeDecks[0]
    );
  }, [safeDecks, defaultDeckId]);

  // Keep legacy pinyinlayer:vocab in sync with the Default Deck for backwards compatibility
  useEffect(() => {
    try {
      if (defaultDeck) {
        window.localStorage.setItem('pinyinlayer:vocab', JSON.stringify(defaultDeck.words));
      }
    } catch {
      // ignore storage errors
    }
  }, [defaultDeck]);

  // Words currently in the active deck
  const vocab = useMemo(() => activeDeck.words || [], [activeDeck]);

  // Set of words saved in default deck or active deck
  const savedWords = useMemo(() => {
    const defaultWords = defaultDeck.words ? defaultDeck.words.map((v) => v.word) : [];
    const activeWords = activeDeck.words ? activeDeck.words.map((v) => v.word) : [];
    return new Set([...defaultWords, ...activeWords]);
  }, [defaultDeck, activeDeck]);

  const isSaved = useCallback((word) => savedWords.has(word), [savedWords]);

  /**
   * Adds word to the DEFAULT DECK.
   */
  const add = useCallback(
    (entry) => {
      const { sentence, ...rest } = entry;
      const targetId = defaultDeckId || DEFAULT_DECK_ID;

      setDecks((prevDecks) => {
        const currentList = Array.isArray(prevDecks) ? prevDecks : safeDecks;
        return currentList.map((deck) => {
          if (deck.id !== targetId) return deck;
          if (deck.words.some((v) => v.word === entry.word)) return deck;
          return {
            ...deck,
            words: [{ ...rest, savedAt: Date.now() }, ...deck.words],
            updatedAt: Date.now(),
          };
        });
      });
    },
    [defaultDeckId, safeDecks, setDecks]
  );

  /**
   * Removes word from specified deck (defaults to default deck if word is in default deck, or active deck).
   */
  const remove = useCallback(
    (word, deckId) => {
      const targetDeckId =
        deckId || (defaultDeck.words.some((w) => w.word === word) ? defaultDeck.id : activeDeck.id);

      setDecks((prevDecks) => {
        const currentList = Array.isArray(prevDecks) ? prevDecks : safeDecks;
        return currentList.map((deck) => {
          if (deck.id !== targetDeckId) return deck;
          return {
            ...deck,
            words: deck.words.filter((v) => v.word !== word),
            updatedAt: Date.now(),
          };
        });
      });
    },
    [defaultDeck, activeDeck, safeDecks, setDecks]
  );

  /**
   * Toggles word in the default deck.
   */
  const toggle = useCallback(
    (entry) => {
      if (defaultDeck.words.some((w) => w.word === entry.word)) {
        remove(entry.word, defaultDeck.id);
      } else {
        add(entry);
      }
    },
    [defaultDeck, add, remove]
  );

  /**
   * Tags Pass / Fail status on a word in active deck (or target deck).
   */
  const tagStatus = useCallback(
    (word, status, deckId) => {
      const targetId = deckId || activeDeck.id;
      setDecks((prevDecks) => {
        const currentList = Array.isArray(prevDecks) ? prevDecks : safeDecks;
        return currentList.map((deck) => {
          if (deck.id !== targetId) return deck;
          return {
            ...deck,
            words: deck.words.map((v) => (v.word === word ? { ...v, status } : v)),
            updatedAt: Date.now(),
          };
        });
      });
    },
    [activeDeck.id, safeDecks, setDecks]
  );

  /**
   * Clears Pass / Fail statuses for a deck.
   */
  const clearStatuses = useCallback(
    (deckId) => {
      const targetId = deckId || activeDeck.id;
      setDecks((prevDecks) => {
        const currentList = Array.isArray(prevDecks) ? prevDecks : safeDecks;
        return currentList.map((deck) => {
          if (deck.id !== targetId) return deck;
          return {
            ...deck,
            words: deck.words.map((v) => {
              const { status, ...rest } = v;
              return rest;
            }),
            updatedAt: Date.now(),
          };
        });
      });
    },
    [activeDeck.id, safeDecks, setDecks]
  );

  /**
   * Creates a new deck with custom name and sets it as active deck.
   */
  const createDeck = useCallback(
    (name) => {
      const newDeck = {
        id: generateDeckId(),
        name: name && name.trim() ? name.trim() : 'New Deck',
        words: [],
        createdAt: Date.now(),
      };
      setDecks((prev) => {
        const currentList = Array.isArray(prev) ? prev : safeDecks;
        return [...currentList, newDeck];
      });
      setActiveDeckIdState(newDeck.id);
      return newDeck;
    },
    [safeDecks, setDecks]
  );

  /**
   * Renames a deck.
   */
  const renameDeck = useCallback(
    (deckId, newName) => {
      if (!newName || !newName.trim()) return;
      setDecks((prev) => {
        const currentList = Array.isArray(prev) ? prev : safeDecks;
        return currentList.map((d) =>
          d.id === deckId ? { ...d, name: newName.trim(), updatedAt: Date.now() } : d
        );
      });
    },
    [safeDecks, setDecks]
  );

  /**
   * Deletes a deck. Reassigns default/active deck if needed.
   */
  const deleteDeck = useCallback(
    (deckId) => {
      setDecks((prev) => {
        const currentList = Array.isArray(prev) ? prev : safeDecks;
        if (currentList.length <= 1) return currentList;
        const updated = currentList.filter((d) => d.id !== deckId);

        if (defaultDeckId === deckId) {
          setDefaultDeckIdState(updated[0].id);
        }
        if (activeDeckId === deckId) {
          setActiveDeckIdState(updated[0].id);
        }

        return updated;
      });
    },
    [defaultDeckId, activeDeckId, safeDecks, setDecks, setDefaultDeckIdState]
  );

  /**
   * Sets default deck.
   */
  const setDefaultDeckId = useCallback(
    (deckId) => {
      if (safeDecks.some((d) => d.id === deckId)) {
        setDefaultDeckIdState(deckId);
      }
    },
    [safeDecks, setDefaultDeckIdState]
  );

  /**
   * Sets active deck.
   */
  const setActiveDeckId = useCallback(
    (deckId) => {
      if (safeDecks.some((d) => d.id === deckId)) {
        setActiveDeckIdState(deckId);
      }
    },
    [safeDecks]
  );

  /**
   * Copies words from source deck to target deck.
   */
  const copyWords = useCallback(
    (sourceDeckId, targetDeckId, wordList) => {
      if (sourceDeckId === targetDeckId || !Array.isArray(wordList) || wordList.length === 0) return 0;

      const wordsToCopy = wordList
        .map((item) => (typeof item === 'string' ? item : item.word))
        .filter(Boolean);

      let copiedCount = 0;

      setDecks((prevDecks) => {
        const currentList = Array.isArray(prevDecks) ? prevDecks : safeDecks;
        const sourceDeck = currentList.find((d) => d.id === sourceDeckId);
        if (!sourceDeck) return currentList;

        const entriesToCopy = sourceDeck.words.filter((w) => wordsToCopy.includes(w.word));

        return currentList.map((deck) => {
          if (deck.id !== targetDeckId) return deck;

          const existingWordsSet = new Set(deck.words.map((w) => w.word));
          const newEntries = entriesToCopy.filter((e) => !existingWordsSet.has(e.word));
          copiedCount = newEntries.length;

          return {
            ...deck,
            words: [...newEntries.map((e) => ({ ...e, savedAt: Date.now() })), ...deck.words],
            updatedAt: Date.now(),
          };
        });
      });

      return copiedCount;
    },
    [safeDecks, setDecks]
  );

  /**
   * Moves words from source deck to target deck.
   */
  const moveWords = useCallback(
    (sourceDeckId, targetDeckId, wordList) => {
      if (sourceDeckId === targetDeckId || !Array.isArray(wordList) || wordList.length === 0) return 0;

      const wordsToMove = wordList
        .map((item) => (typeof item === 'string' ? item : item.word))
        .filter(Boolean);

      let movedCount = 0;

      setDecks((prevDecks) => {
        const currentList = Array.isArray(prevDecks) ? prevDecks : safeDecks;
        const sourceDeck = currentList.find((d) => d.id === sourceDeckId);
        if (!sourceDeck) return currentList;

        const entriesToMove = sourceDeck.words.filter((w) => wordsToMove.includes(w.word));

        return currentList.map((deck) => {
          if (deck.id === sourceDeckId) {
            return {
              ...deck,
              words: deck.words.filter((w) => !wordsToMove.includes(w.word)),
              updatedAt: Date.now(),
            };
          }

          if (deck.id === targetDeckId) {
            const existingWordsSet = new Set(deck.words.map((w) => w.word));
            const newEntries = entriesToMove.filter((e) => !existingWordsSet.has(e.word));
            movedCount = newEntries.length;

            return {
              ...deck,
              words: [...newEntries.map((e) => ({ ...e, savedAt: Date.now() })), ...deck.words],
              updatedAt: Date.now(),
            };
          }

          return deck;
        });
      });

      return movedCount;
    },
    [safeDecks, setDecks]
  );

  /**
   * Bulk removes words from a deck.
   */
  const removeWords = useCallback(
    (deckId, wordList) => {
      const wordsToRemove = new Set(
        wordList.map((item) => (typeof item === 'string' ? item : item.word)).filter(Boolean)
      );

      setDecks((prevDecks) => {
        const currentList = Array.isArray(prevDecks) ? prevDecks : safeDecks;
        return currentList.map((deck) => {
          if (deck.id !== deckId) return deck;
          return {
            ...deck,
            words: deck.words.filter((w) => !wordsToRemove.has(w.word)),
            updatedAt: Date.now(),
          };
        });
      });
    },
    [safeDecks, setDecks]
  );

  /**
   * Imports a deck from a link payload or deck object.
   */
  const importDeckPayload = useCallback(
    (input) => {
      const parsed = typeof input === 'string' ? decodeDeckPayload(input) : input;
      if (!parsed || !Array.isArray(parsed.words)) return null;

      const newDeck = {
        id: generateDeckId(),
        name: parsed.name || 'Imported Deck',
        words: parsed.words,
        createdAt: Date.now(),
      };

      setDecks((prev) => {
        const currentList = Array.isArray(prev) ? prev : safeDecks;
        return [...currentList, newDeck];
      });
      setActiveDeckIdState(newDeck.id);
      return newDeck;
    },
    [safeDecks, setDecks]
  );

  return {
    decks: safeDecks,
    defaultDeckId,
    activeDeckId,
    activeDeck,
    defaultDeck,
    vocab,
    add,
    remove,
    toggle,
    isSaved,
    tagStatus,
    clearStatuses,
    createDeck,
    renameDeck,
    deleteDeck,
    setDefaultDeckId,
    setActiveDeckId,
    copyWords,
    moveWords,
    removeWords,
    importDeckPayload,
  };
}
