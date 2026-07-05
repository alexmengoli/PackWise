import type { Activity } from '@packwise/shared';
import type { CreateActivityInput } from '../../types/data.types';

export interface ActivityDetailsDialogData {
  activity?: Activity;
  findDuplicateActivity?: (name: string, ignoredActivityId?: string) => Activity | undefined;
}

export interface ActivityDetailsDialogResult {
  activityId?: string;
  input?: CreateActivityInput;
  openActivityId?: string;
}
