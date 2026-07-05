import type { Activity, Item } from '@packwise/shared';
import type { CreateItemInput } from '../../types/data.types';

export interface ItemDetailsDialogData {
  activities: Activity[];
  activityIds?: string[];
  findDuplicateItem?: (name: string, ignoredItemId?: string) => Item | undefined;
  item?: Item;
}

export interface ItemDetailsDialogResult {
  input?: CreateItemInput;
  itemId?: string;
  openItemId?: string;
}
