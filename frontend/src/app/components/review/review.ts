import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ReviewWithKatakana } from '../../models/katakana.model';

@Component({
  selector: 'app-review',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './review.html',
  styleUrl: './review.scss'
})
export class ReviewComponent implements OnInit {
  @ViewChild('answerInput') answerInput?: ElementRef<HTMLInputElement>;

  reviews: ReviewWithKatakana[] = [];
  currentIndex = 0;
  userAnswer = '';
  showFeedback = false;
  isCorrect = false;
  isComplete = false;
  isLoading = true;
  isTransitioning = false;
  userNotes: Map<number, string> = new Map();

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadReviews();
  }

  loadReviews() {
    this.isLoading = true;
    this.apiService.getDueReviews().subscribe({
      next: (reviews) => {
        // Randomize the order of reviews
        this.reviews = this.shuffleArray(reviews);
        // Initialize notes map
        reviews.forEach(review => {
          if (review.user_note) {
            this.userNotes.set(review.katakana_id, review.user_note);
          }
        });
        this.isLoading = false;
        if (reviews.length === 0) {
          this.isComplete = true;
        }
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        this.isLoading = false;
      }
    });
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

  get currentReview(): ReviewWithKatakana | null {
    return this.reviews[this.currentIndex] || null;
  }

  get progress(): number {
    if (this.reviews.length === 0) return 100;
    return Math.round((this.currentIndex / this.reviews.length) * 100);
  }

  get remaining(): number {
    return this.reviews.length - this.currentIndex;
  }

  getUserNote(katakanaId: number): string {
    return this.userNotes.get(katakanaId) || '';
  }

  onNoteChange(katakanaId: number, note: string) {
    this.userNotes.set(katakanaId, note);
    // Auto-save note
    if (note.trim()) {
      this.apiService.saveUserNote(katakanaId, note).subscribe({
        error: (error) => console.error('Error saving note:', error)
      });
    }
  }

  onInputClick() {
    // If feedback is showing, advance to next review (like WaniKani)
    if (this.showFeedback) {
      this.nextReview();
    }
  }

  submitAnswer() {
    if (!this.currentReview || !this.userAnswer.trim()) return;

    const normalizedAnswer = this.userAnswer.trim().toLowerCase();
    const correctAnswer = this.currentReview.romaji.toLowerCase();
    this.isCorrect = normalizedAnswer === correctAnswer;
    this.showFeedback = true;

    // If incorrect, add this item back into the queue smartly
    if (!this.isCorrect) {
      const remainingCount = this.reviews.length - this.currentIndex - 1;

      if (remainingCount === 0) {
        // This is the last item, just append to the end
        this.reviews.push(this.currentReview);
      } else if (remainingCount === 1) {
        // Only one item left, add to the end (don't make it immediate next)
        this.reviews.push(this.currentReview);
      } else {
        // Multiple items remaining: insert at a random position that's not immediately next
        // Insert between currentIndex + 2 and end of array
        const minInsertPos = this.currentIndex + 2;
        const maxInsertPos = this.reviews.length;
        const insertPos = Math.floor(Math.random() * (maxInsertPos - minInsertPos + 1)) + minInsertPos;
        this.reviews.splice(insertPos, 0, this.currentReview);
      }
    }

    // Submit to backend
    this.apiService.submitAnswer(this.currentReview.id, this.isCorrect).subscribe({
      error: (error) => console.error('Error submitting answer:', error)
    });

    // Keep the input focused and select text so keyboard doesn't disappear on mobile
    setTimeout(() => {
      this.answerInput?.nativeElement.focus();
      this.answerInput?.nativeElement.select();
    }, 0);
  }

  nextReview() {
    if (this.isTransitioning) return;

    this.isTransitioning = true;
    this.currentIndex++;
    this.userAnswer = '';
    this.showFeedback = false;
    this.isCorrect = false;

    if (this.currentIndex >= this.reviews.length) {
      this.isComplete = true;
      this.isTransitioning = false;
    } else {
      // Focus the input field after the view updates
      setTimeout(() => {
        this.answerInput?.nativeElement.focus();
        this.isTransitioning = false;
      }, 10);
    }
  }

  @HostListener('window:keyup', ['$event'])
  handleKeyPress(event: KeyboardEvent) {
    // Only handle if we're in an active review session (not loading, complete, or transitioning)
    if (this.isLoading || this.isComplete || !this.currentReview || this.isTransitioning) {
      return;
    }

    if (event.key === 'Enter') {
      if (this.showFeedback) {
        this.nextReview();
      } else {
        this.submitAnswer();
      }
    }
  }
}
