import type { PackwiseDataSnapshot } from './data.types';

export interface PackwiseDataExport {
  app: 'packwise';
  version: number;
  exportedAt: string;
  data: PackwiseDataSnapshot;
}
