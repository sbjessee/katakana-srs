// Lesson batch organization - organized from simple to complex
export interface LessonBatch {
  batch_number: number;
  name: string;
  description: string;
  katakana_characters: string[]; // Array of katakana characters in this batch
}

export const LESSON_BATCHES: LessonBatch[] = [
  // Basic Vowels
  {
    batch_number: 1,
    name: 'Vowels',
    description: 'The five basic vowel sounds - foundation of katakana',
    katakana_characters: ['ア', 'イ', 'ウ', 'エ', 'オ']
  },

  // Basic Consonants
  {
    batch_number: 2,
    name: 'K Sounds',
    description: 'K-row sounds (ka, ki, ku, ke, ko)',
    katakana_characters: ['カ', 'キ', 'ク', 'ケ', 'コ']
  },
  {
    batch_number: 3,
    name: 'S Sounds',
    description: 'S-row sounds (sa, shi, su, se, so)',
    katakana_characters: ['サ', 'シ', 'ス', 'セ', 'ソ']
  },
  {
    batch_number: 4,
    name: 'T Sounds',
    description: 'T-row sounds (ta, chi, tsu, te, to)',
    katakana_characters: ['タ', 'チ', 'ツ', 'テ', 'ト']
  },
  {
    batch_number: 5,
    name: 'N Sounds',
    description: 'N-row sounds (na, ni, nu, ne, no)',
    katakana_characters: ['ナ', 'ニ', 'ヌ', 'ネ', 'ノ']
  },
  {
    batch_number: 6,
    name: 'H Sounds',
    description: 'H-row sounds (ha, hi, fu, he, ho)',
    katakana_characters: ['ハ', 'ヒ', 'フ', 'ヘ', 'ホ']
  },
  {
    batch_number: 7,
    name: 'M Sounds',
    description: 'M-row sounds (ma, mi, mu, me, mo)',
    katakana_characters: ['マ', 'ミ', 'ム', 'メ', 'モ']
  },
  {
    batch_number: 8,
    name: 'Y Sounds',
    description: 'Y-row sounds (ya, yu, yo)',
    katakana_characters: ['ヤ', 'ユ', 'ヨ']
  },
  {
    batch_number: 9,
    name: 'R Sounds',
    description: 'R-row sounds (ra, ri, ru, re, ro)',
    katakana_characters: ['ラ', 'リ', 'ル', 'レ', 'ロ']
  },
  {
    batch_number: 10,
    name: 'W & N Sounds',
    description: 'W-row and standalone N (wa, wo, n)',
    katakana_characters: ['ワ', 'ヲ', 'ン']
  },

  // Dakuten (Voiced Consonants)
  {
    batch_number: 11,
    name: 'G Sounds',
    description: 'Voiced K sounds with dakuten (ga, gi, gu, ge, go)',
    katakana_characters: ['ガ', 'ギ', 'グ', 'ゲ', 'ゴ']
  },
  {
    batch_number: 12,
    name: 'Z Sounds',
    description: 'Voiced S sounds with dakuten (za, ji, zu, ze, zo)',
    katakana_characters: ['ザ', 'ジ', 'ズ', 'ゼ', 'ゾ']
  },
  {
    batch_number: 13,
    name: 'D Sounds',
    description: 'Voiced T sounds with dakuten (da, ji, zu, de, do)',
    katakana_characters: ['ダ', 'ヂ', 'ヅ', 'デ', 'ド']
  },
  {
    batch_number: 14,
    name: 'B Sounds',
    description: 'Voiced H sounds with dakuten (ba, bi, bu, be, bo)',
    katakana_characters: ['バ', 'ビ', 'ブ', 'ベ', 'ボ']
  },
  {
    batch_number: 15,
    name: 'P Sounds',
    description: 'H sounds with handakuten (pa, pi, pu, pe, po)',
    katakana_characters: ['パ', 'ピ', 'プ', 'ペ', 'ポ']
  },

  // Combination Sounds (Yōon)
  {
    batch_number: 16,
    name: 'KY Combinations',
    description: 'K + Y combinations (kya, kyu, kyo)',
    katakana_characters: ['キャ', 'キュ', 'キョ']
  },
  {
    batch_number: 17,
    name: 'SH Combinations',
    description: 'SH + Y combinations (sha, shu, sho)',
    katakana_characters: ['シャ', 'シュ', 'ショ']
  },
  {
    batch_number: 18,
    name: 'CH Combinations',
    description: 'CH + Y combinations (cha, chu, cho)',
    katakana_characters: ['チャ', 'チュ', 'チョ']
  },
  {
    batch_number: 19,
    name: 'NY Combinations',
    description: 'N + Y combinations (nya, nyu, nyo)',
    katakana_characters: ['ニャ', 'ニュ', 'ニョ']
  },
  {
    batch_number: 20,
    name: 'HY Combinations',
    description: 'H + Y combinations (hya, hyu, hyo)',
    katakana_characters: ['ヒャ', 'ヒュ', 'ヒョ']
  },
  {
    batch_number: 21,
    name: 'MY Combinations',
    description: 'M + Y combinations (mya, myu, myo)',
    katakana_characters: ['ミャ', 'ミュ', 'ミョ']
  },
  {
    batch_number: 22,
    name: 'RY Combinations',
    description: 'R + Y combinations (rya, ryu, ryo)',
    katakana_characters: ['リャ', 'リュ', 'リョ']
  },
  {
    batch_number: 23,
    name: 'GY Combinations',
    description: 'G + Y combinations (gya, gyu, gyo)',
    katakana_characters: ['ギャ', 'ギュ', 'ギョ']
  },
  {
    batch_number: 24,
    name: 'J Combinations',
    description: 'J + Y combinations (ja, ju, jo)',
    katakana_characters: ['ジャ', 'ジュ', 'ジョ']
  },
  {
    batch_number: 25,
    name: 'BY Combinations',
    description: 'B + Y combinations (bya, byu, byo)',
    katakana_characters: ['ビャ', 'ビュ', 'ビョ']
  },
  {
    batch_number: 26,
    name: 'PY Combinations',
    description: 'P + Y combinations (pya, pyu, pyo)',
    katakana_characters: ['ピャ', 'ピュ', 'ピョ']
  }
];

// Total: 104 katakana across 26 batches
