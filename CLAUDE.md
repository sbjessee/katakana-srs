# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A WaniKani-inspired katakana learning application with spaced repetition system (SRS). Built with Angular 20 and Express.js, deployed as a single unified Docker container.

**Tech Stack:**
- Frontend: Angular 20 (standalone components), TypeScript 5.9+, SCSS
- Backend: Express.js 4, TypeScript 5.9+ (CommonJS), SQLite (better-sqlite3)
- Deployment: Single Docker container serving both frontend and API

## Essential Commands

### Development Mode (Hot-Reload)
```bash
# Terminal 1 - Backend (runs on :3975)
cd backend && npm run dev

# Terminal 2 - Frontend (runs on :4200, proxies API to backend)
cd frontend && npm start
```

### Docker Mode (Production-like)
```bash
docker-compose up -d           # Start on :3975
docker-compose logs -f         # View logs
docker-compose down            # Stop
docker-compose down -v         # Stop and reset database
```

### Build Commands
```bash
# Backend
cd backend && npm run build    # Compile TypeScript → dist/

# Frontend
cd frontend && npm run build   # Build Angular → dist/
```

### Database Reset
```bash
# Development
rm backend/data/katakana.db    # Then restart backend

# Docker
docker-compose down -v         # Removes volume
```

## Architecture

### Unified Container Design
Express.js serves both:
- **`/api/*`** → Backend API endpoints
- **`/*`** → Static Angular build files (from `public/` directory)

The Dockerfile builds frontend first, then copies the built Angular app into backend's `public/` directory, resulting in a single container on port 3975.

### Backend Structure
```
backend/src/
├── db/                    # SQLite init, seeding, 26 lesson batches
├── models/                # TypeScript types
├── routes/                # Express route handlers
├── services/              # Business logic (SRS algorithm, lessons)
└── index.ts               # Express server entry point
```

**Key files:**
- `db/database.ts`: Initializes SQLite with 104 katakana characters and 8 SRS stages
- `services/srs.service.ts`: 8-stage SRS algorithm (Apprentice → Guru → Master → Enlightened)
- `db/lesson-batches.ts`: 26 progressive lesson groups

### Frontend Structure
```
frontend/src/app/
├── components/            # Dashboard, review, lesson, katakana-list
│   └── [component]/       # Each has .ts, .html, .scss
├── services/              # API client, lesson state management
├── models/                # TypeScript interfaces
└── app.routes.ts          # Route configuration
```

**Standalone components:** All Angular components use `standalone: true` (no NgModule).

## Code Conventions

### TypeScript
- **Strict mode enabled** on both frontend and backend
- Frontend additional strictness: `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noImplicitOverride`
- Backend: CommonJS modules (`type: "commonjs"`)
- Frontend: ES modules (Angular standard)

### Naming
- Files: kebab-case (`lesson.service.ts`)
- Classes: PascalCase (`SRSService`)
- Functions/variables: camelCase
- Constants: UPPER_SNAKE_CASE (`DB_PATH`)

### Prettier (Frontend)
```json
{
  "printWidth": 100,
  "singleQuote": true
}
```
No automated linting/formatting scripts configured. Rely on TypeScript strict mode.

## SRS System

8-stage progression with time intervals (matching WaniKani):
- **Apprentice I-IV**: 4h → 8h → 1d → 2d
- **Guru I-II**: 1w → 2w
- **Master**: 1 month
- **Enlightened**: 4 months

Correct answers advance stage; incorrect answers reset to Apprentice I (ensuring same-day review).

## Lesson System

26 progressive batches introducing katakana (vowels → K-row → S-row → ... → combinations).
Each lesson includes study mode, quiz, and re-queuing of incorrect answers.

## Testing

- **Frontend**: `cd frontend && npm test` (Jasmine + Karma)
- **Backend**: No automated tests configured
- **Manual testing**: Use development mode or Docker, check browser console and backend logs

## Development Notes

- Frontend dev server proxies `/api` calls to backend (see `proxy.conf.json`)
- Database auto-initializes and seeds on first backend start
- SQLite database persists in Docker volume (`katakana-data`)
- Port 3975 for both development backend and Docker deployment
- Most code was AI-generated using Claude Code
- always run "docker compose up -d --build" when finishing with a new feature/request