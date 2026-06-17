import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

export function buildQuestionGroup(fb: FormBuilder): FormGroup {
  return fb.group({
    text: ['', Validators.required],
    allowMultiple: [false],
    answers: fb.array<FormGroup>([]),
  });
}

export function buildOptionGroup(fb: FormBuilder): FormGroup {
  return fb.group({ text: ['', Validators.required] });
}

export function pushOptionToQuestion(fb: FormBuilder, question: FormGroup): void {
  const answers = question.get('answers') as FormArray<FormGroup>;
  if (answers.length < 6) answers.push(buildOptionGroup(fb));
}

export function removeOptionFromQuestion(question: FormGroup, index: number): void {
  const answers = question.get('answers') as FormArray<FormGroup>;
  if (answers.length > 2) answers.removeAt(index);
}

export function numToAlpha(index: number): string {
  return String.fromCharCode(65 + index);
}
