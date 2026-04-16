/**
 * Interactive terminal REPL for exercising game-engine logic without the Vue UI.
 *
 * Run:  npm run repl
 *
 * Every command maps to a real engine dispatch (or an explicit bypass like the
 * Pinia store's setStateDirectly) so you are always testing the actual code
 * paths that the UI will call.
 */

import * as rl from 'node:readline';
import { GameEngine } from '../src/game-engine/engine';
import type { GameAction } from '../src/game-engine/engine';
import type { GameState, PlayerState, AutomataCard, AutomataState } from '../src/game-engine/types';
import { CARD_REGISTRY } from '../src/game-engine/data/cards';
import { LOCATION_REGISTRY } from '../src/game-engine/data/locations';
import { MARKET_CARD_IDS, RESERVE_CARD_IDS } from '../src/game-engine/data/marketDeck';
import { STARTER_DECK_IDS } from '../src/game-engine/data/starterDeck';
import { buildConflictDeck } from '../src/game-engine/data/conflictDeck';
import { shuffle, drawCards } from '../src/game-engine/logic/deckManager';
import { executeAutomataTurn } from '../src/game-engine/automataLogic';

// ── ANSI helpers ──────────────────────────────────────────────────────────────
const bold   = (s: string) => `\x1b[1m${s}\x1b[0m`;
const dim    = (s: string) => `\x1b[2m${s}\x1b[0m`;
const red    = (s: string) => `\x1b[31m${s}\x1b[0m`;
const green  = (s: string) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;
const blue   = (s: string) => `\x1b[34m${s}\x1b[0m`;
const cyan   = (s: string) => `\x1b[36m${s}\x1b[0m`;
const ok     = (s: string) => green(`  ✔ ${s}`);
const err    = (s: string) => red(`  ✖ ${s}`);

// ── State + engine ────────────────────────────────────────────────────────────
// `state` is always the latest snapshot. `engine` wraps it.
// Use `rebuildEngine(s)` any time state needs to be injected from outside the
// normal dispatch cycle (mirrors Pinia's setStateDirectly pattern).

let state: GameState;
let engine: GameEngine;

function rebuildEngine(s: GameState): void {
  state = s;
  engine = new GameEngine(s, (next) => { state = next; });
}

function dispatch(action: GameAction): void {
  engine.dispatch(action);
}

// ── Initial state — mirrors useGameStore.buildInitialState() ──────────────────
const MOCK_AUTOMATA_DECK: AutomataCard[] = [
  {
    id: 'ac-balrog-assault',
    title: 'Balrog Assault',
    locationPriorities: ['himring', 'dorthonion', 'gondolin'],
    troopsMustered: 3,
    specialEffect: 'All defenders lose 1 valor.',
  },
  {
    id: 'ac-shadow-spread',
    title: 'Shadow of Angband',
    locationPriorities: ['dorthonion', 'west_beleriand', 'himring'],
    troopsMustered: 2,
  },
  {
    id: 'ac-iron-will',
    title: 'Iron Will',
    locationPriorities: ['gondolin', 'nargothrond', 'doriath'],
    troopsMustered: 1,
    specialEffect: 'Morgoth gains +1 lore.',
  },
];

function buildInitialState(): GameState {
  const shuffledStarter = shuffle(STARTER_DECK_IDS);
  const humanPlayer: PlayerState = {
    id: 'player-noldor',
    isAutomata: false,
    faction: 'noldor',
    resources: { valor: 2, lore: 1, supplies: 3 },
    influence: { fingolfin: 2, feanor: 1, sindar: 0, edain: 0 },
    victoryPoints: 0,
    agentsAvailable: 3,
    agentsTotal: 3,
    garrison: 2,
    deployedTroops: 0,
    currentPurchasingPower: 0,
    deck: {
      hand: shuffledStarter.slice(0, 5),
      drawPile: shuffledStarter.slice(5),
      discardPile: [],
      inPlay: [],
    },
  };
  const morgoth: PlayerState = {
    id: 'player-morgoth',
    isAutomata: true,
    faction: 'morgoth',
    resources: { valor: 0, lore: 0, supplies: 5 },
    influence: { fingolfin: 0, feanor: 0, sindar: 0, edain: 0 },
    victoryPoints: 0,
    agentsAvailable: 0,
    agentsTotal: 0,
    garrison: 5,
    deployedTroops: 0,
    currentPurchasingPower: 0,
    deck: { drawPile: [], hand: [], discardPile: [], inPlay: [] },
  };
  const automata: AutomataState = {
    deck: [...MOCK_AUTOMATA_DECK],
    discard: [],
    revealedCard: null,
    garrison: morgoth.garrison,
    deployedTroops: morgoth.deployedTroops,
  };
  const marketIds = shuffle(MARKET_CARD_IDS);
  return {
    round: 1,
    phase: 'planning',
    activePlayerId: humanPlayer.id,
    players: {
      [humanPlayer.id]: humanPlayer,
      [morgoth.id]: morgoth,
    },
    locations: {
      barad_eithel:  { id: 'barad_eithel',  occupantId: null },
      himring:       { id: 'himring',        occupantId: null },
      dorthonion:    { id: 'dorthonion',     occupantId: null },
      gondolin:      { id: 'gondolin',       occupantId: null },
      nargothrond:   { id: 'nargothrond',    occupantId: null },
      doriath:       { id: 'doriath',        occupantId: null },
      the_havens:    { id: 'the_havens',     occupantId: null },
      west_beleriand:{ id: 'west_beleriand', occupantId: null },
      angband_gates: { id: 'angband_gates',  occupantId: null },
    },
    automata,
    conflict: null,
    conflictDeck: buildConflictDeck(),
    market: { visibleCards: marketIds.slice(0, 5), deck: marketIds.slice(5) },
    history: ['[Round 1] Game started. The Noldor stand against the Shadow.'],
  };
}

