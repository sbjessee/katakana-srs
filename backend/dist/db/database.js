"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeDatabase = exports.initializeDatabase = exports.getDatabase = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const DB_DIR = path_1.default.join(__dirname, '../../data');
const DB_PATH = path_1.default.join(DB_DIR, 'katakana.db');
let db = null;
const getDatabase = () => {
    if (!db) {
        // Ensure data directory exists
        if (!fs_1.default.existsSync(DB_DIR)) {
            fs_1.default.mkdirSync(DB_DIR, { recursive: true });
        }
        db = new better_sqlite3_1.default(DB_PATH);
        db.pragma('journal_mode = WAL');
    }
    return db;
};
exports.getDatabase = getDatabase;
const initializeDatabase = () => {
    const database = (0, exports.getDatabase)();
    // Create katakana table
    database.exec(`
    CREATE TABLE IF NOT EXISTS katakana (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      character TEXT NOT NULL UNIQUE,
      romaji TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('basic', 'dakuten', 'combo')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    // Create reviews table
    database.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      katakana_id INTEGER NOT NULL,
      srs_stage INTEGER NOT NULL DEFAULT 0 CHECK(srs_stage >= 0 AND srs_stage <= 7),
      next_review_date DATETIME NOT NULL,
      correct_count INTEGER NOT NULL DEFAULT 0,
      incorrect_count INTEGER NOT NULL DEFAULT 0,
      last_reviewed DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (katakana_id) REFERENCES katakana(id),
      UNIQUE(katakana_id)
    )
  `);
    // Check if data is already seeded
    const count = database.prepare('SELECT COUNT(*) as count FROM katakana').get();
    if (count.count === 0) {
        console.log('Seeding katakana data...');
        seedKatakanaData(database);
        console.log('Katakana data seeded successfully');
    }
};
exports.initializeDatabase = initializeDatabase;
const seedKatakanaData = (database) => {
    // Basic katakana (46 characters)
    const basicKatakana = [
        { char: 'ア', romaji: 'a' }, { char: 'イ', romaji: 'i' }, { char: 'ウ', romaji: 'u' },
        { char: 'エ', romaji: 'e' }, { char: 'オ', romaji: 'o' },
        { char: 'カ', romaji: 'ka' }, { char: 'キ', romaji: 'ki' }, { char: 'ク', romaji: 'ku' },
        { char: 'ケ', romaji: 'ke' }, { char: 'コ', romaji: 'ko' },
        { char: 'サ', romaji: 'sa' }, { char: 'シ', romaji: 'shi' }, { char: 'ス', romaji: 'su' },
        { char: 'セ', romaji: 'se' }, { char: 'ソ', romaji: 'so' },
        { char: 'タ', romaji: 'ta' }, { char: 'チ', romaji: 'chi' }, { char: 'ツ', romaji: 'tsu' },
        { char: 'テ', romaji: 'te' }, { char: 'ト', romaji: 'to' },
        { char: 'ナ', romaji: 'na' }, { char: 'ニ', romaji: 'ni' }, { char: 'ヌ', romaji: 'nu' },
        { char: 'ネ', romaji: 'ne' }, { char: 'ノ', romaji: 'no' },
        { char: 'ハ', romaji: 'ha' }, { char: 'ヒ', romaji: 'hi' }, { char: 'フ', romaji: 'fu' },
        { char: 'ヘ', romaji: 'he' }, { char: 'ホ', romaji: 'ho' },
        { char: 'マ', romaji: 'ma' }, { char: 'ミ', romaji: 'mi' }, { char: 'ム', romaji: 'mu' },
        { char: 'メ', romaji: 'me' }, { char: 'モ', romaji: 'mo' },
        { char: 'ヤ', romaji: 'ya' }, { char: 'ユ', romaji: 'yu' }, { char: 'ヨ', romaji: 'yo' },
        { char: 'ラ', romaji: 'ra' }, { char: 'リ', romaji: 'ri' }, { char: 'ル', romaji: 'ru' },
        { char: 'レ', romaji: 're' }, { char: 'ロ', romaji: 'ro' },
        { char: 'ワ', romaji: 'wa' }, { char: 'ヲ', romaji: 'wo' }, { char: 'ン', romaji: 'n' }
    ];
    // Dakuten and Handakuten (25 characters)
    const dakutenKatakana = [
        { char: 'ガ', romaji: 'ga' }, { char: 'ギ', romaji: 'gi' }, { char: 'グ', romaji: 'gu' },
        { char: 'ゲ', romaji: 'ge' }, { char: 'ゴ', romaji: 'go' },
        { char: 'ザ', romaji: 'za' }, { char: 'ジ', romaji: 'ji' }, { char: 'ズ', romaji: 'zu' },
        { char: 'ゼ', romaji: 'ze' }, { char: 'ゾ', romaji: 'zo' },
        { char: 'ダ', romaji: 'da' }, { char: 'ヂ', romaji: 'ji' }, { char: 'ヅ', romaji: 'zu' },
        { char: 'デ', romaji: 'de' }, { char: 'ド', romaji: 'do' },
        { char: 'バ', romaji: 'ba' }, { char: 'ビ', romaji: 'bi' }, { char: 'ブ', romaji: 'bu' },
        { char: 'ベ', romaji: 'be' }, { char: 'ボ', romaji: 'bo' },
        { char: 'パ', romaji: 'pa' }, { char: 'ピ', romaji: 'pi' }, { char: 'プ', romaji: 'pu' },
        { char: 'ペ', romaji: 'pe' }, { char: 'ポ', romaji: 'po' }
    ];
    // Combination katakana (33 common ones)
    const comboKatakana = [
        { char: 'キャ', romaji: 'kya' }, { char: 'キュ', romaji: 'kyu' }, { char: 'キョ', romaji: 'kyo' },
        { char: 'シャ', romaji: 'sha' }, { char: 'シュ', romaji: 'shu' }, { char: 'ショ', romaji: 'sho' },
        { char: 'チャ', romaji: 'cha' }, { char: 'チュ', romaji: 'chu' }, { char: 'チョ', romaji: 'cho' },
        { char: 'ニャ', romaji: 'nya' }, { char: 'ニュ', romaji: 'nyu' }, { char: 'ニョ', romaji: 'nyo' },
        { char: 'ヒャ', romaji: 'hya' }, { char: 'ヒュ', romaji: 'hyu' }, { char: 'ヒョ', romaji: 'hyo' },
        { char: 'ミャ', romaji: 'mya' }, { char: 'ミュ', romaji: 'myu' }, { char: 'ミョ', romaji: 'myo' },
        { char: 'リャ', romaji: 'rya' }, { char: 'リュ', romaji: 'ryu' }, { char: 'リョ', romaji: 'ryo' },
        { char: 'ギャ', romaji: 'gya' }, { char: 'ギュ', romaji: 'gyu' }, { char: 'ギョ', romaji: 'gyo' },
        { char: 'ジャ', romaji: 'ja' }, { char: 'ジュ', romaji: 'ju' }, { char: 'ジョ', romaji: 'jo' },
        { char: 'ビャ', romaji: 'bya' }, { char: 'ビュ', romaji: 'byu' }, { char: 'ビョ', romaji: 'byo' },
        { char: 'ピャ', romaji: 'pya' }, { char: 'ピュ', romaji: 'pyu' }, { char: 'ピョ', romaji: 'pyo' }
    ];
    const insertKatakana = database.prepare('INSERT INTO katakana (character, romaji, type) VALUES (?, ?, ?)');
    const insertReview = database.prepare('INSERT INTO reviews (katakana_id, srs_stage, next_review_date) VALUES (?, 0, CURRENT_TIMESTAMP)');
    const insertMany = database.transaction((items) => {
        for (const item of items) {
            const result = insertKatakana.run(item.char, item.romaji, item.type);
            insertReview.run(result.lastInsertRowid);
        }
    });
    // Insert all data
    insertMany([
        ...basicKatakana.map(k => ({ ...k, type: 'basic' })),
        ...dakutenKatakana.map(k => ({ ...k, type: 'dakuten' })),
        ...comboKatakana.map(k => ({ ...k, type: 'combo' }))
    ]);
};
const closeDatabase = () => {
    if (db) {
        db.close();
        db = null;
    }
};
exports.closeDatabase = closeDatabase;
