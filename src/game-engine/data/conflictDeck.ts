import { ResourceId } from '../types/primitives';

// ---------------------------------------------------------------------------
// Reward — discriminated union for all possible payout types
// ---------------------------------------------------------------------------

export type Reward =
  | { type: 'victoryPoints'; amount: number }
  | { type: 'resource'; resourceId: ResourceId; amount: number };

// ---------------------------------------------------------------------------
// MorgothPenalty — discriminated union for all automata-win consequences
// ---------------------------------------------------------------------------

export type MorgothPenalty =
  | { type: 'lose_vp'; amount: number }
  | { type: 'lose_resource'; resourceId: ResourceId; amount: number }
  | { type: 'morgoth_garrison'; amount: number };

// ---------------------------------------------------------------------------
// ConflictCard
// ---------------------------------------------------------------------------

export interface ConflictCard {
  id: string;
  title: string;
  tier: 1 | 2 | 3;
  rewards: {
    /** Paid to whichever player (or Morgoth) achieves the highest strength. */
    firstPlace: Reward[];
    /** Paid to the player with the second-highest strength, if any. */
    secondPlace: Reward[];
  };
  /**
   * Applied to the human player when Morgoth takes first place.
   * Array to support compound penalties (e.g. lose VP AND a resource).
   */
  morgothPenalty: MorgothPenalty[];
}

// ---------------------------------------------------------------------------
// CONFLICT_DECK — canonical card definitions
// ---------------------------------------------------------------------------

export const CONFLICT_DECK: ConflictCard[] = [
  // --- Tier 1 ---
  {
    id: 'conflict-the-first-battle',
    title: 'The First Battle',
    tier: 1,
    rewards: {
      firstPlace: [{ type: 'victoryPoints', amount: 1 }],
      secondPlace: [{ type: 'resource', resourceId: 'valor', amount: 2 }],
    },
    morgothPenalty: [{ type: 'lose_resource', resourceId: 'lore', amount: 1 }],
  },
  {
    id: 'conflict-dagor-nuin-giliath',
    title: 'Dagor-nuin-Giliath',
    tier: 1,
    rewards: {
      firstPlace: [{ type: 'victoryPoints', amount: 1 }],
      secondPlace: [
        { type: 'resource', resourceId: 'supplies', amount: 1 },
        { type: 'resource', resourceId: 'valor', amount: 1 },
      ],
    },
    morgothPenalty: [{ type: 'lose_resource', resourceId: 'supplies', amount: 1 }],
  },

  // --- Tier 2 ---
  {
    id: 'conflict-dagor-aglareb',
    title: 'Dagor Aglareb',
    tier: 2,
    rewards: {
      firstPlace: [{ type: 'victoryPoints', amount: 2 }],
      secondPlace: [{ type: 'victoryPoints', amount: 1 }],
    },
    morgothPenalty: [{ type: 'lose_vp', amount: 1 }],
  },
  {
    id: 'conflict-siege-of-angband',
    title: 'The Siege of Angband',
    tier: 2,
    rewards: {
      firstPlace: [{ type: 'victoryPoints', amount: 2 }],
      secondPlace: [{ type: 'resource', resourceId: 'valor', amount: 3 }],
    },
    morgothPenalty: [{ type: 'morgoth_garrison', amount: 2 }],
  },

  // --- Tier 3 ---
  {
    id: 'conflict-dagor-bragollach',
    title: 'Dagor Bragollach',
    tier: 3,
    rewards: {
      firstPlace: [
        { type: 'victoryPoints', amount: 2 },
        { type: 'resource', resourceId: 'lore', amount: 1 },
      ],
      secondPlace: [{ type: 'victoryPoints', amount: 1 }],
    },
    morgothPenalty: [{ type: 'lose_vp', amount: 2 }],
  },
  {
    id: 'conflict-nirnaeth-arnoediad',
    title: 'Nirnaeth Arnoediad',
    tier: 3,
    rewards: {
      firstPlace: [{ type: 'victoryPoints', amount: 3 }],
      secondPlace: [{ type: 'victoryPoints', amount: 1 }],
    },
    morgothPenalty: [
      { type: 'lose_vp', amount: 2 },
      { type: 'lose_resource', resourceId: 'valor', amount: 2 },
    ],
  },
];

// ---------------------------------------------------------------------------
// buildConflictDeck
// ---------------------------------------------------------------------------

/** Fisher-Yates shuffle for ConflictCard arrays — local to avoid a typed
 *  mismatch with deckManager.shuffle which operates on string[]. */
function shuffleCards(cards: ConflictCard[]): ConflictCard[] {
  const result = [...cards];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Builds a ready-to-play conflict deck:
 * - Each tier is shuffled independently.
 * - Tiers are stacked so Tier 1 sits on top (drawn first), Tier 3 on the
 *   bottom (drawn last), escalating tension as the game progresses.
 *
 * Returns a new array; does not mutate CONFLICT_DECK.
 */
export function buildConflictDeck(): ConflictCard[] {
  const tier1 = shuffleCards(CONFLICT_DECK.filter((c) => c.tier === 1));
  const tier2 = shuffleCards(CONFLICT_DECK.filter((c) => c.tier === 2));
  const tier3 = shuffleCards(CONFLICT_DECK.filter((c) => c.tier === 3));
  return [...tier1, ...tier2, ...tier3];
}
