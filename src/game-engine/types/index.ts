export * from './primitives';
export * from './player';
export * from './board';
export * from './automata';

import { Phase } from './primitives';
import { PlayerState } from './player';
import { LocationState, ConflictState, MarketState } from './board';
import { AutomataState } from './automata';
import { ConflictCard } from '../data/conflictDeck';

export interface GameState {
  round: number;
  phase: Phase;
  activePlayerId: string;
  players: Record<string, PlayerState>;
  locations: Record<string, LocationState>;
  automata: AutomataState;
  /** Active conflict being resolved this round. null when no conflict is in progress. */
  conflict: ConflictState | null;
  /** Remaining conflict cards to be drawn in future rounds. Tier-sorted and shuffled at init. */
  conflictDeck: ConflictCard[];
  market: MarketState;
  history: string[];
}
