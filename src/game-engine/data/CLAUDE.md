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

### `CardDefinition`
```
id    string
name  string
icon  LocationIconType    Single icon — used by engine for PLAY_AGENT icon validation
```

> **Type divergence:** `CardDefinition` uses a single `icon`, while `StarterCard` in `starterDeck.ts` uses `agentIcons: LocationIconType[]` (multi-icon). When unifying, update `CardDefinition` to `agentIcons[]`, update `CARD_REGISTRY` entries, and change the engine icon check from `===` to `.includes()`.

### `CARD_REGISTRY: Record<string, CardDefinition>`

10 named cards covering all five icon types, plus `card-placeholder` (Military) for dev/test use. Add an entry here for every new card introduced.

---

## `starterDeck.ts`

### `StarterCard`
```
id               string
title            string
agentIcons       LocationIconType[]    All icon types this card satisfies
purchasingPower  number                Spending power in the buy phase
```

### `STARTER_DECK: StarterCard[]` — 10 cards

| Title | Copies | Icons | Power |
|---|---|---|---|
| Elven Scout | 2 | Wilderness, Lore | 0 |
| Envoy | 2 | Noble, Trade | 0 |
| Sindarin Militia | 4 | Military | 1 |
| Call to Arms | 1 | Noble, Trade, Wilderness | 0 |
| Hidden Paths | 1 | Lore | 1 |

### `STARTER_DECK_IDS: string[]`

Derived constant — just `STARTER_DECK.map(c => c.id)`. Use this to seed `DeckState.drawPile` at game init so you don't need to import the full card objects.

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
