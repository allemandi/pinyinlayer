import { useCallback, useEffect, useRef, useState } from 'react';
import { tokenizeParagraph } from '../utils/getPinyin.js';
import { shouldShowPinyin } from '../utils/pinyinVisibility.js';
import { loadConversionMaps, convertTextSync, convertWordSync } from '../utils/chineseConversion.js';

const LONG_PRESS_MS = 450;

const TEXT_SIZE_CONFIG = {
  sm: {
    paragraph: 'text-[1.15rem] leading-[2.1]',
    pinyinSlot: 'h-[1em] text-[0.75rem]',
    char: 'text-[1.15rem]',
    underline: 'underline-offset-[6px]',
  },
  md: {
    paragraph: 'text-[1.4rem] leading-[2.35]',
    pinyinSlot: 'h-[1.15em] text-[0.85rem]',
    char: 'text-[1.4rem]',
    underline: 'underline-offset-[8px]',
  },
  lg: {
    paragraph: 'text-[1.75rem] leading-[2.5]',
    pinyinSlot: 'h-[1.25em] text-[0.95rem]',
    char: 'text-[1.75rem]',
    underline: 'underline-offset-[10px]',
  },
  xl: {
    paragraph: 'text-[2.1rem] leading-[2.65]',
    pinyinSlot: 'h-[1.35em] text-[1.1rem]',
    char: 'text-[2.1rem]',
    underline: 'underline-offset-[12px]',
  },
};

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
  const maps = await loadConversionMaps();
  // If formatting to simplified or traditional, we do tokenization on Simplified text for best segmentation accuracy.
  const segmentingFormat = charFormat === 'original' ? 'original' : 'simplified';
  const processedText = convertTextSync(cleanedText, segmentingFormat, maps);

  const blocks = processedText.split(/\n{2,}/).filter(Boolean);
  const paragraphPromises = blocks.map(async (paragraph) => {
    const sentences = splitSentences(paragraph);
    const tokens = await tokenizeParagraph(paragraph);
    let offset = 0;

    return tokens.map((token) => {
      const start = offset;
      offset += token.text.length;
      const sentence = sentences.find((s) => start >= s.start && start < s.end);
      const tokenSentence = sentence ? sentence.text : paragraph;

      // If formatting to Traditional, convert the Simplified token/sentence back to Traditional Chinese
      if (charFormat === 'traditional') {
        const tradText = convertWordSync(token.text, 'traditional', maps);
        const tradChars = token.chars.map((c) => convertWordSync(c, 'traditional', maps));
        const tradSentence = convertTextSync(tokenSentence, 'traditional', maps);

        return {
          ...token,
          text: tradText,
          chars: tradChars,
          sentence: tradSentence,
          simpText: token.text,
          simpChars: token.chars,
        };
      }

      if (charFormat === 'original') {
        const simpText = convertWordSync(token.text, 'simplified', maps);
        const simpChars = token.chars.map((c) => convertWordSync(c, 'simplified', maps));
        return {
          ...token,
          sentence: tokenSentence,
          simpText,
          simpChars,
        };
      }

      return {
        ...token,
        sentence: tokenSentence,
        simpText: token.text,
        simpChars: token.chars,
      };
    });
  });

  return Promise.all(paragraphPromises);
}

function PinyinSlot({ visible, children, reserveSpace, sizeConfig }) {
  return (
    <span
      className={`block text-center font-medium leading-none text-jade transition-opacity ${
        sizeConfig.pinyinSlot
      } ${
        reserveSpace ? 'block' : ''
      } ${visible ? 'opacity-100' : reserveSpace ? 'opacity-0' : 'hidden'}`}
      aria-hidden={!visible}
    >
      {children || '\u00A0'}
    </span>
  );
}

function ChineseToken({ token, tokenKey, showPinyin, reservePinyinRow, saved, onTapToken, onPeekStart, onPeekEnd, sizeConfig }) {
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
      className={`group relative inline-flex items-end gap-px rounded-md px-1 py-0.5 align-bottom transition-all duration-150 cursor-pointer hover:bg-jade-soft/90 active:bg-lavender-soft/80 hover:shadow-xs focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-jade ${
        saved ? `decoration-seal decoration-2 underline ${sizeConfig.underline}` : ''
      }`}
    >
      {token.chars.map((char, cIndex) => (
        <span key={cIndex} className="inline-flex flex-col items-center">
          <PinyinSlot visible={showPinyin} reserveSpace={reservePinyinRow} sizeConfig={sizeConfig}>
            {token.pinyin[cIndex]}
          </PinyinSlot>
          <span className={`font-reading ${sizeConfig.char} leading-none`}>{char}</span>
        </span>
      ))}
    </button>
  );
}

function PunctuationToken({ text, reservePinyinRow, sizeConfig }) {
  return (
    <span className="inline-flex flex-col items-center align-bottom">
      {reservePinyinRow && <PinyinSlot visible={false} reserveSpace sizeConfig={sizeConfig} />}
      <span className={`font-reading ${sizeConfig.char} leading-none text-ink-soft`}>{text}</span>
    </span>
  );
}

export default function ReaderView({ cleanedText, charFormat, textSize = 'md', pinyinVisible, hskFilter, onTapToken, isSaved }) {
  const [paragraphs, setParagraphs] = useState([]);
  const [peekedKeys, setPeekedKeys] = useState(() => new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!cleanedText.trim()) {
      setParagraphs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    buildParagraphs(cleanedText, charFormat)
      .then((result) => {
        if (!cancelled) {
          setParagraphs(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to segment text:', err);
        if (!cancelled) {
          setLoading(false);
        }
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
          Paste Chinese text or upload a PDF/DOCX in the <span className="font-semibold text-ink-soft">Input</span> panel, then click{' '}
          <span className="font-semibold text-ink-soft">Send to reader</span> to see it
          here — cleaned, paragraphed, and ready to tap through.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-6 animate-pulse" aria-busy="true" aria-live="polite">
        {[1, 2, 3].map((p) => (
          <div key={p} className="space-y-3">
            <div className="h-4 bg-jade-soft/50 dark:bg-slate-800 rounded-md w-11/12" />
            <div className="h-4 bg-jade-soft/50 dark:bg-slate-800 rounded-md w-full" />
            <div className="h-4 bg-jade-soft/50 dark:bg-slate-800 rounded-md w-10/12" />
          </div>
        ))}
        <p className="text-center text-xs text-ink-faint pt-4">Segmenting and loading annotations...</p>
      </div>
    );
  }

  const reservePinyinRow = pinyinVisible;
  const sizeConfig = TEXT_SIZE_CONFIG[textSize] || TEXT_SIZE_CONFIG.md;

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6">
      {paragraphs.map((tokens, pIndex) => (
        <p key={pIndex} className={`mb-7 ${sizeConfig.paragraph} last:mb-0`}>
          {tokens.map((token, tIndex) => {
            const tokenKey = `${pIndex}-${tIndex}`;

            if (!token.isChinese) {
              return (
                <PunctuationToken
                  key={tIndex}
                  text={token.text}
                  reservePinyinRow={reservePinyinRow}
                  sizeConfig={sizeConfig}
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
                sizeConfig={sizeConfig}
              />
            );
          })}
        </p>
      ))}
    </div>
  );
}
