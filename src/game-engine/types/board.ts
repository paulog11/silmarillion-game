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

export interface MarketState {
  /** Card IDs currently face-up and available for purchase. Refilled to 5 after each buy. */
  visibleCards: string[];
  /** Remaining card IDs in the market draw pile. */
  deck: string[];
}
