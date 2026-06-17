import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PollDetailView, AnswerOption } from '../core/models/poll-detail.models';
import {
  getPollById,
  getPollQuestions,
  getQuestionAnswers,
  getPollVotes,
  applyVotePercentages,
} from '../core/utils/poll-detail-utils';
import { UserVoteService } from '../core/services/user-vote.service';
import { DatabaseService } from '../core/services/database.service';

@Component({
  selector: 'app-survey',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.scss'],
})
export class SurveyComponent implements OnInit {
  resultsVisible = true;
  pollData: PollDetailView | null = null;
  isLoading = true;
  alreadyVoted = false;

  constructor(
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private userVoteService: UserVoteService,
    private db: DatabaseService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((p) => {
      const id = p.get('id');
      if (id) {
        const voted = localStorage.getItem(`survey_voted_${id}`);
        this.alreadyVoted = voted === 'true';
        this.initPollData(id);
      }
    });
  }

  async initPollData(id: string): Promise<void> {
    try {
      const poll = await getPollById(this.db.client, id);
      const questions = await getPollQuestions(this.db.client, id);
      for (const q of questions) {
        q.answers = await getQuestionAnswers(this.db.client, q.id);
      }
      this.pollData = { ...poll, questions };
      this.isLoading = false;
      this.cdr.detectChanges();
      await this.refreshResults();
    } catch {
      this.isLoading = false;
    }
  }

  indexToLetter(i: number): string {
    return String.fromCharCode(65 + i);
  }

  chooseAnswer(qIndex: number, aIndex: number): void {
    if (this.alreadyVoted) return;
    const q = this.pollData!.questions[qIndex];
    q.answers.forEach((a: AnswerOption, i: number) => {
      a.selected = i === aIndex;
    });
  }

  hasResults(): boolean {
    return (
      this.pollData?.questions?.some((q) => q.answers.some((a) => (a.percentage ?? 0) > 0)) ?? false
    );
  }

  async submitVotes(): Promise<void> {
    if (this.alreadyVoted) return;
    for (const q of this.pollData!.questions) {
      const selected = q.answers.find((a) => a.selected);
      if (!selected) continue;
      await this.userVoteService.castVote({
        poll_id: Number(this.pollData!.id),
        question_id: Number(q.id),
        option_id: Number(selected.id),
      });
    }
    this.alreadyVoted = true;
    localStorage.setItem(`survey_voted_${this.pollData!.id}`, 'true');
    this.pollData!.questions = this.pollData!.questions.map((q) => ({
      ...q,
      answers: q.answers.map((a) => ({ ...a, selected: false })),
    }));
    this.cdr.detectChanges();
    await this.refreshResults();
  }

  async refreshResults(): Promise<void> {
    try {
      const votes = await getPollVotes(this.db.client, Number(this.pollData!.id));
      this.pollData!.questions = applyVotePercentages(this.pollData!.questions, votes);
      this.cdr.detectChanges();
    } catch {}
  }
}
