# types — Type Definitions Reference

All types are exported from `index.ts` (barrel). Import from `'../types'` or `'./types'`, never from individual files.

---

## Primitives (`primitives.ts`)

| Type | Values |
|---|---|
| `ResourceId` | `'valor'` · `'lore'` · `'supplies'` |
| `FactionId` | `'noldor'` · `'sindar'` · `'edain'` · `'morgoth'` |
| `InfluenceTrackId` | `'fingolfin'` · `'feanor'` · `'sindar'` · `'edain'` |
| `Phase` | `'planning'` · `'action'` · `'conflict'` · `'cleanup'` |
| `LocationIconType` | `'Noble'` · `'Military'` · `'Lore'` · `'Trade'` · `'Wilderness'` |

`LocationIconType` is shared between `data/locations.ts` (location `requiredIcon`) and `data/cards.ts` (card `agentIcons`). Always import from primitives, never redefine locally.

---

## Player (`player.ts`)

### `DeckState`
```
drawPile    string[]   Cards not yet drawn
hand        string[]   Cards currently in hand (card IDs)
discardPile string[]   Played/discarded cards
inPlay      string[]   Cards committed this round (agent placements)
```
All fields are arrays of card ID strings. Card objects live in `data/`.

### `PlayerState`
```
id                      string
isAutomata              boolean              true for Morgoth
faction                 FactionId
resources               Record<ResourceId, number>
influence               Record<InfluenceTrackId, number>
victoryPoints           number
agentsAvailable         number               decremented on PLAY_AGENT
agentsTotal             number               constant; used for cleanup reset
garrison                number               troops held in reserve
deployedTroops          number               troops committed to conflict; reset to 0 after resolution
currentPurchasingPower  number               spending power available this turn; consumed by BUY_CARD
deck                    DeckState
```

Morgoth's `deck` is always empty (`{ drawPile:[], hand:[], discardPile:[], inPlay:[] }`). His card draw is managed via `AutomataState` in `GameState`.

---

## Board (`board.ts`)

### `LocationState`
```
id                    string
occupantId            string | null              null = unoccupied
accumulatedResources  Partial<Record<ResourceId, number>>?
```

### `ConflictState`
```
conflictCardId    string                       ID matching a ConflictCard in data/conflictDeck.ts
rewards           string[]                     Legacy field; typed rewards live on ConflictCard
playerStrengths   Record<string, number>       Snapshot of deployedTroops at conflict start
isResolved        boolean
```

### `MarketState`
```
visibleCards      string[]                     Card IDs currently face-up and buyable. Refilled to 5 after each purchase.
deck              string[]                     Remaining card IDs in the market draw pile.
```

`buyCard()` removes the purchased ID from `visibleCards` (for market purchases — reserve buys don't touch it), then `refillMarket()` pulls from `deck` until `visibleCards.length === 5` or the deck is exhausted.

---

## Automata (`automata.ts`)

### `AutomataCard`
```
id                  string
title               string
locationPriorities  string[]     Ordered location IDs Morgoth will try to occupy
troopsMustered      number       Added to deployedTroops on every turn, regardless of placement
specialEffect       string?      Unimplemented; reserved for future card logic
```

### `AutomataState`
```
deck            AutomataCard[]
discard         AutomataCard[]
revealedCard    AutomataCard | null    Last drawn card; null before first draw
garrison        number                 Mirrors Morgoth's PlayerState.garrison at init
deployedTroops  number                 Mirrors Morgoth's PlayerState.deployedTroops at init
```

`AutomataState.garrison` and `deployedTroops` are initialised to match Morgoth's `PlayerState` values. `PlayerState` is the combat-authoritative source; `AutomataState` tracks the card-draw machinery.

---

## Root State (`index.ts`)

### `GameState`
```
round             number
phase             Phase
activePlayerId    string
players           Record<string, PlayerState>
locations         Record<string, LocationState>
automata          AutomataState
conflict          ConflictState | null            null = no active conflict
conflictDeck      ConflictCard[]                  Remaining conflict cards for future rounds
market            MarketState                     Buy-phase card offer + draw pile
history           string[]                        Append-only event log
```

`conflict` is populated at game init: `buildInitialState()` pops the top card from `conflictDeck` and sets a `ConflictState` with `isResolved: false`. After `RESOLVE_CONFLICT` is dispatched, `resolveConflictPhase()` marks it `isResolved: true` and resets `deployedTroops`. Advancing to the next conflict (popping another card) is not yet automated — that's part of the unimplemented cleanup phase.

`conflictDeck` is built once at init via `buildConflictDeck()` (tier-sorted, tier-shuffled). The first card is popped immediately to seed `conflict`; the rest remain for future rounds.
