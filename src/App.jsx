import { useState } from 'react';
import { Layers } from 'lucide-react';
import AppLayout from './components/AppLayout.jsx';
import InputPanel from './components/InputPanel.jsx';
import Controls from './components/Controls.jsx';
import ReaderView from './components/ReaderView.jsx';
import DefinitionPopover from './components/DefinitionPopover.jsx';
import VocabDrawer from './components/VocabDrawer.jsx';
import { cleanText } from './lib/cleanText.js';
import { useVocab } from './hooks/useVocab.js';

export default function App() {
  const [rawText, setRawText] = useState('');
  const [cleanedText, setCleanedText] = useState('');
  const [pinyinVisible, setPinyinVisible] = useState(true);
  const [hskFilter, setHskFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);
  const [vocabOpen, setVocabOpen] = useState(false);
  const [popoverTarget, setPopoverTarget] = useState(null);

  const { vocab, toggle, remove, isSaved } = useVocab();

  const handleSubmit = (text) => setCleanedText(cleanText(text));

  const handleTapToken = (token, rect) => {
    setPopoverTarget({ text: token.text, pinyin: token.pinyin, sentence: token.sentence, rect });
  };

  return (
    <div className="flex h-[100dvh] flex-col bg-paper">
      <header className="flex shrink-0 items-center gap-2 border-b border-rule px-4 py-3 sm:px-6">
        <Layers size={18} className="text-seal" strokeWidth={2.25} />
        <h1 className="font-display text-base font-semibold tracking-tight">PinyinLayer</h1>
        <p className="hidden text-sm text-ink-faint sm:block">Reading assistance, layered.</p>
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
