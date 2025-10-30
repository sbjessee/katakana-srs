import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { DashboardStats, UpcomingReview, HourlyReview, SRS_STAGE_COLORS } from '../../models/katakana.model';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  upcomingReviews: UpcomingReview[] = [];
  hourlyReviews: HourlyReview[] = [];
  expandedDate: string | null = null;
  isLoading = true;
  stageColors = SRS_STAGE_COLORS;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading = true;

    // Load stats
    this.apiService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
        this.isLoading = false;
      }
    });

    // Load upcoming reviews
    this.apiService.getUpcomingReviews().subscribe({
      next: (upcoming) => {
        this.upcomingReviews = this.generateSevenDayView(upcoming);
      },
      error: (error) => console.error('Error loading upcoming reviews:', error)
    });
  }

  private generateSevenDayView(reviewData: UpcomingReview[]): UpcomingReview[] {
    const result: UpcomingReview[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Create a map of existing review data by date
    const reviewMap = new Map<string, UpcomingReview>();
    reviewData.forEach(review => {
      reviewMap.set(review.date, review);
    });

    // Generate 7 days starting from today
    let cumulativeCount = 0;
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateString = this.formatDateToYMD(date);

      const existingReview = reviewMap.get(dateString);
      if (existingReview) {
        cumulativeCount = existingReview.count; // Backend provides cumulative count
        result.push(existingReview);
      } else {
        // Add placeholder for days with no reviews (cumulative count stays same)
        result.push({
          date: dateString,
          count: cumulativeCount,
          new_count: 0
        });
      }
    }

    return result;
  }

  private formatDateToYMD(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getStageEntries(): Array<{name: string, count: number, color: string}> {
    if (!this.stats) return [];

    return Object.entries(this.stats.stage_distribution).map(([name, count]) => ({
      name,
      count,
      color: this.stageColors[name] || '#666'
    }));
  }

  formatDate(dateString: string): string {
    // Parse date string as local date to avoid timezone issues
    // Backend sends dates as YYYY-MM-DD, which new Date() interprets as UTC
    const [year, month, day] = dateString.split('-').map(Number);
    const reviewDate = new Date(year, month - 1, day); // month is 0-indexed
    reviewDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = reviewDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';

    return reviewDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  toggleDayExpansion(date: string) {
    if (this.expandedDate === date) {
      // Collapse if clicking the same date
      this.expandedDate = null;
      this.hourlyReviews = [];
    } else {
      // Expand and load hourly data
      this.expandedDate = date;
      this.apiService.getHourlyReviewsForDate(date).subscribe({
        next: (hourly) => {
          this.hourlyReviews = hourly;
        },
        error: (error) => console.error('Error loading hourly reviews:', error)
      });
    }
  }

  formatHour(hour: number): string {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  }

  get next24HoursCount(): number {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    return this.upcomingReviews
      .filter(review => {
        const [year, month, day] = review.date.split('-').map(Number);
        const reviewDate = new Date(year, month - 1, day);
        return reviewDate <= tomorrow;
      })
      .reduce((sum, review) => sum + review.new_count, 0);
  }

  formatDayName(dateString: string): string {
    const [year, month, day] = dateString.split('-').map(Number);
    const reviewDate = new Date(year, month - 1, day);

    // Always return day name abbreviation (Mon, Tue, Wed, etc.)
    return reviewDate.toLocaleDateString('en-US', { weekday: 'short' });
  }

  getMaxNewCount(): number {
    const maxCount = Math.max(...this.upcomingReviews.map(r => r.new_count));
    return maxCount > 0 ? maxCount : 1; // Ensure minimum of 1 to avoid division by zero
  }

  getMaxHourlyNewCount(): number {
    if (this.hourlyReviews.length === 0) return 1;
    const maxCount = Math.max(...this.hourlyReviews.map(r => r.new_count));
    return maxCount > 0 ? maxCount : 1; // Ensure minimum of 1 to avoid division by zero
  }

  getExpandedDayNewCount(): number {
    if (!this.expandedDate) return 0;
    const review = this.upcomingReviews.find(r => r.date === this.expandedDate);
    return review?.new_count || 0;
  }

  getExpandedDayTotalCount(): number {
    if (!this.expandedDate) return 0;
    const review = this.upcomingReviews.find(r => r.date === this.expandedDate);
    return review?.count || 0;
  }

  getStageLabelShort(stageName: string): string {
    // Convert stage names to Roman numerals matching WaniKani
    const stageMap: Record<string, string> = {
      'Apprentice I': 'I',
      'Apprentice II': 'II',
      'Apprentice III': 'III',
      'Apprentice IV': 'IV',
      'Guru I': 'V',
      'Guru II': 'VI',
      'Master': 'VII',
      'Enlightened': 'VIII'
    };
    return stageMap[stageName] || stageName;
  }
}
