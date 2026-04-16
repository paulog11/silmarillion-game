<script setup lang="ts">
import type { CardDefinition } from '../../game-engine/data/cards';
import type { LocationIconType } from '../../game-engine/types';

defineProps<{
  card: CardDefinition;
}>();

const emit = defineEmits<{
  click: [];
}>();

const ICON_LABEL: Record<LocationIconType, string> = {
  Noble: '👑',
  Military: '⚔️',
  Lore: '📖',
  Trade: '🪙',
  Wilderness: '🌿',
};
</script>

<template>
  <div class="playing-card" @click="emit('click')">
    <div class="card-header">
      <span class="card-title">{{ card.title }}</span>
      <span v-if="card.cost > 0" class="card-cost">{{ card.cost }}</span>
    </div>

    <div class="card-icons">
      <span
        v-for="icon in card.agentIcons"
        :key="icon"
        class="card-icon"
        :title="icon"
      >{{ ICON_LABEL[icon] }}</span>
    </div>

    <div v-if="card.troopsMustered > 0" class="card-troops">
      ⚔ +{{ card.troopsMustered }}
    </div>
  </div>
</template>

<style scoped>
.playing-card {
  display: flex;
  flex-direction: column;
  width: 100px;
  height: 140px;
  border: 1px solid #5a4a3a;
  border-radius: 8px;
  padding: 8px;
  background: #1e1a14;
  color: #e8dcc8;
  cursor: pointer;
  user-select: none;
  transition: transform 0.1s, box-shadow 0.1s;
  box-sizing: border-box;
}

.playing-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 4px;
}

.card-title {
  font-size: 0.65rem;
  font-weight: 700;
  line-height: 1.2;
  flex: 1;
}

.card-cost {
  font-size: 0.75rem;
  font-weight: 700;
  background: #d4ac0d;
  color: #1e1a14;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-icons {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
  flex: 1;
  align-items: center;
  margin-top: 8px;
}

.card-icon {
  font-size: 1.25rem;
  line-height: 1;
}

.card-troops {
  font-size: 0.65rem;
  color: #c0392b;
  text-align: right;
  font-weight: 600;
  margin-top: 4px;
}
</style>
