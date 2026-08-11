// Static HSK 1–6 level lookup: { "word": 1..6 }. Built from the MIT-licensed
// "Complete HSK Vocabulary" project — see src/data/README.md. A word absent
// from this map is treated as beyond HSK 6 / unleveled, and its pinyin is
// only shown when the reader's HSK filter is set to "All".
import levels from './hskWords.json';

export default levels;
