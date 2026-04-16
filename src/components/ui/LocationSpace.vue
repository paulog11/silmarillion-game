<script setup lang="ts">
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
</script>

<template>
  <div
    class="location-space"
    :class="{ 'is-active': props.isActive }"
    :style="{ backgroundColor: occupantColor(props.location.occupantId) }"
    @click="emit('click')"
  >
    <span class="location-icon" :title="definition.requiredIcon">
      {{ ICON_LABEL[definition.requiredIcon] }}
    </span>
    <span class="location-name">{{ definition.name }}</span>
    <span v-if="props.location.occupantId" class="location-occupant">
      {{ props.location.occupantId }}
    </span>
  </div>
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
