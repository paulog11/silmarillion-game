<script setup lang="ts">
import type { ResourceId } from '../../game-engine/types';

const props = defineProps<{
  type: ResourceId;
  amount: number;
}>();

const ICON: Record<ResourceId, string> = {
  valor: '⚔️',
  lore: '📖',
  supplies: '🪙',
};

const COLOR: Record<ResourceId, string> = {
  valor: '#c0392b',
  lore: '#2980b9',
  supplies: '#d4ac0d',
};
</script>

<template>
  <div class="resource-badge" :style="{ backgroundColor: COLOR[props.type] }">
    <span class="resource-icon">{{ ICON[props.type] }}</span>
    <span class="resource-amount">{{ props.amount }}</span>
  </div>
</template>

<style scoped>
.resource-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 12px;
  color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
}

.resource-icon {
  font-size: 1rem;
  line-height: 1;
}

.resource-amount {
  min-width: 1ch;
  text-align: center;
}
</style>
