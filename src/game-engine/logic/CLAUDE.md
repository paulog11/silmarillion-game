# logic — Pure State-Transformation Functions

All functions in this directory are **pure**: they take state as input, return a new state object, and never mutate their arguments. No direct Vue or Pinia imports.

---

## `deckManager.ts`

### `shuffle(cards: string[]): string[]`

Fisher-Yates (Knuth) shuffle. O(n), unbiased. Returns a new array; does not touch the input.

### `drawCards(deckState: DeckState, count: number): DeckState`

Draws up to `count` cards from `drawPile` into `hand`.

- If `drawPile.length < count` and `discardPile` is non-empty: shuffle discard into draw first, clear discard.
- If the combined pool is still smaller than `count`: draws all available cards silently (no error). Caller checks `hand.length` if an exact count matters.
- Returns a new `DeckState`; never mutates input.

---

## `locationActions.ts`

### `applyLocationReward(state: GameState, playerId: string, locationId: string): GameState`

Called during the **action phase** after an agent has been placed. Switch over `locationId`:

| locationId | Condition | Effect |
|---|---|---|
| `barad_eithel` | — | +2 garrison, +1 valor |
| `gondolin` | player has ≥ 2 lore | −2 lore, draw 2 cards |
| `gondolin` | player has < 2 lore | no-op; history note appended |
| `himring` | — | +1 garrison, +1 `feanor` influence |
| `the_havens` | player has ≥ 1 valor | −1 valor, +3 supplies |
| `the_havens` | player has < 1 valor | no-op; history note appended |
| `angband_gates` | — | all garrison → deployedTroops, garrison = 0 |
| _(any other)_ | — | returns state unchanged |

Conditional rewards skip gracefully — they never throw. All other locations return the original state (no-op) to allow safe calls for any location without a defined reward.

---

## `marketActions.ts`

### `buyCard(state, playerId, cardId, isReserve): GameState`

Called by the engine `BUY_CARD` action. Pure — returns a new `GameState`.

**Validation order (throws on failure):**
1. Player exists.
2. Card ID resolves in `CARD_REGISTRY`.
3. Card belongs to the expected pool — `MARKET_CARD_IDS` when `isReserve === false`, `RESERVE_CARD_IDS` when `true`.
4. For market purchases only: card is present in `state.market.visibleCards`.
5. `player.currentPurchasingPower >= cardDef.cost`.

**On success:**
1. Deduct `cost` from `player.currentPurchasingPower`.
2. Push `cardId` into `player.deck.discardPile`.
3. For market purchases: remove `cardId` from `state.market.visibleCards`, then call `refillMarket()` to draw from `state.market.deck` until `visibleCards.length === 5` (or deck exhausted). Reserve buys never touch the market row.
4. Append a purchase entry to `state.history`.

`refillMarket()` is a private helper inside this file — no other caller needs it.

**Note:** Nothing currently populates `currentPurchasingPower`. A reveal/sum step must exist before `buyCard` is reachable through the engine. See "What Is Not Yet Implemented" in `game-engine/CLAUDE.md`.

---

## `conflictResolution.ts`

### `resolveConflictPhase(state: GameState): GameState`

Called by the engine `RESOLVE_CONFLICT` action. Throws if `state.conflict` is null.

**Resolution order:**

1. Look up the `ConflictCard` from `CONFLICT_DECK` by `state.conflict.conflictCardId`.
2. Rank all players by `deployedTroops` descending.
3. **Tie-break rule:** if the top two players share the same troop count, both receive the `secondPlace` reward and the `firstPlace` reward is discarded.
4. **Morgoth wins 1st:** apply each `morgothPenalty` entry:
   - `lose_vp` / `lose_resource` → deducted from human `PlayerState` (floored at 0).
   - `morgoth_garrison` → added to Morgoth's `PlayerState.garrison`.
   - Human still receives the `secondPlace` reward.
5. **Human wins 1st:** apply `firstPlace` rewards to human `PlayerState`. Morgoth's 2nd place is logged only (no tracked effect).
6. Append detailed history entries for placement, rewards, and troop loss.
7. Reset `deployedTroops` to 0 for **all** players — committed troops are always lost.
8. Set `conflict.isResolved = true`.

Returns a new `GameState`; never mutates input.
