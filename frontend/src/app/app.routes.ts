import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard';
import { ReviewComponent } from './components/review/review';
import { KatakanaListComponent } from './components/katakana-list/katakana-list';
import { LessonComponent } from './components/lesson/lesson';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'lessons', component: LessonComponent },
  { path: 'review', component: ReviewComponent },
  { path: 'katakana', component: KatakanaListComponent },
];
