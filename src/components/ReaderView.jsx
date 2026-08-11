import { useEffect, useState } from 'react';
import { tokenizeParagraph } from '../lib/getPinyin.js';
import hskWords from '../data/hskWords.js';

// Splits a paragraph into sentences on Chinese sentence-ending punctuation,
// keeping the punctuation attached, so a tapped word can carry its whole
// sentence into the definition popover for translation.
function splitSentences(paragraph) {
  const matches = paragraph.match(/[^。！？]*[。！？]+|[^。！？]+$/g) || [paragraph];
  let cursor = 0;
  return matches.map((text) => {
    const start = cursor;
    cursor += text.length;
    return { text, start, end: cursor };
  });
}

function getTokenLevel(token) {
  if (hskWords[token.text] !== undefined) return hskWords[token.text];
  const charLevels = token.chars.map((c) => hskWords[c]).filter((l) => l !== undefined);
  return charLevels.length ? Math.min(...charLevels) : undefined;
}

async function buildParagraphs(cleanedText) {
  const blocks = cleanedText.split(/\n{2,}/).filter(Boolean);
  return Promise.all(
    blocks.map(async (paragraph) => {
      const sentences = splitSentences(paragraph);
      const tokens = await tokenizeParagraph(paragraph);
      let offset = 0;
      return tokens.map((token) => {
        const start = offset;
        offset += token.text.length;
        const sentence = sentences.find((s) => start >= s.start && start < s.end);
        return { ...token, sentence: sentence ? sentence.text : paragraph };
      });
    })
  );
}

export default function ReaderView({ cleanedText, pinyinVisible, hskFilter, onTapToken, isSaved }) {
  const [paragraphs, setParagraphs] = useState([]);

  useEffect(() => {
    let cancelled = false;
    if (!cleanedText.trim()) {
      setParagraphs([]);
      return;
    }
    buildParagraphs(cleanedText).then((result) => {
      if (!cancelled) setParagraphs(result);
    });
    return () => {
      cancelled = true;
    };
  }, [cleanedText]);

  if (!cleanedText.trim()) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center">
        <p className="max-w-xs text-sm leading-relaxed text-ink-faint">
          Paste Chinese text or upload a PDF/DOCX on the left, then{' '}
          <span className="font-medium text-ink-soft">send it to the reader</span> to see it
          here — cleaned, paragraphed, and ready to tap through.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6">
      {paragraphs.map((tokens, pIndex) => (
        <p key={pIndex} className="mb-6 text-[1.15rem] leading-[2.4] last:mb-0">
          {tokens.map((token, tIndex) => {
            if (!token.isChinese) {
              return (
                <span key={tIndex} className="text-ink-soft">
                  {token.text}
                </span>
              );
            }

            const level = getTokenLevel(token);
            const showPinyin =
              pinyinVisible && (hskFilter === 'all' || level === undefined || level > hskFilter);
            const saved = isSaved(token.text);

            return (
              <button
                key={tIndex}
                type="button"
                onClick={(e) =>
                  onTapToken(token, e.currentTarget.getBoundingClientRect())
                }
                className={`group relative inline-flex items-baseline gap-px rounded px-0.5 align-bottom transition-colors hover:bg-jade-soft/70 ${
                  saved ? 'decoration-seal decoration-2 underline underline-offset-[6px]' : ''
                }`}
              >
                {token.chars.map((char, cIndex) => (
                  <span key={cIndex} className="inline-flex flex-col items-center leading-none">
                    <span
                      className={`mb-0.5 font-mono text-[0.62rem] text-jade transition-[opacity,height] ${
                        showPinyin ? 'opacity-100' : 'h-0 opacity-0'
                      }`}
                    >
                      {token.pinyin[cIndex]}
                    </span>
                    <span className="font-reading">{char}</span>
                  </span>
                ))}
              </button>
            );
          })}
        </p>
      ))}
    </div>
  );
}
