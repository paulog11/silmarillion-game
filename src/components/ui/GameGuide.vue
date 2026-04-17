<script setup lang="ts">
import { ref } from 'vue';
import { CARD_REGISTRY } from '../../game-engine/data/cards';
import { LOCATION_REGISTRY } from '../../game-engine/data/locations';
import type { LocationIconType } from '../../game-engine/types';

defineProps<{ open: boolean }>();
const emit = defineEmits<{ close: [] }>();

type Tab = 'icons' | 'locations' | 'cards';
const activeTab = ref<Tab>('icons');

// ---------------------------------------------------------------------------
// Icon legend data
// ---------------------------------------------------------------------------
const LOCATION_ICONS: { icon: string; name: LocationIconType; desc: string }[] = [
  { icon: '👑', name: 'Noble',     desc: 'Councils and courts — played to Noble locations.' },
  { icon: '⚔️', name: 'Military',  desc: 'Fortresses and war-hosts — played to Military locations.' },
  { icon: '📖', name: 'Lore',      desc: 'Hidden sanctuaries and libraries — played to Lore locations.' },
  { icon: '🪙', name: 'Trade',     desc: 'Harbours and merchants — played to Trade locations.' },
  { icon: '🌿', name: 'Wilderness',desc: 'Forests, mountains, and open wilds — played to Wilderness locations.' },
];

const RESOURCE_ICONS: { icon: string; name: string; desc: string }[] = [
  { icon: '⚔️', name: 'Valor',    desc: 'Combat power. Spent to enter deadly locations and to commit troops.' },
  { icon: '📖', name: 'Lore',     desc: 'Knowledge. Spent at Gondolin and Nargothrond for card draw.' },
  { icon: '🪙', name: 'Supplies', desc: 'Economy. The most common placement cost; fuels expansion.' },
];

const OTHER_ICONS: { icon: string; name: string; desc: string }[] = [
  { icon: '🛡', name: 'Garrison',        desc: 'Troops held in reserve. Committed to battle at Gates of Angband.' },
  { icon: '🗡', name: 'Deployed Troops', desc: 'Garrison committed to the active conflict. Determines place at resolution.' },
  { icon: '⭐', name: 'Victory Points',  desc: 'Your score. First to reach the target VP wins.' },
];

// ---------------------------------------------------------------------------
// Locations data (rewards from locationActions.ts)
// ---------------------------------------------------------------------------
const LOCATION_REWARDS: Record<string, string> = {
  barad_eithel:  '+2 garrison, +1 Valor',
  gondolin:      'Spend 2 Lore → draw 2 cards',
  himring:       '+1 garrison, +1 Fëanor influence',
  the_havens:    'Spend 1 Valor → +3 Supplies',
  angband_gates: 'All garrison → deployed troops',
  dorthonion:    '—',
  nargothrond:   '—',
  doriath:       '—',
  west_beleriand:'—',
};

const ICON_LABEL: Record<LocationIconType, string> = {
  Noble:     '👑',
  Military:  '⚔️',
  Lore:      '📖',
  Trade:     '🪙',
  Wilderness:'🌿',
};

const locations = Object.values(LOCATION_REGISTRY);

// ---------------------------------------------------------------------------
// Cards data — deduplicated by title, preserving first occurrence
// ---------------------------------------------------------------------------
const STARTER_TITLES = new Set([
  'Elven Scout', 'Envoy', 'Sindarin Militia', 'Call to Arms', 'Hidden Paths',
]);
const RESERVE_IDS = new Set(['wandering-minstrel', 'sindarin-archer']);

interface CardRow {
  title: string;
  agentIcons: LocationIconType[];
  purchasingPower: number;
  troopsMustered: number;
  cost: number;
  pool: 'starter' | 'market' | 'reserve';
  copies: number;
}

