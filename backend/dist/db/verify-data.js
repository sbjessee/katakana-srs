"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("./database");
const db = (0, database_1.getDatabase)();
// Count total katakana
const totalCount = db.prepare('SELECT COUNT(*) as count FROM katakana').get();
console.log(`Total katakana: ${totalCount.count}`);
// Count by type
const typeCount = db.prepare('SELECT type, COUNT(*) as count FROM katakana GROUP BY type').all();
console.log('\nBreakdown by type:');
typeCount.forEach(row => {
    console.log(`  ${row.type}: ${row.count}`);
});
// Sample some katakana
const samples = db.prepare('SELECT character, romaji, type FROM katakana LIMIT 10').all();
console.log('\nSample katakana:');
samples.forEach((row) => {
    console.log(`  ${row.character} (${row.romaji}) - ${row.type}`);
});
// Check reviews table
const reviewCount = db.prepare('SELECT COUNT(*) as count FROM reviews').get();
console.log(`\nTotal reviews initialized: ${reviewCount.count}`);
// Sample reviews with katakana
const reviewSamples = db.prepare(`
  SELECT k.character, k.romaji, r.srs_stage, r.next_review_date
  FROM reviews r
  JOIN katakana k ON r.katakana_id = k.id
  LIMIT 5
`).all();
console.log('\nSample reviews:');
reviewSamples.forEach((row) => {
    console.log(`  ${row.character} (${row.romaji}) - Stage: ${row.srs_stage}, Next: ${row.next_review_date}`);
});
