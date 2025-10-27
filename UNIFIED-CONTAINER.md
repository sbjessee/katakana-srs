# Unified Container Architecture

## Overview

The application has been refactored to run **frontend + backend in a single Docker container** instead of two separate containers. This simplifies deployment while maintaining all functionality.

## Changes Made

### 1. Root-Level Dockerfile (`/Dockerfile`)
**Created a multi-stage build:**
- Stage 1: Builds Angular frontend
- Stage 2: Builds backend and copies frontend build into it
- Express serves both API and static files

### 2. Backend Server (`backend/src/index.ts`)
**Added static file serving:**
```typescript
// Serve static frontend files
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

// Catch-all route for Angular routing
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});
```

### 3. Frontend API Service (`frontend/src/app/services/api.service.ts`)
**Changed to relative URLs:**
```typescript
// Before: private apiUrl = 'http://localhost:3000/api';
// After:  private apiUrl = '/api';
```

### 4. Frontend Proxy Config (`frontend/proxy.conf.json`)
**Added for development:**
```json
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true
  }
}
```

### 5. Docker Compose (`docker-compose.yml`)
**Simplified to single service:**
```yaml
services:
  app:  # One service instead of frontend + backend
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"  # Single port
```

### 6. Documentation
- Updated README.md
- Created QUICKSTART.md
- Created this UNIFIED-CONTAINER.md

## Architecture Comparison

### Before (2 Containers)
```
┌──────────────────┐      ┌──────────────────┐
│   Frontend       │      │   Backend        │
│   (Nginx)        │      │   (Express)      │
│   Port 8080      │◄────►│   Port 3000      │
└──────────────────┘      └──────────────────┘
                                │
                          ┌─────▼──────┐
                          │  SQLite    │
                          └────────────┘
```

### After (1 Container)
```
┌─────────────────────────────────────┐
│   Express Server (Port 3000)        │
│                                     │
│   ┌─────────────┐  ┌─────────────┐ │
│   │   /api/*    │  │    /*       │ │
│   │   Backend   │  │  Frontend   │ │
│   │   API       │  │  (Static)   │ │
│   └─────────────┘  └─────────────┘ │
│                                     │
│   ┌─────────────────────────────┐  │
│   │       SQLite Database       │  │
│   └─────────────────────────────┘  │
└─────────────────────────────────────┘
```

## Benefits

### ✅ Simpler Deployment
- One container instead of two
- One port to expose (3000 instead of 3000 + 8080)
- Smaller docker-compose.yml

### ✅ Better Performance
- No reverse proxy overhead
- Direct static file serving from Express
- Fewer network hops

### ✅ Same-Origin Requests
- No CORS configuration needed
- Frontend and API on same origin
- Simpler security model

### ✅ Smaller Footprint
- No Nginx container
- No nginx.conf needed in production
- Reduced image size

### ✅ Easier Development
- Proxy config handles dev mode
- Same codebase for dev and prod
- Clear separation of concerns

## Development vs Production

### Development Mode
```bash
# Terminal 1 - Backend
cd backend && npm run dev  # Port 3000

# Terminal 2 - Frontend
cd frontend && npm start   # Port 4200 (proxies to 3000)
```

Frontend runs on 4200 with hot-reload, proxies API calls to backend on 3000.

### Production Mode
```bash
docker-compose up -d  # Single container on port 3000
```

Express serves both Angular static files AND API endpoints.

## File Structure

```
katakana/
├── Dockerfile              # ← NEW: Unified multi-stage build
├── docker-compose.yml      # ← UPDATED: Single service
├── .dockerignore          # ← NEW: Root-level ignore file
│
├── backend/
│   └── src/
│       └── index.ts       # ← UPDATED: Added static file serving
│
└── frontend/
    ├── proxy.conf.json    # ← NEW: Dev proxy config
    └── src/app/services/
        └── api.service.ts # ← UPDATED: Relative URLs
```

## Migration Guide

If you have the old setup running:

```bash
# Stop old containers
docker-compose down -v

# Pull latest code with unified container
git pull

# Start new unified container
docker-compose up -d

# Access at http://localhost:3000 (not 8080!)
```

## Backward Compatibility

The old individual Dockerfiles still exist:
- `frontend/Dockerfile` - Frontend-only container
- `backend/Dockerfile` - Backend-only container

But the new unified approach is recommended for all deployments.

## Testing

Test the unified container:

```bash
# Build
docker-compose build

# Start
docker-compose up -d

# Test frontend
curl http://localhost:3000/

# Test API
curl http://localhost:3000/api/health

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## Future Considerations

This architecture works well for:
- ✅ Single-user applications
- ✅ Small to medium traffic
- ✅ Simplified deployment scenarios

For high-traffic production you might want:
- Separate frontend CDN
- Load-balanced backend
- Dedicated web server (Nginx)

But for this katakana learning app, the unified container is perfect!
