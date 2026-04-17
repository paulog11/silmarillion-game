import { LocationIconType, ResourceId } from '../types/primitives';

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
  /** Cards drawn from the draw pile when this card is played. Not yet wired into the engine. */
  cardDraw?: number;
  /** Resources gained when this card is played. Not yet wired into the engine. */
  resourceGain?: Partial<Record<ResourceId, number>>;
  /** Victory points gained when this card is purchased (scored at end of game). Not yet wired into the engine. */
  vpGain?: number;
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

  // --- Cost 1 ---

  // Multi-icon generalist; good for placing an agent when resources are tight.
  // Analog: Soo-Soo Sook! (Dune Imperium)
  'wandering-dunadan': {
    id: 'wandering-dunadan',
    title: 'Wandering Dúnadan',
    agentIcons: ['Noble', 'Trade', 'Wilderness'],
    purchasingPower: 0,
    cost: 1,
    troopsMustered: 0,
  },

  // --- Cost 2 ---

  // Cheap troop filler. Analog: Desert Warrior (Dune Imperium)
  'edain-spearman': {
    id: 'edain-spearman',
    title: 'Edain Spearman',
    agentIcons: ['Military'],
    purchasingPower: 0,
    cost: 2,
    troopsMustered: 1,
  },
  // Scouting + draw. Analog: Arrakeen Scouts (Dune Imperium)
  'rangers-of-beleg': {
    id: 'rangers-of-beleg',
    title: 'Rangers of Beleg',
    agentIcons: ['Wilderness', 'Military'],
    purchasingPower: 0,
    cost: 2,
    troopsMustered: 0,
    cardDraw: 1,
  },
  // Economy with supply gain. Analog: Cargo Hold (Dune Imperium)
  'supply-cache': {
    id: 'supply-cache',
    title: 'Supply Cache',
    agentIcons: ['Trade'],
    purchasingPower: 1,
    cost: 2,
    troopsMustered: 0,
    resourceGain: { supplies: 1 },
  },

  // --- Cost 3 ---

  // Existing card (kept)
  'feanorian-vanguard': {
    id: 'feanorian-vanguard',
    title: 'Fëanorian Vanguard',
    agentIcons: ['Military'],
    purchasingPower: 0,
    cost: 3,
    troopsMustered: 2,
  },
  // Pure troop pump, no pp. Analog: Weirding Way (Dune Imperium)
  'noldorin-battle-art': {
    id: 'noldorin-battle-art',
    title: 'Noldorin Battle-Art',
    agentIcons: ['Military'],
    purchasingPower: 0,
    cost: 3,
    troopsMustered: 2,
  },
  // Flexible scouting with valor bonus. Analog: Smugglers (Dune Imperium)
  'paths-of-the-girdle': {
    id: 'paths-of-the-girdle',
    title: 'Paths of the Girdle',
    agentIcons: ['Wilderness', 'Trade'],
    purchasingPower: 1,
    cost: 3,
    troopsMustered: 0,
    resourceGain: { valor: 1 },
  },
  // Draw + minor economy. Analog: Bene Gesserit Sister (Dune Imperium)
  'minstrel-of-doriath': {
    id: 'minstrel-of-doriath',
    title: 'Minstrel of Doriath',
    agentIcons: ['Lore', 'Noble'],
    purchasingPower: 1,
    cost: 3,
    troopsMustered: 0,
    cardDraw: 1,
  },
  // Trade node with supply gain. Analog: Guild Ambassador (Dune Imperium)
  'dwarven-trade-envoy': {
    id: 'dwarven-trade-envoy',
    title: 'Dwarven Trade Envoy',
    agentIcons: ['Trade', 'Noble'],
    purchasingPower: 1,
    cost: 3,
    troopsMustered: 0,
    resourceGain: { supplies: 1 },
  },
  // Combat blade with valor. Analog: Crysknife (Dune Imperium)
  'blade-of-angrist': {
    id: 'blade-of-angrist',
    title: 'Blade of Angrist',
    agentIcons: ['Military', 'Wilderness'],
    purchasingPower: 0,
    cost: 3,
    troopsMustered: 1,
    resourceGain: { valor: 1 },
  },

  // --- Cost 4 ---

  // Existing card (kept)
  'song-of-power': {
    id: 'song-of-power',
    title: 'Song of Power',
    agentIcons: ['Lore', 'Noble'],
    purchasingPower: 2,
    cost: 4,
    troopsMustered: 0,
  },
  // The card-draw engine card. Analog: Mentat (Dune Imperium)
  'rumil-the-scribe': {
    id: 'rumil-the-scribe',
    title: 'Rúmil the Scribe',
    agentIcons: ['Lore'],
    purchasingPower: 1,
    cost: 4,
    troopsMustered: 0,
    cardDraw: 2,
  },
  // Noble + Military flexiblity, troop + economy. Analog: Signet Ring (Dune Imperium)
  'ring-of-barahir': {
    id: 'ring-of-barahir',
    title: 'Ring of Barahir',
    agentIcons: ['Noble', 'Military'],
    purchasingPower: 1,
    cost: 4,
    troopsMustered: 1,
  },
  // Pure economy powerhouse. Analog: Choam Directorship (Dune Imperium)
  'guild-of-naugrim': {
    id: 'guild-of-naugrim',
    title: 'Guild of Naugrim',
    agentIcons: ['Trade'],
    purchasingPower: 3,
    cost: 4,
    troopsMustered: 0,
  },
  // All three military-adjacent icons; supply bonus. Analog: Diplomat (Dune Imperium)
  'ambassador-of-free-peoples': {
    id: 'ambassador-of-free-peoples',
    title: 'Ambassador of the Free Peoples',
    agentIcons: ['Noble', 'Trade', 'Military'],
    purchasingPower: 0,
    cost: 4,
    troopsMustered: 0,
    resourceGain: { supplies: 1 },
  },

  // --- Cost 5 ---

  // Existing card (kept)
  'eagle-scout': {
    id: 'eagle-scout',
    title: 'Eagle Scout',
    agentIcons: ['Wilderness', 'Military'],
    purchasingPower: 1,
    cost: 5,
    troopsMustered: 1,
  },
  // Lore + Noble economy with card draw. Analog: Truthsayer (Dune Imperium)
  'voice-of-melian': {
    id: 'voice-of-melian',
    title: 'Voice of Melian',
    agentIcons: ['Lore', 'Noble'],
    purchasingPower: 2,
    cost: 5,
    troopsMustered: 0,
    cardDraw: 1,
  },
  // Double card draw + lore gain. Analog: Peripheral Vision (Dune Imperium)
  'far-sight-of-the-eldar': {
    id: 'far-sight-of-the-eldar',
    title: 'Far-Sight of the Eldar',
    agentIcons: ['Lore', 'Wilderness'],
    purchasingPower: 0,
    cost: 5,
    troopsMustered: 0,
    cardDraw: 2,
    resourceGain: { lore: 1 },
  },
  // Strong pure military card. Analog: Sardaukar Legion (Dune Imperium)
  'host-of-fingolfin': {
    id: 'host-of-fingolfin',
    title: 'Host of Fingolfin',
    agentIcons: ['Military'],
    purchasingPower: 0,
    cost: 5,
    troopsMustered: 3,
  },
  // Wide icon access + double supply. Analog: Interstellar Shipping (Dune Imperium)
  'blessing-of-ulmo': {
    id: 'blessing-of-ulmo',
    title: "Blessing of Ulmo",
    agentIcons: ['Trade', 'Wilderness', 'Noble'],
    purchasingPower: 1,
    cost: 5,
    troopsMustered: 0,
    resourceGain: { supplies: 2 },
  },

  // --- Cost 6 ---

  // Existing card (kept)
  'helm-of-hador': {
    id: 'helm-of-hador',
    title: 'The Helm of Hador',
    agentIcons: ['Noble'],
    purchasingPower: 3,
    cost: 6,
    troopsMustered: 1,
  },
  // Military + draw: the "swordmaster" archetype. Analog: Swordmaster of Ginaz (Dune Imperium)
  'champion-of-the-edain': {
    id: 'champion-of-the-edain',
    title: 'Champion of the Edain',
    agentIcons: ['Military', 'Noble'],
    purchasingPower: 1,
    cost: 6,
    troopsMustered: 2,
    cardDraw: 1,
  },
  // VP engine card. Analog: Council Seat (Dune Imperium)
  'seat-in-the-high-council': {
    id: 'seat-in-the-high-council',
    title: "Seat in the High Council",
    agentIcons: ['Noble', 'Lore'],
    purchasingPower: 2,
    cost: 6,
    troopsMustered: 0,
    vpGain: 1,
  },
  // Double resource harvest. Analog: Harvest Spice / Spice Smelter (Dune Imperium)
  'fields-of-ard-galen': {
    id: 'fields-of-ard-galen',
    title: 'Fields of Ard-galen',
    agentIcons: ['Wilderness', 'Trade'],
    purchasingPower: 0,
    cost: 6,
    troopsMustered: 0,
    resourceGain: { valor: 2, supplies: 2 },
  },

  // --- Cost 7 ---

  // Elite combat hero with valor. Analog: Swordmaster premium tier (Dune Imperium)
  'dragon-helm-of-dorlomin': {
    id: 'dragon-helm-of-dorlomin',
    title: 'Dragon-helm of Dor-lómin',
    agentIcons: ['Military', 'Noble'],
    purchasingPower: 0,
    cost: 7,
    troopsMustered: 3,
    resourceGain: { valor: 2 },
  },

  // --- Cost 9 ---

  // The ultimate prize: huge VP payoff, worth buying even at high cost.
  // Analog: The Spice Must Flow (Dune Imperium)
  'the-silmarils': {
    id: 'the-silmarils',
    title: 'The Silmarils',
    agentIcons: ['Lore', 'Noble'],
    purchasingPower: 0,
    cost: 9,
    troopsMustered: 0,
    vpGain: 3,
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
