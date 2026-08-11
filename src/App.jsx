import { useEffect, useState } from 'react';
import { Layers, Moon, Sun } from 'lucide-react';
import AppLayout from './components/AppLayout.jsx';
import InputPanel from './components/InputPanel.jsx';
import Controls from './components/Controls.jsx';
import ReaderView from './components/ReaderView.jsx';
import DefinitionPopover from './components/DefinitionPopover.jsx';
import VocabDrawer from './components/VocabDrawer.jsx';
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
      <header className="flex flex-col gap-4 border-b border-rule bg-surface px-4 py-3.5 shadow-sm shadow-black/5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-jade-soft text-jade shadow-inner shadow-black/10">
            <Layers size={22} />
          </div>
          <div>
            <h1 className="font-display text-lg font-semibold tracking-tight text-ink">PinyinLayer</h1>
            <p className="text-sm text-ink-faint">Reading assistance, layered.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
          className="inline-flex items-center gap-2 rounded-full border border-rule bg-surface px-4 py-2 text-sm font-semibold text-ink-soft transition hover:bg-surface-dim hover:text-ink active:scale-[0.98]"
        >
          {themeMode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          {themeMode === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
      </header>

      <AppLayout
        leftTitle="Input"
        rightTitle="Reader"
        expanded={expanded}
        onToggleExpand={setExpanded}
        left={
          <div className="flex h-full min-h-0 flex-col">
            <div className="min-h-0 flex-1">
              <InputPanel rawText={rawText} onChangeRawText={setRawText} onSubmit={handleSubmit} />
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
        right={
          <ReaderView
            cleanedText={cleanedText}
            pinyinVisible={pinyinVisible}
            hskFilter={hskFilter}
            onTapToken={handleTapToken}
            isSaved={isSaved}
          />
        }
      />

      <DefinitionPopover
        target={popoverTarget}
        onClose={() => setPopoverTarget(null)}
        isSaved={isSaved}
        onToggleSave={toggle}
      />

      <VocabDrawer isOpen={vocabOpen} onClose={() => setVocabOpen(false)} vocab={vocab} onRemove={remove} />
    </div>
  );
}
