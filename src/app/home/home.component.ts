import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PollService } from '../core/services/poll.service';
import { Poll } from '../core/models/poll.model';
import { computeTimeRemaining } from '../core/utils/poll-date-utils';

/** Displays the poll listing with active/past tabs, category filter, and ending-soon cards. */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  /** Currently visible tab. */
  activeTab: 'active' | 'past' = 'active';

  /** Whether the category sort dropdown is open. */
  sortMenuOpen = false;

  /** Currently active category filter, or null when all categories are shown. */
  selectedCategory: string | null = null;

  /** Available category options shown in the sort dropdown. */
  categoryOptions = [
    'All Categories',
    'Team Activities',
    'Health & Wellness',
    'Gaming & Entertainment',
    'Education & Learning',
    'Lifestyle & Preferences',
    'Technology & Innovation',
  ];

  /** All polls as loaded from the database, with computed date fields. */
  allPolls: Poll[] = [];

  /** Polls currently shown — equals allPolls unless a category filter is active. */
  filteredPolls: Poll[] = [];

  constructor(private pollService: PollService, private cd: ChangeDetectorRef) {}

  /** Loads and enriches all polls on component initialisation. */
  async ngOnInit(): Promise<void> {
    try {
      const raw = await this.pollService.getAllPolls();
      this.allPolls = raw.map((p) => this.enrichPoll(p));
      this.filteredPolls = [...this.allPolls];
      this.cd.detectChanges();
    } catch {
      // polls failed to load — leave lists empty
    }
  }

  /** Polls that are ending soon and still active (used for the highlight row). */
  get soonEndingPolls(): Poll[] {
    return this.allPolls.filter((p) => p.isActive && !!p.end_date);
  }

  /** Active polls from the currently filtered set. */
  get activePolls(): Poll[] {
    return this.filteredPolls.filter((p) => p.isActive);
  }

  /** Past polls from the currently filtered set. */
  get pastPolls(): Poll[] {
    return this.filteredPolls.filter((p) => p.isPast);
  }

  /**
   * Switches the visible tab between active and past surveys.
   *
   * @param tab - The tab to activate (`'active'` or `'past'`).
   */
  switchTab(tab: 'active' | 'past'): void {
    this.activeTab = tab;
  }

  /** Toggles the category sort dropdown open or closed. */
  toggleSortMenu(): void {
    this.sortMenuOpen = !this.sortMenuOpen;
  }

  /**
   * Filters the poll list to the given category, or resets to all when `'All Categories'` is passed.
   *
   * @param cat - The category name to filter by, or `'All Categories'` to clear the filter.
   */
  filterByCategory(cat: string): void {
    this.filteredPolls =
      cat === 'All Categories' ? [...this.allPolls] : this.allPolls.filter((p) => p.category === cat);
    this.selectedCategory = cat === 'All Categories' ? null : cat;
    this.sortMenuOpen = false;
  }

  /**
   * Closes the sort dropdown when the user clicks outside the nav-right container.
   *
   * @param event - The native mouse event from the document click listener.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.sortMenuOpen && !(event.target as HTMLElement).closest('.nav-right')) {
      this.sortMenuOpen = false;
    }
  }

  /**
   * Adds computed display fields (`endsIn`, `isActive`, `isPast`) to a raw poll.
   * Both dates are normalised to midnight so same-day polls count as active.
   *
   * @param p - The raw poll record from the database.
   * @returns The same poll enriched with computed date fields.
   */
  private enrichPoll(p: Poll): Poll {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = p.end_date ? new Date(p.end_date) : null;
    if (endDate) endDate.setHours(0, 0, 0, 0);
    return {
      ...p,
      endsIn: computeTimeRemaining(p.end_date),
      isActive: !endDate || endDate >= today,
      isPast: !!endDate && endDate < today,
    };
  }
}
