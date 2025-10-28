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

## Quick Start with Docker

### Prerequisites
- Docker
- Docker Compose

### Run the Application

```bash
# Clone the repository
git clone https://github.com/yourusername/katakana.git
cd katakana

# Start the application (single container)
docker-compose up -d

# The app will be available at:
# Application: http://localhost:3000
# API Endpoints: http://localhost:3000/api
```

The frontend and backend run in a **single unified container** - Express serves both the API and the Angular static files.

### Stop the Application

```bash
docker-compose down

# To remove data as well:
docker-compose down -v
```

## Development Setup

### Prerequisites
- Node.js 22+
- npm 11+

### Backend Setup

```bash
cd backend
npm install
npm run dev  # Starts on port 3000
```

### Frontend Setup

```bash
cd frontend
npm install
npm start  # Starts on port 4200 with API proxy to :3000
```

The frontend uses a proxy configuration ([proxy.conf.json](frontend/proxy.conf.json)) to forward `/api/*` requests to the backend during development. In production, both are served from the same Express server on port 3000.

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

## API Endpoints

### Core
- `GET /api/health` - Health check
- `GET /api/stats` - Dashboard statistics

### Katakana
- `GET /api/katakana` - All katakana with review status

### Reviews
- `GET /api/reviews/due` - Reviews currently due
- `GET /api/reviews/upcoming` - Upcoming reviews (next 7 days)
- `GET /api/reviews/upcoming/:date/hourly` - Hourly breakdown for a specific date
- `POST /api/reviews/:id/answer` - Submit review answer

### Lessons
- `GET /api/lessons` - All lesson batches with completion status
- `GET /api/lessons/next` - Next incomplete lesson
- `GET /api/lessons/:batchNumber/items` - Items in a lesson batch
- `POST /api/lessons/:batchNumber/complete` - Complete lesson (with quiz results)
- `POST /api/lessons/notes` - Save user note/mnemonic
- `DELETE /api/lessons/notes/:katakanaId` - Delete user note

## Project Structure

```
katakana/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── database.ts          # SQLite setup & seeding
│   │   │   └── lesson-batches.ts    # 26 lesson batch definitions
│   │   ├── models/
│   │   │   └── types.ts              # TypeScript interfaces
│   │   ├── routes/
│   │   │   ├── api.routes.ts         # Core API endpoints
│   │   │   └── lesson.routes.ts      # Lesson API endpoints
│   │   ├── services/
│   │   │   ├── srs.service.ts        # SRS logic & stats
│   │   │   └── lesson.service.ts     # Lesson management
│   │   └── index.ts                  # Express server
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── dashboard/        # Dashboard with stats
│   │   │   │   ├── review/           # Review session
│   │   │   │   ├── lesson/           # Lesson system
│   │   │   │   └── katakana-list/    # All katakana list
│   │   │   ├── models/
│   │   │   │   └── katakana.model.ts # TypeScript models
│   │   │   ├── services/
│   │   │   │   ├── api.service.ts    # HTTP service
│   │   │   │   └── lesson.service.ts # Lesson HTTP service
│   │   │   └── app.routes.ts         # Routing
│   │   ├── styles.scss               # Global dark mode styles
│   │   └── index.html                # PWA manifest
│   ├── public/
│   │   ├── manifest.json             # PWA manifest
│   │   └── icon.svg                  # App icon
│   └── package.json
├── Dockerfile                         # Multi-stage build
├── docker-compose.yml                 # Single container orchestration
├── .gitignore
└── README.md
```

## Database Schema

The SQLite database (`backend/data/katakana.db`) contains:

### Tables

**katakana**
- `id` - Primary key
- `character` - Katakana character
- `romaji` - Romanization
- `type` - basic | dakuten | combo
- `lesson_batch_number` - Which lesson introduces this character
- `created_at` - Timestamp

**reviews**
- `id` - Primary key
- `katakana_id` - Foreign key
- `srs_stage` - Current SRS stage (0-7)
- `next_review_date` - When next review is due
- `correct_count` - Number of correct answers
- `incorrect_count` - Number of incorrect answers
- `last_reviewed` - Last review timestamp
- `created_at` - Timestamp

**lesson_batches**
- `batch_number` - Primary key
- `name` - Batch name (e.g., "Vowels", "K-row")
- `description` - Batch description
- `completed` - Boolean completion status
- `completed_at` - Completion timestamp

**user_notes**
- `id` - Primary key
- `katakana_id` - Foreign key
- `note` - User's mnemonic/note
- `created_at` - Timestamp
- `updated_at` - Last update timestamp

## Usage Guide

### 1. Start with Lessons
- Dashboard shows available lessons
- Click "Start Lesson" to begin
- Study each character with its romaji
- Add optional memory tricks in the notes section
- Take the quiz at the end (incorrect items re-queued)
- Complete lesson to unlock reviews

### 2. Daily Reviews
- Dashboard shows reviews due now
- Click "Start Reviews" when items are ready
- Type the romaji for each character
- Use Enter key to submit and progress
- Incorrect items are added back to the current session
- Track your progress and accuracy

### 3. Monitor Progress
- View statistics on the dashboard
- Check SRS stage distribution
- See upcoming reviews for the next 7 days
- Click any day to see hourly breakdown
- Track overall accuracy rate

## Keyboard Shortcuts

### Review & Quiz Sessions
- **Enter**: Submit answer or progress to next item
- **Enter** (during feedback): Proceed to next question

### Lesson Study Mode
- **Enter**: Move to next card
- **Arrow Right**: Next card
- **Arrow Left**: Previous card

## Technologies Used

- **Angular 19**: Modern web framework with signals and standalone components
- **Express.js 4**: Node.js web framework
- **TypeScript**: Type-safe development
- **SQLite**: Lightweight embedded database
- **better-sqlite3**: Fast synchronous SQLite driver
- **SCSS**: Styling with CSS variables
- **Docker**: Containerization with multi-stage builds
- **RxJS**: Reactive programming

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

- [ ] Add hiragana support
- [ ] Export/import progress data (JSON/CSV)
- [ ] Study session customization (batch size, SRS intervals)
- [ ] Audio pronunciation
- [ ] Kanji support
- [ ] Mobile app version (PWA enhancement)
- [ ] Multiple user support with authentication
- [ ] Statistics charts and graphs
- [ ] Custom lesson creation

## License

MIT

## Acknowledgments

- Inspired by [WaniKani](https://www.wanikani.com/) - an excellent spaced repetition system for learning Japanese
- Developed with [Claude Code](https://claude.com/claude-code) by Anthropic
- Katakana data based on standard Japanese phonetic systems

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.
