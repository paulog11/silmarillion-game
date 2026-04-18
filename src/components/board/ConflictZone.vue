<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '../../stores/useGameStore';
import { CONFLICT_DECK, MorgothPenalty } from '../../game-engine/data/conflictDeck';

const store = useGameStore();

const conflict = computed(() => store.gameState?.conflict ?? null);

const conflictCard = computed(() => {
  const id = conflict.value?.conflictCardId;
  if (!id) return null;
  return CONFLICT_DECK.find((c) => c.id === id) ?? null;
});

const humanPlayer = computed(() => {
  const state = store.gameState;
  if (!state) return null;
  return Object.values(state.players).find((p) => !p.isAutomata) ?? null;
});

interface Side {
  label: string;
  playerId: string;
  troops: number;
  isWinning: boolean;
  isHuman: boolean;
}

const sides = computed((): Side[] => {
  const state = store.gameState;
  if (!state) return [];

  const players = Object.values(state.players);
  const human = players.find((p) => !p.isAutomata);
  const morgoth = players.find((p) => p.isAutomata);
  if (!human || !morgoth) return [];

  const humanTroops = human.deployedTroops;
  const morgothTroops = morgoth.deployedTroops;

  return [
    {
      label: human.faction.charAt(0).toUpperCase() + human.faction.slice(1),
      playerId: human.id,
      troops: humanTroops,
      isWinning: humanTroops > morgothTroops,
      isHuman: true,
    },
    {
      label: 'Morgoth',
      playerId: morgoth.id,
      troops: morgothTroops,
      isWinning: morgothTroops > humanTroops,
      isHuman: false,
    },
  ];
});

const tierLabel = computed(() => {
  const tier = conflictCard.value?.tier;
  return tier ? `Tier ${tier}` : '';
});

const isTied = computed(() => {
  const [a, b] = sides.value;
  return a && b && a.troops === b.troops && a.troops > 0;
});

function penaltyLabel(penalty: MorgothPenalty): string {
  switch (penalty.type) {
    case 'lose_vp': return `−${penalty.amount} VP`;
    case 'lose_resource': return `−${penalty.amount} ${penalty.resourceId}`;
    case 'morgoth_garrison': return `Morgoth +${penalty.amount} garrison`;
  }
}

function deployTroops(amount: number): void {
  const player = humanPlayer.value;
  if (!player) return;
  store.sendAction({ type: 'DEPLOY_TROOPS', playerId: player.id, amount });
}

function resolveConflict(): void {
  store.sendAction({ type: 'RESOLVE_CONFLICT' });
}
</script>

<template>
  <div class="conflict-zone" :class="{ 'no-conflict': !conflict }">
    <template v-if="conflict && conflictCard">
      <div class="conflict-header">
        <span class="tier-badge">{{ tierLabel }}</span>
        <h2 class="conflict-title">{{ conflictCard.title }}</h2>
        <span v-if="conflict.isResolved" class="resolved-badge">Resolved</span>
        <button
          v-else
          class="resolve-btn"
          @click="resolveConflict"
        >
          Resolve
        </button>
      </div>

      <div class="strength-row">
        <div
          v-for="side in sides"
          :key="side.playerId"
          class="strength-card"
          :class="{
            winning: side.isWinning && !isTied,
            morgoth: !side.isHuman,
          }"
        >
          <span class="side-label">{{ side.label }}</span>
          <span class="troops-value">{{ side.troops }}</span>
          <span class="troops-unit">troops</span>
          <span v-if="side.isWinning && !isTied" class="winning-indicator">▲ Leading</span>
          <span v-else-if="isTied" class="tied-indicator">— Tied</span>

          <template v-if="side.isHuman && !conflict.isResolved && humanPlayer">
            <span class="garrison-label">Garrison: {{ humanPlayer.garrison }}</span>
            <div class="deploy-btns">
              <button
                class="deploy-btn"
                :disabled="humanPlayer.garrison < 1"
                @click="deployTroops(1)"
              >+1</button>
              <button
                class="deploy-btn deploy-btn-all"
                :disabled="humanPlayer.garrison === 0"
                @click="deployTroops(humanPlayer.garrison)"
              >All</button>
            </div>
          </template>
        </div>
      </div>

      <div class="rewards-hint">
        <span class="hint-label">1st:</span>
        <span
          v-for="(reward, i) in conflictCard.rewards.firstPlace"
          :key="i"
          class="reward-chip"
        >
          {{ reward.type === 'victoryPoints' ? `${reward.amount} VP` : `${reward.amount} ${reward.resourceId}` }}
        </span>
        <span class="hint-sep">|</span>
        <span class="hint-label">2nd:</span>
        <span
          v-for="(reward, i) in conflictCard.rewards.secondPlace"
          :key="i"
          class="reward-chip"
        >
          {{ reward.type === 'victoryPoints' ? `${reward.amount} VP` : `${reward.amount} ${reward.resourceId}` }}
        </span>
      </div>

      <div class="penalty-hint">
        <span class="penalty-label">If Morgoth wins:</span>
        <span
          v-for="(penalty, i) in conflictCard.morgothPenalty"
          :key="i"
          class="penalty-chip"
        >
          {{ penaltyLabel(penalty) }}
        </span>
      </div>
    </template>

    <div v-else class="no-conflict-msg">
      <span>No active conflict</span>
    </div>
  </div>
