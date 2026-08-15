// Turns raw pasted / file-extracted text into clean Chinese paragraphs.
//
// Heuristics (kept deliberately simple — KISS):
//  - A blank line marks a real paragraph break.
//  - Single line breaks inside a block are treated as mid-paragraph wraps
//    (common with PDF text extraction) and are joined with no space, since
//    Chinese doesn't use spaces between words.
//  - Anything that isn't a CJK ideograph, common Chinese punctuation, or
//    whitespace is stripped — this drops stray Latin/PDF artifacts (page
//    numbers, running headers, footnote markers) without touching meaning.

const CJK_AND_PUNCT =
  /[^\u4e00-\u9fff\u3400-\u4dbf\u3000-\u303f\uff00-\uffef，。！？；：、""''“”‘’《》〈〉〔〕【】（）…—·～\s]/g;

const PAGE_NUMBER_LINE = /^[\d\s.\-–—]+$/;

function convertPunctuation(str) {
  if (!str) return str;

  // Standardize ellipses and long dashes
  let res = str
    .replace(/\.{3,}/g, '……')
    .replace(/--+/g, '——');

  // Convert double quotes "..." to alternating “ and ”
  let isDoubleOpen = true;
  res = res.replace(/"/g, () => {
    const quote = isDoubleOpen ? '“' : '”';
    isDoubleOpen = !isDoubleOpen;
    return quote;
  });

  // Convert single quotes '...' to alternating ‘ and ’
  let isSingleOpen = true;
  res = res.replace(/'/g, () => {
    const quote = isSingleOpen ? '‘' : '’';
    isSingleOpen = !isSingleOpen;
    return quote;
  });

  // Direct 1-to-1 ASCII punctuation mappings
  const punctMap = {
    ',': '，',
    '.': '。',
    '?': '？',
    '!': '！',
    ';': '；',
    ':': '：',
    '(': '（',
    ')': '）',
    '[': '【',
    ']': '】',
    '~': '～',
    '<': '《',
    '>': '》',
  };

  return res.replace(/[,.?!;:()\[\]~<>]/g, (m) => punctMap[m] || m);
}

export function cleanText(raw) {
  if (!raw) return '';

  const blocks = raw.replace(/\r\n?/g, '\n').split(/\n{2,}/);

  const paragraphs = blocks
    .map((block) =>
      block
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line && !PAGE_NUMBER_LINE.test(line))
        .join('')
    )
    .map((paragraph) => convertPunctuation(paragraph))
    .map((paragraph) => paragraph.replace(CJK_AND_PUNCT, '').trim())
    .filter(Boolean);

  return paragraphs.join('\n\n');
}
