import { useEffect, useState } from 'react';
import { Layers, Moon, Sun, HelpCircle, FolderInput, X } from 'lucide-react';
import AppLayout from './components/AppLayout.jsx';
import InputPanel from './components/InputPanel.jsx';
import Controls from './components/Controls.jsx';
import ReaderView from './components/ReaderView.jsx';
import DefinitionPopover from './components/DefinitionPopover.jsx';
import VocabDrawer from './components/VocabDrawer.jsx';
import FlashcardModal from './components/FlashcardModal.jsx';
import HelpModal from './components/HelpModal.jsx';
import { cleanText } from './utils/cleanText.js';
import { useVocab } from './hooks/useVocab.js';
import { useLocalStorage } from './hooks/useLocalStorage.js';
import { decodeDeckPayload } from './utils/deckShare.js';
import { useEscapeKey } from './hooks/useEscapeKey.js';
import { useFocusTrap } from './hooks/useFocusTrap.js';

export default function App() {
  const [rawText, setRawText] = useState('');
  const [cleanedText, setCleanedText] = useState('');
  const [pinyinVisible, setPinyinVisible] = useLocalStorage('pinyinlayer:pinyin', true);
  const [hskFilter, setHskFilter] = useLocalStorage('pinyinlayer:hsk', 'all');
  const [charFormat, setCharFormat] = useLocalStorage('pinyinlayer:charFormat', 'simplified');
  const [textSize, setTextSize] = useLocalStorage('pinyinlayer:textSize', 'md');
  const [themeMode, setThemeMode] = useLocalStorage('pinyinlayer:theme', 'light');
  const [expanded, setExpanded] = useState(null);
  const [vocabOpen, setVocabOpen] = useState(false);
  const [popoverTarget, setPopoverTarget] = useState(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [flashcardOpen, setFlashcardOpen] = useState(false);
  const [studyDeck, setStudyDeck] = useState([]);
  const [pendingImportDeck, setPendingImportDeck] = useState(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', themeMode === 'dark');
  }, [themeMode]);

  const {
    decks,
    defaultDeckId,
    activeDeckId,
    activeDeck,
    vocab,
    toggle,
    remove,
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
  } = useVocab();

  // Auto-detect shared deck link query parameter on startup
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const searchParams = new URLSearchParams(window.location.search);
    const deckParam = searchParams.get('deck');
    if (deckParam) {
      const decoded = decodeDeckPayload(deckParam);
      if (decoded) {
        setPendingImportDeck(decoded);
      }
    }
  }, []);

  const handleConfirmImport = () => {
    if (pendingImportDeck) {
      importDeckPayload(pendingImportDeck);
      setPendingImportDeck(null);
      setVocabOpen(true);
      if (typeof window !== 'undefined' && window.history) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  };

  const handleCancelImport = () => {
    setPendingImportDeck(null);
    if (typeof window !== 'undefined' && window.history) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  const handleStartStudy = (deck) => {
    setStudyDeck(deck);
    setFlashcardOpen(true);
  };

  const handleSubmit = (text) => {
    const cleaned = cleanText(text);
    setCleanedText(cleaned);
    if (cleaned.trim()) {
      setExpanded('right');
    }
  };

  const handleTapToken = (token, rect) => {
    setPopoverTarget({ text: token.text, pinyin: token.pinyin, sentence: token.sentence, rect });
  };

  useEscapeKey(handleCancelImport, Boolean(pendingImportDeck));
  const importModalRef = useFocusTrap(Boolean(pendingImportDeck));

  return (
    <div className="flex h-[100dvh] flex-col bg-paper dark:bg-slate-950">
      <header className="flex flex-row items-center justify-between gap-4 border-b border-rule bg-surface px-4 py-3 shadow-sm shadow-black/5 sm:px-6">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-jade-soft text-jade shadow-inner shadow-black/10 sm:h-12 sm:w-12">
            <Layers size={24} />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold tracking-tight text-ink sm:text-xl">PinyinLayer</h1>
            <p className="text-xs sm:text-sm font-medium text-ink-soft">Reading assistance, layered.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
            title={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="inline-flex items-center gap-1.5 rounded-full border border-rule bg-surface px-3.5 py-2 text-sm font-bold text-ink-soft transition hover:bg-surface-dim hover:text-ink active:scale-[0.98] cursor-pointer sm:text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade h-10 sm:h-11"
          >
            {themeMode === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            <span>{themeMode === 'dark' ? 'Light' : 'Dark'}</span>
          </button>

          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            title="Help & Information"
            aria-label="Help & Information"
            className="inline-flex items-center gap-1.5 rounded-full border border-rule bg-surface px-3.5 py-2 text-sm font-bold text-ink-soft transition hover:bg-surface-dim hover:text-ink active:scale-[0.98] cursor-pointer sm:text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade h-10 sm:h-11"
          >
            <HelpCircle size={17} />
            <span>Help</span>
          </button>
        </div>
      </header>

      <AppLayout
        leftTitle="Input"
        rightTitle="Reader"
        expanded={expanded}
        onToggleExpand={setExpanded}
        left={
          <InputPanel rawText={rawText} onChangeRawText={setRawText} onSubmit={handleSubmit} />
        }
        right={
          <div className="flex h-full min-h-0 flex-col">
            <div className="min-h-0 flex-1">
              <ReaderView
                cleanedText={cleanedText}
                charFormat={charFormat}
                textSize={textSize}
                pinyinVisible={pinyinVisible}
                hskFilter={hskFilter}
                onTapToken={handleTapToken}
                isSaved={isSaved}
              />
            </div>
            <Controls
              pinyinVisible={pinyinVisible}
              onTogglePinyin={() => setPinyinVisible((v) => !v)}
              hskFilter={hskFilter}
              onChangeHskFilter={setHskFilter}
              charFormat={charFormat}
              onChangeCharFormat={setCharFormat}
              textSize={textSize}
              onChangeTextSize={setTextSize}
              vocabCount={vocab.length}
              onOpenVocab={() => setVocabOpen(true)}
              onImportDeck={importDeckPayload}
            />
          </div>
        }
      />

      <footer className="flex shrink-0 flex-row items-center justify-center gap-6 border-t border-rule bg-surface/95 px-4 py-3 text-sm font-medium text-ink-soft dark:border-slate-800 dark:bg-slate-950 sm:px-6">
        <span>&copy; {new Date().getFullYear()} allemandi</span>
        <a
          href="https://github.com/allemandi/pinyinlayer"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 underline decoration-dotted underline-offset-4 hover:text-ink transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade cursor-pointer dark:hover:text-slate-200"
        >
          <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
          </svg>
          GitHub Repository
        </a>
      </footer>

      <DefinitionPopover
        target={popoverTarget}
        onClose={() => setPopoverTarget(null)}
        isSaved={isSaved}
        onToggleSave={toggle}
      />

      <VocabDrawer
        isOpen={vocabOpen}
        onClose={() => setVocabOpen(false)}
        decks={decks}
        activeDeck={activeDeck}
        defaultDeckId={defaultDeckId}
        onSetActiveDeckId={setActiveDeckId}
        onSetDefaultDeckId={setDefaultDeckId}
        onCreateDeck={createDeck}
        onRenameDeck={renameDeck}
        onDeleteDeck={deleteDeck}
        onCopyWords={copyWords}
        onMoveWords={moveWords}
        onRemoveWords={removeWords}
        onRemove={remove}
        onStartStudy={handleStartStudy}
        onClearStatuses={clearStatuses}
        onImportDeck={importDeckPayload}
      />

      <FlashcardModal
        isOpen={flashcardOpen}
        onClose={() => setFlashcardOpen(false)}
        deck={studyDeck}
        onTagStatus={tagStatus}
      />

      <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />

      {/* URL Import Confirmation Modal */}
      {pendingImportDeck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/30 backdrop-blur-xs">
          <div
            ref={importModalRef}
            className="w-full max-w-sm rounded-2xl border border-rule bg-surface p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            role="dialog"
            aria-modal="true"
            aria-label="Import Shared Deck"
          >
            <div className="flex items-center justify-between border-b border-rule pb-3 dark:border-slate-800">
              <h3 className="font-display text-base font-bold text-ink dark:text-slate-100 flex items-center gap-2">
                <FolderInput size={20} className="text-jade" />
                Import Shared Deck
              </h3>
              <button
                type="button"
                onClick={handleCancelImport}
                aria-label="Close dialog"
                className="rounded-full p-1 text-ink-soft hover:bg-surface-dim hover:text-ink cursor-pointer dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              <p className="text-sm font-semibold text-ink dark:text-slate-200">
                You opened a link to import a vocabulary deck:
              </p>
              <div className="rounded-xl border border-rule bg-surface-dim p-3 dark:border-slate-800 dark:bg-slate-950">
                <p className="font-bold text-jade dark:text-sky-400 text-base">
                  {pendingImportDeck.name}
                </p>
                <p className="text-xs text-ink-soft dark:text-slate-400 mt-0.5">
                  Contains {pendingImportDeck.words?.length || 0} vocabulary words
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelImport}
                className="rounded-xl border border-rule px-4 py-2 text-xs font-semibold text-ink-soft hover:bg-surface-dim cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                className="rounded-xl bg-jade px-4 py-2 text-xs font-bold text-white shadow-xs cursor-pointer hover:bg-jade/90"
              >
                Import & View Deck
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
