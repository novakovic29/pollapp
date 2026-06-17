import { Component, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  Validators,
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PollService } from '../core/services/poll.service';
import { QuestionOptionService } from '../core/services/question-option.service';
import {
  buildQuestionGroup,
  pushOptionToQuestion,
  removeOptionFromQuestion,
  numToAlpha,
} from '../core/utils/poll-form-utils';
import { submitPollLogic } from '../core/utils/poll-publish-utils';

@Component({
  selector: 'app-new-poll',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './create-poll.component.html',
  styleUrls: ['./create-poll.component.scss'],
})
export class NewPollComponent {
  pollForm: FormGroup;
  isSending = false;
  notificationVisible = false;
  notificationText = '';
  categoryOpen = false;
  chosenCategory: string | null = null;
  minDate = new Date().toISOString().split('T')[0];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private pollService: PollService,
    private questionOptionService: QuestionOptionService,
    private cd: ChangeDetectorRef,
  ) {
    this.pollForm = this.fb.group({
      name: ['', Validators.required],
      endDate: ['', [this.dateRangeValidator()]],
      category: [''],
      description: [''],
      questions: this.fb.array<FormGroup>([]),
    });
    this.appendQuestion();
    this.appendOption(0);
    this.appendOption(0);
  }

  dateRangeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      const today = new Date().toISOString().split('T')[0];
      return value < today ? { minDate: true } : null;
    };
  }

  toggleCategoryMenu(): void {
    this.categoryOpen = !this.categoryOpen;
  }

  pickCategory(cat: string): void {
    this.chosenCategory = cat;
    this.pollForm.get('category')?.setValue(cat);
    this.categoryOpen = false;
  }

  get pollQuestions(): FormArray<FormGroup> {
    return this.pollForm.get('questions') as FormArray<FormGroup>;
  }

  getOptions(q: FormGroup): FormArray<FormGroup> {
    return q.get('answers') as FormArray<FormGroup>;
  }

  appendQuestion(): void {
    const q = buildQuestionGroup(this.fb);
    this.pollQuestions.push(q);
    const i = this.pollQuestions.length - 1;
    if (i > 0) {
      pushOptionToQuestion(this.fb, q);
      pushOptionToQuestion(this.fb, q);
    }
  }

  deleteQuestion(index: number): void {
    this.pollQuestions.removeAt(index);
  }

  appendOption(questionIndex: number): void {
    pushOptionToQuestion(this.fb, this.pollQuestions.at(questionIndex));
  }

  deleteOption(questionIndex: number, answerIndex: number): void {
    removeOptionFromQuestion(this.pollQuestions.at(questionIndex), answerIndex);
  }

  indexToLetter(index: number): string {
    return numToAlpha(index);
  }

  async submitPoll(): Promise<void> {
    if (this.pollForm.invalid || this.pollQuestions.length === 0) {
      this.pollForm.markAllAsTouched();
      return;
    }
    this.isSending = true;
    try {
      await submitPollLogic(
        this.pollService,
        this.questionOptionService,
        this.pollForm.value,
        this.chosenCategory,
        this.pollQuestions.value,
      );
      this.displayNotification('Your poll is now published');
      setTimeout(() => this.router.navigate(['/']), 2200);
    } catch {
      this.isSending = false;
    }
  }

  displayNotification(message: string): void {
    this.notificationText = message;
    this.notificationVisible = true;
    this.cd.detectChanges();
    setTimeout(() => (this.notificationVisible = false), 2000);
  }
}
