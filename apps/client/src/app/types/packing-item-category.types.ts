import type { Item, ItemCategoryId } from '@packwise/shared';

export type PackingItemCategoryId = ItemCategoryId | 'uncategorized';

export interface PackingItemCategoryGroup {
  id: PackingItemCategoryId;
  name: string;
  items: Item[];
}