function buildCardRows(): CardRow[] {
  const seen = new Map<string, CardRow>();
  for (const card of Object.values(CARD_REGISTRY)) {
    const pool: CardRow['pool'] = RESERVE_IDS.has(card.id)
      ? 'reserve'
      : STARTER_TITLES.has(card.title)
        ? 'starter'
        : 'market';

    if (seen.has(card.title)) {
      seen.get(card.title)!.copies++;
    } else {
      seen.set(card.title, {
        title: card.title,
        agentIcons: card.agentIcons,
        purchasingPower: card.purchasingPower,
        troopsMustered: card.troopsMustered,
        cost: card.cost,
        pool,
        copies: 1,
      });
    }
  }
  // Sort: starter first, then market, then reserve
  const order: CardRow['pool'][] = ['starter', 'market', 'reserve'];
  return [...seen.values()].sort((a, b) => order.indexOf(a.pool) - order.indexOf(b.pool));
}

const cardRows = buildCardRows();
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="guide-backdrop" @click.self="emit('close')">
      <div class="guide-modal" role="dialog" aria-modal="true" aria-label="Game Guide">
        <!-- Header -->
        <div class="guide-header">
          <h2 class="guide-title">Game Guide</h2>
          <button class="guide-close" aria-label="Close" @click="emit('close')">✕</button>
        </div>

        <!-- Tab bar -->
        <div class="guide-tabs" role="tablist">
          <button
            role="tab"
            :class="['guide-tab', { active: activeTab === 'icons' }]"
            @click="activeTab = 'icons'"
          >Icons</button>
          <button
            role="tab"
            :class="['guide-tab', { active: activeTab === 'locations' }]"
            @click="activeTab = 'locations'"
          >Locations</button>
          <button
            role="tab"
            :class="['guide-tab', { active: activeTab === 'cards' }]"
            @click="activeTab = 'cards'"
          >Cards</button>
        </div>

        <!-- Content -->
        <div class="guide-content">
          <!-- ICONS TAB -->
          <div v-if="activeTab === 'icons'">
            <section class="guide-section">
              <h3 class="guide-section-title">Location Icons</h3>
              <p class="guide-section-note">A card can only be played to a location whose icon appears on the card.</p>
              <table class="guide-table">
                <tbody>
                  <tr v-for="row in LOCATION_ICONS" :key="row.name">
                    <td class="icon-cell">{{ row.icon }}</td>
                    <td class="name-cell">{{ row.name }}</td>
                    <td class="desc-cell">{{ row.desc }}</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section class="guide-section">
              <h3 class="guide-section-title">Resource Icons</h3>
              <p class="guide-section-note">Resources appear as coloured badges on your dashboard and are spent to place agents or activate rewards.</p>
              <table class="guide-table">
                <tbody>
                  <tr v-for="row in RESOURCE_ICONS" :key="row.name">
                    <td class="icon-cell">{{ row.icon }}</td>
                    <td class="name-cell">{{ row.name }}</td>
                    <td class="desc-cell">{{ row.desc }}</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section class="guide-section">
              <h3 class="guide-section-title">Other Symbols</h3>
              <table class="guide-table">
                <tbody>
                  <tr v-for="row in OTHER_ICONS" :key="row.name">
                    <td class="icon-cell">{{ row.icon }}</td>
                    <td class="name-cell">{{ row.name }}</td>
                    <td class="desc-cell">{{ row.desc }}</td>
                  </tr>
                </tbody>
              </table>
            </section>
          </div>

          <!-- LOCATIONS TAB -->
          <div v-if="activeTab === 'locations'">
            <section class="guide-section">
              <p class="guide-section-note">Place an agent here by playing a card with the matching icon. Costs are paid from your resources <em>before</em> the reward is granted.</p>
            </section>
            <div class="location-list">
              <div v-for="loc in locations" :key="loc.id" class="location-row">
                <div class="location-row-header">
                  <span class="location-icon-badge">{{ ICON_LABEL[loc.requiredIcon] }}</span>
                  <span class="location-name">{{ loc.name }}</span>
                  <span v-if="loc.isNeighborToMorgoth" class="morgoth-tag" title="Adjacent to Angband">☠ Front Line</span>
                </div>
                <div class="location-detail">
                  <span class="detail-label">Requires</span>
                  <span>{{ loc.requiredIcon }}</span>
                </div>
                <div class="location-detail">
                  <span class="detail-label">Placement cost</span>
                  <span>{{ loc.cost ? `${loc.cost.amount} ${loc.cost.resource}` : 'Free' }}</span>
                </div>
                <div class="location-detail">
                  <span class="detail-label">Reward</span>
                  <span>{{ LOCATION_REWARDS[loc.id] }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- CARDS TAB -->
          <div v-if="activeTab === 'cards'">
            <section class="guide-section">
              <p class="guide-section-note">
                Cards grant <strong>agent icons</strong> (where you can place), <strong>purchasing power</strong> (buying cards), and <strong>troops</strong> (conflict strength).
              </p>
            </section>

            <div class="pool-group">
              <h3 class="pool-label">Starter Deck</h3>
              <div
                v-for="card in cardRows.filter(c => c.pool === 'starter')"
                :key="card.title"
                class="card-row"
              >
                <div class="card-row-header">
                  <span class="card-title-text">{{ card.title }}</span>
                  <span v-if="card.copies > 1" class="card-copies">×{{ card.copies }}</span>
                </div>
                <div class="card-icons-row">
                  <span
                    v-for="icon in card.agentIcons"
                    :key="icon"
                    class="icon-pip"
                    :title="icon"
                  >{{ ICON_LABEL[icon] }}</span>
                </div>
                <div class="card-stats">
                  <span v-if="card.purchasingPower > 0" class="stat-chip stat-buy">+{{ card.purchasingPower }} buy</span>
                  <span v-if="card.troopsMustered > 0" class="stat-chip stat-troops">+{{ card.troopsMustered }} troops</span>
                  <span v-if="card.purchasingPower === 0 && card.troopsMustered === 0" class="stat-chip stat-neutral">Placement only</span>
                </div>
              </div>
            </div>

            <div class="pool-group">
              <h3 class="pool-label">Market Cards</h3>
              <div
                v-for="card in cardRows.filter(c => c.pool === 'market')"
                :key="card.title"
                class="card-row"
              >
                <div class="card-row-header">
                  <span class="card-title-text">{{ card.title }}</span>
                  <span class="card-cost-badge">{{ card.cost }}</span>
                </div>
                <div class="card-icons-row">
                  <span
                    v-for="icon in card.agentIcons"
                    :key="icon"
                    class="icon-pip"
                    :title="icon"
                  >{{ ICON_LABEL[icon] }}</span>
                </div>
                <div class="card-stats">
                  <span v-if="card.purchasingPower > 0" class="stat-chip stat-buy">+{{ card.purchasingPower }} buy</span>
                  <span v-if="card.troopsMustered > 0" class="stat-chip stat-troops">+{{ card.troopsMustered }} troops</span>
                  <span v-if="card.purchasingPower === 0 && card.troopsMustered === 0" class="stat-chip stat-neutral">Placement only</span>
                </div>
              </div>
            </div>

            <div class="pool-group">
              <h3 class="pool-label">Reserve Cards <span class="pool-sub">(always available)</span></h3>
              <div
                v-for="card in cardRows.filter(c => c.pool === 'reserve')"
                :key="card.title"
                class="card-row"
              >
                <div class="card-row-header">
                  <span class="card-title-text">{{ card.title }}</span>
                  <span class="card-cost-badge">{{ card.cost }}</span>
                </div>
                <div class="card-icons-row">
                  <span
                    v-for="icon in card.agentIcons"
                    :key="icon"
                    class="icon-pip"
                    :title="icon"
                  >{{ ICON_LABEL[icon] }}</span>
                </div>
                <div class="card-stats">
                  <span v-if="card.purchasingPower > 0" class="stat-chip stat-buy">+{{ card.purchasingPower }} buy</span>
                  <span v-if="card.troopsMustered > 0" class="stat-chip stat-troops">+{{ card.troopsMustered }} troops</span>
                  <span v-if="card.purchasingPower === 0 && card.troopsMustered === 0" class="stat-chip stat-neutral">Placement only</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* Backdrop */
.guide-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.72);
  z-index: 9998;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

