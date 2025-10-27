import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LessonBatch, LessonItem, UserNote, ApiResponse } from '../models/katakana.model';

@Injectable({
  providedIn: 'root'
})
export class LessonService {
  private apiUrl = '/api/lessons';

  constructor(private http: HttpClient) {}

  /**
   * Get all lesson batches with completion status
   */
  getAllLessonBatches(): Observable<LessonBatch[]> {
    return this.http.get<ApiResponse<LessonBatch[]>>(this.apiUrl)
      .pipe(map(response => response.data || []));
  }

  /**
   * Get the next available (incomplete) lesson batch
   */
  getNextLesson(): Observable<LessonBatch | null> {
    return this.http.get<ApiResponse<LessonBatch | null>>(`${this.apiUrl}/next`)
      .pipe(map(response => response.data || null));
  }

  /**
   * Get lesson items (katakana) for a specific batch
   */
  getLessonItems(batchNumber: number): Observable<LessonItem[]> {
    return this.http.get<ApiResponse<LessonItem[]>>(`${this.apiUrl}/${batchNumber}/items`)
      .pipe(map(response => response.data || []));
  }

  /**
   * Complete a lesson batch with quiz results
   */
  completeLesson(batchNumber: number, quizResults?: { katakanaId: number, correct: boolean }[]): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/${batchNumber}/complete`, { quizResults })
      .pipe(map(() => undefined));
  }

  /**
   * Save or update a user note for a katakana
   */
  saveUserNote(katakanaId: number, note: string): Observable<UserNote> {
    return this.http.post<ApiResponse<UserNote>>(`${this.apiUrl}/notes`, { katakanaId, note })
      .pipe(map(response => response.data!));
  }

  /**
   * Delete a user note
   */
  deleteUserNote(katakanaId: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/notes/${katakanaId}`)
      .pipe(map(() => undefined));
  }
}
