export interface Trip {
  id: string;
  name: string;
  description?: string;
  activityIds: string[];
  packedItemIds: string[];
  createdAt: string;
  updatedAt: string;
}
