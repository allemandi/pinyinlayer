import { useEffect, useRef, useState } from 'react';
import {
  FileUp,
  Eraser,
  ArrowRightCircle,
  LoaderCircle,
  UploadCloud,
  Clipboard,
  Volume2,
  VolumeX,
  Sparkles,
  Check,
} from 'lucide-react';
import { speakText, stopSpeech } from '../utils/tts.js';
import { countTextStats } from '../utils/cleanText.js';

async function extractFromFile(file) {
  const name = file.name.toLowerCase();

  if (name.endsWith('.pdf')) {
    const pdfjsLib = await import('pdfjs-dist');
    const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

    const buffer = await file.arrayBuffer();
    const doc = await pdfjsLib.getDocument({ data: buffer }).promise;
    const pages = [];
    const CJK_CHAR = /[\u4e00-\u9fff\u3400-\u4dbf]/;

    function joinText(existing, next) {
      if (!existing) return next;
      if (CJK_CHAR.test(existing.slice(-1)) && CJK_CHAR.test(next[0])) {
        return existing + next;
      }
      return `${existing} ${next}`.replace(/\s+/g, ' ').trim();
    }

    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const lines = [];
      let currentLine = '';
      let currentY = null;

      for (const item of content.items) {
        const raw = String(item.str).replace(/\u00A0/g, ' ').trim();
        if (!raw) continue;

        const y = item.transform?.[5] ?? 0;
        if (currentY === null || Math.abs(y - currentY) > 4) {
          if (currentLine) lines.push(currentLine.trim());
          currentLine = raw;
          currentY = y;
        } else {
          currentLine = joinText(currentLine, raw);
        }
      }

      if (currentLine) lines.push(currentLine.trim());
      pages.push(lines.join('\n'));
    }

    return pages.join('\n\n');
  }

  if (name.endsWith('.docx')) {
    const mammoth = await import('mammoth');
    const buffer = await file.arrayBuffer();
    const { value } = await mammoth.extractRawText({ arrayBuffer: buffer });
    return value;
  }

  throw new Error('Please upload a .pdf or .docx file.');
}

const SAMPLE_TEXTS = [
  {
    title: 'Conversational',
    text: '你好！很高兴认识你。今天天气非常好，我们一起去喝咖啡吧！',
  },
  {
    title: 'HSK 3 Story',
    text: '我学习汉语已经半年了。虽然汉字很难写，但是我觉得非常有意思。',
  },
  {
    title: 'Daily News',
    text: '科技的发展改变了人们的生活方式。现在，手机支付在全国各地非常普及。',
  },
  {
    title: 'Idiom & Wisdom',
    text: '千里之行，始于足下。不积跬步，无以至千里；不积小流，无以成江海。',
  },
];

