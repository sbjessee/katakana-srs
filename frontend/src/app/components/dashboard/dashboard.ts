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
        this.upcomingReviews = upcoming;
      },
      error: (error) => console.error('Error loading upcoming reviews:', error)
    });
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
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const reviewDate = new Date(date);
    reviewDate.setHours(0, 0, 0, 0);

    const diffTime = reviewDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
}
