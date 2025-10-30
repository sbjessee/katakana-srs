import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { LESSON_BATCHES } from './lesson-batches';

const DB_DIR = path.join(__dirname, '../../data');
const DB_PATH = path.join(DB_DIR, 'katakana.db');

let db: Database.Database | null = null;

export const getDatabase = (): Database.Database => {
  if (!db) {
    // Ensure data directory exists
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
  }
  return db;
};

export const initializeDatabase = (): void => {
  const database = getDatabase();

  // Create katakana table
  database.exec(`
    CREATE TABLE IF NOT EXISTS katakana (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      character TEXT NOT NULL UNIQUE,
      romaji TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('basic', 'dakuten', 'combo')),
      lesson_batch_number INTEGER NOT NULL DEFAULT 1,
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

  // Create lesson_batches table
  database.exec(`
    CREATE TABLE IF NOT EXISTS lesson_batches (
      batch_number INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      completed BOOLEAN NOT NULL DEFAULT 0,
      completed_at DATETIME
    )
  `);

  // Create user_notes table
  database.exec(`
    CREATE TABLE IF NOT EXISTS user_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      katakana_id INTEGER NOT NULL,
      note TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (katakana_id) REFERENCES katakana(id),
      UNIQUE(katakana_id)
    )
  `);

  // Check if data is already seeded
  const count = database.prepare('SELECT COUNT(*) as count FROM katakana').get() as { count: number };

  if (count.count === 0) {
    console.log('Seeding katakana data...');
    seedKatakanaData(database);
    console.log('Katakana data seeded successfully');
  }

  // Check if lesson batches are seeded
  const batchCount = database.prepare('SELECT COUNT(*) as count FROM lesson_batches').get() as { count: number };

  if (batchCount.count === 0) {
    console.log('Seeding lesson batches...');
    seedLessonBatches(database);
    console.log('Lesson batches seeded successfully');
  }

  // Run migrations for existing data
  migrateApprentice4Intervals(database);
};

/**
 * Migration: Update APPRENTICE_4 reviews to use new 48-hour interval (down from 72 hours)
 * This brings the schedule in line with WaniKani's timing.
 * Safe to run multiple times (idempotent).
 */
const migrateApprentice4Intervals = (database: Database.Database): void => {
  // Update all APPRENTICE_4 (stage 3) reviews that have been reviewed
  // Recalculate next_review_date as last_reviewed + 48 hours
  // If the calculated date is in the past, set to now (make it due immediately)
  const query = `
    UPDATE reviews
    SET next_review_date = MAX(
      datetime(last_reviewed, '+48 hours'),
      datetime('now')
    )
    WHERE srs_stage = 3
    AND last_reviewed IS NOT NULL
    AND datetime(next_review_date) > datetime('now')
  `;

  const result = database.prepare(query).run();

  if (result.changes > 0) {
    console.log(`Migration: Updated ${result.changes} APPRENTICE_4 review(s) to new 48-hour interval`);
  }
};

// Lookup table for katakana character types
const KATAKANA_TYPES: Record<string, 'basic' | 'dakuten' | 'combo'> = {
  'ア': 'basic', 'イ': 'basic', 'ウ': 'basic', 'エ': 'basic', 'オ': 'basic',
  'カ': 'basic', 'キ': 'basic', 'ク': 'basic', 'ケ': 'basic', 'コ': 'basic',
  'サ': 'basic', 'シ': 'basic', 'ス': 'basic', 'セ': 'basic', 'ソ': 'basic',
  'タ': 'basic', 'チ': 'basic', 'ツ': 'basic', 'テ': 'basic', 'ト': 'basic',
  'ナ': 'basic', 'ニ': 'basic', 'ヌ': 'basic', 'ネ': 'basic', 'ノ': 'basic',
  'ハ': 'basic', 'ヒ': 'basic', 'フ': 'basic', 'ヘ': 'basic', 'ホ': 'basic',
  'マ': 'basic', 'ミ': 'basic', 'ム': 'basic', 'メ': 'basic', 'モ': 'basic',
  'ヤ': 'basic', 'ユ': 'basic', 'ヨ': 'basic',
  'ラ': 'basic', 'リ': 'basic', 'ル': 'basic', 'レ': 'basic', 'ロ': 'basic',
  'ワ': 'basic', 'ヲ': 'basic', 'ン': 'basic',
  'ガ': 'dakuten', 'ギ': 'dakuten', 'グ': 'dakuten', 'ゲ': 'dakuten', 'ゴ': 'dakuten',
  'ザ': 'dakuten', 'ジ': 'dakuten', 'ズ': 'dakuten', 'ゼ': 'dakuten', 'ゾ': 'dakuten',
  'ダ': 'dakuten', 'ヂ': 'dakuten', 'ヅ': 'dakuten', 'デ': 'dakuten', 'ド': 'dakuten',
  'バ': 'dakuten', 'ビ': 'dakuten', 'ブ': 'dakuten', 'ベ': 'dakuten', 'ボ': 'dakuten',
  'パ': 'dakuten', 'ピ': 'dakuten', 'プ': 'dakuten', 'ペ': 'dakuten', 'ポ': 'dakuten',
  'キャ': 'combo', 'キュ': 'combo', 'キョ': 'combo',
  'シャ': 'combo', 'シュ': 'combo', 'ショ': 'combo',
  'チャ': 'combo', 'チュ': 'combo', 'チョ': 'combo',
  'ニャ': 'combo', 'ニュ': 'combo', 'ニョ': 'combo',
  'ヒャ': 'combo', 'ヒュ': 'combo', 'ヒョ': 'combo',
  'ミャ': 'combo', 'ミュ': 'combo', 'ミョ': 'combo',
  'リャ': 'combo', 'リュ': 'combo', 'リョ': 'combo',
  'ギャ': 'combo', 'ギュ': 'combo', 'ギョ': 'combo',
  'ジャ': 'combo', 'ジュ': 'combo', 'ジョ': 'combo',
  'ビャ': 'combo', 'ビュ': 'combo', 'ビョ': 'combo',
  'ピャ': 'combo', 'ピュ': 'combo', 'ピョ': 'combo',
};

// Lookup table for katakana romaji
const KATAKANA_ROMAJI: Record<string, string> = {
  'ア': 'a', 'イ': 'i', 'ウ': 'u', 'エ': 'e', 'オ': 'o',
  'カ': 'ka', 'キ': 'ki', 'ク': 'ku', 'ケ': 'ke', 'コ': 'ko',
  'サ': 'sa', 'シ': 'shi', 'ス': 'su', 'セ': 'se', 'ソ': 'so',
  'タ': 'ta', 'チ': 'chi', 'ツ': 'tsu', 'テ': 'te', 'ト': 'to',
  'ナ': 'na', 'ニ': 'ni', 'ヌ': 'nu', 'ネ': 'ne', 'ノ': 'no',
  'ハ': 'ha', 'ヒ': 'hi', 'フ': 'fu', 'ヘ': 'he', 'ホ': 'ho',
  'マ': 'ma', 'ミ': 'mi', 'ム': 'mu', 'メ': 'me', 'モ': 'mo',
  'ヤ': 'ya', 'ユ': 'yu', 'ヨ': 'yo',
  'ラ': 'ra', 'リ': 'ri', 'ル': 'ru', 'レ': 're', 'ロ': 'ro',
  'ワ': 'wa', 'ヲ': 'wo', 'ン': 'n',
  'ガ': 'ga', 'ギ': 'gi', 'グ': 'gu', 'ゲ': 'ge', 'ゴ': 'go',
  'ザ': 'za', 'ジ': 'ji', 'ズ': 'zu', 'ゼ': 'ze', 'ゾ': 'zo',
  'ダ': 'da', 'ヂ': 'ji', 'ヅ': 'zu', 'デ': 'de', 'ド': 'do',
  'バ': 'ba', 'ビ': 'bi', 'ブ': 'bu', 'ベ': 'be', 'ボ': 'bo',
  'パ': 'pa', 'ピ': 'pi', 'プ': 'pu', 'ペ': 'pe', 'ポ': 'po',
  'キャ': 'kya', 'キュ': 'kyu', 'キョ': 'kyo',
  'シャ': 'sha', 'シュ': 'shu', 'ショ': 'sho',
  'チャ': 'cha', 'チュ': 'chu', 'チョ': 'cho',
  'ニャ': 'nya', 'ニュ': 'nyu', 'ニョ': 'nyo',
  'ヒャ': 'hya', 'ヒュ': 'hyu', 'ヒョ': 'hyo',
  'ミャ': 'mya', 'ミュ': 'myu', 'ミョ': 'myo',
  'リャ': 'rya', 'リュ': 'ryu', 'リョ': 'ryo',
  'ギャ': 'gya', 'ギュ': 'gyu', 'ギョ': 'gyo',
  'ジャ': 'ja', 'ジュ': 'ju', 'ジョ': 'jo',
  'ビャ': 'bya', 'ビュ': 'byu', 'ビョ': 'byo',
  'ピャ': 'pya', 'ピュ': 'pyu', 'ピョ': 'pyo',
};

const seedKatakanaData = (database: Database.Database): void => {
  const insertKatakana = database.prepare(
    'INSERT INTO katakana (character, romaji, type, lesson_batch_number) VALUES (?, ?, ?, ?)'
  );

  // Don't create reviews for katakana yet - they're created when lesson is completed

  const insertMany = database.transaction(() => {
    for (const batch of LESSON_BATCHES) {
      for (const character of batch.katakana_characters) {
        const romaji = KATAKANA_ROMAJI[character];
        const type = KATAKANA_TYPES[character];
        insertKatakana.run(character, romaji, type, batch.batch_number);
      }
    }
  });

  insertMany();
};

const seedLessonBatches = (database: Database.Database): void => {
  const insert = database.prepare(
    'INSERT INTO lesson_batches (batch_number, name, description, completed) VALUES (?, ?, ?, 0)'
  );

  const insertMany = database.transaction(() => {
    for (const batch of LESSON_BATCHES) {
      insert.run(batch.batch_number, batch.name, batch.description);
    }
  });

  insertMany();
};

export const closeDatabase = (): void => {
  if (db) {
    db.close();
    db = null;
  }
};
