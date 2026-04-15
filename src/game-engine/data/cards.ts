import { LocationIconType } from '../types/primitives';

export interface CardDefinition {
  id: string;
  title: string;
  /** All location icon types this card can satisfy when placing an agent. */
  agentIcons: LocationIconType[];
  /** Purchasing power contributed during the buy phase. */
  purchasingPower: number;
  /** Cost to buy from the market. 0 for non-purchasable (starter) cards. */
  cost: number;
  /** Troops instantly gained when played or revealed. */
  troopsMustered: number;
}

export const CARD_REGISTRY: Record<string, CardDefinition> = {
  // ---------------------------------------------------------------------------
  // Starter deck — 10 cards dealt to the human player at game start.
  // Duplicate titles use suffixed IDs so each physical card is addressable.
  // ---------------------------------------------------------------------------

  'starter-elven-scout-1': {
    id: 'starter-elven-scout-1',
    title: 'Elven Scout',
    agentIcons: ['Wilderness', 'Lore'],
    purchasingPower: 0,
    cost: 0,
    troopsMustered: 0,
  },
  'starter-elven-scout-2': {
    id: 'starter-elven-scout-2',
    title: 'Elven Scout',
    agentIcons: ['Wilderness', 'Lore'],
    purchasingPower: 0,
    cost: 0,
    troopsMustered: 0,
  },
  'starter-envoy-1': {
    id: 'starter-envoy-1',
    title: 'Envoy',
    agentIcons: ['Noble', 'Trade'],
    purchasingPower: 0,
    cost: 0,
    troopsMustered: 0,
  },
  'starter-envoy-2': {
    id: 'starter-envoy-2',
    title: 'Envoy',
    agentIcons: ['Noble', 'Trade'],
    purchasingPower: 0,
    cost: 0,
    troopsMustered: 0,
  },
  'starter-sindarin-militia-1': {
    id: 'starter-sindarin-militia-1',
    title: 'Sindarin Militia',
    agentIcons: ['Military'],
    purchasingPower: 1,
    cost: 0,
    troopsMustered: 0,
  },
  'starter-sindarin-militia-2': {
    id: 'starter-sindarin-militia-2',
    title: 'Sindarin Militia',
    agentIcons: ['Military'],
    purchasingPower: 1,
    cost: 0,
    troopsMustered: 0,
  },
  'starter-sindarin-militia-3': {
    id: 'starter-sindarin-militia-3',
    title: 'Sindarin Militia',
    agentIcons: ['Military'],
    purchasingPower: 1,
    cost: 0,
    troopsMustered: 0,
  },
  'starter-sindarin-militia-4': {
    id: 'starter-sindarin-militia-4',
    title: 'Sindarin Militia',
    agentIcons: ['Military'],
    purchasingPower: 1,
    cost: 0,
    troopsMustered: 0,
  },
  'starter-call-to-arms': {
    id: 'starter-call-to-arms',
    title: 'Call to Arms',
    agentIcons: ['Noble', 'Trade', 'Wilderness'],
    purchasingPower: 0,
    cost: 0,
    troopsMustered: 0,
  },
  'starter-hidden-paths': {
    id: 'starter-hidden-paths',
    title: 'Hidden Paths',
    agentIcons: ['Lore'],
    purchasingPower: 1,
    cost: 0,
    troopsMustered: 0,
  },

  // ---------------------------------------------------------------------------
  // Market deck — purchasable cards.
  // ---------------------------------------------------------------------------

  'feanorian-vanguard': {
    id: 'feanorian-vanguard',
    title: 'Fëanorian Vanguard',
    agentIcons: ['Military'],
    purchasingPower: 0,
    cost: 3,
    troopsMustered: 2,
  },
  'song-of-power': {
    id: 'song-of-power',
    title: 'Song of Power',
    agentIcons: ['Lore', 'Noble'],
    purchasingPower: 2,
    cost: 4,
    troopsMustered: 0,
  },
  'dwarven-smiths': {
    id: 'dwarven-smiths',
    title: 'Dwarven Smiths',
    agentIcons: ['Trade'],
    purchasingPower: 2,
    cost: 2,
    troopsMustered: 0,
  },
  'eagle-scout': {
    id: 'eagle-scout',
    title: 'Eagle Scout',
    agentIcons: ['Wilderness', 'Military'],
    purchasingPower: 1,
    cost: 5,
    troopsMustered: 1,
  },
  'helm-of-hador': {
    id: 'helm-of-hador',
    title: 'The Helm of Hador',
    agentIcons: ['Noble'],
    purchasingPower: 3,
    cost: 6,
    troopsMustered: 1,
  },

  // ---------------------------------------------------------------------------
  // Reserve cards — always available for purchase, never removed from offer.
  // ---------------------------------------------------------------------------

  'wandering-minstrel': {
    id: 'wandering-minstrel',
    title: 'Wandering Minstrel',
    agentIcons: ['Lore'],
    purchasingPower: 1,
    cost: 2,
    troopsMustered: 0,
  },
  'sindarin-archer': {
    id: 'sindarin-archer',
    title: 'Sindarin Archer',
    agentIcons: ['Military'],
    purchasingPower: 0,
    cost: 3,
    troopsMustered: 1,
  },
};
