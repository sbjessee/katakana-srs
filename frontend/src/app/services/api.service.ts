import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ReviewWithKatakana,
  DashboardStats,
  UpcomingReview,
  Review,
  ApiResponse
} from '../models/katakana.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:3000/api';

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
}
