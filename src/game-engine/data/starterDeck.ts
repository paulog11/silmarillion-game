import { LocationIconType } from '../types/primitives';

// ---------------------------------------------------------------------------
// StarterCard
//
// NOTE: This is a richer structure than CardDefinition in cards.ts.
// CardDefinition currently holds a single `icon`; StarterCard carries
// `agentIcons[]` because starter cards can satisfy multiple location types.
// When the card registry is expanded, CardDefinition should be aligned to
// this shape (agentIcons + purchasingPower) and the engine updated to check
// `agentIcons.includes(requiredIcon)` instead of a strict equality match.
// ---------------------------------------------------------------------------

export interface StarterCard {
  id: string;
  title: string;
  /** All location icon types this card can satisfy when placing an agent. */
  agentIcons: LocationIconType[];
  /** Purchasing power revealed during the buy phase to acquire better cards. */
  purchasingPower: number;
}

export const STARTER_DECK: StarterCard[] = [
  // 2× Elven Scout
  {
    id: 'starter-elven-scout-1',
    title: 'Elven Scout',
    agentIcons: ['Wilderness', 'Lore'],
    purchasingPower: 0,
  },
  {
    id: 'starter-elven-scout-2',
    title: 'Elven Scout',
    agentIcons: ['Wilderness', 'Lore'],
    purchasingPower: 0,
  },

  // 2× Envoy
  {
    id: 'starter-envoy-1',
    title: 'Envoy',
    agentIcons: ['Noble', 'Trade'],
    purchasingPower: 0,
  },
  {
    id: 'starter-envoy-2',
    title: 'Envoy',
    agentIcons: ['Noble', 'Trade'],
    purchasingPower: 0,
  },

  // 4× Sindarin Militia
  {
    id: 'starter-sindarin-militia-1',
    title: 'Sindarin Militia',
    agentIcons: ['Military'],
    purchasingPower: 1,
  },
  {
    id: 'starter-sindarin-militia-2',
    title: 'Sindarin Militia',
    agentIcons: ['Military'],
    purchasingPower: 1,
  },
  {
    id: 'starter-sindarin-militia-3',
    title: 'Sindarin Militia',
    agentIcons: ['Military'],
    purchasingPower: 1,
  },
  {
    id: 'starter-sindarin-militia-4',
    title: 'Sindarin Militia',
    agentIcons: ['Military'],
    purchasingPower: 1,
  },

  // 1× Call to Arms
  {
    id: 'starter-call-to-arms',
    title: 'Call to Arms',
    agentIcons: ['Noble', 'Trade', 'Wilderness'],
    purchasingPower: 0,
  },

  // 1× Hidden Paths
  {
    id: 'starter-hidden-paths',
    title: 'Hidden Paths',
    agentIcons: ['Lore'],
    purchasingPower: 1,
  },
];

/** Convenience: the ordered list of all starter card IDs, used to seed DeckState.drawPile. */
export const STARTER_DECK_IDS: string[] = STARTER_DECK.map((c) => c.id);
