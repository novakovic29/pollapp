/** Shape of the reactive form value for the create-poll form. */
export interface PollFormValue {
  /** Poll title entered by the user. */
  name: string;
  /** Optional description text. */
  description: string;
  /** ISO date string chosen as end date, or null. */
  endDate: string | null;
  /** Selected category string, or null. */
  category: string | null;
}