/* Modal shell */
.guide-modal {
  background: #1a1710;
  border: 1px solid #5a4a3a;
  border-radius: 12px;
  width: min(680px, 100%);
  max-height: 82vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.7);
  font-family: 'Georgia', serif;
  color: #e8dcc8;
  overflow: hidden;
}

/* Header */
.guide-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px 14px;
  border-bottom: 1px solid #2c2820;
  flex-shrink: 0;
}

.guide-title {
  margin: 0;
  font-size: 1.1rem;
  color: #d4ac0d;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.guide-close {
  background: none;
  border: none;
  color: #8a7a6a;
  font-size: 1rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: color 0.15s, background 0.15s;
  font-family: inherit;
}
.guide-close:hover {
  color: #e8dcc8;
  background: #2c2820;
}

/* Tab bar */
.guide-tabs {
  display: flex;
  gap: 0;
  padding: 12px 20px 0;
  border-bottom: 1px solid #2c2820;
  flex-shrink: 0;
}

.guide-tab {
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: #8a7a6a;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 6px 16px 10px;
  cursor: pointer;
  font-family: inherit;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  transition: color 0.15s, border-color 0.15s;
}
.guide-tab:hover {
  color: #c8b89a;
}
.guide-tab.active {
  color: #d4ac0d;
  border-bottom-color: #d4ac0d;
}

