/**
 * Ordered list of card IDs every human player starts with. Each ID must exist
 * in CARD_REGISTRY (cards.ts). Used by useGameStore.initGame() to seed the
 * human player's DeckState.
 */
export const STARTER_DECK_IDS: string[] = [
  'starter-elven-scout-1',
  'starter-elven-scout-2',
  'starter-envoy-1',
  'starter-envoy-2',
  'starter-sindarin-militia-1',
  'starter-sindarin-militia-2',
  'starter-sindarin-militia-3',
  'starter-sindarin-militia-4',
  'starter-call-to-arms',
  'starter-hidden-paths',
];
