import { GameState } from './types';
import { CARD_REGISTRY } from './data/cards';
import { LOCATION_REGISTRY } from './data/locations';
import { resolveConflictPhase } from './logic/conflictResolution';

// ---------------------------------------------------------------------------
// GameAction — discriminated union of all user intents
// ---------------------------------------------------------------------------

export type GameAction =
  | { type: 'PLAY_AGENT'; playerId: string; locationId: string; cardId: string }
  | { type: 'PASS_TURN'; playerId: string }
  | { type: 'RESOLVE_CONFLICT' };

// ---------------------------------------------------------------------------
// GameEngine
// ---------------------------------------------------------------------------

export class GameEngine {
  private state: GameState;
  private readonly onStateChange: (state: GameState) => void;

  constructor(initialState: GameState, onStateChange: (state: GameState) => void) {
    this.state = initialState;
    this.onStateChange = onStateChange;
  }

  dispatch(action: GameAction): void {
    this.state = this.reduce(this.state, action);
    this.onStateChange(this.cloneState(this.state));
  }

  // ---------------------------------------------------------------------------
  // Reducer — pure: no side effects, always returns a new state object
  // ---------------------------------------------------------------------------

  private reduce(state: GameState, action: GameAction): GameState {
    switch (action.type) {
      case 'PLAY_AGENT':
        return this.handlePlayAgent(state, action);

      case 'PASS_TURN':
        return {
          ...state,
          history: [
            ...state.history,
            `[Round ${state.round}] Player "${action.playerId}" passed their turn.`,
          ],
        };

      case 'RESOLVE_CONFLICT':
        return resolveConflictPhase(state);

      default: {
        // Exhaustiveness guard — TypeScript will error here if a case is missing
        const _exhaustive: never = action;
        return _exhaustive;
      }
    }
  }

  private handlePlayAgent(
    state: GameState,
    action: Extract<GameAction, { type: 'PLAY_AGENT' }>
  ): GameState {
    const { playerId, locationId, cardId } = action;

    const player = state.players[playerId];
    if (!player) {
      throw new Error(`PLAY_AGENT: player "${playerId}" not found.`);
    }

    const location = state.locations[locationId];
    if (!location) {
      throw new Error(`PLAY_AGENT: location "${locationId}" not found.`);
    }

    if (location.occupantId !== null) {
      throw new Error(
        `PLAY_AGENT: location "${locationId}" is already occupied by "${location.occupantId}".`
      );
    }

    if (player.agentsAvailable <= 0) {
      throw new Error(`PLAY_AGENT: player "${playerId}" has no agents available.`);
    }

    // --- Card validation ---
    if (!player.deck.hand.includes(cardId)) {
      throw new Error(`PLAY_AGENT: card "${cardId}" is not in player "${playerId}"'s hand.`);
    }

    const cardDef = CARD_REGISTRY[cardId];
    if (!cardDef) {
      throw new Error(`PLAY_AGENT: card "${cardId}" is not in the CARD_REGISTRY.`);
    }

    // --- Location registry validation (icon + cost) ---
    const locationDef = LOCATION_REGISTRY[locationId];
    if (locationDef) {
      if (cardDef.icon !== locationDef.requiredIcon) {
        throw new Error(
          `PLAY_AGENT: location "${locationId}" requires a ${locationDef.requiredIcon} card, ` +
          `but "${cardId}" is ${cardDef.icon}.`
        );
      }

      if (locationDef.cost !== null) {
        const { resource, amount } = locationDef.cost;
        if (player.resources[resource] < amount) {
          throw new Error(
            `PLAY_AGENT: location "${locationId}" costs ${amount} ${resource}, ` +
            `but player "${playerId}" only has ${player.resources[resource]}.`
          );
        }
      }
    }

    // --- Apply cost, move card hand → inPlay, place agent ---
    const costResource = locationDef?.cost?.resource;
    const costAmount = locationDef?.cost?.amount ?? 0;

    return {
      ...state,
      players: {
        ...state.players,
        [playerId]: {
          ...player,
          agentsAvailable: player.agentsAvailable - 1,
          resources: costResource
            ? { ...player.resources, [costResource]: player.resources[costResource] - costAmount }
            : player.resources,
          deck: {
            ...player.deck,
            hand: player.deck.hand.filter((id) => id !== cardId),
            inPlay: [...player.deck.inPlay, cardId],
          },
        },
      },
      locations: {
        ...state.locations,
        [locationId]: {
          ...location,
          occupantId: playerId,
        },
      },
      history: [
        ...state.history,
        `[Round ${state.round}] Player "${playerId}" played "${cardDef.name}" to ${locationDef?.name ?? locationId}.`,
      ],
    };
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /** Deep-clones state so the callback receiver cannot mutate internal state. */
  private cloneState(state: GameState): GameState {
    return JSON.parse(JSON.stringify(state));
  }
}
