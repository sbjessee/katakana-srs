import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LessonService } from '../../services/lesson.service';
import { LessonBatch, LessonItem } from '../../models/katakana.model';

type LessonMode = 'loading' | 'study' | 'quiz' | 'complete' | 'no-lessons';

@Component({
  selector: 'app-lesson',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './lesson.html',
  styleUrl: './lesson.scss'
})
export class LessonComponent implements OnInit {
  @ViewChild('quizAnswerInput') quizAnswerInput?: ElementRef<HTMLInputElement>;

  mode: LessonMode = 'loading';
  currentBatch: LessonBatch | null = null;
  lessonItems: LessonItem[] = [];
  currentItemIndex = 0;
  userNotes: Map<number, string> = new Map();

  // Quiz state
  quizItems: LessonItem[] = [];
  quizIndex = 0;
  userAnswer = '';
  showQuizFeedback = false;
  isQuizCorrect = false;
  quizResults: boolean[] = [];
  firstAttemptResults: Map<number, boolean> = new Map(); // Track first attempt for each item
  isTransitioning = false;

  constructor(private lessonService: LessonService) {}

  ngOnInit() {
    this.loadNextLesson();
  }

  loadNextLesson() {
    this.mode = 'loading';
    this.lessonService.getNextLesson().subscribe({
      next: (batch) => {
        if (!batch) {
          this.mode = 'no-lessons';
          return;
        }
        this.currentBatch = batch;
        this.loadLessonItems(batch.batch_number);
      },
      error: (error) => {
        console.error('Error loading next lesson:', error);
      }
    });
  }

  loadLessonItems(batchNumber: number) {
    this.lessonService.getLessonItems(batchNumber).subscribe({
      next: (items) => {
        this.lessonItems = items;
        this.currentItemIndex = 0;
        // Initialize notes map
        items.forEach(item => {
          if (item.user_note) {
            this.userNotes.set(item.id, item.user_note);
          }
        });
        this.mode = 'study';
      },
      error: (error) => {
        console.error('Error loading lesson items:', error);
      }
    });
  }

  get currentItem(): LessonItem | null {
    return this.lessonItems[this.currentItemIndex] || null;
  }

  get studyProgress(): number {
    if (this.lessonItems.length === 0) return 0;
    return Math.round(((this.currentItemIndex + 1) / this.lessonItems.length) * 100);
  }

  getUserNote(itemId: number): string {
    return this.userNotes.get(itemId) || '';
  }

  onNoteChange(itemId: number, note: string) {
    this.userNotes.set(itemId, note);
    // Auto-save note
    if (note.trim()) {
      this.lessonService.saveUserNote(itemId, note).subscribe({
        error: (error) => console.error('Error saving note:', error)
      });
    }
  }

  nextStudyCard() {
    // Remove focus from any active element (like notes textarea) to prevent enter key from adding blank lines
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    if (this.currentItemIndex < this.lessonItems.length - 1) {
      this.currentItemIndex++;
    } else {
      // Start quiz
      this.startQuiz();
    }
  }

  previousStudyCard() {
    if (this.currentItemIndex > 0) {
      this.currentItemIndex--;
    }
  }

  startQuiz() {
    // Shuffle lesson items for quiz using Fisher-Yates algorithm
    this.quizItems = this.shuffleArray([...this.lessonItems]);
    this.quizIndex = 0;
    this.quizResults = [];
    this.firstAttemptResults.clear();
    this.userAnswer = '';
    this.showQuizFeedback = false;
    this.mode = 'quiz';
  }

