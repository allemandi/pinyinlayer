import { useEffect, useState } from 'react';
import { Layers, Moon, Sun, HelpCircle } from 'lucide-react';
import AppLayout from './components/AppLayout.jsx';
import InputPanel from './components/InputPanel.jsx';
import Controls from './components/Controls.jsx';
import ReaderView from './components/ReaderView.jsx';
import DefinitionPopover from './components/DefinitionPopover.jsx';
import VocabDrawer from './components/VocabDrawer.jsx';
import HelpModal from './components/HelpModal.jsx';
import { cleanText } from './utils/cleanText.js';
import { useVocab } from './hooks/useVocab.js';
import { useLocalStorage } from './hooks/useLocalStorage.js';

export default function App() {
  const [rawText, setRawText] = useState('');
  const [cleanedText, setCleanedText] = useState('');
  const [pinyinVisible, setPinyinVisible] = useLocalStorage('pinyinlayer:pinyin', true);
  const [hskFilter, setHskFilter] = useLocalStorage('pinyinlayer:hsk', 'all');
  const [themeMode, setThemeMode] = useLocalStorage('pinyinlayer:theme', 'light');
  const [expanded, setExpanded] = useState(null);
  const [vocabOpen, setVocabOpen] = useState(false);
  const [popoverTarget, setPopoverTarget] = useState(null);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', themeMode === 'dark');
  }, [themeMode]);

  const { vocab, toggle, remove, isSaved } = useVocab();

  const handleSubmit = (text) => setCleanedText(cleanText(text));

  const handleTapToken = (token, rect) => {
    setPopoverTarget({ text: token.text, pinyin: token.pinyin, sentence: token.sentence, rect });
  };

  return (
    <div className="flex h-[100dvh] flex-col bg-paper dark:bg-slate-950">
      <header className="flex flex-row items-center justify-between gap-4 border-b border-rule bg-surface px-4 py-3 shadow-sm shadow-black/5 sm:px-6">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-jade-soft text-jade shadow-inner shadow-black/10 sm:h-11 sm:w-11">
            <Layers size={22} />
          </div>
          <div>
            <h1 className="font-display text-base font-semibold tracking-tight text-ink sm:text-lg">PinyinLayer</h1>
            <p className="text-xs text-ink-faint sm:text-sm">Reading assistance, layered.</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
            title={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="inline-flex items-center gap-1.5 rounded-full border border-rule bg-surface px-3 py-1.5 text-xs font-semibold text-ink-soft transition hover:bg-surface-dim hover:text-ink active:scale-[0.98] cursor-pointer sm:text-sm"
          >
            {themeMode === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            <span>{themeMode === 'dark' ? 'Light' : 'Dark'}</span>
          </button>

          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            title="Help & Information"
            aria-label="Help & Information"
            className="inline-flex items-center gap-1.5 rounded-full border border-rule bg-surface px-3 py-1.5 text-xs font-semibold text-ink-soft transition hover:bg-surface-dim hover:text-ink active:scale-[0.98] cursor-pointer sm:text-sm"
          >
            <HelpCircle size={14} />
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
              vocabCount={vocab.length}
              onOpenVocab={() => setVocabOpen(true)}
            />
          </div>
        }
      />

      <footer className="flex shrink-0 flex-row items-center justify-between border-t border-rule bg-surface px-4 py-2 text-xs text-ink-faint dark:border-slate-800 dark:bg-slate-950 sm:px-6">
        <span>&copy; 2026 allemandi</span>
        <a
          href="https://github.com/allemandi/pinyinlayer"
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-dotted underline-offset-4 hover:text-ink transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade cursor-pointer dark:hover:text-slate-200"
        >
          GitHub Repository
        </a>
      </footer>

      <DefinitionPopover
        target={popoverTarget}
        onClose={() => setPopoverTarget(null)}
        isSaved={isSaved}
        onToggleSave={toggle}
      />

      <VocabDrawer isOpen={vocabOpen} onClose={() => setVocabOpen(false)} vocab={vocab} onRemove={remove} />

      <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
