# Silmarillion: War of the First Age

A single-player, deck-building worker-placement game set in Beleriand during the First Age of Middle-earth. You command the Free Peoples — Noldor, Sindar, or Edain — resisting Morgoth's expansion from Angband. Morgoth is controlled by an automata driven by a card-draw bot.

Built with **Vue 3 · TypeScript 5 · Pinia · Vite**.

---

## The Setting

The First Age is the age of Elves and the great struggle against Morgoth, the first Dark Lord. From his fortress of Angband in the north, Morgoth endlessly musters troops and extends his shadow across Beleriand. The great battles — the Dagor-nuin-Giliath, the Dagor Aglareb, the catastrophic Nirnaeth Arnoediad — mark the rising and falling of the Free Peoples' resistance.

You must place agents at key strongholds and crossroads, build a deck powerful enough to outmanoeuvre the automata, and commit troops to the great battles before the age ends.

---

## Running the Game

```bash
npm install
npm run dev        # start Vite dev server → http://localhost:5173
```

**Terminal REPL** (test engine logic without the UI):

```bash
npm run repl
```

Type `help` inside the REPL for a full command reference.

---

## Factions

| Faction | Side | Flavour |
|---|---|---|
| Noldor | Free Peoples | High Elves from Valinor; strong agents and lore |
| Sindar | Free Peoples | Grey Elves of Beleriand; influence and terrain |
| Edain | Free Peoples | Men; flexible, garrison-heavy |
| Morgoth | Automata only | Never chosen by the player |

---

## Core Concepts

### Resources

Three resources track your capacity to act each round.

| Resource | Used for |
|---|---|
| **Valor** | Placing agents at dangerous front-line locations; combat power |
| **Lore** | Paying costs at knowledge-based locations; card draw effects |
| **Supplies** | The most common placement cost; economy and logistics |

### Influence Tracks

Four tracks measure your political standing across Beleriand. Higher influence on a track unlocks effects when those factions act.

| Track | Represents |
|---|---|
| Fingolfin | High Kingship of the Noldor |
| Fëanor | The Oath-bound Noldor (volatile) |
| Sindar | Alliance with the Grey Elves |
| Edain | Alliance with Men |

### Agents

You start with **3 agents**. Each round you assign them to locations by playing a card from your hand. The card's icons must satisfy the location's requirement. Once placed, an agent occupies that location — Morgoth cannot take it, and you cannot reuse it until the cleanup phase.

### Your Deck

You begin with a 10-card starter deck, drawn 5 at a time. Cards serve two purposes:

1. **Agent placement** — the icons on the card determine which locations you can send an agent to.
2. **Purchasing power** — some cards contribute buying power during the market phase.

---

## Round Structure

Each round cycles through four phases. **Phase advancement is not yet automated** — the current build lets you trigger each step manually via the REPL or the UI.

```
Planning → Action → Conflict → Cleanup
```

### 1. Planning

Alternate taking turns with Morgoth. On your turn, choose one action:

- **Place an Agent** — play a card from your hand whose icons match a location's requirement, pay any resource cost, and place your agent token there.
- **Pass** — skip your placement for this turn.

Morgoth's placement is resolved automatically by `executeAutomataTurn()`: his automata deck is drawn, the card's location priority list is checked top-to-bottom, and his agent goes to the first open location. If all priority locations are taken, Morgoth adds 1 to his garrison instead.

Every automata card also musters troops (`troopsMustered`) for Morgoth regardless of placement success.

### 2. Action