</template>

<style scoped>
.conflict-zone {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: #1a1008;
  border: 1px solid #5a3a1a;
  border-radius: 8px;
  color: #e8dcc8;
}

.conflict-zone.no-conflict {
  background: #12100c;
  border-color: #2c2820;
}

/* Header */
.conflict-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.conflict-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  flex: 1;
}

.tier-badge {
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background: #5a3a1a;
  color: #e8b87a;
  border-radius: 4px;
  padding: 2px 6px;
  font-weight: 600;
  white-space: nowrap;
}

.resolved-badge {
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background: #1a3a1a;
  color: #6aaa6a;
  border-radius: 4px;
  padding: 2px 6px;
  font-weight: 600;
}

.resolve-btn {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  background: #3a2010;
  border: 1px solid #8a5a2a;
  color: #e8b87a;
  border-radius: 4px;
  padding: 3px 10px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.resolve-btn:hover {
  background: #5a3a18;
  border-color: #d4ac0d;
  color: #d4ac0d;
}

/* Strength row */
.strength-row {
  display: flex;
  flex-direction: row;
  gap: 12px;
}

.strength-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border: 1px solid #3a3020;
  border-radius: 6px;
  background: #1e1a10;
  gap: 2px;
  transition: border-color 0.15s, background 0.15s;
}

.strength-card.winning {
  border-color: #d4ac0d;
  background: #28240e;
}

.strength-card.morgoth {
  border-color: #5a1a1a;
  background: #1e1010;
}

.strength-card.morgoth.winning {
  border-color: #c04040;
  background: #2e1010;
}

.side-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #8a7a6a;
  font-weight: 600;
}

.troops-value {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}

.troops-unit {
  font-size: 0.6rem;
  color: #6a5a4a;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.winning-indicator {
  font-size: 0.65rem;
  color: #d4ac0d;
  font-weight: 600;
}

.tied-indicator {
  font-size: 0.65rem;
  color: #8a7a6a;
}

.garrison-label {
  font-size: 0.6rem;
  color: #8a7a6a;
  margin-top: 6px;
}

.deploy-btns {
  display: flex;
  gap: 4px;
  margin-top: 4px;
}

.deploy-btn {
  font-size: 0.65rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid #4a6a3a;
  background: #1a2a14;
  color: #8aca6a;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.deploy-btn:hover:not(:disabled) {
  background: #2a4020;
  border-color: #8aca6a;
}

.deploy-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.deploy-btn-all {
  border-color: #3a5a2a;
}

/* Rewards hint */
.rewards-hint {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
}

.hint-label {
  color: #8a7a6a;
  font-weight: 600;
}

.hint-sep {
  color: #3c3028;
  padding: 0 2px;
}

.reward-chip {
  background: #2c2820;
  border: 1px solid #3c3028;
  border-radius: 4px;
  padding: 1px 6px;
  color: #c8b898;
}

/* Penalty hint */
.penalty-hint {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
}

.penalty-label {
  color: #8a5a5a;
  font-weight: 600;
}

.penalty-chip {
  background: #2a1414;
  border: 1px solid #5a2a2a;
  border-radius: 4px;
  padding: 1px 6px;
  color: #c87878;
}

/* No-conflict state */
.no-conflict-msg {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5a4a3a;
  font-size: 0.8rem;
  font-style: italic;
  padding: 8px 0;
}
</style>
