import { GameState, PlayerState } from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getPlayer(state: GameState, playerId: string): PlayerState {
  const player = state.players[playerId];
  if (!player) {
    throw new Error(`applyLocationReward: player "${playerId}" not found.`);
  }
  return player;
}

/** Draw up to `count` cards from the player's drawPile into their hand. */
function drawCards(player: PlayerState, count: number): PlayerState {
  const available = Math.min(count, player.deck.drawPile.length);
  const drawn = player.deck.drawPile.slice(0, available);
  return {
    ...player,
    deck: {
      ...player.deck,
      drawPile: player.deck.drawPile.slice(available),
      hand: [...player.deck.hand, ...drawn],
    },
  };
}

function updatePlayer(state: GameState, player: PlayerState): GameState {
  return {
    ...state,
    players: { ...state.players, [player.id]: player },
  };
}

// ---------------------------------------------------------------------------
// applyLocationReward
// ---------------------------------------------------------------------------

/**
 * Pure function — applies the reward for the given location to the player and
 * returns a new GameState. Does not mutate the input state.
 *
 * Called during the action phase after an agent has been placed. Conditional
 * rewards (e.g. gondolin) are only applied when the player meets the cost; if
 * they do not, the state is returned unchanged and a history note is appended.
 */
export function applyLocationReward(
  state: GameState,
  playerId: string,
  locationId: string,
): GameState {
  let player = getPlayer(state, playerId);
  let rewardDescription: string;

  switch (locationId) {
    // +2 garrison, +1 valor, unlock troop deployment
    case 'barad_eithel': {
      player = {
        ...player,
        garrison: player.garrison + 2,
        resources: { ...player.resources, valor: player.resources.valor + 1 },
        canDeployTroops: true,
      };
      rewardDescription = '+2 garrison, +1 valor, deployment unlocked.';
      break;
    }

    // Costs 2 lore → draw 2 cards
    case 'gondolin': {
      if (player.resources.lore < 2) {
        rewardDescription = 'reward skipped — insufficient lore (need 2).';
        break;
      }
      player = {
        ...player,
        resources: { ...player.resources, lore: player.resources.lore - 2 },
      };
      player = drawCards(player, 2);
      rewardDescription = 'spent 2 lore, drew 2 cards.';
      break;
    }

    // +1 troop (garrison), increment feanor influence, unlock troop deployment
    case 'himring': {
      player = {
        ...player,
        garrison: player.garrison + 1,
        influence: { ...player.influence, feanor: player.influence.feanor + 1 },
        canDeployTroops: true,
      };
      rewardDescription = '+1 garrison, +1 Fëanor influence, deployment unlocked.';
      break;
    }

    // Costs 1 valor → +3 supplies
    case 'the_havens': {
      if (player.resources.valor < 1) {
        rewardDescription = 'reward skipped — insufficient valor (need 1).';
        break;
      }
      player = {
        ...player,
        resources: {
          ...player.resources,
          valor: player.resources.valor - 1,
          supplies: player.resources.supplies + 3,
        },
      };
      rewardDescription = 'spent 1 valor, gained +3 supplies.';
      break;
    }

    // Commit: all garrison → deployedTroops
    case 'angband_gates': {
      player = {
        ...player,
        deployedTroops: player.deployedTroops + player.garrison,
        garrison: 0,
      };
      rewardDescription = `committed ${player.garrison === 0 ? 'all' : player.garrison} garrison troops to the assault.`;
      break;
    }

    default:
      // Location has no defined reward — no-op
      return state;
  }

  const next = updatePlayer(state, player);
  return {
    ...next,
    history: [
      ...next.history,
      `[Round ${state.round}] "${playerId}" at ${locationId}: ${rewardDescription}`,
    ],
  };
}
