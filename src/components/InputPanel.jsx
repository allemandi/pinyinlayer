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
    <div className="flex h-full flex-col bg-transparent">
      <textarea
        value={rawText}
        onChange={(e) => onChangeRawText(e.target.value)}
        placeholder="粘贴中文文本… (paste Chinese text here, or upload a PDF/DOCX below)"
        aria-label="Chinese text input"
        className="min-h-0 flex-1 resize-none border-none bg-transparent p-5 font-reading text-lg leading-relaxed text-ink placeholder:font-display placeholder:text-base placeholder:text-ink-faint focus:outline-none"
      />

      {error && (
        <p className="border-t border-rule bg-surface px-4 py-2 text-base text-seal dark:border-slate-700">{error}</p>
      )}

      <div className="flex flex-row items-center gap-1.5 sm:gap-2 border-t border-rule bg-surface px-3 py-2.5 sm:px-4 sm:py-3 select-none">
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
          className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-rule bg-surface px-2.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-ink-soft transition duration-150 ease-out hover:bg-surface-dim hover:text-ink active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer h-9"
        >
          {busy ? (
            <LoaderCircle size={14} className="animate-spin" strokeWidth={2.25} />
          ) : (
            <FileUp size={14} strokeWidth={2.25} />
          )}
          <span>
            {busy ? 'Reading…' : (
              <>
                <span className="sm:hidden">Upload</span>
                <span className="hidden sm:inline">Upload PDF / DOCX</span>
              </>
            )}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            onChangeRawText('');
            onSubmit('');
          }}
          className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-rule bg-surface px-2.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-ink-soft transition duration-150 ease-out hover:bg-surface-dim hover:text-ink active:scale-[0.97] cursor-pointer h-9"
        >
          <Eraser size={14} strokeWidth={2.25} />
          <span>Clear</span>
        </button>

        <button
          type="button"
          onClick={() => onSubmit(rawText)}
          disabled={!rawText.trim()}
          className="ml-auto flex items-center gap-1.5 sm:gap-2 rounded-full bg-jade px-2.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold text-surface transition duration-150 ease-out hover:bg-jade/90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer h-9"
        >
          <span>Send to reader</span>
          <ArrowRightCircle size={14} strokeWidth={2.25} />
        </button>
      </div>
    </div>
  );
}
