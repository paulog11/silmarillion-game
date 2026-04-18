import { defineStore } from 'pinia';
import { markRaw, ref } from 'vue';
import { useTutorialStore } from './useTutorialStore';
import { GameEngine, GameAction } from '../game-engine/engine';
import { GameState, AutomataCard, PlayerState, AutomataState } from '../game-engine/types';
import { buildConflictDeck } from '../game-engine/data/conflictDeck';
import { MARKET_CARD_IDS } from '../game-engine/data/marketDeck';
import { STARTER_DECK_IDS } from '../game-engine/data/starterDeck';
import { shuffle } from '../game-engine/logic/deckManager';

// ---------------------------------------------------------------------------
// Mock setup helpers
// ---------------------------------------------------------------------------

const MOCK_AUTOMATA_DECK: AutomataCard[] = [
  {
    id: 'ac-balrog-assault',
    title: 'Balrog Assault',
    locationPriorities: ['himring', 'dorthonion', 'gondolin'],
    troopsMustered: 3,
    specialEffect: 'All defenders in the target location lose 1 valor.',
  },
  {
    id: 'ac-shadow-spread',
    title: 'Shadow of Angband',
    locationPriorities: ['dorthonion', 'west_beleriand', 'himring'],
    troopsMustered: 2,
  },
  {
    id: 'ac-iron-will',
    title: 'Iron Will',
    locationPriorities: ['gondolin', 'nargothrond', 'doriath'],
    troopsMustered: 1,
    specialEffect: 'Morgoth gains +1 lore this round.',
  },
];

function buildInitialState(): GameState {
  // --- Human player deck ---
  const shuffledStarter = shuffle(STARTER_DECK_IDS);
  const humanDeck = {
    hand: shuffledStarter.slice(0, 5),
    drawPile: shuffledStarter.slice(5),
    discardPile: [] as string[],
    inPlay: [] as string[],
  };

  const humanPlayer: PlayerState = {
    id: 'player-noldor',
    isAutomata: false,
    faction: 'noldor',
    resources: { valor: 2, lore: 1, supplies: 3 },
    influence: { fingolfin: 2, feanor: 1, sindar: 0, edain: 0 },
    victoryPoints: 0,
    agentsAvailable: 3,
    agentsTotal: 3,
    garrison: 2,
    deployedTroops: 0,
    currentPurchasingPower: 0,
    deck: humanDeck,
  };

  const morgothPlayer: PlayerState = {
    id: 'player-morgoth',
    isAutomata: true,
    faction: 'morgoth',
    resources: { valor: 0, lore: 0, supplies: 5 },
    influence: { fingolfin: 0, feanor: 0, sindar: 0, edain: 0 },
    victoryPoints: 0,
    agentsAvailable: 0,
    agentsTotal: 0,
    garrison: 5,
    deployedTroops: 0,
    currentPurchasingPower: 0,
    deck: { drawPile: [], hand: [], discardPile: [], inPlay: [] },
  };

  // --- Automata state ---
  const automata: AutomataState = {
    deck: [...MOCK_AUTOMATA_DECK],
    discard: [],
    revealedCard: null,
    garrison: morgothPlayer.garrison,
    deployedTroops: morgothPlayer.deployedTroops,
  };

  // --- Market ---
  const marketDeckIds = shuffle(MARKET_CARD_IDS);
  const visibleCards = marketDeckIds.slice(0, 5);
  const marketDrawPile = marketDeckIds.slice(5);

  // --- Conflict deck ---
  const [firstConflict, ...remainingConflicts] = buildConflictDeck();

  return {
    round: 1,
    phase: 'planning',
    activePlayerId: humanPlayer.id,
    players: {
      [humanPlayer.id]: humanPlayer,
      [morgothPlayer.id]: morgothPlayer,
    },
    locations: {
      barad_eithel: { id: 'barad_eithel', occupantId: null },
      himring: { id: 'himring', occupantId: null },
      dorthonion: { id: 'dorthonion', occupantId: null },
      gondolin: { id: 'gondolin', occupantId: null },
      nargothrond: { id: 'nargothrond', occupantId: null },
      doriath: { id: 'doriath', occupantId: null },
      the_havens: { id: 'the_havens', occupantId: null },
      west_beleriand: { id: 'west_beleriand', occupantId: null },
      angband_gates: { id: 'angband_gates', occupantId: null },
    },
    automata,
    conflict: firstConflict
      ? {
          conflictCardId: firstConflict.id,
          rewards: [],
          playerStrengths: {
            [humanPlayer.id]: 0,
            [morgothPlayer.id]: 0,
          },
          isResolved: false,
        }
      : null,
    conflictDeck: remainingConflicts,
    market: { visibleCards, deck: marketDrawPile },
    history: ['[Round 1] Game started. The Noldor stand against the Shadow.'],
  };
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useGameStore = defineStore('game', () => {
  const gameState = ref<GameState | null>(null);

  // markRaw prevents Vue from making the engine instance deeply reactive.
  // The engine manages its own state; Pinia holds only the plain-data snapshot.
  const engine = ref<GameEngine | null>(null);

  function initGame(): void {
    const initialState = buildInitialState();

    const newEngine = markRaw(
      new GameEngine(initialState, (updatedState: GameState) => {
        gameState.value = updatedState;
      })
    );

    engine.value = newEngine;

    // Seed the reactive state with the initial snapshot so components
    // can render immediately without waiting for the first dispatch.
    gameState.value = initialState;
  }

  function sendAction(action: GameAction): void {
    if (!engine.value) {
      throw new Error('sendAction: engine is not initialised. Call initGame() first.');
    }
    engine.value.dispatch(action);
    useTutorialStore().notifyAction(action.type);
  }

  // Used by automata turns that run outside the engine's dispatch cycle.
  function setStateDirectly(next: GameState): void {
    gameState.value = next;
  }

  return { gameState, initGame, sendAction, setStateDirectly };
});
