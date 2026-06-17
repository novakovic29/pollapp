export interface Poll {
  id: string;
  name: string;
  category: string | null;
  end_date: string | null;
  endsIn?: string;
  description?: string;
  isPast?: boolean;
  isActive?: boolean;
}
