import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

/**
 * Creates a new question {@link FormGroup} with a required `text` control,
 * an `allowMultiple` toggle, and an empty `answers` array.
 */
export function buildQuestionGroup(fb: FormBuilder): FormGroup {
  return fb.group({
    text: ['', Validators.required],
    allowMultiple: [false],
    answers: fb.array<FormGroup>([]),
  });
}

/**
 * Creates a single answer option {@link FormGroup} with a required `text` control.
 */
export function buildOptionGroup(fb: FormBuilder): FormGroup {
  return fb.group({ text: ['', Validators.required] });
}

/**
 * Appends a new answer option to a question's `answers` array.
 * Has no effect when the question already has 6 options (maximum).
 */
export function pushOptionToQuestion(fb: FormBuilder, question: FormGroup): void {
  const answers = question.get('answers') as FormArray<FormGroup>;
  if (answers.length < 6) answers.push(buildOptionGroup(fb));
}

/**
 * Removes the answer option at {@link index} from a question.
 * Has no effect when fewer than 3 options remain (minimum is 2).
 */
export function removeOptionFromQuestion(question: FormGroup, index: number): void {
  const answers = question.get('answers') as FormArray<FormGroup>;
  if (answers.length > 2) answers.removeAt(index);
}

/**
 * Converts a zero-based index to its uppercase letter (0 → `'A'`, 1 → `'B'`, …).
 */
export function numToAlpha(index: number): string {
  return String.fromCharCode(65 + index);
}
