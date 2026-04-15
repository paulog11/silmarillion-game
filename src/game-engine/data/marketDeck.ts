/**
 * Card IDs that make up the purchasable market deck. Shuffled and drawn into
 * the market row during game setup. Each ID must exist in CARD_REGISTRY.
 */
export const MARKET_CARD_IDS: string[] = [
  'feanorian-vanguard',
  'song-of-power',
  'dwarven-smiths',
  'eagle-scout',
  'helm-of-hador',
];

/**
 * Reserve cards are always available for purchase and never removed from the
 * offer. Used as a permanent fallback pool alongside the rotating market row.
 */
export const RESERVE_CARD_IDS: string[] = [
  'wandering-minstrel',
  'sindarin-archer',
];
