<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useGameStore } from './stores/useGameStore';
import { executeAutomataTurn } from './game-engine/automataLogic';
import { CARD_REGISTRY } from './game-engine/data/cards';
import { LOCATION_REGISTRY } from './game-engine/data/locations';

const store = useGameStore();

onMounted(() => {
  store.initGame();
});

const state = computed(() => store.gameState);
const human = computed(() => {
  if (!state.value) return null;
  return Object.values(state.value.players).find((p) => !p.isAutomata) ?? null;
});
const morgoth = computed(() => {
  if (!state.value) return null;
  return Object.values(state.value.players).find((p) => p.isAutomata) ?? null;
});
const locations = computed(() => (state.value ? Object.values(state.value.locations) : []));

function playAgent(locationId: string) {
  if (!human.value) return;
  const requiredIcon = LOCATION_REGISTRY[locationId]?.requiredIcon;
  const cardId = human.value.deck.hand.find((id) => {
    const def = CARD_REGISTRY[id];
    return def && (!requiredIcon || def.agentIcons.includes(requiredIcon));
  });
  if (!cardId) {
    console.warn(`No playable card in hand for location "${locationId}".`);
    return;
  }
  store.sendAction({
    type: 'PLAY_AGENT',
    playerId: human.value.id,
    locationId,
    cardId,
  });
}

function passTurn() {
  if (!human.value) return;
  store.sendAction({ type: 'PASS_TURN', playerId: human.value.id });
}

function runMorgothTurn() {
  if (!state.value) return;
  const next = executeAutomataTurn(state.value);
  // Bypass the engine for the automata turn — push state directly via a
  // PASS_TURN so the store callback fires, or update via a dedicated action.
  // For now we directly update through a small adapter until a dedicated
  // AUTOMATA_TURN action is added to the engine.
  store.setStateDirectly(next);
}
</script>

<template>
  <main v-if="state" style="font-family: monospace; padding: 2rem; max-width: 900px; margin: auto;">
    <h1>Silmarillion: War of the First Age</h1>
    <p><strong>Round:</strong> {{ state.round }} &nbsp;|&nbsp; <strong>Phase:</strong> {{ state.phase }} &nbsp;|&nbsp; <strong>Active Player:</strong> {{ state.activePlayerId }}</p>

    <hr />

    <section v-if="human">
      <h2>Your Forces ({{ human.faction }})</h2>
      <ul>
        <li>Agents available: {{ human.agentsAvailable }} / {{ human.agentsTotal }}</li>
        <li>Victory Points: {{ human.victoryPoints }}</li>
        <li>Garrison: {{ human.garrison }} &nbsp;|&nbsp; Deployed: {{ human.deployedTroops }}</li>
        <li>Resources — Valor: {{ human.resources.valor }}, Lore: {{ human.resources.lore }}, Supplies: {{ human.resources.supplies }}</li>
      </ul>
    </section>

    <section v-if="morgoth" style="margin-top: 1rem;">
      <h2>Morgoth (Automata)</h2>
      <ul>
        <li>Garrison: {{ morgoth.garrison }} &nbsp;|&nbsp; Deployed: {{ morgoth.deployedTroops }}</li>
        <li>Automata deck: {{ state.automata.deck.length }} cards &nbsp;|&nbsp; Discard: {{ state.automata.discard.length }}</li>
        <li v-if="state.automata.revealedCard">Last card played: <em>{{ state.automata.revealedCard.title }}</em></li>
      </ul>
    </section>

    <hr />

    <section>
      <h2>Locations</h2>
      <table style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr>
            <th style="text-align:left; padding: 4px 12px;">Location</th>
            <th style="text-align:left; padding: 4px 12px;">Occupant</th>
            <th style="padding: 4px 12px;"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="loc in locations" :key="loc.id" style="border-top: 1px solid #ccc;">
            <td style="padding: 4px 12px;">{{ loc.id }}</td>
            <td style="padding: 4px 12px;">{{ loc.occupantId ?? '—' }}</td>
            <td style="padding: 4px 12px;">
              <button
                v-if="!loc.occupantId"
                @click="playAgent(loc.id)"
                :disabled="!human || human.agentsAvailable === 0"
              >
                Place Agent
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <hr />

    <section style="display: flex; gap: 1rem; margin-top: 1rem;">
      <button @click="passTurn">Pass Turn</button>
      <button @click="runMorgothTurn">Run Morgoth Turn</button>
    </section>

    <hr />

    <section>
      <h2>History</h2>
      <ul style="font-size: 0.85rem;">
        <li v-for="(entry, i) in [...state.history].reverse()" :key="i">{{ entry }}</li>
      </ul>
    </section>
  </main>

  <main v-else style="font-family: monospace; padding: 2rem;">
    <p>Initialising engine…</p>
  </main>
</template>
