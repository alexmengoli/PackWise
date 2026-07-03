export interface PackingListEntry {
  itemId: string;
  name: string;
  quantity: number;
  activityIds: string[];
  packed: boolean;
  notes?: string;
}
