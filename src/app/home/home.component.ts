import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PollService } from '../core/services/poll.service';
import { Poll } from '../core/models/poll.model';
import { computeTimeRemaining } from '../core/utils/poll-date-utils';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
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

  allPolls: Poll[] = [];
  filteredPolls: Poll[] = [];

  constructor(private pollService: PollService, private cd: ChangeDetectorRef) {}

  async ngOnInit(): Promise<void> {
    try {
      const raw = await this.pollService.getAllPolls();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      this.allPolls = raw.map(p => {
        const endDate = p.end_date ? new Date(p.end_date) : null;
        if (endDate) endDate.setHours(0, 0, 0, 0);
        return {
          ...p,
          endsIn: computeTimeRemaining(p.end_date),
          isActive: !endDate || endDate >= today,
          isPast: !!endDate && endDate < today,
        };
      });
      this.filteredPolls = [...this.allPolls];
      this.cd.detectChanges();
    } catch {
      // polls failed to load
    }
  }

  get soonEndingPolls(): Poll[] {
    return this.allPolls.filter(p => p.isActive && !!p.end_date);
  }

  get activePolls(): Poll[] {
    return this.filteredPolls.filter(p => p.isActive);
  }

  get pastPolls(): Poll[] {
    return this.filteredPolls.filter(p => p.isPast);
  }

  switchTab(tab: 'active' | 'past'): void {
    this.activeTab = tab;
  }

  toggleSortMenu(): void {
    this.sortMenuOpen = !this.sortMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.sortMenuOpen && !(event.target as HTMLElement).closest('.nav-right')) {
      this.sortMenuOpen = false;
    }
  }

  selectedCategory: string | null = null;

  filterByCategory(cat: string): void {
    this.filteredPolls = cat === 'All Categories'
      ? [...this.allPolls]
      : this.allPolls.filter(p => p.category === cat);
    this.selectedCategory = cat === 'All Categories' ? null : cat;
    this.sortMenuOpen = false;
  }
}
