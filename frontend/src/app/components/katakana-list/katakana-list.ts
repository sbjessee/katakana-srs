import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { ReviewWithKatakana, SRS_STAGE_NAMES, SRS_STAGE_COLORS, getSRSGroupName } from '../../models/katakana.model';

@Component({
  selector: 'app-katakana-list',
  imports: [CommonModule],
  templateUrl: './katakana-list.html',
  styleUrl: './katakana-list.scss'
})
export class KatakanaListComponent implements OnInit {
  allKatakana: ReviewWithKatakana[] = [];
  filteredKatakana: ReviewWithKatakana[] = [];
  isLoading = true;
  filterType: 'all' | 'basic' | 'dakuten' | 'combo' = 'all';
  sortBy: 'character' | 'stage' | 'next_review' = 'character';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadKatakana();
  }

  loadKatakana() {
    this.isLoading = true;
    this.apiService.getAllKatakana().subscribe({
      next: (katakana) => {
        this.allKatakana = katakana;
        this.applyFilter();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading katakana:', error);
        this.isLoading = false;
      }
    });
  }

  applyFilter() {
    // Filter by type
    if (this.filterType === 'all') {
      this.filteredKatakana = [...this.allKatakana];
    } else {
      this.filteredKatakana = this.allKatakana.filter(k => k.type === this.filterType);
    }

    // Apply sorting
    this.filteredKatakana.sort((a, b) => {
      if (this.sortBy === 'character') {
        return a.character.localeCompare(b.character);
      } else if (this.sortBy === 'stage') {
        return b.srs_stage - a.srs_stage;
      } else {
        return new Date(a.next_review_date).getTime() - new Date(b.next_review_date).getTime();
      }
    });
  }

  setFilter(type: 'all' | 'basic' | 'dakuten' | 'combo') {
    this.filterType = type;
    this.applyFilter();
  }

  setSortBy(sortBy: 'character' | 'stage' | 'next_review') {
    this.sortBy = sortBy;
    this.applyFilter();
  }

  getStageName(stage: number): string {
    return SRS_STAGE_NAMES[stage as keyof typeof SRS_STAGE_NAMES] || 'Unknown';
  }

  getStageGroup(stage: number): string {
    return getSRSGroupName(stage);
  }

  getStageColor(stage: number): string {
    const group = getSRSGroupName(stage);
    return SRS_STAGE_COLORS[group] || '#666';
  }

  formatNextReview(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMs < 0) return 'Available now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  getAccuracy(item: ReviewWithKatakana): number {
    const total = item.correct_count + item.incorrect_count;
    if (total === 0) return 0;
    return Math.round((item.correct_count / total) * 100);
  }
}
