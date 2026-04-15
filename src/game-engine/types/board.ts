import { ResourceId } from './primitives';

export interface LocationState {
  id: string;
  occupantId: string | null;
  accumulatedResources?: Partial<Record<ResourceId, number>>;
}

export interface ConflictState {
  conflictCardId: string;
  rewards: string[];
  playerStrengths: Record<string, number>;
  isResolved: boolean;
}
