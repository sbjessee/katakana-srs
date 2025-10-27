# Quick Start Guide

## Option 1: Docker (Recommended) - Single Container

The simplest way to run the application. Everything in one container.

```bash
# Build and start
docker-compose up -d

# Access the app
open http://localhost:3000

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

**What you get:**
- ✅ Frontend + Backend in one container
- ✅ Single port (3000)
- ✅ Persistent SQLite database
- ✅ No configuration needed

## Option 2: Development Mode

For active development with hot-reload.

### Terminal 1 - Backend
```bash
cd backend
npm install
npm run dev
```
Backend runs on http://localhost:3000

### Terminal 2 - Frontend
```bash
cd frontend
npm install
npm start
```
Frontend runs on http://localhost:4200 (with proxy to backend)

**What you get:**
- ✅ Hot-reload for both frontend and backend
- ✅ TypeScript compilation with watch mode
- ✅ Frontend proxy automatically forwards API calls

## First Time Setup

1. **Start the application** (using either option above)
2. **Open your browser** to http://localhost:3000 (Docker) or http://localhost:4200 (Dev)
3. **You'll see 104 reviews available** - all katakana characters ready to learn!
4. **Click "Start Reviews"** to begin learning

## How the Single Container Works

```
┌─────────────────────────────────────┐
│   Docker Container (Port 3000)      │
│                                     │
│  ┌────────────────────────────┐   │
│  │   Express.js Server        │   │
│  ├────────────────────────────┤   │
│  │                            │   │
│  │  /api/*  → Backend API     │   │
│  │                            │   │
│  │  /*      → Angular App     │   │
│  │           (static files)   │   │
│  │                            │   │
│  └────────────────────────────┘   │
│                                     │
│  ┌────────────────────────────┐   │
│  │   SQLite Database          │   │
│  │   /app/data/katakana.db    │   │
│  └────────────────────────────┘   │
│         (persisted volume)         │
└─────────────────────────────────────┘
```

## Advantages of Single Container

1. **Simpler deployment** - One container vs two
2. **Same-origin requests** - No CORS issues
3. **Smaller footprint** - No separate Nginx
4. **Easier configuration** - One port to expose
5. **Faster startup** - Less containers to orchestrate

## Troubleshooting

### Docker Issues
```bash
# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d

# Check container status
docker-compose ps

# View container logs
docker-compose logs -f app
```

### Development Issues
```bash
# Backend not starting?
cd backend && rm -rf node_modules && npm install

# Frontend not starting?
cd frontend && rm -rf node_modules .angular && npm install

# Database issues?
rm backend/data/katakana.db
# Restart backend - it will recreate the database
```

## Data Persistence

### Docker
Data is stored in a Docker volume named `katakana-data`:
```bash
# List volumes
docker volume ls

# Remove data (reset progress)
docker-compose down -v
```

### Development
Data is stored in `backend/data/katakana.db`:
```bash
# Reset progress
rm backend/data/katakana.db
# Restart backend to recreate
```

## Next Steps

1. Complete your first review session
2. Check the Dashboard to see your progress
3. View all katakana in the "All Katakana" page
4. Reviews will automatically schedule based on SRS algorithm

Enjoy learning katakana! 🎌
