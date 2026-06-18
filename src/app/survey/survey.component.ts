import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PollDetailView, AnswerOption, VoteRecord } from '../core/models/poll-detail.models';
import {
  getPollById,
  getPollQuestions,
  getQuestionAnswers,
  getPollVotes,
  applyVotePercentages,
} from '../core/utils/poll-detail-utils';
import { UserVoteService } from '../core/services/user-vote.service';
import { DatabaseService } from '../core/services/database.service';

/** Displays a single poll, handles answer selection, live preview, and vote submission. */
@Component({
  selector: 'app-survey',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.scss'],
})
export class SurveyComponent implements OnInit {
  /** Whether the results panel is visible. */
  resultsVisible = true;

  /** Full poll data including questions and answers, or null while loading. */
  pollData: PollDetailView | null = null;

  /** True while the initial data fetch is in progress. */
  isLoading = true;

  /** True when the current user has already submitted a vote for this poll. */
  alreadyVoted = false;

  /** Vote records fetched from the database, used as the baseline for live preview. */
  private baseVotes: VoteRecord[] = [];

  constructor(
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private userVoteService: UserVoteService,
    private db: DatabaseService,
  ) {}

  /** Subscribes to route params and triggers poll loading on navigation. */
  ngOnInit(): void {
    this.route.paramMap.subscribe((p) => {
      const id = p.get('id');
      if (id) {
        this.alreadyVoted = localStorage.getItem(`survey_voted_${id}`) === 'true';
        this.initPollData(id);
      }
    });
  }

  /**
   * Fetches the poll, its questions, and all answer options, then loads existing vote results.
   *
   * @param id - The string id of the poll to load.
   */
  async initPollData(id: string): Promise<void> {
    try {
      this.pollData = await this.loadPollWithQuestions(id);
      this.isLoading = false;
      this.cdr.detectChanges();
      await this.refreshResults();
    } catch {
      this.isLoading = false;
    }
  }

  /**
   * Loads a poll and eagerly resolves all answer options for each question.
   *
   * @param id - The string id of the poll to load.
   * @returns The fully populated {@link PollDetailView} including questions and answers.
   */
  private async loadPollWithQuestions(id: string): Promise<PollDetailView> {
    const poll = await getPollById(this.db.client, id);
    const questions = await getPollQuestions(this.db.client, id);
    for (const q of questions) q.answers = await getQuestionAnswers(this.db.client, q.id);
    return { ...poll, questions };
  }

  /**
   * Converts a zero-based answer index to its uppercase letter label (0 → `'A'`).
   *
   * @param i - Zero-based index of the answer option.
   * @returns The corresponding uppercase letter string.
   */
  indexToLetter(i: number): string {
    return String.fromCharCode(65 + i);
  }

  /**
   * Toggles or exclusively selects an answer, then updates the live preview.
   *
   * @param qIndex - Zero-based index of the question in the questions array.
   * @param aIndex - Zero-based index of the answer option within that question.
   */
  chooseAnswer(qIndex: number, aIndex: number): void {
    if (this.alreadyVoted) return;
    const q = this.pollData!.questions[qIndex];
    if (q.allow_multiple) {
      q.answers[aIndex].selected = !q.answers[aIndex].selected;
    } else {
      q.answers.forEach((a: AnswerOption, i: number) => { a.selected = i === aIndex; });
    }
    this.updatePreview();
  }

  /** True when every question has at least one selected answer. */
  get allAnswered(): boolean {
    return !!this.pollData?.questions?.every((q) => q.answers.some((a) => a.selected));
  }

  /**
   * True when any answer option has a non-zero vote percentage.
   *
   * @returns `true` if at least one answer has votes, `false` otherwise.
   */
  hasResults(): boolean {
    return this.pollData?.questions?.some((q) => q.answers.some((a) => (a.percentage ?? 0) > 0)) ?? false;
  }

  /** Submits the selected answers, persists the voted state, and refreshes results. */
  async submitVotes(): Promise<void> {
    if (this.alreadyVoted) return;
    try {
      await this.castAllVotes();
      this.markAsVoted();
      this.cdr.detectChanges();
      await this.refreshResults();
    } catch {
      this.cdr.detectChanges();
    }
  }

  /** Sends a vote record for every selected answer across all questions. */
  private async castAllVotes(): Promise<void> {
    for (const q of this.pollData!.questions) {
      for (const selected of q.answers.filter((a) => a.selected)) {
        await this.userVoteService.castVote({
          poll_id: Number(this.pollData!.id),
          question_id: Number(q.id),
          option_id: Number(selected.id),
        });
      }
    }
  }

  /** Persists the voted flag to localStorage and clears all selected answers. */
  private markAsVoted(): void {
    this.alreadyVoted = true;
    localStorage.setItem(`survey_voted_${this.pollData!.id}`, 'true');
    this.pollData!.questions = this.pollData!.questions.map((q) => ({
      ...q,
      answers: q.answers.map((a) => ({ ...a, selected: false })),
    }));
  }

  /** Fetches the latest vote counts and recalculates percentages. */
  async refreshResults(): Promise<void> {
    const votes = await getPollVotes(this.db.client, Number(this.pollData!.id));
    this.baseVotes = votes;
    this.pollData!.questions = applyVotePercentages(this.pollData!.questions, votes);
    this.cdr.detectChanges();
  }

  /**
   * Recalculates live preview percentages by combining the base votes with the
   * currently selected (but not yet submitted) answers.
   */
  private updatePreview(): void {
    if (!this.pollData) return;
    const previewVotes = [...this.baseVotes];
    for (const q of this.pollData.questions) {
      for (const a of q.answers) {
        if (a.selected) previewVotes.push({ option_id: a.id });
      }
    }
    this.pollData.questions = applyVotePercentages(this.pollData.questions, previewVotes);
    this.cdr.detectChanges();
  }
}
