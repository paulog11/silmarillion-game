export * from './primitives';
export * from './player';
export * from './board';
export * from './automata';

import { Phase } from './primitives';
import { PlayerState } from './player';
import { LocationState, ConflictState } from './board';
import { AutomataState } from './automata';

export interface GameState {
  round: number;
  phase: Phase;
  activePlayerId: string;
  players: Record<string, PlayerState>;
  locations: Record<string, LocationState>;
  automata: AutomataState;
  conflict: ConflictState | null;
  history: string[];
}
