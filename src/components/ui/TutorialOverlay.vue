<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useTutorialStore } from '../../stores/useTutorialStore';

const tutorial = useTutorialStore();

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const targetRect = ref<Rect | null>(null);
const PADDING = 10; // px around the highlighted element

// The element that currently has the active class applied (for cleanup)
let activeEl: Element | null = null;
let activeDashboard: Element | null = null;

function applyActiveClass(target: string | null): void {
  // Remove from old target
  if (activeEl) {
    activeEl.classList.remove('tutorial-target-active');
    activeEl = null;
  }
  if (activeDashboard) {
    (activeDashboard as HTMLElement).style.zIndex = '';
    activeDashboard = null;
  }

  if (!target) {
    targetRect.value = null;
    return;
  }

  const el = document.querySelector(`[data-tutorial="${target}"]`);
  if (!el) {
    targetRect.value = null;
    return;
  }

  el.classList.add('tutorial-target-active');
  activeEl = el;

  // If the target is inside PlayerDashboard (position:fixed z-index:100),
  // bump the dashboard's z-index so children can exceed the overlay at 9998.
  const dashboard = document.querySelector('.player-dashboard');
  if (dashboard && dashboard.contains(el)) {
    (dashboard as HTMLElement).style.zIndex = '10000';
    activeDashboard = dashboard;
  }

  const rect = el.getBoundingClientRect();
  targetRect.value = {
    top: rect.top - PADDING,
    left: rect.left - PADDING,
    width: rect.width + PADDING * 2,
    height: rect.height + PADDING * 2,
  };
}

function updateRect(): void {
  const target = tutorial.currentStep?.target ?? null;
  if (!target || !activeEl) return;
  const el = activeEl;
  const rect = el.getBoundingClientRect();
  targetRect.value = {
    top: rect.top - PADDING,
    left: rect.left - PADDING,
    width: rect.width + PADDING * 2,
    height: rect.height + PADDING * 2,
  };
}

watch(
  () => [tutorial.isActive, tutorial.currentStepIndex] as const,
  ([active]) => {
    if (!active) {
      applyActiveClass(null);
      return;
    }
    nextTick(() => {
      applyActiveClass(tutorial.currentStep?.target ?? null);
    });
  },
  { immediate: true }
);

onMounted(() => {
  window.addEventListener('resize', updateRect);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateRect);
  applyActiveClass(null);
});

// ---------------------------------------------------------------------------
// Spotlight style
// ---------------------------------------------------------------------------
const spotlightStyle = computed(() => {
  const r = targetRect.value;
  if (!r) return {};
  return {
    position: 'fixed' as const,
    top: `${r.top}px`,
    left: `${r.left}px`,
    width: `${r.width}px`,
    height: `${r.height}px`,
    borderRadius: '8px',
    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.72)',
    pointerEvents: 'none' as const,
    zIndex: 9999,
  };
});

// ---------------------------------------------------------------------------
// Dialog positioning
// ---------------------------------------------------------------------------
const DIALOG_WIDTH = 320;
const DIALOG_GAP = 16;

