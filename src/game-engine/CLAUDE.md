# game-engine — Overview

Headless, framework-agnostic TypeScript engine. No Vue imports anywhere in this directory. All state flows through `GameEngine.dispatch()` → pure `reduce()` → `onStateChange` callback.

## Directory map

```
game-engine/
├── engine.ts          # GameEngine class + GameAction union
├── automataLogic.ts   # executeAutomataTurn() — pure Morgoth bot function
├── types/             # All TypeScript interfaces and primitives
├── data/              # Static card/location definitions (registries)
└── logic/             # Pure state-transformation functions
```

See the CLAUDE.md in each subdirectory for details.

---

## GameEngine (`engine.ts`)

Single public method: `dispatch(action: GameAction): void`.

Internally calls a pure `reduce(state, action): GameState` switch. An exhaustiveness guard on the `default` branch (`const _exhaustive: never = action`) causes a **compile error** if a new `GameAction` variant is added without a matching `case` — this is intentional.

After reduction the engine deep-clones state (`JSON.parse/JSON.stringify`) before passing it to `onStateChange`, so the caller cannot hold a reference that mutates internal state.

## GameAction union (current variants)

| Action | Payload | Description |
|---|---|---|
| `PLAY_AGENT` | `playerId, locationId, cardId` | Place an agent; validates `agentIcons.includes(requiredIcon)`, cost, hand, and occupancy; immediately applies the location reward via `applyLocationReward()` |
| `PASS_TURN` | `playerId` | Log a pass; no state change beyond history |
| `RESOLVE_CONFLICT` | _(none)_ | Delegate to `resolveConflictPhase()` |
| `DEPLOY_TROOPS` | `playerId, amount` | Move `amount` troops from `garrison → deployedTroops`. Validates: player exists, `amount > 0`, `garrison >= amount`, active unresolved conflict exists. |
| `REVEAL_CARDS_FOR_PURCHASE` | `playerId` | Sums `purchasingPower` across all cards in the player's hand and sets `currentPurchasingPower`. Must be dispatched before `BUY_CARD`. |
| `BUY_CARD` | `playerId, cardId, isReserve` | Delegate to `buyCard()` — purchase a market or reserve card; deducts `currentPurchasingPower`, adds card to discardPile, refills market row |

### Adding a new action

1. Add a new variant to the `GameAction` union in `engine.ts`.
2. Add a matching `case` in `reduce` — the `never` guard will error until you do.
3. Implement the handler as a private method returning a new `GameState`.

---

## Morgoth Automata (`automataLogic.ts`)

`executeAutomataTurn(state: GameState): GameState` — pure function, no engine involvement.

Turn sequence:
1. Reshuffle `automata.discard` → `automata.deck` if deck is empty.
2. Draw top card → `automata.revealedCard`.
3. Walk `card.locationPriorities`; pick first location with `occupantId === null`.
4. **Placement found:** set `occupantId = morgoth.id`; add `troopsMustered` to `deployedTroops`.
5. **All blocked:** `garrison += 1`; still add `troopsMustered` to `deployedTroops`.
6. Move drawn card to `automata.discard`.
7. Set `activePlayerId` back to the human player.

Currently bypasses the engine — the Pinia store calls `setStateDirectly()` with the result. Long-term fix: add an `AUTOMATA_TURN` action to `GameAction` so all transitions go through the reducer.

---

## Turn Structure

Each round cycles through four phases:

| Phase | What happens |
|---|---|
| `planning` | Players assign agents to locations, play cards from hand |
| `action` | Location effects resolve via `applyLocationReward()` |
| `conflict` | `resolveConflictPhase()` ranks `deployedTroops`, pays rewards/penalties |
| `cleanup` | Agents recalled, hands refreshed, round counter incremented |

Phase advancement is not yet implemented — `GameState.phase` must be set manually.

---

## What Is Not Yet Implemented

| Feature | Where to hook in |
|---|---|
| Phase advancement | `engine.ts` — new `ADVANCE_PHASE` action |
| `AUTOMATA_TURN` action | `engine.ts` + `automataLogic.ts` |
| Card special effects | `data/cards.ts` `specialEffect` field; handler in `logic/` |
| Influence track unlock effects | `logic/` — new `influenceEffects.ts` |
| Victory condition check | `logic/` — new `victoryCheck.ts` |
| Cleanup phase logic | `logic/` — new `cleanupPhase.ts` |
| Move reward to action phase | `applyLocationReward()` is currently called at end of `PLAY_AGENT`; relocate the call when `ADVANCE_PHASE` is implemented |
