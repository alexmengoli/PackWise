import type { PackingItem } from '../models/item';
import type { PackingListEntry } from '../models/packing-list';

export function generatePackingList(
  items: PackingItem[],
  selectedActivityIds: readonly string[],
  packedItemIds: ReadonlySet<string> = new Set<string>()
): PackingListEntry[] {
  const selected = new Set(selectedActivityIds);

  return items
    .filter((item) => item.activityIds.some((activityId) => selected.has(activityId)))
    .map((item) => ({
      itemId: item.id,
      name: item.name,
      quantity: item.quantity,
      activityIds: item.activityIds,
      packed: packedItemIds.has(item.id),
      notes: item.notes
    }))
    .sort((first, second) => first.name.localeCompare(second.name));
}
