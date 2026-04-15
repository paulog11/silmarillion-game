import { LocationIconType } from '../types/primitives';

export interface CardDefinition {
  id: string;
  name: string;
  icon: LocationIconType;
}

/**
 * Registry of all playable human cards.
 * The engine looks up a card's icon here during PLAY_AGENT validation to
 * ensure it matches the target location's requiredIcon.
 *
 * Add a new entry for every card added to the game.
 */
export const CARD_REGISTRY: Record<string, CardDefinition> = {
  // --- Noble ---
  'card-house-of-fingolfin': {
    id: 'card-house-of-fingolfin',
    name: 'House of Fingolfin',
    icon: 'Noble',
  },
  'card-thingol-decree': {
    id: 'card-thingol-decree',
    name: "Thingol's Decree",
    icon: 'Noble',
  },

  // --- Military ---
  'card-noldor-vanguard': {
    id: 'card-noldor-vanguard',
    name: 'Noldor Vanguard',
    icon: 'Military',
  },
  'card-edain-warrior': {
    id: 'card-edain-warrior',
    name: 'Edain Warrior',
    icon: 'Military',
  },

  // --- Lore ---
  'card-lore-of-aman': {
    id: 'card-lore-of-aman',
    name: 'Lore of Aman',
    icon: 'Lore',
  },
  'card-melian-counsel': {
    id: 'card-melian-counsel',
    name: "Melian's Counsel",
    icon: 'Lore',
  },

  // --- Trade ---
  'card-cirdan-fleet': {
    id: 'card-cirdan-fleet',
    name: "Círdan's Fleet",
    icon: 'Trade',
  },
  'card-dwarven-goods': {
    id: 'card-dwarven-goods',
    name: 'Dwarven Goods',
    icon: 'Trade',
  },

  // --- Wilderness ---
  'card-green-elves': {
    id: 'card-green-elves',
    name: 'Green Elves of Ossiriand',
    icon: 'Wilderness',
  },
  'card-beorn-scout': {
    id: 'card-beorn-scout',
    name: 'Scout of the Wilds',
    icon: 'Wilderness',
  },

  // Placeholder used in tests / dev before real cards are assigned
  'card-placeholder': {
    id: 'card-placeholder',
    name: 'Placeholder Card',
    icon: 'Military',
  },
};
