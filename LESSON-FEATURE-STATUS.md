# Lesson Feature Implementation Status

## 📋 Overview

Adding a WaniKani-style lesson system to the Katakana learning app with:
- 26 batches organized from simple to complex
- Lesson cards showing character + romaji
- User notes/mnemonics functionality
- Quiz at end of each batch
- Progressive unlocking (complete batch to unlock next)

---

## ✅ COMPLETED (Backend)

### 1. Database Schema ✓
**Files**: [backend/src/db/database.ts](backend/src/db/database.ts)

- ✅ `lesson_batches` table - tracks batch completion
- ✅ `user_notes` table - stores mnemonics
- ✅ `katakana.lesson_batch_number` column - assigns katakana to batches
- ✅ Modified review creation - only creates reviews after lesson completion

### 2. Lesson Batch Organization ✓
**Files**: [backend/src/db/lesson-batches.ts](backend/src/db/lesson-batches.ts)

✅ **26 Batches organized as:**
1. Vowels (ア, イ, ウ, エ, オ)
2-10. Basic consonants (K, S, T, N, H, M, Y, R, W/N sounds)
11-15. Dakuten/Handakuten (G, Z, D, B, P sounds)
16-26. Combinations (KY, SH, CH, NY, HY, MY, RY, GY, J, BY, PY)

### 3. Lesson Service ✓
**Files**: [backend/src/services/lesson.service.ts](backend/src/services/lesson.service.ts)

✅ Methods implemented:
- `getAllLessonBatches()` - Get all batches with completion status
- `getNextLesson()` - Get next incomplete batch
- `getLessonItems(batchNumber)` - Get katakana in a batch
- `completeLesson(batchNumber)` - Mark complete & create reviews
- `saveUserNote(katakanaId, note)` - Save/update mnemonic
- `deleteUserNote(katakanaId)` - Delete mnemonic
- `getAvailableLessonsCount()` - Count incomplete batches

### 4. API Endpoints ✓
**Files**: [backend/src/routes/lesson.routes.ts](backend/src/routes/lesson.routes.ts)

✅ Routes created:
- `GET /api/lessons` - All lesson batches
- `GET /api/lessons/next` - Next available lesson
- `GET /api/lessons/:batchNumber/items` - Katakana in batch
- `POST /api/lessons/:batchNumber/complete` - Complete batch
- `POST /api/lessons/notes` - Save note
- `DELETE /api/lessons/notes/:katakanaId` - Delete note

### 5. Stats Update ✓
**Files**: [backend/src/services/srs.service.ts](backend/src/services/srs.service.ts)

✅ Dashboard stats now include:
- `lessons_available` - Count of incomplete batches

### 6. Type Definitions ✓
**Files**: [backend/src/models/types.ts](backend/src/models/types.ts)

✅ New interfaces:
- `LessonBatch`
- `LessonItem`
- `UserNote`

---

## ✅ COMPLETED (Configuration)

### 7. Web Manifest ✓
**Files**: [frontend/public/manifest.json](frontend/public/manifest.json)

✅ Created with:
- Name: "Katakana"
- Dark theme colors
- PWA configuration

### 8. Page Title & Icon ✓
**Files**:
- [frontend/src/index.html](frontend/src/index.html)
- [frontend/public/icon.svg](frontend/public/icon.svg)

✅ Updates:
- Page title changed to "Katakana"
- SVG icon with カ character
- Manifest linked
- Meta tags added

---

## ⏳ REMAINING (Frontend - Angular)

### 9. Angular Models & Services
**Location**: `frontend/src/app/`

**TODO**:
```typescript
// models/katakana.model.ts
export interface LessonBatch {
  batch_number: number;
  name: string;
  description: string;
  completed: boolean;
  completed_at: string | null;
}

export interface LessonItem {
  id: number;
  character: string;
  romaji: string;
  type: string;
  user_note: string | null;
}
```

**TODO**: Create `services/lesson.service.ts`
- Methods to call all lesson API endpoints
- HTTP requests using Angular HttpClient

### 10. Lesson Component
**Location**: `frontend/src/app/components/lesson/`

