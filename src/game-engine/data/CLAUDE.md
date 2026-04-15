# data — Static Registries & Card Definitions

All files in this directory are pure data — no functions that mutate state, no imports from `logic/`. Import these into `logic/` or `engine.ts` as read-only lookup tables.

---

## `locations.ts`

### `LocationDefinition`
```
id                  string
name                string                          Display name
requiredIcon        LocationIconType                Card icon needed to place here
cost                { resource: ResourceId, amount: number } | null
isNeighborToMorgoth boolean                         Used for future combat bonus logic
```

### `LOCATION_REGISTRY: Record<string, LocationDefinition>`

| id | Name | Icon | Cost | Neighbor to Morgoth |
|---|---|---|---|---|
| `barad_eithel` | Barad Eithel | Military | 1 supplies | yes |
| `gondolin` | Gondolin | Noble | 2 lore | no |
| `himring` | Himring | Military | 1 supplies | yes |
| `the_havens` | The Havens | Trade | — | no |
| `angband_gates` | Gates of Angband | Military | 2 valor | yes |
| `dorthonion` | Dorthonion | Wilderness | 1 supplies | yes |
| `nargothrond` | Nargothrond | Lore | 1 lore | no |
| `doriath` | Doriath | Noble | — | no |
| `west_beleriand` | West Beleriand | Wilderness | — | no |

The engine's `PLAY_AGENT` handler looks up `LOCATION_REGISTRY[locationId]` to validate the card icon and deduct the cost before placement.

---

## `cards.ts`

`CARD_REGISTRY` is the **single source of truth** for every card in the game — starter, market, and reserve. No separate per-pool registries. Each pool file (`starterDeck.ts`, `marketDeck.ts`) just exports an array of ID strings into this one registry.

### `CardDefinition`
```
id               string
title            string
agentIcons       LocationIconType[]    All icon types this card satisfies
purchasingPower  number                Contribution to buy-phase spending power
cost             number                Price to buy from market. 0 for starter cards.
troopsMustered   number                Troops gained when played / revealed. 0 if none.
```

The engine's `PLAY_AGENT` handler checks `cardDef.agentIcons.includes(locationDef.requiredIcon)` — multi-icon cards satisfy any of their listed icon types.

### `CARD_REGISTRY: Record<string, CardDefinition>` — 17 cards

- **10 starter cards** (ids prefixed `starter-*`) — the human's starting deck. `cost: 0`.
- **5 market cards** (Fëanorian Vanguard, Song of Power, Dwarven Smiths, Eagle Scout, The Helm of Hador) — purchasable.
- **2 reserve cards** (Wandering Minstrel, Sindarin Archer) — always available to buy.

Add an entry here for every new card introduced, then add its ID to the appropriate pool file.

---

## `starterDeck.ts`

### `STARTER_DECK_IDS: string[]` — 10 cards

Hardcoded ordered list of IDs used by `useGameStore.initGame()` to seed the human player's `DeckState`. Card details come from `CARD_REGISTRY`. Duplicate titles use suffixed IDs (e.g. `starter-sindarin-militia-1` through `-4`) so each physical card is individually addressable.

| Title | Copies | Icons | Power |
|---|---|---|---|
| Elven Scout | 2 | Wilderness, Lore | 0 |
| Envoy | 2 | Noble, Trade | 0 |
| Sindarin Militia | 4 | Military | 1 |
| Call to Arms | 1 | Noble, Trade, Wilderness | 0 |
| Hidden Paths | 1 | Lore | 1 |

---

## `marketDeck.ts`

### `MARKET_CARD_IDS: string[]` — 5 cards

Shuffled at game start; first 5 drawn into `market.visibleCards`, remainder becomes `market.deck`. Refilled via `refillMarket()` after each purchase.

### `RESERVE_CARD_IDS: string[]` — 2 cards

Always-available fallback pool. Never removed from offer; not affected by market refill. Pass `isReserve: true` to `buyCard()` to purchase from this pool.

---

## `conflictDeck.ts`

### Types

**`Reward`** (discriminated union):
```
{ type: 'victoryPoints'; amount: number }
{ type: 'resource'; resourceId: ResourceId; amount: number }
```

**`MorgothPenalty`** (discriminated union):
```
{ type: 'lose_vp'; amount: number }
{ type: 'lose_resource'; resourceId: ResourceId; amount: number }
{ type: 'morgoth_garrison'; amount: number }       // adds garrison to Morgoth's PlayerState
```

**`ConflictCard`**:
```
id              string
title           string
tier            1 | 2 | 3
rewards         { firstPlace: Reward[]; secondPlace: Reward[] }
morgothPenalty  MorgothPenalty[]    Applied to human when Morgoth wins 1st place
```

Both `firstPlace`/`secondPlace` and `morgothPenalty` are arrays to support compound payouts (e.g. "Dagor-nuin-Giliath" 2nd place pays 1 Supply + 1 Valor; "Nirnaeth Arnoediad" penalises 2 VP + 2 Valor).

### `CONFLICT_DECK: ConflictCard[]` — 6 cards

| Title | Tier | 1st | 2nd | Morgoth Penalty |
|---|---|---|---|---|
| The First Battle | 1 | 1 VP | 2 Valor | −1 Lore |
| Dagor-nuin-Giliath | 1 | 1 VP | 1 Supply + 1 Valor | −1 Supply |
| Dagor Aglareb | 2 | 2 VP | 1 VP | −1 VP |
| The Siege of Angband | 2 | 2 VP | 3 Valor | +2 Morgoth garrison |
| Dagor Bragollach | 3 | 2 VP + 1 Lore | 1 VP | −2 VP |
| Nirnaeth Arnoediad | 3 | 3 VP | 1 VP | −2 VP, −2 Valor |

### `buildConflictDeck(): ConflictCard[]`

Filters by tier, shuffles each tier independently (Fisher-Yates), then stacks them: Tier 1 on top → Tier 2 → Tier 3 on bottom. Escalates tension as the game progresses. Does not mutate `CONFLICT_DECK`.
