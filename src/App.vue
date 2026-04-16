<script setup lang="ts">
import { onMounted } from 'vue';
import { useGameStore } from './stores/useGameStore';
import AutomataPanel from './components/automata/AutomataPanel.vue';
import ConflictZone from './components/board/ConflictZone.vue';
import GameBoard from './components/board/GameBoard.vue';
import MarketRow from './components/board/MarketRow.vue';
import PlayerDashboard from './components/player/PlayerDashboard.vue';

const store = useGameStore();

onMounted(() => {
  store.initGame();
});
</script>

<template>
  <div v-if="store.gameState" class="app-layout">
    <!-- Header: Morgoth status + active conflict -->
    <header class="app-header">
      <AutomataPanel />
      <ConflictZone />
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
