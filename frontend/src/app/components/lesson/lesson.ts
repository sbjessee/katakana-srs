import { Component, OnInit } from '@angular/core';
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
    // Shuffle lesson items for quiz
    this.quizItems = [...this.lessonItems].sort(() => Math.random() - 0.5);
    this.quizIndex = 0;
    this.quizResults = [];
    this.userAnswer = '';
    this.showQuizFeedback = false;
    this.mode = 'quiz';
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
  }

  nextQuizQuestion() {
    if (this.quizIndex < this.quizItems.length - 1) {
      this.quizIndex++;
      this.userAnswer = '';
      this.showQuizFeedback = false;
      this.isQuizCorrect = false;
    } else {
      // Quiz complete
      this.completeLesson();
    }
  }

  completeLesson() {
    if (!this.currentBatch) return;

    this.lessonService.completeLesson(this.currentBatch.batch_number).subscribe({
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

  handleQuizKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      if (this.showQuizFeedback) {
        this.nextQuizQuestion();
      } else {
        this.submitQuizAnswer();
      }
    }
  }
}
