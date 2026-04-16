<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '../../stores/useGameStore';
import { CARD_REGISTRY } from '../../game-engine/data/cards';
import { RESERVE_CARD_IDS } from '../../game-engine/data/marketDeck';
import PlayingCard from '../ui/PlayingCard.vue';

const store = useGameStore();

const humanPlayer = computed(() => {
  const state = store.gameState;
  if (!state) return null;
  return Object.values(state.players).find((p) => !p.isAutomata) ?? null;
});

const visibleCards = computed(() => {
  const ids = store.gameState?.market.visibleCards ?? [];
  return ids.map((id) => CARD_REGISTRY[id]).filter((c): c is NonNullable<typeof c> => c !== undefined);
});

const reserveCards = computed(() =>
  RESERVE_CARD_IDS.map((id) => CARD_REGISTRY[id]).filter((c): c is NonNullable<typeof c> => c !== undefined)
);

function buy(cardId: string, isReserve: boolean): void {
  const player = humanPlayer.value;
  if (!player) return;
  store.sendAction({ type: 'BUY_CARD', playerId: player.id, cardId, isReserve });
}
</script>

<template>
  <div class="market-row" data-tutorial="market-section">
    <div class="market-group">
      <h3 class="market-label">Market</h3>
      <div class="card-row" data-tutorial="market-cards">
        <PlayingCard
          v-for="card in visibleCards"
          :key="card.id"
          :card="card"
          @click="buy(card.id, false)"
        />
        <p v-if="visibleCards.length === 0" class="empty-row">Market deck exhausted</p>
      </div>
    </div>

    <div class="market-divider" />

    <div class="market-group">
      <h3 class="market-label">Reserve</h3>
      <div class="card-row">
        <PlayingCard
          v-for="card in reserveCards"
          :key="card.id"
          :card="card"
          @click="buy(card.id, true)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.market-row {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 16px;
  padding: 12px 16px;
  background: #0e0d0a;
  border-bottom: 1px solid #2c2820;
}

.market-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.market-label {
  margin: 0;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #8a7a6a;
  font-weight: 600;
}

.card-row {
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: flex-start;
  flex-wrap: nowrap;
}

.empty-row {
  font-size: 0.75rem;
  color: #5a4a3a;
  margin: 0;
  align-self: center;
}

.market-divider {
  width: 1px;
  background: #2c2820;
  align-self: stretch;
}
</style>
