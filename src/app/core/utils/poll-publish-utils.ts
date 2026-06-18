import { PollFormValue } from '../models/poll-form.model';
import { QuestionPayload } from '../models/question-payload.model';
import { PollService } from '../services/poll.service';
import { QuestionOptionService } from '../services/question-option.service';

/**
 * Persists a new poll together with its questions and answer options.
 *
 * @param pollService - Service used to insert the poll record.
 * @param questionOptionService - Service used to insert questions and answers.
 * @param formValue - Raw form value from the create-poll form.
 * @param chosenCategory - Category selected via the custom dropdown (takes precedence over the form field).
 * @param questions - Question payloads including nested answer arrays.
 * @returns The id of the newly created poll.
 * @throws When any Supabase insert fails.
 */
export async function submitPollLogic(
  pollService: PollService,
  questionOptionService: QuestionOptionService,
  formValue: PollFormValue,
  chosenCategory: string | null,
  questions: QuestionPayload[],
): Promise<number> {
  const { name, description, endDate, category } = formValue;
  const pollId = await pollService.createPoll({
    name,
    category: chosenCategory ?? category,
    end_date: endDate || null,
    description,
  });
  await questionOptionService.saveQuestionsWithOptions(pollId, questions);
  return pollId;
}