export default function InputPanel({ rawText, onChangeRawText, onSubmit }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const fileInputRef = useRef(null);
  const dragCounter = useRef(0);

  useEffect(() => {
    const preventDefault = (e) => e.preventDefault();
    window.addEventListener('dragover', preventDefault);
    window.addEventListener('drop', preventDefault);
    return () => {
      window.removeEventListener('dragover', preventDefault);
      window.removeEventListener('drop', preventDefault);
    };
  }, []);

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const processSelectedFile = async (file) => {
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    if (!lowerName.endsWith('.pdf') && !lowerName.endsWith('.docx')) {
      setError('Please drop or upload a valid .pdf or .docx document.');
      return;
    }

    setError('');
    setBusy(true);
    try {
      const text = await extractFromFile(file);
      onChangeRawText(text);
      onSubmit(text);
      showToast('Document text extracted successfully');
    } catch (err) {
      setError(err.message || 'Could not read that file.');
    } finally {
      setBusy(false);
    }
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    await processSelectedFile(file);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer?.types?.includes('Files')) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDragging(false);

    const file = e.dataTransfer?.files?.[0];
    if (file) {
      await processSelectedFile(file);
    }
  };

  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard?.readText) {
        const clipText = await navigator.clipboard.readText();
        if (clipText?.trim()) {
          onChangeRawText(clipText);
          showToast('Pasted from clipboard');
        } else {
          showToast('Clipboard is empty');
        }
      } else {
        showToast('Clipboard access not supported');
      }
    } catch {
      showToast('Clipboard access denied');
    }
  };

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      stopSpeech();
      setIsPlayingAudio(false);
    } else {
      if (!rawText.trim()) return;
      setIsPlayingAudio(true);
      speakText(
        rawText,
        'zh-CN',
        () => setIsPlayingAudio(false),
        () => setIsPlayingAudio(false)
      );
    }
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (rawText.trim()) {
        onSubmit(rawText);
      }
    }
  };

  const stats = countTextStats(rawText);

  return (
    <div
      className="relative flex h-full flex-col bg-transparent"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Header Bar: Clean Live Text Stats */}
      <div className="flex items-center justify-between border-b border-rule/60 bg-surface/50 px-3.5 py-2 dark:border-slate-800 dark:bg-slate-900/50 shrink-0 select-none">
        <span className="text-xs font-bold text-ink dark:text-slate-200">
          Source Text
        </span>

        <div className="flex items-center gap-2 text-[11px] font-semibold text-ink-faint">
          <span>{stats.chars} chars</span>
          <span className="text-rule">•</span>
          <span>{stats.words} words</span>
        </div>
      </div>

      {/* Main Textarea Area */}
      <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto p-3.5 sm:p-5">
        <textarea
          value={rawText}
          onChange={(e) => onChangeRawText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste Chinese text here, or drag & drop a PDF/DOCX file... (Cmd+Enter or Ctrl+Enter to read)"
          aria-label="Chinese text source input"
          className="min-h-[130px] flex-1 resize-none border-none bg-transparent font-reading text-base sm:text-lg leading-relaxed text-ink placeholder:font-display placeholder:text-xs sm:placeholder:text-sm placeholder:text-ink-faint focus:outline-none"
        />

        {/* Sample Starter Prompts when Empty */}
        {!rawText.trim() && (
          <div className="mt-3 pt-3 border-t border-rule/40 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-ink-soft dark:text-slate-400">
              <Sparkles size={13} className="text-jade" />
              <span>Try a sample Chinese text:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SAMPLE_TEXTS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onChangeRawText(sample.text);
                    onSubmit(sample.text);
                  }}
                  className="flex flex-col items-start rounded-xl border border-rule/80 bg-surface/80 p-2.5 text-left transition hover:border-jade hover:bg-jade-soft/30 cursor-pointer dark:border-slate-800 dark:bg-slate-900 dark:hover:border-jade"
                >
                  <span className="text-xs font-bold text-jade dark:text-sky-400">
                    {sample.title}
                  </span>
                  <span className="mt-0.5 line-clamp-1 font-reading text-xs text-ink-soft dark:text-slate-300">
                    {sample.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Drag and Drop Overlay */}
        {isDragging && (
          <div
            className="absolute inset-2 z-20 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-jade bg-surface/95 p-6 shadow-xl backdrop-blur-xs text-center transition-all animate-fadeIn dark:bg-slate-950/95"
            aria-live="polite"
          >
            <UploadCloud size={40} className="text-jade animate-bounce mb-2" strokeWidth={2} />
            <p className="font-display text-base font-bold text-ink dark:text-slate-100">
              Drop PDF or DOCX file here
            </p>
            <p className="mt-1 text-xs font-semibold text-ink-soft dark:text-slate-400">
              Text will be extracted automatically into the reader
            </p>
          </div>
        )}
      </div>

      {/* Error / Toast Floating Banner */}
      {error && (
        <p className="border-t border-rule bg-surface px-3 py-1.5 text-xs font-bold text-seal dark:border-slate-700">
          {error}
        </p>
      )}

      {toastMessage && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-30 inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-xs font-bold text-white shadow-md animate-fadeIn dark:bg-slate-100 dark:text-slate-900">
          <Check size={13} className="text-jade" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Bottom Action Toolbar: Streamlined single-row mobile layout without ugly stacking */}
      <div className="flex items-center justify-between gap-2 border-t border-rule bg-surface px-3 py-2 shrink-0 select-none dark:border-slate-800 dark:bg-slate-900 overflow-x-auto">
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            onChange={handleFile}
            className="hidden"
          />

          <button
            type="button"
            onClick={handlePasteClipboard}
            title="Paste text from clipboard"
            className="inline-flex items-center gap-1 rounded-xl border border-rule bg-surface px-2.5 py-1.5 text-xs font-bold text-ink-soft transition hover:bg-surface-dim hover:text-ink cursor-pointer h-9 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
          >
            <Clipboard size={14} strokeWidth={2.25} />
            <span>Paste</span>
          </button>

          <button
            type="button"
            onClick={handleToggleAudio}
            disabled={!rawText.trim()}
            title={isPlayingAudio ? 'Stop speech' : 'Listen to text'}
            aria-label={isPlayingAudio ? 'Stop speech' : 'Listen to text'}
            className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer h-9 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade ${
              isPlayingAudio
                ? 'bg-seal-soft border-seal text-seal dark:bg-rose-950 dark:text-rose-300'
                : 'bg-surface border-rule text-ink-soft hover:bg-surface-dim hover:text-ink dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'
            }`}
          >
            {isPlayingAudio ? (
              <VolumeX size={14} className="animate-pulse" />
            ) : (
              <Volume2 size={14} />
            )}
            <span>{isPlayingAudio ? 'Stop' : 'Listen'}</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={busy}
            title="Upload PDF or DOCX file"
            className="inline-flex items-center gap-1 rounded-xl border border-rule bg-surface px-2.5 py-1.5 text-xs font-bold text-ink-soft transition hover:bg-surface-dim hover:text-ink disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer h-9 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
          >
            {busy ? (
              <LoaderCircle size={14} className="animate-spin" />
            ) : (
              <FileUp size={14} />
            )}
            <span>{busy ? 'Reading…' : 'Upload'}</span>
          </button>

          {rawText && (
            <button
              type="button"
              onClick={() => {
                onChangeRawText('');
                onSubmit('');
                stopSpeech();
                setIsPlayingAudio(false);
              }}
              title="Clear text"
              aria-label="Clear text"
              className="inline-flex items-center gap-1 rounded-xl border border-rule bg-surface px-2 py-1.5 text-xs font-bold text-ink-faint transition hover:bg-surface-dim hover:text-ink cursor-pointer h-9 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
            >
              <Eraser size={14} />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={() => onSubmit(rawText)}
          disabled={!rawText.trim()}
          title="Send text to interactive reader (Cmd/Ctrl + Enter)"
          className="ml-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-jade px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-jade/90 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer h-9 shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade"
        >
          <span>Read & Translate</span>
          <ArrowRightCircle size={15} strokeWidth={2.25} />
        </button>
      </div>
    </div>
  );
}
