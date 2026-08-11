import { useCallback, useEffect, useRef, useState } from 'react';
import { tokenizeParagraph } from '../utils/getPinyin.js';
import { shouldShowPinyin } from '../utils/pinyinVisibility.js';
import { convertTextAsync, convertWordAsync } from '../utils/chineseConversion.js';

const PINYIN_SLOT = 'h-[1.15em]';
const LONG_PRESS_MS = 450;

function splitSentences(paragraph) {
  const matches = paragraph.match(/[^。！？]*[。！？]+|[^。！？]+$/g) || [paragraph];
  let cursor = 0;
  return matches.map((text) => {
    const start = cursor;
    cursor += text.length;
    return { text, start, end: cursor };
  });
}

async function buildParagraphs(cleanedText, charFormat) {
  // If formatting to simplified or traditional, we do tokenization on Simplified text for best segmentation accuracy.
  const segmentingFormat = charFormat === 'original' ? 'original' : 'simplified';
  const processedText = await convertTextAsync(cleanedText, segmentingFormat);

  const blocks = processedText.split(/\n{2,}/).filter(Boolean);
  const paragraphPromises = blocks.map(async (paragraph) => {
    const sentences = splitSentences(paragraph);
    const tokens = await tokenizeParagraph(paragraph);
    let offset = 0;

    return Promise.all(
      tokens.map(async (token) => {
        const start = offset;
        offset += token.text.length;
        const sentence = sentences.find((s) => start >= s.start && start < s.end);
        const tokenSentence = sentence ? sentence.text : paragraph;

        // If formatting to Traditional, convert the Simplified token/sentence back to Traditional Chinese
        if (charFormat === 'traditional') {
          const tradText = await convertWordAsync(token.text, 'traditional');
          const tradChars = await Promise.all(token.chars.map(c => convertWordAsync(c, 'traditional')));
          const tradSentence = await convertTextAsync(tokenSentence, 'traditional');

          return {
            ...token,
            text: tradText,
            chars: tradChars,
            sentence: tradSentence,
          };
        }

        return {
          ...token,
          sentence: tokenSentence,
        };
      })
    );
  });

  return Promise.all(paragraphPromises);
}

function PinyinSlot({ visible, children, reserveSpace }) {
  return (
    <span
      className={`block text-center text-[0.85rem] font-medium leading-none text-jade transition-opacity ${
        reserveSpace ? PINYIN_SLOT : ''
      } ${visible ? 'opacity-100' : reserveSpace ? 'opacity-0' : 'hidden'}`}
      aria-hidden={!visible}
    >
      {children || '\u00A0'}
    </span>
  );
}

function ChineseToken({ token, tokenKey, showPinyin, reservePinyinRow, saved, onTapToken, onPeekStart, onPeekEnd }) {
  const longPressFired = useRef(false);
  const pressTimer = useRef(null);

  const clearPress = useCallback(() => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  }, []);

  const handlePointerDown = () => {
    longPressFired.current = false;
    clearPress();
    pressTimer.current = setTimeout(() => {
      longPressFired.current = true;
      onPeekStart(tokenKey);
    }, LONG_PRESS_MS);
  };

  const handlePointerUp = () => {
    clearPress();
    onPeekEnd(tokenKey);
  };

  return (
    <button
      type="button"
      onClick={(e) => {
        if (longPressFired.current) {
          e.preventDefault();
          return;
        }
        onTapToken(token, e.currentTarget.getBoundingClientRect());
      }}
      onMouseEnter={() => onPeekStart(tokenKey)}
      onMouseLeave={() => onPeekEnd(tokenKey)}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className={`group relative inline-flex items-end gap-px rounded-md px-0.5 align-bottom transition-colors hover:bg-jade-soft/80 active:bg-lavender-soft/70 ${
        saved ? 'decoration-seal decoration-2 underline underline-offset-[8px]' : ''
      }`}
    >
      {token.chars.map((char, cIndex) => (
        <span key={cIndex} className="inline-flex flex-col items-center">
          <PinyinSlot visible={showPinyin} reserveSpace={reservePinyinRow}>
            {token.pinyin[cIndex]}
          </PinyinSlot>
          <span className="font-reading text-[1.4rem] leading-none">{char}</span>
        </span>
      ))}
    </button>
  );
}

function PunctuationToken({ text, reservePinyinRow }) {
  return (
    <span className="inline-flex flex-col items-center align-bottom">
      {reservePinyinRow && <PinyinSlot visible={false} reserveSpace />}
      <span className="font-reading text-[1.4rem] leading-none text-ink-soft">{text}</span>
    </span>
  );
}

export default function ReaderView({ cleanedText, charFormat, pinyinVisible, hskFilter, onTapToken, isSaved }) {
  const [paragraphs, setParagraphs] = useState([]);
  const [peekedKeys, setPeekedKeys] = useState(() => new Set());

  useEffect(() => {
    let cancelled = false;
    if (!cleanedText.trim()) {
      setParagraphs([]);
      return;
    }
    buildParagraphs(cleanedText, charFormat).then((result) => {
      if (!cancelled) setParagraphs(result);
    });
    return () => {
      cancelled = true;
    };
  }, [cleanedText, charFormat]);

  const handlePeekStart = useCallback((key) => {
    setPeekedKeys((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }, []);

  const handlePeekEnd = useCallback((key) => {
    setPeekedKeys((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, []);

  if (!cleanedText.trim()) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center">
        <p className="max-w-sm text-base leading-relaxed text-ink-faint">
          Paste Chinese text or upload a PDF/DOCX on the left, then{' '}
          <span className="font-medium text-ink-soft">send it to the reader</span> to see it
          here — cleaned, paragraphed, and ready to tap through.
        </p>
      </div>
    );
  }

  const reservePinyinRow = pinyinVisible;

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6">
      {paragraphs.map((tokens, pIndex) => (
        <p key={pIndex} className="mb-7 text-[1.4rem] leading-[2.35] last:mb-0">
          {tokens.map((token, tIndex) => {
            const tokenKey = `${pIndex}-${tIndex}`;

            if (!token.isChinese) {
              return (
                <PunctuationToken
                  key={tIndex}
                  text={token.text}
                  reservePinyinRow={reservePinyinRow}
                />
              );
            }

            const persistentPinyin = shouldShowPinyin(pinyinVisible, hskFilter, token);
            const showPinyin = persistentPinyin || peekedKeys.has(tokenKey);

            return (
              <ChineseToken
                key={tIndex}
                token={token}
                tokenKey={tokenKey}
                showPinyin={showPinyin}
                reservePinyinRow={reservePinyinRow}
                saved={isSaved(token.text)}
                onTapToken={onTapToken}
                onPeekStart={handlePeekStart}
                onPeekEnd={handlePeekEnd}
              />
            );
          })}
        </p>
      ))}
    </div>
  );
}
