import { AutomataCard, AutomataState, GameState, PlayerState } from './types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function findMorgothPlayer(state: GameState): PlayerState {
  const morgoth = Object.values(state.players).find((p) => p.isAutomata);
  if (!morgoth) {
    throw new Error('executeAutomataTurn: no automata player found in state.');
  }
  return morgoth;
}

/** Returns a new AutomataState with discard shuffled back into the deck. */
function reshuffleDiscard(automata: AutomataState): AutomataState {
  const shuffled = [...automata.discard].sort(() => Math.random() - 0.5);
  return { ...automata, deck: shuffled, discard: [] };
}

// ---------------------------------------------------------------------------
// Pure function — mutates nothing, always returns a new GameState
// ---------------------------------------------------------------------------

export function executeAutomataTurn(state: GameState): GameState {
  const morgoth = findMorgothPlayer(state);

  // 1. Reshuffle if deck is empty
  let automata: AutomataState = state.automata;
  if (automata.deck.length === 0) {
    if (automata.discard.length === 0) {
      throw new Error('executeAutomataTurn: Morgoth has no cards in deck or discard pile.');
    }
    automata = reshuffleDiscard(automata);
  }

  // 2. Draw the top card
  const [drawnCard, ...remainingDeck] = automata.deck;
  automata = { ...automata, deck: remainingDeck, revealedCard: drawnCard };

  // 3. Find the first open priority location
  const targetLocationId = drawnCard.locationPriorities.find(
    (locId) => state.locations[locId]?.occupantId === null
  ) ?? null;

  // 4. Resolve placement or garrison fallback
  let updatedLocations = state.locations;
  let updatedMorgoth: PlayerState;
  let actionDescription: string;

  if (targetLocationId !== null) {
    updatedLocations = {
      ...state.locations,
      [targetLocationId]: {
        ...state.locations[targetLocationId],
        occupantId: morgoth.id,
      },
    };
    updatedMorgoth = {
      ...morgoth,
      deployedTroops: morgoth.deployedTroops + drawnCard.troopsMustered,
    };
    actionDescription =
      `Morgoth played card "${drawnCard.title}" — ` +
      `placed agent at "${targetLocationId}" and mustered ${drawnCard.troopsMustered} troop(s).`;
  } else {
    // All priority locations blocked — fall back to garrison
    updatedMorgoth = {
      ...morgoth,
      garrison: morgoth.garrison + 1,
      deployedTroops: morgoth.deployedTroops + drawnCard.troopsMustered,
    };
    actionDescription =
      `Morgoth played card "${drawnCard.title}" — ` +
      `all priority locations blocked; +1 garrison and mustered ${drawnCard.troopsMustered} troop(s).`;
  }

  // 5. Move drawn card to discard
  automata = {
    ...automata,
    discard: [...automata.discard, drawnCard],
  };

  // 6. Determine the next human player
  const humanPlayer = Object.values(state.players).find((p) => !p.isAutomata);
  const nextActivePlayerId = humanPlayer?.id ?? state.activePlayerId;

  // 7. Assemble the new state
  return {
    ...state,
    activePlayerId: nextActivePlayerId,
    players: {
      ...state.players,
      [updatedMorgoth.id]: updatedMorgoth,
    },
    locations: updatedLocations,
    automata,
    history: [
      ...state.history,
      `[Round ${state.round}] ${actionDescription}`,
    ],
  };
}
