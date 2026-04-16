<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '../../stores/useGameStore';

const store = useGameStore();

const morgoth = computed(() => {
  const state = store.gameState;
  if (!state) return null;
  return Object.values(state.players).find((p) => p.isAutomata) ?? null;
});

const automata = computed(() => store.gameState?.automata ?? null);
</script>

<template>
  <div v-if="morgoth && automata" class="automata-panel">
    <h3 class="panel-title">
      <span class="eye-icon">👁</span> Morgoth — Angband
    </h3>

    <div class="stats-row">
      <div class="stat">
        <span class="stat-label">Garrison</span>
        <span class="stat-value">{{ morgoth.garrison }}</span>
      </div>
      <div class="stat-divider" />
      <div class="stat">
        <span class="stat-label">Deployed</span>
        <span class="stat-value deployed">{{ morgoth.deployedTroops }}</span>
      </div>
      <div class="stat-divider" />
      <div class="stat">
        <span class="stat-label">Deck</span>
        <span class="stat-value">{{ automata.deck.length }}</span>
      </div>
      <div class="stat-divider" />
      <div class="stat">
        <span class="stat-label">Discard</span>
        <span class="stat-value">{{ automata.discard.length }}</span>
      </div>
    </div>

    <div v-if="automata.revealedCard" class="revealed-card">
      <span class="revealed-label">Last order:</span>
      <div class="card-body">
        <span class="card-title">{{ automata.revealedCard.title }}</span>
        <span class="card-troops">+{{ automata.revealedCard.troopsMustered }} troops</span>
        <ol class="priority-list">
          <li
            v-for="locId in automata.revealedCard.locationPriorities"
            :key="locId"
            class="priority-item"
          >{{ locId.replace(/_/g, ' ') }}</li>
        </ol>
        <p v-if="automata.revealedCard.specialEffect" class="special-effect">
          ✦ {{ automata.revealedCard.specialEffect }}
        </p>
      </div>
    </div>

    <div v-else class="no-card">
      No card revealed yet
    </div>
  </div>
</template>

<style scoped>
.automata-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 16px;
  background: #1a0d0d;
  border: 1px solid #5a1a1a;
  border-radius: 8px;
  color: #e8ccc8;
  min-width: 220px;
}

.panel-title {
  margin: 0;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #c04040;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
}

.eye-icon {
  font-size: 1rem;
}

/* Stats */
.stats-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  flex: 1;
}

.stat-label {
  font-size: 0.55rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #7a5a5a;
  font-weight: 600;
}

.stat-value {
  font-size: 1.3rem;
  font-weight: 700;
  line-height: 1;
  color: #e8ccc8;
}

.stat-value.deployed {
  color: #c04040;
}

.stat-divider {
  width: 1px;
  height: 28px;
  background: #3a1a1a;
}

/* Revealed card */
.revealed-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.revealed-label {
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #7a5a5a;
  font-weight: 600;
}

.card-body {
  background: #260d0d;
  border: 1px solid #5a1a1a;
  border-radius: 6px;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: #e8ccc8;
}

.card-troops {
  font-size: 0.72rem;
  color: #c04040;
  font-weight: 600;
}

.priority-list {
  margin: 0;
  padding-left: 16px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.priority-item {
  font-size: 0.68rem;
  color: #9a7a7a;
  text-transform: capitalize;
}

.special-effect {
  margin: 4px 0 0;
  font-size: 0.68rem;
  color: #b08070;
  font-style: italic;
}

.no-card {
  font-size: 0.72rem;
  color: #5a3a3a;
  font-style: italic;
  text-align: center;
  padding: 4px 0;
}
</style>
