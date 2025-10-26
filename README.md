# Katakana Learning App with Spaced Repetition System

A WaniKani-inspired web application for learning katakana using a spaced repetition system (SRS). Built with Angular 19, Express.js, and SQLite.

## Features

- **Spaced Repetition System (SRS)**: 8-stage learning system (Apprentice → Guru → Master → Enlightened)
- **104 Katakana Characters**: Basic katakana, dakuten/handakuten, and combination characters
- **Interactive Reviews**: Type romaji answers with immediate feedback
- **Progress Tracking**: Dashboard with statistics and upcoming reviews
- **Dark Mode UI**: WaniKani-inspired color scheme
- **Persistent Data**: SQLite database for tracking progress
- **Containerized**: Docker deployment for easy setup

## Architecture

- **Frontend**: Angular 19 with TypeScript, SCSS
- **Backend**: Express.js with TypeScript
- **Database**: SQLite (better-sqlite3)
- **Deployment**: Docker & Docker Compose

## Quick Start with Docker

### Prerequisites
- Docker
- Docker Compose

### Run the Application

```bash
# Clone the repository
git clone <your-repo-url>
cd katakana

# Start the application
docker-compose up -d

# The app will be available at:
# Frontend: http://localhost:8080
# Backend API: http://localhost:3000
```

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
npm start  # Starts on port 4200
```

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

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/stats` - Dashboard statistics
- `GET /api/katakana` - All katakana with review status
- `GET /api/reviews/due` - Reviews currently due
- `GET /api/reviews/upcoming` - Upcoming reviews (next 7 days)
- `POST /api/reviews/:id/answer` - Submit review answer

## Project Structure

```
katakana/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   └── database.ts          # SQLite setup & seeding
│   │   ├── models/
│   │   │   └── types.ts              # TypeScript interfaces
│   │   ├── routes/
│   │   │   └── api.routes.ts         # API endpoints
│   │   ├── services/
│   │   │   └── srs.service.ts        # SRS logic
│   │   └── index.ts                  # Express server
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── dashboard/        # Dashboard component
│   │   │   │   ├── review/           # Review session component
│   │   │   │   └── katakana-list/    # All katakana list
│   │   │   ├── models/
│   │   │   │   └── katakana.model.ts # TypeScript models
│   │   │   ├── services/
│   │   │   │   └── api.service.ts    # HTTP service
│   │   │   └── app.routes.ts         # Routing
│   │   └── styles.scss               # Global dark mode styles
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
└── docker-compose.yml
```

## Database

The SQLite database (`backend/data/katakana.db`) contains:

### Tables

**katakana**
- `id` - Primary key
- `character` - Katakana character
- `romaji` - Romanization
- `type` - basic | dakuten | combo
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

## Testing the Application

1. **Start the app**: `docker-compose up -d`
2. **Open browser**: Navigate to `http://localhost:8080`
3. **Dashboard**: See all 104 katakana available for review
4. **Start Reviews**: Click "Start Reviews" button
5. **Practice**: Type the romaji for each katakana character
6. **Track Progress**: View your statistics and upcoming reviews

## Data Persistence

The SQLite database is stored in a Docker volume (`katakana-data`), ensuring data persists between container restarts.

## Technologies Used

- **Angular 19**: Modern web framework
- **Express.js 4**: Node.js web framework
- **TypeScript**: Type-safe development
- **SQLite**: Lightweight database
- **better-sqlite3**: Fast SQLite driver
- **SCSS**: Styling with variables
- **Docker**: Containerization
- **Nginx**: Static file serving

## Future Enhancements

- Add hiragana support
- Export/import progress data
- Study session customization
- Audio pronunciation
- Mobile app version
- Multiple user support with authentication

## License

MIT

## Acknowledgments

Inspired by [WaniKani](https://www.wanikani.com/) - an excellent spaced repetition system for learning Japanese.
