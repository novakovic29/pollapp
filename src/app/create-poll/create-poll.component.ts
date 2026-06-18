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

/** Handles the create-poll form: question/answer management, validation, and submission. */
@Component({
  selector: 'app-new-poll',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './create-poll.component.html',
  styleUrls: ['./create-poll.component.scss'],
})
export class NewPollComponent {
  /** The main reactive form for creating a poll. */
  pollForm: FormGroup;

  /** True while the poll is being submitted to the backend. */
  isSending = false;

  /** Whether the toast notification is currently visible. */
  notificationVisible = false;

  /** Text displayed inside the toast notification. */
  notificationText = '';

  /** Whether the category dropdown is open. */
  categoryOpen = false;

  /** Category selected via the custom dropdown (takes precedence over the form field). */
  chosenCategory: string | null = null;

  /** Minimum selectable date (today) for the end-date input. */
  minDate = new Date().toISOString().split('T')[0];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private pollService: PollService,
    private questionOptionService: QuestionOptionService,
    private cd: ChangeDetectorRef,
  ) {
    this.pollForm = this.buildPollForm();
    this.appendQuestion();
    this.appendOption(0);
    this.appendOption(0);
  }

  /** Builds the root form group with all poll meta fields and an empty questions array. */
  private buildPollForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      endDate: ['', [this.dateRangeValidator()]],
      category: [''],
      description: [''],
      questions: this.fb.array<FormGroup>([]),
    });
  }

  /**
   * Validator that rejects end dates in the past.
   *
   * @returns A {@link ValidatorFn} that returns `{ minDate: true }` for past dates, or `null` when valid.
   */
  dateRangeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      return value < new Date().toISOString().split('T')[0] ? { minDate: true } : null;
    };
  }

  /** Toggles the category dropdown open or closed. */
  toggleCategoryMenu(): void {
    this.categoryOpen = !this.categoryOpen;
  }

  /**
   * Selects a category from the dropdown and syncs it to the form control.
   *
   * @param cat - The category string the user selected.
   */
  pickCategory(cat: string): void {
    this.chosenCategory = cat;
    this.pollForm.get('category')?.setValue(cat);
    this.categoryOpen = false;
  }

  /**
   * Accessor for the questions FormArray.
   *
   * @returns The {@link FormArray} containing all question groups.
   */
  get pollQuestions(): FormArray<FormGroup> {
    return this.pollForm.get('questions') as FormArray<FormGroup>;
  }

  /**
   * Returns the answers FormArray for a given question group.
   *
   * @param q - The question {@link FormGroup} to read answers from.
   * @returns The nested {@link FormArray} of answer option groups.
   */
  getOptions(q: FormGroup): FormArray<FormGroup> {
    return q.get('answers') as FormArray<FormGroup>;
  }

  /** Appends a new question with two default answer options. */
  appendQuestion(): void {
    const q = buildQuestionGroup(this.fb);
    this.pollQuestions.push(q);
    const i = this.pollQuestions.length - 1;
    if (i > 0) {
      pushOptionToQuestion(this.fb, q);
      pushOptionToQuestion(this.fb, q);
    }
  }

  /**
   * Removes the question at {@link index} when more than one question exists.
   * Clears the question text when only one question remains.
   *
   * @param index - Zero-based index of the question to remove or clear.
   */
  deleteQuestion(index: number): void {
    if (this.pollQuestions.length > 1) {
      this.pollQuestions.removeAt(index);
    } else {
      this.pollQuestions.at(0).get('text')?.setValue('');
    }
  }

  /**
   * Appends a new answer option to the question at {@link questionIndex}.
   *
   * @param questionIndex - Zero-based index of the question to add an answer to.
   */
  appendOption(questionIndex: number): void {
    pushOptionToQuestion(this.fb, this.pollQuestions.at(questionIndex));
  }

  /**
   * Removes the answer at {@link answerIndex} when more than two options exist.
   * Clears the answer text when only two options remain.
   *
   * @param questionIndex - Zero-based index of the question that owns the answer.
   * @param answerIndex - Zero-based index of the answer option to remove or clear.
   */
  deleteOption(questionIndex: number, answerIndex: number): void {
    const q = this.pollQuestions.at(questionIndex);
    const answers = q.get('answers') as FormArray<FormGroup>;
    if (answers.length > 2) {
      removeOptionFromQuestion(q, answerIndex);
    } else {
      answers.at(answerIndex).get('text')?.setValue('');
    }
  }

  /**
   * Clears a named form field; also resets {@link chosenCategory} when clearing the category.
   *
   * @param fieldName - The form control name to clear (e.g. `'name'`, `'category'`).
   */
  clearField(fieldName: string): void {
    this.pollForm.get(fieldName)?.setValue('');
    if (fieldName === 'category') this.chosenCategory = null;
  }

  /**
   * Converts a zero-based answer index to its uppercase letter label (0 → `'A'`).
   *
   * @param index - Zero-based position of the answer option.
   * @returns The corresponding uppercase letter string.
   */
  indexToLetter(index: number): string {
    return numToAlpha(index);
  }

  /** Validates and submits the form, then navigates home after a short delay. */
  async submitPoll(): Promise<void> {
    if (!this.validateForm()) return;
    this.isSending = true;
    try {
      await submitPollLogic(this.pollService, this.questionOptionService, this.pollForm.value, this.chosenCategory, this.pollQuestions.value);
      this.onSubmitSuccess();
    } catch {
      this.isSending = false;
    }
  }

  /**
   * Returns false and shows a notification when the form is not ready to submit.
   *
   * @returns `true` when the form is valid and ready to submit, `false` otherwise.
   */
  private validateForm(): boolean {
    if (this.pollQuestions.length === 0) {
      this.displayNotification('Please add at least one question');
      return false;
    }
    if (this.pollForm.invalid) {
      this.pollForm.markAllAsTouched();
      this.displayNotification('Please fill in all required fields');
      return false;
    }
    return true;
  }

  /** Shows the success notification and redirects to home after a delay. */
  private onSubmitSuccess(): void {
    this.displayNotification('Your poll is now published');
    setTimeout(() => this.router.navigate(['/']), 2200);
  }

  /**
   * Shows a toast notification with {@link message} and hides it after 2 seconds.
   *
   * @param message - The text to display inside the toast.
   */
  displayNotification(message: string): void {
    this.notificationText = message;
    this.notificationVisible = true;
    this.cd.detectChanges();
    setTimeout(() => (this.notificationVisible = false), 2000);
  }
}