// ── Accessors ─────────────────────────────────────────────────────────────────
function human(): PlayerState {
  return Object.values(state.players).find(p => !p.isAutomata)!;
}
function morgothState(): PlayerState {
  return Object.values(state.players).find(p => p.isAutomata)!;
}

// ── Display ───────────────────────────────────────────────────────────────────
function printStatus(): void {
  const p = human();
  const m = morgothState();
  console.log();
  console.log(bold(`  ╔═══ SILMARILLION  Round ${state.round} | ${yellow(state.phase.toUpperCase())} ═══╗`));
  console.log();

  // Human
  console.log(
    bold(green(`  YOU (${p.faction})`)) +
    `  Agents: ${p.agentsAvailable}/${p.agentsTotal}` +
    `  VP: ${cyan(String(p.victoryPoints))}` +
    `  Buying power: ${yellow(String(p.currentPurchasingPower))}`
  );
  console.log(`  Resources  Valor:${p.resources.valor}  Lore:${p.resources.lore}  Supplies:${p.resources.supplies}`);
  console.log(`  Garrison: ${p.garrison}  Troops deployed: ${p.deployedTroops}`);
  console.log(`  Hand (${p.deck.hand.length}): ${p.deck.hand.length ? p.deck.hand.map(id => yellow(id)).join('  ') : dim('empty')}`);
  console.log(`  Draw pile: ${p.deck.drawPile.length}  Discard: ${p.deck.discardPile.length}  In play: ${p.deck.inPlay.length}`);
  console.log();

  // Morgoth
  console.log(
    bold(red(`  MORGOTH`)) +
    `  Garrison: ${m.garrison}  Troops deployed: ${m.deployedTroops}  VP: ${m.victoryPoints}`
  );
  if (state.automata.revealedCard) {
    console.log(`  Last automata card: ${state.automata.revealedCard.title}`);
  }
  console.log();

  // Locations
  console.log(bold('  LOCATIONS'));
  for (const [id, loc] of Object.entries(state.locations)) {
    const def = LOCATION_REGISTRY[id];
    const icon = def ? `[${def.requiredIcon}]`.padEnd(13) : '           ';
    const cost = def?.cost ? `cost: ${def.cost.amount} ${def.cost.resource}` : 'free      ';
    const who  = loc.occupantId === null
      ? dim('open')
      : loc.occupantId === m.id
        ? red('MORGOTH')
        : green('YOU');
    console.log(`  ${cyan(id.padEnd(20))} ${dim((def?.name ?? '').padEnd(22))} ${icon} ${cost.padEnd(18)} ${who}`);
  }
  console.log();

  // Market
  console.log(bold('  MARKET ROW'));
  for (const id of state.market.visibleCards) {
    const def = CARD_REGISTRY[id];
    console.log(
      `  ${yellow(id.padEnd(24))}` +
      `  cost:${String(def?.cost ?? '?').padEnd(3)}` +
      `  power:${String(def?.purchasingPower ?? 0).padEnd(2)}` +
      `  icons:[${def?.agentIcons.join(', ')}]`
    );
  }
  console.log(bold('  RESERVE'));
  for (const id of RESERVE_CARD_IDS) {
    const def = CARD_REGISTRY[id];
    console.log(
      `  ${yellow(id.padEnd(24))}` +
      `  cost:${String(def?.cost ?? '?').padEnd(3)}` +
      `  power:${String(def?.purchasingPower ?? 0).padEnd(2)}` +
      `  icons:[${def?.agentIcons.join(', ')}]`
    );
  }
  console.log();
}

