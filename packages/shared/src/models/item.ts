export interface PackingItem {
  id: string;
  name: string;
  activityIds: string[];
  quantity: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
