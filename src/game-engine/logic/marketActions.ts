import { GameState } from '../types';
import { CARD_REGISTRY } from '../data/cards';
import { MARKET_CARD_IDS, RESERVE_CARD_IDS } from '../data/marketDeck';

const MARKET_SIZE = 5;

// ---------------------------------------------------------------------------
// refillMarket
// ---------------------------------------------------------------------------

/**
 * Draws cards from `market.deck` into `market.visibleCards` until it reaches
 * MARKET_SIZE or the deck is exhausted. Returns a new GameState; never mutates.
 */
function refillMarket(state: GameState): GameState {
  const visibleCards = [...state.market.visibleCards];
  const deck = [...state.market.deck];

  while (visibleCards.length < MARKET_SIZE && deck.length > 0) {
    visibleCards.push(deck.shift()!);
  }

  return {
    ...state,
    market: { visibleCards, deck },
  };
}

// ---------------------------------------------------------------------------
// buyCard
// ---------------------------------------------------------------------------

/**
 * Purchases a market card on behalf of a player.
 *
 * @param state      Current game state.
 * @param playerId   ID of the purchasing player.
 * @param cardId     ID of the card being purchased.
 * @param isReserve  True → card must be a reserve card and is not removed
 *                   from `market.visibleCards`. False → card must be present
 *                   in `market.visibleCards` and is removed before refilling.
 *
 * Throws if:
 *  - the player is not found
 *  - the card is not in CARD_REGISTRY
 *  - the card is not a member of the expected pool (reserve vs market)
 *  - the card is not in visibleCards when isReserve is false
 *  - the player's currentPurchasingPower is less than the card's cost
 *
 * Returns a new GameState; never mutates the input.
 */
export function buyCard(
  state: GameState,
  playerId: string,
  cardId: string,
  isReserve: boolean
): GameState {
  // --- Look up the player ---
  const player = state.players[playerId];
  if (!player) {
    throw new Error(`BUY_CARD: player "${playerId}" not found.`);
  }

  // --- Look up the card definition ---
  const cardDef = CARD_REGISTRY[cardId];
  if (!cardDef) {
    throw new Error(`BUY_CARD: card "${cardId}" not found in CARD_REGISTRY.`);
  }

  // --- Validate card belongs to the expected pool ---
  const pool = isReserve ? RESERVE_CARD_IDS : MARKET_CARD_IDS;
  if (!pool.includes(cardId)) {
    throw new Error(
      `BUY_CARD: card "${cardId}" is not in the ${isReserve ? 'reserve' : 'market'} pool.`
    );
  }

  // --- Validate card is visible when buying from the market ---
  if (!isReserve && !state.market.visibleCards.includes(cardId)) {
    throw new Error(
      `BUY_CARD: card "${cardId}" is not in the current market row.`
    );
  }

  // --- Check purchasing power ---
  if (player.currentPurchasingPower < cardDef.cost) {
    throw new Error(
      `BUY_CARD: player "${playerId}" has ${player.currentPurchasingPower} purchasing power ` +
      `but "${cardDef.title}" costs ${cardDef.cost}.`
    );
  }

  // --- Build updated state ---
  let next: GameState = {
    ...state,
    players: {
      ...state.players,
      [playerId]: {
        ...player,
        currentPurchasingPower: player.currentPurchasingPower - cardDef.cost,
        deck: {
          ...player.deck,
          discardPile: [...player.deck.discardPile, cardId],
        },
      },
    },
    market: isReserve
      ? state.market
      : {
          ...state.market,
          visibleCards: state.market.visibleCards.filter((id) => id !== cardId),
        },
    history: [
      ...state.history,
      `[Round ${state.round}] Player "${playerId}" purchased "${cardDef.title}" ` +
      `(cost: ${cardDef.cost}) from the ${isReserve ? 'reserve' : 'market'}.`,
    ],
  };

  // --- Refill the market row (no-op for reserve purchases) ---
  if (!isReserve) {
    next = refillMarket(next);
  }

  return next;
}