function printHand(): void {
  const p = human();
  console.log();
  console.log(bold(`  HAND (${p.deck.hand.length} cards)`));
  if (p.deck.hand.length === 0) { console.log(dim('  empty')); console.log(); return; }
  for (const id of p.deck.hand) {
    const def = CARD_REGISTRY[id];
    if (!def) { console.log(`  ${yellow(id)}  ${red('NOT IN REGISTRY')}`); continue; }
    console.log(
      `  ${yellow(id.padEnd(34))}` +
      `icons:[${def.agentIcons.join(', ')}]`.padEnd(30) +
      `power:${String(def.purchasingPower).padEnd(3)}` +
      `troops:${def.troopsMustered}`
    );
  }
  console.log();
}

function printMarket(): void {
  console.log();
  console.log(bold('  MARKET ROW'));
  for (const id of state.market.visibleCards) {
    const def = CARD_REGISTRY[id];
    console.log(
      `  ${yellow(id.padEnd(24))}` +
      `  cost:${String(def?.cost ?? '?').padEnd(3)}` +
      `  power:${String(def?.purchasingPower ?? 0).padEnd(2)}` +
      `  icons:[${def?.agentIcons.join(', ')}]`
    );
  }
  console.log(bold('  RESERVE (always available)'));
  for (const id of RESERVE_CARD_IDS) {
    const def = CARD_REGISTRY[id];
    console.log(
      `  ${yellow(id.padEnd(24))}` +
      `  cost:${String(def?.cost ?? '?').padEnd(3)}` +
      `  power:${String(def?.purchasingPower ?? 0).padEnd(2)}` +
      `  icons:[${def?.agentIcons.join(', ')}]`
    );
  }
  console.log();
}

function printHistory(n = 10): void {
  const entries = state.history.slice(-n);
  console.log();
  console.log(bold(`  HISTORY (last ${entries.length})`));
  for (const e of entries) console.log(`  ${dim(e)}`);
  console.log();
}

function printHelp(): void {
  console.log(`
${bold('COMMANDS')}

  ${cyan('status')} | s              Full game snapshot (locations, resources, market)
  ${cyan('hand')} | h                Your hand with icons and purchasing power
  ${cyan('market')} | m              Market row and reserve cards
  ${cyan('history')} [n]             Last n history entries (default 10)

  ${cyan('play')} <card> <location>  Place an agent     → PLAY_AGENT
  ${cyan('pass')}                    Pass your turn      → PASS_TURN
  ${cyan('reveal')}                  Sum hand buy-power  → REVEAL_CARDS_FOR_PURCHASE
  ${cyan('buy')} <card>              Buy from market row → BUY_CARD (isReserve=false)
  ${cyan('buy')} <card> reserve      Buy reserve card    → BUY_CARD (isReserve=true)
  ${cyan('morgoth')}                 Run Morgoth automata turn (executeAutomataTurn)
  ${cyan('conflict')}                Draw next conflict card + RESOLVE_CONFLICT
  ${cyan('draw')} [n]                Draw n cards from your deck (default 5)
  ${cyan('reset')}                   Start a new game
  ${cyan('quit')} | q                Exit

${bold('EXAMPLE SEQUENCE')}
  hand
  play starter-sindarin-militia-1 barad_eithel
  morgoth
  draw 3
  reveal
  buy dwarven-smiths
  conflict
`);
}

// ── Command handlers ──────────────────────────────────────────────────────────
function cmdPlay(args: string[]): void {
  if (args.length < 2) {
    console.log(red('  Usage: play <cardId> <locationId>'));
    return;
  }
  const [cardId, locationId] = args;
  dispatch({ type: 'PLAY_AGENT', playerId: human().id, locationId, cardId });
  console.log(ok(`Played ${cardId} → ${locationId}`));
  printHistory(1);
}

function cmdPass(): void {
  dispatch({ type: 'PASS_TURN', playerId: human().id });
  console.log(ok('Passed turn'));
  printHistory(1);
}

function cmdReveal(): void {
  dispatch({ type: 'REVEAL_CARDS_FOR_PURCHASE', playerId: human().id });
  console.log(ok(`Purchasing power set to ${yellow(String(human().currentPurchasingPower))}`));
  printHistory(1);
}

function cmdBuy(args: string[]): void {
  if (args.length < 1) {
    console.log(red('  Usage: buy <cardId> [reserve]'));
    return;
  }
  const cardId = args[0];
  const isReserve = args[1] === 'reserve';
  dispatch({ type: 'BUY_CARD', playerId: human().id, cardId, isReserve });
  console.log(ok(`Bought ${cardId}${isReserve ? ' (reserve)' : ''} — now in discard pile`));
  console.log(`  Remaining power: ${yellow(String(human().currentPurchasingPower))}`);
  printHistory(1);
}