Location rewards apply when an agent is placed. *(Currently these resolve immediately on placement rather than in a dedicated action phase — see [Known Gaps](#known-gaps).)*

| Location | Requirement | Cost | Reward |
|---|---|---|---|
| Barad Eithel | Military | 1 Supplies | +2 garrison, +1 valor |
| Gondolin | Noble | 2 Lore | −2 lore → draw 2 cards (skips if lore < 2) |
| Himring | Military | 1 Supplies | +1 garrison, +1 Fëanor influence |
| The Havens | Trade | — | −1 valor → +3 supplies (skips if valor < 1) |
| Gates of Angband | Military | 2 Valor | All garrison → deployed troops, garrison = 0 |
| Dorthonion | Wilderness | 1 Supplies | *(no reward yet)* |
| Nargothrond | Lore | 1 Lore | *(no reward yet)* |
| Doriath | Noble | — | *(no reward yet)* |
| West Beleriand | Wilderness | — | *(no reward yet)* |

### 3. Conflict

One conflict card is drawn from the tiered conflict deck. Each card names one of the great battles of the First Age and defines the stakes.

**Resolution:**
1. All players' `deployedTroops` are compared.
2. **Tie rule** — if first and second place share the same troop count, both receive the second-place reward and first place is discarded.
3. **Morgoth wins first** — his penalty fires against you (resource loss, VP loss, or extra garrison). You still receive the second-place consolation reward.
4. **You win first** — you receive the first-place reward. Morgoth's second place is logged but has no tracked effect.
5. All `deployedTroops` reset to 0 for every player — committed troops are always lost.

**Conflict cards** (drawn in tier order — easiest battles first, catastrophes last):

| Battle | Tier | Your 1st Place | 2nd Place | Morgoth Wins: Penalty |
|---|---|---|---|---|
| The First Battle | 1 | 1 VP | 2 Valor | −1 Lore |
| Dagor-nuin-Giliath | 1 | 1 VP | 1 Supply + 1 Valor | −1 Supply |
| Dagor Aglareb | 2 | 2 VP | 1 VP | −1 VP |
| The Siege of Angband | 2 | 2 VP | 3 Valor | +2 Morgoth garrison |
| Dagor Bragollach | 3 | 2 VP + 1 Lore | 1 VP | −2 VP |
| Nirnaeth Arnoediad | 3 | 3 VP | 1 VP | −2 VP, −2 Valor |

### 4. Cleanup

Agents are recalled, hands are refreshed, and the round counter advances. *(Not yet automated — see [Known Gaps](#known-gaps).)*

---

## The Card Market

After the planning phase, you may buy cards from a rotating market row of 5 face-up cards. Two reserve cards are always available as a fallback.

**Buy flow:**
1. Dispatch `REVEAL_CARDS_FOR_PURCHASE` — this sums the `purchasingPower` value of every card in your hand and sets your spending budget for the turn.
2. Dispatch `BUY_CARD` for each card you can afford — cost is deducted, card goes to your discard pile, and the market row refills from the draw pile.

**Market cards:**

| Card | Cost | Buy Power | Icons | Troops |
|---|---|---|---|---|
| Fëanorian Vanguard | 3 | 0 | Military | 2 |
| Song of Power | 4 | 2 | Lore, Noble | 0 |
| Dwarven Smiths | 2 | 2 | Trade | 0 |
| Eagle Scout | 5 | 1 | Wilderness, Military | 1 |
| The Helm of Hador | 6 | 3 | Noble | 1 |

**Reserve cards (always available):**

| Card | Cost | Buy Power | Icons | Troops |
|---|---|---|---|---|
| Wandering Minstrel | 2 | 1 | Lore | 0 |
| Sindarin Archer | 3 | 0 | Military | 1 |

---

## Starter Deck

Every human player begins with these 10 cards (dealt 5 to hand, 5 in the draw pile):

| Card | Copies | Icons | Buy Power |
|---|---|---|---|
| Elven Scout | 2 | Wilderness, Lore | 0 |
| Envoy | 2 | Noble, Trade | 0 |
| Sindarin Militia | 4 | Military | 1 |
| Call to Arms | 1 | Noble, Trade, Wilderness | 0 |
| Hidden Paths | 1 | Lore | 1 |

---

## Morgoth Automata

Morgoth's turn is driven by a 3-card automata deck (shuffled and cycled):

| Card | Location Priorities | Troops Mustered | Special |
|---|---|---|---|
| Balrog Assault | Himring → Dorthonion → Gondolin | 3 | Defenders lose 1 valor *(unimplemented)* |
| Shadow of Angband | Dorthonion → West Beleriand → Himring | 2 | — |
| Iron Will | Gondolin → Nargothrond → Doriath | 1 | Morgoth gains +1 lore *(unimplemented)* |

Each turn: draw a card, try each location in priority order, place at the first open one. If all are occupied, Morgoth's garrison grows by 1. Either way, `troopsMustered` is added to his deployed troops — he's always building toward the next battle.

---

## Terminal REPL

The REPL lets you drive the engine directly from the terminal, mirroring exactly the `dispatch()` calls the UI makes. Useful for testing logic without needing the browser.

```
npm run repl
```

```
COMMANDS

  status | s              Full game snapshot (locations, resources, market)
  hand | h                Your hand with icons and purchasing power
  market | m              Market row and reserve cards
  history [n]             Last n history entries (default 10)

  play <card> <location>  Place an agent     → PLAY_AGENT
  pass                    Pass your turn     → PASS_TURN
  reveal                  Sum hand buy-power → REVEAL_CARDS_FOR_PURCHASE
  buy <card>              Buy from market    → BUY_CARD
  buy <card> reserve      Buy reserve card   → BUY_CARD (isReserve=true)
  morgoth                 Run Morgoth automata turn
  conflict                Draw next conflict card + resolve
  draw [n]                Draw n cards from your deck
  reset                   Start a new game
  quit | q                Exit
```

Example sequence:
```
hand
play starter-sindarin-militia-1 barad_eithel
morgoth
reveal
buy dwarven-smiths
conflict
history
```

---

## Architecture

The engine is **headless** — `GameEngine` (`src/game-engine/engine.ts`) is a plain TypeScript class with no Vue dependency. All state flows through a single `dispatch(action)` call, through a pure `reduce()` switch, and out via an `onStateChange` callback that hands a deep-cloned snapshot to Pinia.

```
Vue component
    └─ sendAction(action)         ← Pinia store
         └─ engine.dispatch()     ← GameEngine
              └─ reduce()         ← pure switch
                   └─ handler()   ← returns new GameState
                        └─ onStateChange(clone)
                             └─ gameState.value = …  ← Vue reactivity
```

Morgoth's turn (`executeAutomataTurn`) is a pure function that runs outside the dispatch cycle and is applied via `setStateDirectly()` — the same pattern a real "AUTOMATA_TURN" action would use once that's wired in.

---

## Known Gaps

These are the unimplemented seams in the current build:

| Feature | Status |
|---|---|
| Phase advancement (`ADVANCE_PHASE` action) | Not implemented — phase must be set manually |
| Cleanup phase — recall agents, refresh hand, increment round | Not implemented |
| `AUTOMATA_TURN` engine action | Bypasses engine; uses `setStateDirectly` for now |
| Card special effects (`specialEffect` field) | Defined on cards, not yet executed |
| Influence track unlock effects | Tracked in state, effects not wired |
| Victory condition check | No win/loss detection yet |
| Rewards for Dorthonion, Nargothrond, Doriath, West Beleriand | Locations open but have no reward |
| `conflictDeck` auto-advance | Conflict must be triggered manually |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Vue 3 (Composition API, `<script setup>`) |
| Language | TypeScript 5 (strict mode) |
| Build tool | Vite 5 |
| State management | Pinia 2 |
| Runtime | Node 24 / npm 11 |

```bash
npm run dev        # dev server with hot reload
npm run build      # type-check + production build → dist/
npm run typecheck  # vue-tsc --noEmit only
npm run repl       # interactive terminal REPL
```
