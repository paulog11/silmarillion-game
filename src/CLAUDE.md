# src — Game Mechanics & Source Reference

## Theme

Beleriand, First Age. The human player commands the Free Peoples (Noldor, Sindar, or Edain) resisting Morgoth's expansion from Angband. Morgoth is an automata controlled by a card-driven bot.

## Factions

| FactionId | Side | Notes |
|---|---|---|
| `noldor` | Free peoples | High elves; strong agents and lore |
| `sindar` | Free peoples | Grey elves; influence and terrain |
| `edain` | Free peoples | Men; flexible, garrison-heavy |
| `morgoth` | Automata only | Never played by a human |

## Resources

| ResourceId | Meaning |
|---|---|
| `valor` | Combat power and heroic actions |
| `lore` | Card draw, knowledge effects |
| `supplies` | Economy; agent placement costs |

## Influence Tracks

| InfluenceTrackId | Represents |
|---|---|
| `fingolfin` | High kingship of the Noldor |
| `feanor` | Oath-bound Noldor (volatile) |
| `sindar` | Alliance with the Grey Elves |
| `edain` | Alliance with Men |

---

## Sub-directory references

| Directory | CLAUDE.md covers |
|---|---|
| [`game-engine/`](game-engine/CLAUDE.md) | Engine architecture, GameAction union, automata turn sequence, phase structure, unimplemented features |
| [`game-engine/types/`](game-engine/types/CLAUDE.md) | All TypeScript interfaces — primitives, PlayerState, DeckState, GameState, ConflictState, AutomataState |
| [`game-engine/data/`](game-engine/data/CLAUDE.md) | Static registries — locations, cards, starter deck, conflict deck, Reward/MorgothPenalty types |
| [`game-engine/logic/`](game-engine/logic/CLAUDE.md) | Pure functions — deckManager, locationActions, conflictResolution |
