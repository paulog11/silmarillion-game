<script setup lang="ts">
import { computed, ref } from 'vue';
import { useGameStore } from '../../stores/useGameStore';
import { LOCATION_REGISTRY } from '../../game-engine/data/locations';
import { CARD_REGISTRY } from '../../game-engine/data/cards';
import LocationSpace from '../ui/LocationSpace.vue';

const store = useGameStore();

const humanPlayer = computed(() => {
  const state = store.gameState;
  if (!state) return null;
  return Object.values(state.players).find((p) => !p.isAutomata) ?? null;
});

// Cards currently in the human player's hand, for the card selector.
const handCards = computed(() => {
  const player = humanPlayer.value;
  if (!player) return [];
  return player.deck.hand
    .map((id) => CARD_REGISTRY[id])
    .filter((c): c is NonNullable<typeof c> => c !== undefined);
});

// Basic selected-card state: the ID of the card the player intends to play.
const selectedCardId = ref<string | null>(null);

const selectedCard = computed(() =>
  selectedCardId.value ? CARD_REGISTRY[selectedCardId.value] : null
);

const locations = computed(() => Object.values(LOCATION_REGISTRY));

function locationState(id: string) {
  return store.gameState?.locations[id] ?? { id, occupantId: null };
}

function isActiveLocation(id: string): boolean {
  if (!selectedCard.value) return false;
  const def = LOCATION_REGISTRY[id];
  return selectedCard.value.agentIcons.includes(def.requiredIcon);
}

function handleLocationClick(locationId: string): void {
  const player = humanPlayer.value;
  if (!player || !selectedCardId.value) return;
  store.sendAction({
    type: 'PLAY_AGENT',
    playerId: player.id,
    locationId,
    cardId: selectedCardId.value,
  });
  selectedCardId.value = null;
}
</script>

<template>
  <div class="game-board">
    <!-- Card selector -->
    <div class="card-selector">
      <span class="selector-label">Play card:</span>
      <div class="selector-cards">
        <button
          v-for="card in handCards"
          :key="card.id"
          class="selector-btn"
          :class="{ selected: selectedCardId === card.id }"
          @click="selectedCardId = selectedCardId === card.id ? null : card.id"
        >
          {{ card.title }}
        </button>
        <span v-if="handCards.length === 0" class="no-cards">No cards in hand</span>
      </div>
      <span v-if="selectedCard" class="selector-hint">
        Click a highlighted location to place
      </span>
    </div>

    <!-- Location grid -->
    <div class="locations-grid">
      <LocationSpace
        v-for="def in locations"
        :key="def.id"
        :definition="def"
        :location="locationState(def.id)"
        :is-active="isActiveLocation(def.id)"
        @click="handleLocationClick(def.id)"
      />
    </div>
  </div>
</template>

<style scoped>
.game-board {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: #16130f;
}

/* Card selector */
.card-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.selector-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #8a7a6a;
  font-weight: 600;
  white-space: nowrap;
}

.selector-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.selector-btn {
  padding: 4px 10px;
  background: #2c2820;
  border: 1px solid #5a4a3a;
  border-radius: 4px;
  color: #e8dcc8;
  font-size: 0.72rem;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s;
}

.selector-btn:hover {
  background: #3c3028;
  border-color: #8a7a6a;
}

.selector-btn.selected {
  background: #3a3010;
  border-color: #d4ac0d;
  color: #d4ac0d;
}

.selector-hint {
  font-size: 0.7rem;
  color: #d4ac0d;
  font-style: italic;
}

.no-cards {
  font-size: 0.72rem;
  color: #5a4a3a;
}

/* Locations */
.locations-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
}
</style>
