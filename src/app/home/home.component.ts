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
      this.allPolls = raw.map(p => ({
        ...p,
        endsIn: computeTimeRemaining(p.end_date),
        isActive: !p.end_date || new Date(p.end_date) >= new Date(),
        isPast: !!p.end_date && new Date(p.end_date) < new Date(),
      }));
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

  filterByCategory(cat: string): void {
    this.filteredPolls = cat === 'All Categories'
      ? [...this.allPolls]
      : this.allPolls.filter(p => p.category === cat);
    this.sortMenuOpen = false;
  }
}
