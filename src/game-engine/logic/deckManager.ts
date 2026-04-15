import { DeckState } from '../types';

// ---------------------------------------------------------------------------
// shuffle
// ---------------------------------------------------------------------------

/**
 * Returns a new array with the same elements in a random order.
 * Uses the Fisher-Yates (Knuth) algorithm — O(n), unbiased.
 * Does not mutate the input array.
 */
export function shuffle(cards: string[]): string[] {
  const result = [...cards];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ---------------------------------------------------------------------------
// drawCards
// ---------------------------------------------------------------------------

/**
 * Draws `count` cards from the drawPile into the hand.
 *
 * If the drawPile has fewer cards than requested, the discardPile is shuffled
 * and appended to the drawPile before drawing. If the combined pool still has
 * fewer cards than `count`, all available cards are drawn (no error — the
 * caller can check hand length if an exact draw count matters).
 *
 * Returns a new DeckState; does not mutate the input.
 */
export function drawCards(deckState: DeckState, count: number): DeckState {
  let drawPile = deckState.drawPile;
  let discardPile = deckState.discardPile;

  // Reshuffle discard into draw if we don't have enough cards
  if (drawPile.length < count && discardPile.length > 0) {
    drawPile = [...drawPile, ...shuffle(discardPile)];
    discardPile = [];
  }

  const actualDraw = Math.min(count, drawPile.length);
  const drawn = drawPile.slice(0, actualDraw);
  const remaining = drawPile.slice(actualDraw);

  return {
    ...deckState,
    drawPile: remaining,
    hand: [...deckState.hand, ...drawn],
    discardPile,
  };
}