/* Scrollable content */
.guide-content {
  overflow-y: auto;
  padding: 20px;
  flex: 1;
}

/* Section */
.guide-section {
  margin-bottom: 24px;
}

.guide-section-title {
  margin: 0 0 10px;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #8a7a6a;
  font-weight: 700;
}

.guide-section-note {
  margin: 0 0 12px;
  font-size: 0.78rem;
  color: #8a7a6a;
  line-height: 1.5;
}

/* Icon table */
.guide-table {
  width: 100%;
  border-collapse: collapse;
}
.guide-table tr + tr td {
  border-top: 1px solid #2c2820;
}
.icon-cell {
  font-size: 1.3rem;
  width: 36px;
  padding: 8px 10px 8px 0;
  text-align: center;
}
.name-cell {
  font-size: 0.82rem;
  font-weight: 700;
  color: #c8b89a;
  width: 110px;
  padding: 8px 10px;
}
.desc-cell {
  font-size: 0.78rem;
  color: #8a7a6a;
  padding: 8px 0;
  line-height: 1.4;
}

/* Location list */
.location-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.location-row {
  background: #1e1a14;
  border: 1px solid #2c2820;
  border-radius: 8px;
  padding: 12px 14px;
}

.location-row-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.location-icon-badge {
  font-size: 1.2rem;
  line-height: 1;
}

.location-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: #d4ac0d;
  flex: 1;
}

.morgoth-tag {
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #c0392b;
  border: 1px solid #7b1a1a;
  border-radius: 4px;
  padding: 2px 6px;
}

.location-detail {
  display: flex;
  gap: 8px;
  font-size: 0.75rem;
  line-height: 1.6;
}

.detail-label {
  color: #5a4a3a;
  min-width: 110px;
  flex-shrink: 0;
}

/* Card list */
.pool-group {
  margin-bottom: 24px;
}

.pool-label {
  margin: 0 0 10px;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #8a7a6a;
  font-weight: 700;
}

.pool-sub {
  font-size: 0.7rem;
  text-transform: none;
  letter-spacing: 0;
  font-weight: 400;
  color: #5a4a3a;
}

.card-row {
  background: #1e1a14;
  border: 1px solid #2c2820;
  border-radius: 8px;
  padding: 10px 14px;
  margin-bottom: 6px;
}

.card-row-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.card-title-text {
  font-size: 0.88rem;
  font-weight: 700;
  color: #c8b89a;
  flex: 1;
}

.card-copies {
  font-size: 0.72rem;
  color: #5a4a3a;
}

.card-cost-badge {
  font-size: 0.72rem;
  font-weight: 700;
  background: #d4ac0d;
  color: #1e1a14;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-icons-row {
  display: flex;
  gap: 4px;
  margin-bottom: 6px;
}

.icon-pip {
  font-size: 1rem;
  line-height: 1;
}

.card-stats {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.stat-chip {
  font-size: 0.68rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
}
.stat-buy    { background: #1a3020; color: #4caf50; border: 1px solid #2d5a3a; }
.stat-troops { background: #2a1010; color: #e57373; border: 1px solid #5a2020; }
.stat-neutral { background: #1e1a14; color: #5a4a3a; border: 1px solid #2c2820; }
</style>
