import { defineStore } from 'pinia';
import { markRaw, ref } from 'vue';
import { GameEngine, GameAction } from '../game-engine/engine';
import { GameState, AutomataCard, PlayerState, AutomataState } from '../game-engine/types';

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
    locationPriorities: ['dorthonion', 'west-beleriand', 'himring'],
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
    deck: {
      drawPile: ['card-noldor-vanguard', 'card-lore-of-aman', 'card-cirdan-fleet'],
      hand: ['card-placeholder', 'card-house-of-fingolfin', 'card-edain-warrior'],
      discardPile: [],
      inPlay: [],
    },
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
    deck: { drawPile: [], hand: [], discardPile: [], inPlay: [] },
  };

  const automata: AutomataState = {
    deck: [...MOCK_AUTOMATA_DECK],
    discard: [],
    revealedCard: null,
    garrison: morgothPlayer.garrison,
    deployedTroops: morgothPlayer.deployedTroops,
  };

  return {
    round: 1,
    phase: 'planning',
    activePlayerId: humanPlayer.id,
    players: {
      [humanPlayer.id]: humanPlayer,
      [morgothPlayer.id]: morgothPlayer,
    },
    locations: {
      himring: { id: 'himring', occupantId: null },
      dorthonion: { id: 'dorthonion', occupantId: null },
      gondolin: { id: 'gondolin', occupantId: null },
      nargothrond: { id: 'nargothrond', occupantId: null },
      doriath: { id: 'doriath', occupantId: null },
      'west-beleriand': { id: 'west-beleriand', occupantId: null },
    },
    automata,
    conflict: null,
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
  }

  // Used by automata turns that run outside the engine's dispatch cycle.
  function setStateDirectly(next: GameState): void {
    gameState.value = next;
  }

  return { gameState, initGame, sendAction, setStateDirectly };
});
