import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ReviewWithKatakana,
  DashboardStats,
  UpcomingReview,
  HourlyReview,
  Review,
  ApiResponse,
  UserNote
} from '../models/katakana.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // Use relative URL - works for both dev (proxy) and production (same server)
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  /**
   * Get all reviews that are currently due
   */
  getDueReviews(): Observable<ReviewWithKatakana[]> {
    return this.http.get<ApiResponse<ReviewWithKatakana[]>>(`${this.apiUrl}/reviews/due`)
      .pipe(map(response => response.data || []));
  }

  /**
   * Submit an answer for a review
   */
  submitAnswer(reviewId: number, isCorrect: boolean): Observable<Review> {
    return this.http.post<ApiResponse<Review>>(`${this.apiUrl}/reviews/${reviewId}/answer`, { isCorrect })
      .pipe(map(response => response.data!));
  }

  /**
   * Get all katakana with their review status
   */
  getAllKatakana(): Observable<ReviewWithKatakana[]> {
    return this.http.get<ApiResponse<ReviewWithKatakana[]>>(`${this.apiUrl}/katakana`)
      .pipe(map(response => response.data || []));
  }

  /**
   * Get dashboard statistics
   */
  getStats(): Observable<DashboardStats> {
    return this.http.get<ApiResponse<DashboardStats>>(`${this.apiUrl}/stats`)
      .pipe(map(response => response.data!));
  }

  /**
   * Get upcoming reviews for the next 7 days
   */
  getUpcomingReviews(): Observable<UpcomingReview[]> {
    return this.http.get<ApiResponse<UpcomingReview[]>>(`${this.apiUrl}/reviews/upcoming`)
      .pipe(map(response => response.data || []));
  }

  /**
   * Get hourly breakdown of reviews for a specific date
   */
  getHourlyReviewsForDate(date: string): Observable<HourlyReview[]> {
    return this.http.get<ApiResponse<HourlyReview[]>>(`${this.apiUrl}/reviews/upcoming/${date}/hourly`)
      .pipe(map(response => response.data || []));
  }

  /**
   * Save or update a user note for a katakana character
   */
  saveUserNote(katakanaId: number, note: string): Observable<UserNote> {
    return this.http.post<ApiResponse<UserNote>>(`${this.apiUrl}/notes`, { katakanaId, note })
      .pipe(map(response => response.data!));
  }
}
