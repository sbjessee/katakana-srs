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
  migrateToAcceleratedSchedule(database);
};

/**
 * Migration: Update all reviews to use WaniKani's accelerated schedule (levels 1-2)
 * - Apprentice I: 4h → 2h
 * - Apprentice II: 8h → 4h
 * - Apprentice III: 1d → 8h
 * - Apprentice IV: 2d → 1d
 * - Round all times to the top of the hour
 * Safe to run multiple times (idempotent).
 */
const migrateToAcceleratedSchedule = (database: Database.Database): void => {
  // Update reviews that have been reviewed - recalculate based on last_reviewed + new interval
  const updateReviewed = `
    UPDATE reviews
    SET next_review_date = CASE
      WHEN srs_stage = 0 THEN datetime(strftime('%Y-%m-%d %H:00:00', datetime(last_reviewed, '+2 hours')))
      WHEN srs_stage = 1 THEN datetime(strftime('%Y-%m-%d %H:00:00', datetime(last_reviewed, '+4 hours')))
      WHEN srs_stage = 2 THEN datetime(strftime('%Y-%m-%d %H:00:00', datetime(last_reviewed, '+8 hours')))
      WHEN srs_stage = 3 THEN datetime(strftime('%Y-%m-%d %H:00:00', datetime(last_reviewed, '+24 hours')))
      WHEN srs_stage = 4 THEN datetime(strftime('%Y-%m-%d %H:00:00', datetime(last_reviewed, '+168 hours')))
      WHEN srs_stage = 5 THEN datetime(strftime('%Y-%m-%d %H:00:00', datetime(last_reviewed, '+336 hours')))
      WHEN srs_stage = 6 THEN datetime(strftime('%Y-%m-%d %H:00:00', datetime(last_reviewed, '+720 hours')))
      WHEN srs_stage = 7 THEN datetime(strftime('%Y-%m-%d %H:00:00', datetime(last_reviewed, '+2880 hours')))
    END
    WHERE last_reviewed IS NOT NULL
  `;

  // Update reviews that haven't been reviewed yet - recalculate based on created_at + new interval
  const updateNotReviewed = `
    UPDATE reviews
    SET next_review_date = CASE
      WHEN srs_stage = 0 THEN datetime(strftime('%Y-%m-%d %H:00:00', datetime(created_at, '+2 hours')))
      WHEN srs_stage = 1 THEN datetime(strftime('%Y-%m-%d %H:00:00', datetime(created_at, '+4 hours')))
      WHEN srs_stage = 2 THEN datetime(strftime('%Y-%m-%d %H:00:00', datetime(created_at, '+8 hours')))
      WHEN srs_stage = 3 THEN datetime(strftime('%Y-%m-%d %H:00:00', datetime(created_at, '+24 hours')))
      WHEN srs_stage = 4 THEN datetime(strftime('%Y-%m-%d %H:00:00', datetime(created_at, '+168 hours')))
      WHEN srs_stage = 5 THEN datetime(strftime('%Y-%m-%d %H:00:00', datetime(created_at, '+336 hours')))
      WHEN srs_stage = 6 THEN datetime(strftime('%Y-%m-%d %H:00:00', datetime(created_at, '+720 hours')))
      WHEN srs_stage = 7 THEN datetime(strftime('%Y-%m-%d %H:00:00', datetime(created_at, '+2880 hours')))
    END
    WHERE last_reviewed IS NULL
  `;

  const result1 = database.prepare(updateReviewed).run();
  const result2 = database.prepare(updateNotReviewed).run();

  const totalChanges = result1.changes + result2.changes;
  if (totalChanges > 0) {
    console.log(`Migration: Updated ${totalChanges} review(s) to accelerated schedule with rounded times`);
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
