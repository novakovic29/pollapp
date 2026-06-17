export interface HomePollItem {
  id: string;
  name: string;
  category: string | null;
  end_date: string | null;
  endsIn?: string;
  isPast?: boolean;
  isActive?: boolean;
}
