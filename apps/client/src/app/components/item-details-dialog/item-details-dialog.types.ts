import type { Activity, Item } from '@packwise/shared';

export interface ItemDetailsDialogData {
  activities: Activity[];
  activityIds?: string[];
  item?: Item;
}