const dialogStyle = computed(() => {
  const r = targetRect.value;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Centered for steps without a target
  if (!r) {
    return {
      position: 'fixed' as const,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: `${DIALOG_WIDTH}px`,
      zIndex: 10001,
    };
  }

  const step = tutorial.currentStep;
  const prefer = step?.dialogPosition ?? 'auto';

  // Try preferred position, fallback to auto
  const spaceBelow = vh - (r.top + r.height);
  const spaceAbove = r.top;
  const centerX = r.left + r.width / 2;

  let top: number;
  let left: number;

  const placedBelow = () => {
    top = r.top + r.height + DIALOG_GAP;
    left = Math.max(8, Math.min(vw - DIALOG_WIDTH - 8, centerX - DIALOG_WIDTH / 2));
  };
  const placedAbove = () => {
    // estimate dialog height ~180px
    top = r.top - 180 - DIALOG_GAP;
    left = Math.max(8, Math.min(vw - DIALOG_WIDTH - 8, centerX - DIALOG_WIDTH / 2));
  };
  const placedLeft = () => {
    top = Math.max(8, r.top + r.height / 2 - 90);
    left = Math.max(8, r.left - DIALOG_WIDTH - DIALOG_GAP);
  };

  if (prefer === 'bottom' || (prefer === 'auto' && spaceBelow >= 200)) {
    placedBelow();
  } else if (prefer === 'top' || (prefer === 'auto' && spaceAbove >= 200)) {
    placedAbove();
  } else if (prefer === 'left') {
    placedLeft();
  } else {
    // default: below if room, else above
    if (spaceBelow >= spaceAbove) {
      placedBelow();
    } else {
      placedAbove();
    }
  }

  return {
    position: 'fixed' as const,
    top: `${Math.max(8, top!)}px`,
    left: `${left!}px`,
    width: `${DIALOG_WIDTH}px`,
    zIndex: 10001,
  };
});
</script>

<template>
  <Teleport to="body">
    <div v-if="tutorial.isActive" class="tutorial-root">
      <!-- Blocking overlay (prevents clicking non-target elements) -->
      <div class="tutorial-backdrop" />

      <!-- Spotlight cutout (decorative, pointer-events: none) -->
      <div v-if="targetRect" class="tutorial-spotlight" :style="spotlightStyle" />

      <!-- Dialog -->
      <div class="tutorial-dialog" :style="dialogStyle">
        <div class="tutorial-dialog-inner">
          <p class="tutorial-step-counter">
            Step {{ tutorial.currentStepIndex + 1 }} of {{ tutorial.steps.length }}
          </p>
          <h4 class="tutorial-title">{{ tutorial.currentStep.title }}</h4>
          <p class="tutorial-body">{{ tutorial.currentStep.body }}</p>

          <p v-if="tutorial.currentStep.advanceOnAction" class="tutorial-hint">
            Go ahead — try it!
          </p>

          <div class="tutorial-actions">
            <button class="tutorial-skip" @click="tutorial.skipTutorial()">
              Skip tutorial
            </button>
            <button
              v-if="!tutorial.currentStep.advanceOnAction"
              class="tutorial-next"
              @click="tutorial.nextStep()"
            >
              {{ tutorial.isLastStep ? 'Finish' : 'Next' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.tutorial-root {
  position: fixed;
  inset: 0;
  z-index: 9998;
  pointer-events: none;
}

.tutorial-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9998;
  pointer-events: all;
  background: transparent;
}

.tutorial-spotlight {
  pointer-events: none;
}

.tutorial-dialog {
  pointer-events: all;
}

.tutorial-dialog-inner {
  background: #1e1a14;
  border: 1px solid #5a4a3a;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-family: 'Georgia', serif;
  color: #e8dcc8;
}

.tutorial-step-counter {
  margin: 0;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #8a7a6a;
  font-weight: 600;
}

.tutorial-title {
  margin: 0;
  font-size: 1rem;
  color: #d4ac0d;
  font-weight: 700;
}

.tutorial-body {
  margin: 0;
  font-size: 0.82rem;
  line-height: 1.55;
  color: #c8b89a;
}

.tutorial-hint {
  margin: 0;
  font-size: 0.75rem;
  font-style: italic;
  color: #d4ac0d;
}

.tutorial-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.tutorial-skip {
  background: none;
  border: none;
  color: #5a4a3a;
  font-size: 0.72rem;
  cursor: pointer;
  padding: 4px 0;
  font-family: inherit;
  transition: color 0.15s;
}

.tutorial-skip:hover {
  color: #8a7a6a;
}

.tutorial-next {
  padding: 7px 18px;
  background: #2c2820;
  border: 1px solid #d4ac0d;
  border-radius: 6px;
  color: #d4ac0d;
  font-size: 0.78rem;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}

.tutorial-next:hover {
  background: #3a3010;
}
</style>
