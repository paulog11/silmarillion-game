/**
 * Card IDs that make up the purchasable market deck. Shuffled and drawn into
 * the market row during game setup. Each ID must exist in CARD_REGISTRY.
 *
 * Cards are grouped by cost tier for readability; order here has no effect
 * on gameplay (the deck is shuffled at game start).
 */
export const MARKET_CARD_IDS: string[] = [
  // Cost 1
  'wandering-dunadan',

  // Cost 2
  'edain-spearman',
  'rangers-of-beleg',
  'supply-cache',

  // Cost 3
  'feanorian-vanguard',
  'noldorin-battle-art',
  'paths-of-the-girdle',
  'minstrel-of-doriath',
  'dwarven-trade-envoy',
  'blade-of-angrist',

  // Cost 4
  'song-of-power',
  'rumil-the-scribe',
  'ring-of-barahir',
  'guild-of-naugrim',
  'ambassador-of-free-peoples',

  // Cost 5
  'eagle-scout',
  'voice-of-melian',
  'far-sight-of-the-eldar',
  'host-of-fingolfin',
  'blessing-of-ulmo',

  // Cost 6
  'helm-of-hador',
  'champion-of-the-edain',
  'seat-in-the-high-council',
  'fields-of-ard-galen',

  // Cost 7
  'dragon-helm-of-dorlomin',

  // Cost 9
  'the-silmarils',
];

/**
 * Reserve cards are always available for purchase and never removed from the
 * offer. Used as a permanent fallback pool alongside the rotating market row.
 */
export const RESERVE_CARD_IDS: string[] = [
  'wandering-minstrel',
  'sindarin-archer',
];
