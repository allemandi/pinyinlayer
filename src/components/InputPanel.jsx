import { useRef, useState } from 'react';
import { FileUp, Eraser, ArrowRightCircle, LoaderCircle } from 'lucide-react';

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

/**
 * Left-panel input: paste text directly, or upload a PDF/DOCX to extract
 * text from. "Send to reader" is explicit so large pastes don't re-segment
 * on every keystroke.
 */
export default function InputPanel({ rawText, onChangeRawText, onSubmit }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    setBusy(true);
    try {
      const text = await extractFromFile(file);
      onChangeRawText(text);
      onSubmit(text);
    } catch (err) {
      setError(err.message || 'Could not read that file.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex h-full flex-col rounded-[1.75rem] border border-rule bg-surface shadow-sm shadow-black/5 dark:border-slate-700">
      <textarea
        value={rawText}
        onChange={(e) => onChangeRawText(e.target.value)}
        placeholder="粘贴中文文本… (paste Chinese text here, or upload a PDF/DOCX below)"
        className="min-h-0 flex-1 resize-none rounded-t-[1.4rem] border-none bg-surface p-5 font-reading text-lg leading-relaxed text-ink placeholder:font-display placeholder:text-base placeholder:text-ink-faint focus:outline-none"
      />

      {error && (
        <p className="border-t border-rule bg-surface px-4 py-2 text-base text-seal dark:border-slate-700">{error}</p>
      )}

      <div className="flex flex-wrap items-center gap-2 border-t border-rule bg-surface px-4 py-3">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx"
          onChange={handleFile}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={busy}
          className="flex items-center gap-2 rounded-full border border-rule bg-surface px-4 py-2 text-base font-medium text-ink-soft transition duration-150 ease-out hover:bg-surface-dim hover:text-ink active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? (
            <LoaderCircle size={15} className="animate-spin" strokeWidth={2.25} />
          ) : (
            <FileUp size={15} strokeWidth={2.25} />
          )}
          {busy ? 'Reading file…' : 'Upload PDF / DOCX'}
        </button>

        <button
          type="button"
          onClick={() => {
            onChangeRawText('');
            onSubmit('');
          }}
          className="flex items-center gap-2 rounded-full border border-rule bg-surface px-4 py-2 text-base font-medium text-ink-soft transition duration-150 ease-out hover:bg-surface-dim hover:text-ink active:scale-[0.98]"
        >
          <Eraser size={15} strokeWidth={2.25} />
          Clear
        </button>

        <button
          type="button"
          onClick={() => onSubmit(rawText)}
          disabled={!rawText.trim()}
          className="ml-auto flex items-center gap-2 rounded-full bg-jade px-4 py-2 text-base font-medium text-surface transition duration-150 ease-out hover:bg-jade/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Send to reader
          <ArrowRightCircle size={15} strokeWidth={2.25} />
        </button>
      </div>
    </div>
  );
}
