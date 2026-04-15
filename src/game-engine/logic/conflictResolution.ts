import { GameState, PlayerState } from '../types';
import { ConflictCard, MorgothPenalty, Reward, CONFLICT_DECK } from '../data/conflictDeck';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function lookupConflictCard(id: string): ConflictCard {
  const card = CONFLICT_DECK.find((c) => c.id === id);
  if (!card) {
    throw new Error(`resolveConflictPhase: conflict card "${id}" not found in CONFLICT_DECK.`);
  }
  return card;
}

function applyRewards(player: PlayerState, rewards: Reward[]): PlayerState {
  return rewards.reduce((p, reward) => {
    switch (reward.type) {
      case 'victoryPoints':
        return { ...p, victoryPoints: p.victoryPoints + reward.amount };
      case 'resource':
        return {
          ...p,
          resources: {
            ...p.resources,
            [reward.resourceId]: p.resources[reward.resourceId] + reward.amount,
          },
        };
    }
  }, player);
}

function applyHumanPenalty(player: PlayerState, penalty: MorgothPenalty): PlayerState {
  switch (penalty.type) {
    case 'lose_vp':
      return { ...player, victoryPoints: Math.max(0, player.victoryPoints - penalty.amount) };
    case 'lose_resource':
      return {
        ...player,
        resources: {
          ...player.resources,
          [penalty.resourceId]: Math.max(0, player.resources[penalty.resourceId] - penalty.amount),
        },
      };
    case 'morgoth_garrison':
      // This variant targets the Morgoth player, not the human — handled separately.
      return player;
  }
}

function describeRewards(rewards: Reward[]): string {
  return rewards
    .map((r) => {
      if (r.type === 'victoryPoints') return `${r.amount} VP`;
      return `${r.amount} ${r.resourceId}`;
    })
    .join(', ');
}

function describePenalty(penalty: MorgothPenalty): string {
  switch (penalty.type) {
    case 'lose_vp':      return `−${penalty.amount} VP`;
    case 'lose_resource': return `−${penalty.amount} ${penalty.resourceId}`;
    case 'morgoth_garrison': return `Morgoth gains +${penalty.amount} garrison`;
  }
}

// ---------------------------------------------------------------------------
// resolveConflictPhase
// ---------------------------------------------------------------------------

/**
 * Pure function — resolves the active conflict and returns a new GameState.
 * Does not mutate the input (spread-based immutability throughout).
 *
 * Resolution order:
 *  1. Validate active conflict exists.
 *  2. Look up the ConflictCard definition.
 *  3. Rank all players by deployedTroops (descending).
 *  4. Tie-break: tied 1st place → both receive 2nd-place reward; 1st discarded.
 *  5. Apply rewards (human) and morgothPenalty (if Morgoth wins 1st).
 *  6. Append history entries.
 *  7. Reset deployedTroops to 0 for all players.
 *  8. Mark conflict as resolved.
 */
export function resolveConflictPhase(state: GameState): GameState {
  if (!state.conflict) {
    throw new Error('resolveConflictPhase: no active conflict in state.');
  }

  const conflictCard = lookupConflictCard(state.conflict.conflictCardId);
  const historyEntries: string[] = [];
  const prefix = `[Round ${state.round}] "${conflictCard.title}"`;

  // --- 1. Rank players by deployedTroops ---
  const ranked = Object.values(state.players).sort(
    (a, b) => b.deployedTroops - a.deployedTroops,
  );

  const first = ranked[0];
  const second = ranked[1] ?? null;
  const isTie = second !== null && first.deployedTroops === second.deployedTroops;

  historyEntries.push(
    `${prefix} — conflict begins. ` +
    ranked.map((p) => `${p.id}: ${p.deployedTroops} troops`).join(', ') + '.',
  );

  // --- 2. Identify human and Morgoth players ---
  const humanPlayer = Object.values(state.players).find((p) => !p.isAutomata);
  const morgothPlayer = Object.values(state.players).find((p) => p.isAutomata);

  if (!humanPlayer) throw new Error('resolveConflictPhase: no human player found.');
  if (!morgothPlayer) throw new Error('resolveConflictPhase: no automata player found.');

  let updatedHuman = { ...humanPlayer };
  let updatedMorgoth = { ...morgothPlayer };

  // --- 3. Determine outcome and apply rewards/penalties ---
  if (isTie) {
    // Tied for 1st: both receive 2nd-place reward; 1st-place reward is discarded.
    historyEntries.push(
      `${prefix} — TIE (${first.deployedTroops} troops each). ` +
      `First-place reward discarded. Both sides receive: ${describeRewards(conflictCard.rewards.secondPlace)}.`,
    );

    updatedHuman = applyRewards(updatedHuman, conflictCard.rewards.secondPlace);
    // Morgoth receives no tracked VP/resources; tie outcome is a soft draw for him.

  } else {
    const firstWinner = first;
    const morgothWinsFirst = firstWinner.isAutomata;

    if (morgothWinsFirst) {
      // Morgoth takes 1st place.
      historyEntries.push(
        `${prefix} — MORGOTH VICTORIOUS (${firstWinner.deployedTroops} troops). ` +
        `Penalty for the Free Peoples: ${conflictCard.morgothPenalty.map(describePenalty).join(', ')}.`,
      );

      // Apply human-facing penalties.
      for (const penalty of conflictCard.morgothPenalty) {
        updatedHuman = applyHumanPenalty(updatedHuman, penalty);
      }

      // Apply Morgoth-facing penalty (morgoth_garrison).
      for (const penalty of conflictCard.morgothPenalty) {
        if (penalty.type === 'morgoth_garrison') {
          updatedMorgoth = {
            ...updatedMorgoth,
            garrison: updatedMorgoth.garrison + penalty.amount,
          };
          historyEntries.push(
            `${prefix} — Morgoth's forces swell: +${penalty.amount} garrison added to Angband.`,
          );
        }
      }

      // Human still claims 2nd-place reward (if a second player exists).
      if (second !== null) {
        historyEntries.push(
          `${prefix} — The Free Peoples salvage a partial victory: ` +
          `${describeRewards(conflictCard.rewards.secondPlace)}.`,
        );
        updatedHuman = applyRewards(updatedHuman, conflictCard.rewards.secondPlace);
      }

    } else {
      // Human takes 1st place.
      historyEntries.push(
        `${prefix} — FREE PEOPLES VICTORIOUS (${firstWinner.deployedTroops} troops). ` +
        `Reward: ${describeRewards(conflictCard.rewards.firstPlace)}.`,
      );
      updatedHuman = applyRewards(updatedHuman, conflictCard.rewards.firstPlace);

      // Morgoth claims 2nd-place reward (no tracked effect — log only).
      if (second !== null) {
        historyEntries.push(
          `${prefix} — Morgoth's forces retreat but are not broken ` +
          `(${second.deployedTroops} troops committed).`,
        );
      }
    }
  }

  // --- 4. Reset deployedTroops for all players (troops are lost in battle) ---
  historyEntries.push(`${prefix} — All committed troops are lost. Beleriand weeps.`);

  const updatedPlayers = Object.fromEntries(
    Object.entries(state.players).map(([id, player]) => [
      id,
      {
        ...(id === updatedHuman.id ? updatedHuman : id === updatedMorgoth.id ? updatedMorgoth : player),
        deployedTroops: 0,
      },
    ]),
  );

  // --- 5. Mark conflict resolved ---
  return {
    ...state,
    players: updatedPlayers,
    conflict: {
      ...state.conflict,
      isResolved: true,
    },
    history: [...state.history, ...historyEntries],
  };
}
