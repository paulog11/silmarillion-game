<script setup lang="ts">
import { nextTick, onMounted } from 'vue';
import { useGameStore } from './stores/useGameStore';
import { useTutorialStore } from './stores/useTutorialStore';
import AutomataPanel from './components/automata/AutomataPanel.vue';
import ConflictZone from './components/board/ConflictZone.vue';
import GameBoard from './components/board/GameBoard.vue';
import MarketRow from './components/board/MarketRow.vue';
import PlayerDashboard from './components/player/PlayerDashboard.vue';
import TutorialOverlay from './components/ui/TutorialOverlay.vue';

const store = useGameStore();
const tutorial = useTutorialStore();

onMounted(() => {
  store.initGame();
  if (!localStorage.getItem('tutorialCompleted')) {
    nextTick(() => tutorial.startTutorial());
  }
});
</script>

<template>
  <div v-if="store.gameState" class="app-layout">
    <!-- Tutorial overlay (Teleports to body, sits above everything) -->
    <TutorialOverlay />

    <!-- Header: Morgoth status + active conflict -->
    <header class="app-header">
      <AutomataPanel />
      <ConflictZone />
      <button class="tutorial-help-btn" title="Replay tutorial" @click="tutorial.startTutorial()">?</button>
    </header>

    <!-- Body: board left, market right -->
    <div class="app-body">
      <section class="board-area">
        <GameBoard />
      </section>
      <aside class="market-area">
        <MarketRow />
      </aside>
    </div>

    <!-- Footer: player hand anchored to bottom (PlayerDashboard is position:fixed) -->
    <PlayerDashboard />
  </div>

  <div v-else class="loading-screen">
    <p class="loading-text">Summoning the First Age…</p>
  </div>
</template>

<style>
/* Global reset */
*, *::before, *::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: #0e0d0a;
  color: #e8dcc8;
  font-family: 'Georgia', serif;
}

/* Tutorial: lifts the targeted element above the blocking overlay */
.tutorial-target-active {
  position: relative !important;
  z-index: 10001 !important;
  pointer-events: all !important;
  outline: 2px solid #d4ac0d;
  outline-offset: 4px;
  border-radius: 6px;
}
</style>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  /* Leave space for the fixed PlayerDashboard at the bottom */
  padding-bottom: 180px;
}

/* Header */
.app-header {
  display: flex;
  flex-direction: row;
  gap: 16px;
  padding: 16px;
  align-items: flex-start;
  border-bottom: 1px solid #2c2820;
}

.app-header > :first-child {
  flex: 0 0 auto;
}

.app-header > :last-child {
  flex: 1;
}

/* Body */
.app-body {
  display: flex;
  flex-direction: row;
  flex: 1;
  gap: 0;
}

.board-area {
  flex: 1;
  border-right: 1px solid #2c2820;
  overflow-y: auto;
}

.market-area {
  flex: 0 0 auto;
  overflow-y: auto;
}

/* Tutorial help button */
.tutorial-help-btn {
  margin-left: auto;
  align-self: flex-start;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid #5a4a3a;
  background: #2c2820;
  color: #8a7a6a;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
  flex-shrink: 0;
}

.tutorial-help-btn:hover {
  border-color: #d4ac0d;
  color: #d4ac0d;
}

/* Loading */
.loading-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.loading-text {
  font-size: 1.1rem;
  color: #5a4a3a;
  font-style: italic;
}
</style>
