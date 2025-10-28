# Katakana Learning App with Spaced Repetition System

A WaniKani-inspired web application for learning katakana using a spaced repetition system (SRS). Built with Angular 19, Express.js, and SQLite.

> **Note:** Most of the code in this project was generated with AI assistance (Claude Code by Anthropic). The project demonstrates AI-assisted full-stack development capabilities.

## Features

### Learning System
- **26 Lesson Batches**: Progressive introduction of katakana in logical groups (vowels → basic → dakuten → combinations)
- **Interactive Lessons**: Study mode with flashcards showing character and romaji
- **User Notes/Mnemonics**: Add custom memory tricks for each character
- **Lesson Quizzes**: Test retention with shuffled questions after each batch
- **Smart Quiz Results**: First-attempt performance determines initial SRS stage
  - Correct on first try → Start at Apprentice II (8 hour interval)
  - Incorrect → Start at Apprentice I (4 hour interval)

### Spaced Repetition System (SRS)
- **8-Stage Learning System**: Apprentice → Guru → Master → Enlightened
- **104 Katakana Characters**: Basic katakana, dakuten/handakuten, and combination characters
- **Re-queuing**: Incorrectly answered items are added back to the current session until mastered
- **Interactive Reviews**: Type romaji answers with immediate feedback
- **Smart Progression**: Items advance on correct answers, reset on incorrect

### Dashboard & Analytics
- **Dual Hero Sections**:
  - Lessons section (pink/purple gradient)
  - Reviews section (blue gradient)
- **Statistics**:
  - Total items learned
  - Reviews due now
  - Reviews due today
  - Overall accuracy rate
- **SRS Stage Distribution**: Visual breakdown by learning stage
- **Upcoming Reviews**: 7-day forecast with expandable hourly breakdown
  - Click any day to see reviews per hour
  - WaniKani-style hourly schedule view

### User Experience
- **Dark Mode UI**: WaniKani-inspired color scheme
- **Keyboard Shortcuts**:
  - Enter: Submit answer / Progress to next item
  - Arrow Keys: Navigate study cards (Left/Right)
- **Auto-focus**: Input fields automatically focused after progressing
- **Smooth Animations**: Transitions for expanding sections and feedback
- **Responsive Design**: Works on desktop and mobile

### Technical
- **Persistent Data**: SQLite database for tracking all progress
- **Containerized**: Single Docker container deployment
- **PWA-Ready**: Web manifest for "Add to Home Screen"
- **Icon**: Custom katakana (カ) icon

## Architecture

- **Frontend**: Angular 19 with TypeScript, SCSS, standalone components
- **Backend**: Express.js 4 with TypeScript (serves both API and static files)
- **Database**: SQLite (better-sqlite3)
- **Deployment**: Single unified Docker container

### Unified Container Design

The application runs as a **single container** where:
- Express.js serves the built Angular app as static files
- The same Express instance handles `/api/*` routes for the backend
- No need for separate web server (Nginx) or multiple containers
- Simpler deployment and configuration

## SRS Algorithm

The app uses an 8-stage spaced repetition system:

| Stage | Level | Interval |
|-------|-------|----------|
| 0 | Apprentice I | 4 hours |
| 1 | Apprentice II | 8 hours |
| 2 | Apprentice III | 1 day |
| 3 | Apprentice IV | 3 days |
| 4 | Guru I | 1 week |
| 5 | Guru II | 2 weeks |
| 6 | Master | 1 month |
| 7 | Enlightened | 4 months |

- **Correct Answer**: Advances to the next stage
- **Incorrect Answer**: Resets to Apprentice I
- **Lesson Quiz Performance**: Determines initial starting stage (0 or 1)

## Lesson System

Katakana are introduced in 26 carefully ordered batches:

1. **Vowels** (ア, イ, ウ, エ, オ)
2. **K-row** (カ, キ, ク, ケ, コ)
3. **S-row** (サ, シ, ス, セ, ソ)
4. **T-row** (タ, チ, ツ, テ, ト)
5. **N-row** (ナ, ニ, ヌ, ネ, ノ)
6. **H-row** (ハ, ヒ, フ, ヘ, ホ)
7. **M-row** (マ, ミ, ム, メ, モ)
8. **Y-row** (ヤ, ユ, ヨ)
9. **R-row** (ラ, リ, ル, レ, ロ)
10. **W-row & N** (ワ, ヲ, ン)
11-26. Dakuten, handakuten, and combination characters

Each lesson includes:
- Study mode with romaji display
- Optional user notes for mnemonics
- Quiz with shuffled questions
- Incorrect items re-queued until correct

## Data Persistence

The SQLite database is stored in a Docker volume (`katakana-data`), ensuring data persists between container restarts. User progress, lesson completion, notes, and review history are all maintained.

## AI Development Disclosure

This project was developed with extensive AI assistance using **Claude Code** by Anthropic. The AI helped with:
- Full-stack architecture design
- Backend API and database schema
- Frontend components and services
- SRS algorithm implementation
- Lesson system design
- UI/UX implementation
- Docker configuration
- Bug fixes and feature enhancements

The project demonstrates the capabilities of AI-assisted software development in creating a complete, production-ready web application.

## Future Enhancements

- [ ] Export/import progress data (JSON/CSV)
- [ ] Audio pronunciation
- [ ] Mobile app version (PWA enhancement)
- [ ] Multiple user support with authentication
- [ ] Statistics charts and graphs

## License

MIT

## Acknowledgments

- Inspired by [WaniKani](https://www.wanikani.com/) - an excellent spaced repetition system for learning Japanese
- Developed with [Claude Code](https://claude.com/claude-code) by Anthropic
- Katakana data based on standard Japanese phonetic systems