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

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadReviews();
  }

  loadReviews() {
    this.isLoading = true;
    this.apiService.getDueReviews().subscribe({
      next: (reviews) => {
        this.reviews = reviews;
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

  submitAnswer() {
    if (!this.currentReview || !this.userAnswer.trim()) return;

    const normalizedAnswer = this.userAnswer.trim().toLowerCase();
    const correctAnswer = this.currentReview.romaji.toLowerCase();
    this.isCorrect = normalizedAnswer === correctAnswer;
    this.showFeedback = true;

    // Submit to backend
    this.apiService.submitAnswer(this.currentReview.id, this.isCorrect).subscribe({
      error: (error) => console.error('Error submitting answer:', error)
    });
  }

  nextReview() {
    this.currentIndex++;
    this.userAnswer = '';
    this.showFeedback = false;
    this.isCorrect = false;

    if (this.currentIndex >= this.reviews.length) {
      this.isComplete = true;
    } else {
      // Focus the input field after the view updates
      setTimeout(() => {
        this.answerInput?.nativeElement.focus();
      }, 0);
    }
  }

  @HostListener('window:keyup', ['$event'])
  handleKeyPress(event: KeyboardEvent) {
    // Only handle if we're in an active review session (not loading or complete)
    if (this.isLoading || this.isComplete || !this.currentReview) {
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
