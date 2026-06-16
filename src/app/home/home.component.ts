import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Survey {
  id: string;
  title: string;
  category: string;
  description: string;
  endsIn: string;
  isPast: boolean;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  activeTab: 'active' | 'past' = 'active';
  sortMenuOpen = false;

  categoryOptions = [
    'All Categories',
    'Team Activities',
    'Health & Wellness',
    'Gaming & Entertainment',
    'Education & Learning',
    'Lifestyle & Preferences',
    'Technology & Innovation',
  ];

  allSurveys: Survey[] = [
    { id: '1', title: "Let's Plan the Next Team Event Together", category: 'Team Activities', description: 'Help us choose the perfect date, location, and activities for our next team gathering.', endsIn: 'Ends in 1 Day', isPast: false },
    { id: '2', title: 'Fit & Wellness Survey!', category: 'Health & Wellness', description: 'A general survey about how people stay healthy in their daily life.', endsIn: 'Ends in 2 Days', isPast: false },
    { id: '3', title: 'Gaming Habits and Favorite Games!', category: 'Gaming & Entertainment', description: 'Share your favorite games and gaming preferences with the community.', endsIn: 'Ends in 3 Days', isPast: false },
    { id: '4', title: 'Remote Work Preferences', category: 'Lifestyle & Preferences', description: 'Tell us how you feel about working from home vs the office.', endsIn: 'Ended 5 Days ago', isPast: true },
    { id: '5', title: 'AI Tools in the Workplace', category: 'Technology & Innovation', description: 'Share your experience using AI tools for productivity.', endsIn: 'Ended 10 Days ago', isPast: true },
  ];

  filteredSurveys: Survey[] = [...this.allSurveys];

  get soonEndingSurveys(): Survey[] {
    return this.allSurveys.filter(s => !s.isPast);
  }

  get activeSurveys(): Survey[] {
    return this.filteredSurveys.filter(s => !s.isPast);
  }

  get pastSurveys(): Survey[] {
    return this.filteredSurveys.filter(s => s.isPast);
  }

  switchTab(tab: 'active' | 'past'): void {
    this.activeTab = tab;
  }

  toggleSortMenu(): void {
    this.sortMenuOpen = !this.sortMenuOpen;
  }

  filterByCategory(cat: string): void {
    this.filteredSurveys = cat === 'All Categories'
      ? [...this.allSurveys]
      : this.allSurveys.filter(s => s.category === cat);
    this.sortMenuOpen = false;
  }
}