function cmdMorgoth(): void {
  // executeAutomataTurn is a pure function used via setStateDirectly in the
  // Pinia store — mirrors that pattern exactly here.
  const next = executeAutomataTurn(state);
  rebuildEngine(next);
  console.log(ok('Morgoth automata turn resolved'));
  printHistory(1);
}

function cmdConflict(): void {
  // If there's already an active, unresolved conflict just resolve it.
  if (state.conflict !== null && !state.conflict.isResolved) {
    dispatch({ type: 'RESOLVE_CONFLICT' });
    console.log(ok('Conflict resolved'));
    printHistory(3);
    return;
  }

  if (state.conflictDeck.length === 0) {
    console.log(err('No conflict cards remaining.'));
    return;
  }

  // Draw the next conflict card and inject the ConflictState, then resolve.
  const [card, ...remaining] = state.conflictDeck;
  const playerStrengths = Object.fromEntries(
    Object.values(state.players).map(p => [p.id, p.deployedTroops])
  );

  console.log(blue(`  Conflict: "${card.title}" (Tier ${card.tier})`));
  console.log(`  Strengths — You: ${playerStrengths[human().id]}  Morgoth: ${playerStrengths[morgothState().id]}`);

  rebuildEngine({
    ...state,
    conflictDeck: remaining,
    conflict: {
      conflictCardId: card.id,
      rewards: [],
      playerStrengths,
      isResolved: false,
    },
  });

  dispatch({ type: 'RESOLVE_CONFLICT' });
  console.log(ok('Conflict resolved'));
  printHistory(4);
}

function cmdDraw(args: string[]): void {
  const n = Math.max(1, parseInt(args[0] ?? '5', 10) || 5);
  const p = human();
  const before = p.deck.hand.length;
  const newDeck = drawCards(p.deck, n);
  const drew = newDeck.hand.length - before;
  rebuildEngine({
    ...state,
    players: {
      ...state.players,
      [p.id]: { ...p, deck: newDeck },
    },
    history: [
      ...state.history,
      `[Round ${state.round}] Player "${p.id}" drew ${drew} card(s).`,
    ],
  });
  console.log(ok(`Drew ${drew} card(s)`));
  printHand();
}

// ── REPL entry point ──────────────────────────────────────────────────────────
function startRepl(): void {
  rebuildEngine(buildInitialState());

  const ALL_COMMANDS = [
    'status', 'hand', 'market', 'history',
    'play', 'pass', 'reveal', 'buy', 'morgoth', 'conflict', 'draw',
    'reset', 'quit', 'help',
  ];

  const iface = rl.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: bold(cyan('silm> ')),
    completer: (line: string) => {
      const hits = ALL_COMMANDS.filter(c => c.startsWith(line));
      return [hits.length ? hits : ALL_COMMANDS, line];
    },
  });

  console.log(bold('\n  Silmarillion: War of the First Age — Engine REPL'));
  console.log(dim('  Type "help" for commands, "status" for a full snapshot.\n'));
  printStatus();

  iface.prompt();

  iface.on('line', (raw) => {
    const trimmed = raw.trim();
    if (!trimmed) { iface.prompt(); return; }

    const [cmd, ...args] = trimmed.split(/\s+/);

    try {
      switch (cmd) {
        case 'help':                  printHelp();           break;
        case 'status': case 's':      printStatus();         break;
        case 'hand':   case 'h':      printHand();           break;
        case 'market': case 'm':      printMarket();         break;
        case 'history':               printHistory(args[0] ? parseInt(args[0], 10) : 10); break;
        case 'play':                  cmdPlay(args);         break;
        case 'pass':                  cmdPass();             break;
        case 'reveal':                cmdReveal();           break;
        case 'buy':                   cmdBuy(args);          break;
        case 'morgoth':               cmdMorgoth();          break;
        case 'conflict':              cmdConflict();         break;
        case 'draw':                  cmdDraw(args);         break;
        case 'reset':
          rebuildEngine(buildInitialState());
          console.log(ok('New game started'));
          printStatus();
          break;
        case 'quit': case 'exit': case 'q':
          console.log(dim('\n  Farewell from Beleriand.\n'));
          iface.close();
          process.exit(0);
        default:
          console.log(red(`  Unknown command: "${cmd}". Type "help" for commands.`));
      }
    } catch (e) {
      console.log(err((e as Error).message));
    }

    iface.prompt();
  });

  iface.on('close', () => process.exit(0));
}

startRepl();
