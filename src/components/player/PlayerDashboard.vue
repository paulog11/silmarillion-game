<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '../../stores/useGameStore';
import { CARD_REGISTRY } from '../../game-engine/data/cards';
import ResourceBadge from '../ui/ResourceBadge.vue';
import PlayingCard from '../ui/PlayingCard.vue';

const store = useGameStore();

// Derive the human player: the first non-automata player in the state.
const humanPlayer = computed(() => {
  const state = store.gameState;
  if (!state) return null;
  return Object.values(state.players).find((p) => !p.isAutomata) ?? null;
});

const handCards = computed(() => {
  const player = humanPlayer.value;
  if (!player) return [];
  return player.deck.hand
    .map((id) => CARD_REGISTRY[id])
    .filter((card): card is NonNullable<typeof card> => card !== undefined);
});

function revealHand(): void {
  const player = humanPlayer.value;
  if (!player) return;
  store.sendAction({ type: 'REVEAL_CARDS_FOR_PURCHASE', playerId: player.id });
}
</script>

<template>
  <div v-if="humanPlayer" class="player-dashboard">
    <!-- Left: Resources + agents -->
    <section class="dashboard-section resources-section">
      <h3 class="section-label">Resources</h3>
      <div class="resource-list">
        <ResourceBadge type="valor" :amount="humanPlayer.resources.valor" />
        <ResourceBadge type="lore" :amount="humanPlayer.resources.lore" />
        <ResourceBadge type="supplies" :amount="humanPlayer.resources.supplies" />
      </div>
      <div class="agent-row">
        <span class="agent-label">Agents</span>
        <span class="agent-count">
          {{ humanPlayer.agentsAvailable }} / {{ humanPlayer.agentsTotal }}
        </span>
      </div>
      <div class="vp-row">
        <span class="vp-label">VP</span>
        <span class="vp-count">{{ humanPlayer.victoryPoints }}</span>
      </div>
    </section>

    <!-- Center: Hand -->
    <section class="dashboard-section hand-section" data-tutorial="hand-section">
      <h3 class="section-label">Hand ({{ handCards.length }})</h3>
      <div class="hand-cards">
        <PlayingCard
          v-for="card in handCards"
          :key="card.id"
          :card="card"
        />
        <p v-if="handCards.length === 0" class="empty-hand">No cards in hand</p>
      </div>
    </section>

    <!-- Right: Deck info + action button -->
    <section class="dashboard-section deck-section">
      <h3 class="section-label">Deck</h3>
      <ul class="deck-stats">
        <li>
          <span class="stat-label">Draw pile</span>
          <span class="stat-value">{{ humanPlayer.deck.drawPile.length }}</span>
        </li>
        <li>
          <span class="stat-label">Discard</span>
          <span class="stat-value">{{ humanPlayer.deck.discardPile.length }}</span>
        </li>
        <li>
          <span class="stat-label">In play</span>
          <span class="stat-value">{{ humanPlayer.deck.inPlay.length }}</span>
        </li>
      </ul>
      <div v-if="humanPlayer.currentPurchasingPower > 0" class="purchasing-power">
        Buying power: <strong>{{ humanPlayer.currentPurchasingPower }}</strong>
      </div>
      <button class="reveal-btn" data-tutorial="reveal-btn" @click="revealHand">
        Reveal Hand for Purchase
      </button>
    </section>
  </div>
</template>

<style scoped>
.player-dashboard {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 0;
  background: #12100c;
  border-top: 2px solid #5a4a3a;
  color: #e8dcc8;
  z-index: 100;
  min-height: 180px;
}

.dashboard-section {
  display: flex;
  flex-direction: column;
  padding: 12px 16px;
  gap: 8px;
  border-right: 1px solid #2c2820;
}

.dashboard-section:last-child {
  border-right: none;
}

.resources-section {
  flex: 0 0 160px;
}

.hand-section {
  flex: 1;
  overflow-x: auto;
}

.deck-section {
  flex: 0 0 180px;
}

.section-label {
  margin: 0;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #8a7a6a;
  font-weight: 600;
}

/* Resources */
.resource-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.agent-row,
.vp-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
}

.agent-label,
.vp-label {
  color: #8a7a6a;
}

.agent-count,
.vp-count {
  font-weight: 700;
}

/* Hand */
.hand-cards {
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: flex-start;
  overflow-x: auto;
  padding-bottom: 4px;
  min-height: 140px;
}

.empty-hand {
  font-size: 0.75rem;
  color: #5a4a3a;
  align-self: center;
  margin: 0;
}

/* Deck stats */
.deck-stats {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.deck-stats li {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
}

.stat-label {
  color: #8a7a6a;
}

.stat-value {
  font-weight: 700;
}

.purchasing-power {
  font-size: 0.8rem;
  color: #d4ac0d;
}

/* Button */
.reveal-btn {
  margin-top: auto;
  padding: 8px 12px;
  background: #2c2820;
  border: 1px solid #5a4a3a;
  border-radius: 6px;
  color: #e8dcc8;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  text-align: center;
}

.reveal-btn:hover {
  background: #3c3028;
  border-color: #d4ac0d;
  color: #d4ac0d;
}
</style>
