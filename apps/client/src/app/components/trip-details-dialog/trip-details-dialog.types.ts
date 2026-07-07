import type { Trip } from '@packwise/shared';
import type { CreateTripInput } from '../../types/data.types';

export interface TripDetailsDialogData {
  activityIds: string[];
  packedItemIds: string[];
  trip?: Trip;
}

export interface TripDetailsDialogResult {
  input: CreateTripInput;
}
