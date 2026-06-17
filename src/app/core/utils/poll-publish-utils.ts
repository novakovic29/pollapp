import { PollFormValue } from '../models/poll-form.model';
import { QuestionPayload } from '../models/question-payload.model';
import { PollService } from '../services/poll.service';
import { QuestionOptionService } from '../services/question-option.service';

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