  /**
   * Shuffle an array using Fisher-Yates algorithm
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  get currentQuizItem(): LessonItem | null {
    return this.quizItems[this.quizIndex] || null;
  }

  get quizProgress(): number {
    if (this.quizItems.length === 0) return 0;
    return Math.round(((this.quizIndex + 1) / this.quizItems.length) * 100);
  }

  submitQuizAnswer() {
    if (!this.currentQuizItem || !this.userAnswer.trim()) return;

    const normalizedAnswer = this.userAnswer.trim().toLowerCase();
    const correctAnswer = this.currentQuizItem.romaji.toLowerCase();
    this.isQuizCorrect = normalizedAnswer === correctAnswer;
    this.showQuizFeedback = true;
    this.quizResults.push(this.isQuizCorrect);

    // Track first attempt result (only if this item hasn't been attempted before)
    if (!this.firstAttemptResults.has(this.currentQuizItem.id)) {
      this.firstAttemptResults.set(this.currentQuizItem.id, this.isQuizCorrect);
    }

    // If incorrect, add this item back into the queue smartly
    if (!this.isQuizCorrect) {
      const remainingCount = this.quizItems.length - this.quizIndex - 1;

      if (remainingCount === 0) {
        // This is the last item, just append to the end
        this.quizItems.push(this.currentQuizItem);
      } else if (remainingCount === 1) {
        // Only one item left, add to the end (don't make it immediate next)
        this.quizItems.push(this.currentQuizItem);
      } else {
        // Multiple items remaining: insert at a random position that's not immediately next
        // Insert between quizIndex + 2 and end of array
        const minInsertPos = this.quizIndex + 2;
        const maxInsertPos = this.quizItems.length;
        const insertPos = Math.floor(Math.random() * (maxInsertPos - minInsertPos + 1)) + minInsertPos;
        this.quizItems.splice(insertPos, 0, this.currentQuizItem);
      }
    }

    // Keep the input focused and select text so keyboard doesn't disappear on mobile
    setTimeout(() => {
      this.quizAnswerInput?.nativeElement.focus();
      this.quizAnswerInput?.nativeElement.select();
    }, 0);
  }

  onQuizInputClick() {
    // If feedback is showing, advance to next question (like WaniKani)
    if (this.showQuizFeedback) {
      this.nextQuizQuestion();
    }
  }

  nextQuizQuestion() {
    if (this.isTransitioning) return;

    if (this.quizIndex < this.quizItems.length - 1) {
      this.isTransitioning = true;
      this.quizIndex++;
      this.userAnswer = '';
      this.showQuizFeedback = false;
      this.isQuizCorrect = false;
      // Focus the input field after the view updates
      setTimeout(() => {
        this.quizAnswerInput?.nativeElement.focus();
        this.isTransitioning = false;
      }, 10);
    } else {
      // Quiz complete
      this.completeLesson();
    }
  }

  completeLesson() {
    if (!this.currentBatch) return;

    // Convert first attempt results to format expected by backend
    const quizResults = Array.from(this.firstAttemptResults.entries()).map(([katakanaId, correct]) => ({
      katakanaId,
      correct
    }));

    this.lessonService.completeLesson(this.currentBatch.batch_number, quizResults).subscribe({
      next: () => {
        this.mode = 'complete';
      },
      error: (error) => {
        console.error('Error completing lesson:', error);
      }
    });
  }

  get quizScore(): number {
    const correct = this.quizResults.filter(r => r).length;
    return this.quizResults.length > 0 ? Math.round((correct / this.quizResults.length) * 100) : 0;
  }

  get quizCorrectCount(): number {
    return this.quizResults.filter(r => r).length;
  }

  @HostListener('window:keyup', ['$event'])
  handleKeyPress(event: KeyboardEvent) {
    // Don't handle keyboard events when loading, no lessons, complete, or transitioning
    if (this.mode === 'loading' || this.mode === 'no-lessons' || this.mode === 'complete' || this.isTransitioning) {
      return;
    }

    // Study mode keyboard shortcuts
    if (this.mode === 'study') {
      if (event.key === 'Enter' || event.key === 'ArrowRight') {
        this.nextStudyCard();
      } else if (event.key === 'ArrowLeft') {
        this.previousStudyCard();
      }
    }

    // Quiz mode keyboard shortcuts
    if (this.mode === 'quiz') {
      if (event.key === 'Enter') {
        if (this.showQuizFeedback) {
          this.nextQuizQuestion();
        } else {
          this.submitQuizAnswer();
        }
      }
    }
  }
}
