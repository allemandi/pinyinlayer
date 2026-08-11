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
  const [charFormat, setCharFormat] = useLocalStorage('pinyinlayer:charFormat', 'simplified');
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
            className="inline-flex items-center gap-1.5 rounded-full border border-rule bg-surface px-3 py-1.5 text-xs font-semibold text-ink-soft transition hover:bg-surface-dim hover:text-ink active:scale-[0.98] cursor-pointer sm:text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade"
          >
            {themeMode === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            <span>{themeMode === 'dark' ? 'Light' : 'Dark'}</span>
          </button>

          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            title="Help & Information"
            aria-label="Help & Information"
            className="inline-flex items-center gap-1.5 rounded-full border border-rule bg-surface px-3 py-1.5 text-xs font-semibold text-ink-soft transition hover:bg-surface-dim hover:text-ink active:scale-[0.98] cursor-pointer sm:text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade"
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
                charFormat={charFormat}
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
              vocabCount={vocab.length}
              onOpenVocab={() => setVocabOpen(true)}
            />
          </div>
        }
      />

      <footer className="flex shrink-0 flex-col items-center justify-center gap-1.5 border-t border-rule bg-surface/95 px-4 py-3 text-xs text-ink-faint dark:border-slate-800 dark:bg-slate-950 sm:flex-row sm:gap-4 sm:px-6">
        <span>&copy; 2026 allemandi</span>
        <span className="hidden sm:inline text-rule dark:text-slate-800">|</span>
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

      <VocabDrawer isOpen={vocabOpen} onClose={() => setVocabOpen(false)} vocab={vocab} onRemove={remove} />

      <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
