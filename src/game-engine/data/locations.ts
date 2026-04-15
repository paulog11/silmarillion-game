import { LocationIconType, ResourceId } from '../types/primitives';

export interface LocationDefinition {
  id: string;
  name: string;
  requiredIcon: LocationIconType;
  cost: { resource: ResourceId; amount: number } | null;
  isNeighborToMorgoth: boolean;
}

export const LOCATION_REGISTRY: Record<string, LocationDefinition> = {
  barad_eithel: {
    id: 'barad_eithel',
    name: 'Barad Eithel',
    requiredIcon: 'Military',
    cost: { resource: 'supplies', amount: 1 },
    isNeighborToMorgoth: true,
  },
  gondolin: {
    id: 'gondolin',
    name: 'Gondolin',
    requiredIcon: 'Noble',
    cost: { resource: 'lore', amount: 2 },
    isNeighborToMorgoth: false,
  },
  himring: {
    id: 'himring',
    name: 'Himring',
    requiredIcon: 'Military',
    cost: { resource: 'supplies', amount: 1 },
    isNeighborToMorgoth: true,
  },
  the_havens: {
    id: 'the_havens',
    name: 'The Havens',
    requiredIcon: 'Trade',
    cost: null,
    isNeighborToMorgoth: false,
  },
  angband_gates: {
    id: 'angband_gates',
    name: 'Gates of Angband',
    requiredIcon: 'Military',
    cost: { resource: 'valor', amount: 2 },
    isNeighborToMorgoth: true,
  },
  dorthonion: {
    id: 'dorthonion',
    name: 'Dorthonion',
    requiredIcon: 'Wilderness',
    cost: { resource: 'supplies', amount: 1 },
    isNeighborToMorgoth: true,
  },
  nargothrond: {
    id: 'nargothrond',
    name: 'Nargothrond',
    requiredIcon: 'Lore',
    cost: { resource: 'lore', amount: 1 },
    isNeighborToMorgoth: false,
  },
  doriath: {
    id: 'doriath',
    name: 'Doriath',
    requiredIcon: 'Noble',
    cost: null,
    isNeighborToMorgoth: false,
  },
  west_beleriand: {
    id: 'west_beleriand',
    name: 'West Beleriand',
    requiredIcon: 'Wilderness',
    cost: null,
    isNeighborToMorgoth: false,
  },
};
