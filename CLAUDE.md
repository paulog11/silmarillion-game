# Silmarillion: War of the First Age — Project Guide

## Stack

| Layer | Technology |
|---|---|
| Framework | Vue 3 (Composition API, `<script setup>`) |
| Language | TypeScript 5 (strict mode) |
| Build tool | Vite 5 |
| State management | Pinia 2 |
| Runtime | Node 24 / npm 11 |

## Project Structure

```
silmarillion-game/
├── index.html               # Vite HTML entry
├── vite.config.ts           # Vite config (@/ alias → src/)
├── tsconfig.json            # Root tsconfig (references app + node)
├── tsconfig.app.json        # App compiler options (src/**)
├── tsconfig.node.json       # Node compiler options (vite.config.ts)
├── package.json
└── src/
    ├── main.ts              # createApp, Pinia install, mount #app
    ├── App.vue              # Root component (debug UI)
    ├── stores/
    │   └── useGameStore.ts  # Pinia store — holds GameState, owns GameEngine instance
    └── game-engine/
        ├── engine.ts        # GameEngine class + GameAction union
        ├── automataLogic.ts # Pure function: executeAutomataTurn()
        └── types/
            ├── index.ts     # GameState root interface + barrel export
            ├── primitives.ts
            ├── player.ts
            ├── board.ts
            └── automata.ts
```

## Dev Commands

```bash
npm run dev        # Start Vite dev server (hot reload)
npm run build      # Type-check then production build → dist/
npm run preview    # Serve the dist/ build locally
npm run typecheck  # vue-tsc --noEmit only (no build)
```

## Architecture

The engine is **headless** — `GameEngine` (`src/game-engine/engine.ts`) is a plain TypeScript class with no Vue dependency. It owns internal `GameState` and exposes a single `dispatch(action: GameAction)` method. After every dispatch it emits a deep-cloned state via the `onStateChange` callback registered at construction time.

The Pinia store (`useGameStore`) is the bridge:
- Holds a `ref<GameState | null>` that drives Vue reactivity.
- Holds the `GameEngine` instance wrapped in `markRaw` so Vue never proxies it.
- `initGame()` constructs the engine and wires the callback.
- `sendAction(action)` forwards to `engine.dispatch()`.
- `setStateDirectly(state)` is used for automata turns that run as pure functions outside the engine dispatch cycle.

The Morgoth automata turn runs via `executeAutomataTurn(state): GameState` (`src/game-engine/automataLogic.ts`) — a pure function that returns a new state without mutating the original.

## Key Design Decisions

- **Immutability** — the reducer in `GameEngine` and `executeAutomataTurn` always return new objects via spread. Nothing mutates in place.
- **`markRaw` on the engine** — prevents Vue from recursively proxying `GameEngine`'s private fields, which would break class method bindings and waste overhead.
- **`GameState.automata`** holds the Morgoth card-draw machinery (`AutomataState`). Garrison and `deployedTroops` live on Morgoth's `PlayerState` as the combat-relevant source of truth; `AutomataState` mirrors them at construction time.
- **`DeckState`** is defined in `types/player.ts` but not yet threaded into `PlayerState` — reserved for the human player's deck-building layer.
- **`setStateDirectly`** is a deliberate short-term seam. The long-term fix is an `AUTOMATA_TURN` action inside the `GameAction` union so all state transitions go through the engine reducer.

## Adding a New Action

1. Add a new variant to the `GameAction` union in `src/game-engine/engine.ts`.
2. Add a matching `case` in the `reduce` switch — TypeScript's `never` exhaustiveness guard will error if you forget.
3. Write the handler as a private method on `GameEngine` that returns a new `GameState`.

## Type Conventions

- `ResourceId`, `FactionId`, `InfluenceTrackId`, `Phase` are string literal union types in `primitives.ts` — use these everywhere instead of raw strings.
- Import engine types from `'../game-engine/types'` (the barrel), not from individual files.
