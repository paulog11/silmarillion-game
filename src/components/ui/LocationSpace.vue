<script setup lang="ts">
import { computed, ref } from 'vue';
import type { LocationState } from '../../game-engine/types';
import type { LocationDefinition } from '../../game-engine/data/locations';
import type { LocationIconType } from '../../game-engine/types';

const props = defineProps<{
  location: LocationState;
  definition: LocationDefinition;
  isActive: boolean;
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

function occupantColor(occupantId: string | null): string {
  if (!occupantId) return '#2c2a24';
  if (occupantId === 'morgoth') return '#7b1a1a';
  return '#1a3f7b';
}

const costText = computed(() => {
  if (!props.definition.cost) return 'Free';
  return `${props.definition.cost.amount} ${props.definition.cost.resource}`;
});

const locationRef = ref<HTMLElement | null>(null);
const showTooltip = ref(false);

const tooltipStyle = computed(() => {
  if (!locationRef.value) return {};
  const rect = locationRef.value.getBoundingClientRect();
  return {
    left: `${rect.left + rect.width / 2}px`,
    bottom: `${window.innerHeight - rect.top + 10}px`,
  };
});
</script>

<template>
  <div
    ref="locationRef"
    class="location-space"
    :class="{ 'is-active': props.isActive }"
    :style="{ backgroundColor: occupantColor(props.location.occupantId) }"
    @click="emit('click')"
    @mouseenter="showTooltip = true"
    @mouseleave="showTooltip = false"
  >
    <span class="location-icon">{{ ICON_LABEL[definition.requiredIcon] }}</span>
    <span class="location-name">{{ definition.name }}</span>
    <span v-if="props.location.occupantId" class="location-occupant">
      {{ props.location.occupantId }}
    </span>
  </div>

  <Teleport to="body">
    <div v-if="showTooltip" class="location-tooltip" :style="tooltipStyle">
      <div class="tooltip-title">{{ definition.name }}</div>
      <div class="tooltip-line"><span class="tooltip-label">Requires</span> {{ definition.requiredIcon }}</div>
      <div class="tooltip-line"><span class="tooltip-label">Cost</span> {{ costText }}</div>
      <div class="tooltip-line"><span class="tooltip-label">Reward</span> {{ definition.rewardText }}</div>
      <div v-if="definition.isNeighborToMorgoth" class="tooltip-frontline">⚔ Front line</div>
    </div>
  </Teleport>
</template>

<style scoped>
.location-space {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 2px solid #5a4a3a;
  color: #e8dcc8;
  cursor: pointer;
  user-select: none;
  text-align: center;
  gap: 2px;
  transition: border-color 0.15s, box-shadow 0.15s;
  box-sizing: border-box;
  padding: 6px;
}

.location-space.is-active {
  border-color: #d4ac0d;
  box-shadow: 0 0 8px rgba(212, 172, 13, 0.6);
}

.location-icon {
  font-size: 1.25rem;
  line-height: 1;
}

.location-name {
  font-size: 0.5rem;
  font-weight: 600;
  line-height: 1.2;
  word-break: break-word;
  hyphens: auto;
}

.location-occupant {
  font-size: 0.45rem;
  opacity: 0.8;
  text-transform: capitalize;
}
</style>

<style>
.location-tooltip {
  position: fixed;
  transform: translateX(-50%);
  background: #1a1612;
  border: 1px solid #5a4a3a;
  border-radius: 6px;
  padding: 8px 10px;
  width: 170px;
  font-size: 0.65rem;
  color: #e8dcc8;
  text-align: left;
  z-index: 9999;
  pointer-events: none;
  white-space: normal;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
  font-family: 'Georgia', serif;
}

.location-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: #5a4a3a;
}

.location-tooltip .tooltip-title {
  font-weight: 700;
  font-size: 0.7rem;
  color: #d4ac0d;
  margin-bottom: 5px;
  border-bottom: 1px solid #3a2e24;
  padding-bottom: 4px;
}

.location-tooltip .tooltip-line {
  margin-bottom: 3px;
  line-height: 1.4;
}

.location-tooltip .tooltip-label {
  font-weight: 600;
  color: #a89070;
  margin-right: 4px;
}

.location-tooltip .tooltip-frontline {
  margin-top: 5px;
  color: #c45a5a;
  font-weight: 600;
}
</style>