**TODO**: Create component with states:
1. **Study Mode** - Show flashcards with:
   - Large katakana character
   - Romaji displayed
   - Text area for user note/mnemonic
   - "Next" button
   - Progress indicator (e.g., "3 / 5")

2. **Quiz Mode** (after all cards seen):
   - Show character
   - Input field for romaji answer
   - Submit button
   - Correct/incorrect feedback
   - Move to next question

3. **Complete Mode** (after quiz):
   - Success message
   - Stats (e.g., "5/5 correct!")
   - Button to return to dashboard

**Key Features**:
- Save user notes to backend as they type
- Shuffle katakana for quiz
- Track quiz progress
- Call `POST /api/lessons/:batchNumber/complete` when done

### 11. Update Dashboard
**Location**: `frontend/src/app/components/dashboard/`

**TODO**: Add lessons section:
```html
<div class="lesson-section" *ngIf="stats.lessons_available > 0">
  <h2>{{ stats.lessons_available }} Lessons Available!</h2>
  <a routerLink="/lessons" class="btn btn-lg btn-primary">Start Lesson</a>
</div>
```

Update dashboard.ts to show lessons_available from stats.

### 12. Routing
**Location**: `frontend/src/app/app.routes.ts`

**TODO**: Add lesson route:
```typescript
{ path: 'lessons', component: LessonComponent }
```

### 13. Styling
**Location**: `frontend/src/app/components/lesson/lesson.scss`

**TODO**: Dark mode styles for:
- Lesson flashcards (large, centered character)
- Note input area
- Quiz interface
- Progress indicators
- Success/complete screens

---

## 🎯 Implementation Guide

### Step 1: Create Angular Models
```bash
# Add to frontend/src/app/models/katakana.model.ts
```

Add the `LessonBatch` and `LessonItem` interfaces.

### Step 2: Create Lesson Service
```bash
cd frontend
ng generate service services/lesson
```

Implement methods to call the 6 lesson API endpoints.

### Step 3: Create Lesson Component
```bash
ng generate component components/lesson
```

Create the three modes: Study, Quiz, Complete.

### Step 4: Update Dashboard
Edit `dashboard.ts` and `dashboard.html` to show lessons.

### Step 5: Add Routing
Edit `app.routes.ts` to add `/lessons` route.

### Step 6: Style Everything
Create dark-mode SCSS following the existing style patterns.

---

## 🧪 Testing the Feature

### Backend Testing (Already Works!)
```bash
# Start backend
cd backend
npm run dev

# Test lesson endpoints
curl http://localhost:3000/api/lessons
curl http://localhost:3000/api/lessons/next
curl http://localhost:3000/api/lessons/1/items
```

### Frontend Testing (After Implementation)
```bash
# Start both backend and frontend
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm start

# Visit http://localhost:4200
# Click "Start Lesson" from dashboard
# Complete a lesson batch
# Verify reviews are created
```

---

## 📝 Key Design Decisions

1. **Progressive Unlocking**: Batches must be completed in order (handled by `getNextLesson()`)

2. **Review Creation**: Reviews are NOT created until lesson is completed
   - Before: All 104 katakana had reviews immediately
   - After: Reviews created only after completing the lesson batch

3. **User Notes**: Stored per-katakana, not per-batch
   - Allows notes to persist across the app
   - Can be displayed in reviews later

4. **Quiz Requirement**: User must complete quiz to finish lesson
   - Ensures active recall, not just passive viewing

5. **Batch Organization**: Logical progression
   - Start with vowels (easiest)
   - Basic consonants
   - Dakuten (voiced sounds)
   - Combinations (most complex)

---

## 🚀 Next Steps

1. ✅ Backend is 100% complete and tested
2. ⏳ Implement Angular frontend components (steps above)
3. ⏳ Test the complete flow
4. ⏳ Style with dark mode
5. ⏳ Deploy and enjoy learning katakana!

---

## 📚 Resources

- Backend API docs: See route files for request/response formats
- WaniKani inspiration: https://www.wanikani.com/
- Spaced Repetition: https://en.wikipedia.org/wiki/Spaced_repetition

---

**Backend Status**: ✅ 100% Complete
**Frontend Status**: ⏳ 0% Complete (all pieces ready to build)
**Configuration**: ✅ 100% Complete (manifest, icon, title)
