import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export interface TutorialStep {
  id: string;
  target: string | null; // data-tutorial attribute value; null = centered dialog
  title: string;
  body: string;
  dialogPosition: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  advanceOnAction?: string; // GameAction['type'] — auto-advance when this fires
}

const STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    target: null,
    title: 'Welcome to the First Age',
    body: 'You lead the Noldor against the shadow of Morgoth. Place agents at locations to gather resources and troops, buy cards to strengthen your deck, and contest conflicts to earn victory points.',
    dialogPosition: 'auto',
  },
  {
    id: 'your-hand',
    target: 'hand-section',
    title: 'Your Hand',
    body: 'These are your cards. Each card shows icons for the location types it can be played to, and how many troops it contributes to battle.',
    dialogPosition: 'top',
  },
  {
    id: 'select-card',
    target: 'card-selector',
    title: 'Select a Card',
    body: 'Click a card name here to select it. Once selected, matching locations on the board will glow gold. Press Next when you have selected a card.',
    dialogPosition: 'bottom',
  },
  {
    id: 'place-agent',
    target: 'locations-grid',
    title: 'Place Your Agent',
    body: 'Gold-highlighted locations accept your selected card. Click one to place your agent there and immediately gain that location\'s reward — resources, troops, or card draws.',
    dialogPosition: 'bottom',
    advanceOnAction: 'PLAY_AGENT',
  },
  {
    id: 'the-market',
    target: 'market-section',
    title: 'The Market',
    body: 'Here you can buy stronger cards to add to your deck. Cards cost resources shown in the gold circle. The Reserve cards on the right are always available.',
    dialogPosition: 'left',
  },
  {
    id: 'reveal-purchase',
    target: 'reveal-btn',
    title: 'Reveal Hand for Purchase',
    body: 'Click this button to calculate your buying power from the cards remaining in your hand. This shows how much you can spend on the market this turn.',
    dialogPosition: 'top',
    advanceOnAction: 'REVEAL_CARDS_FOR_PURCHASE',
  },
  {
    id: 'buy-card',
    target: 'market-cards',
    title: 'Buy a Card',
    body: 'Click any market card you can afford (buying power ≥ card cost) to add it to your discard pile. It will cycle into your hand over future rounds.',
    dialogPosition: 'left',
    advanceOnAction: 'BUY_CARD',
  },
  {
    id: 'complete',
    target: null,
    title: 'You\'re Ready!',
    body: 'That\'s the core loop — place agents, gather resources, buy cards, muster troops, and fight Morgoth\'s forces in conflicts. Earn the most victory points to win. Good luck, and may the light of the Silmarils guide you.',
    dialogPosition: 'auto',
  },
];

export const useTutorialStore = defineStore('tutorial', () => {
  const isActive = ref(false);
  const currentStepIndex = ref(0);

  const steps = STEPS;

  const currentStep = computed(() => steps[currentStepIndex.value] ?? steps[0]);

  const isLastStep = computed(() => currentStepIndex.value >= steps.length - 1);

  function startTutorial(): void {
    currentStepIndex.value = 0;
    isActive.value = true;
  }

  function nextStep(): void {
    if (currentStepIndex.value < steps.length - 1) {
      currentStepIndex.value++;
    } else {
      completeTutorial();
    }
  }

  function completeTutorial(): void {
    isActive.value = false;
    localStorage.setItem('tutorialCompleted', '1');
  }

  function skipTutorial(): void {
    isActive.value = false;
    localStorage.setItem('tutorialCompleted', '1');
  }

  function notifyAction(actionType: string): void {
    if (!isActive.value) return;
    if (currentStep.value.advanceOnAction === actionType) {
      nextStep();
    }
  }

  return {
    isActive,
    currentStepIndex,
    steps,
    currentStep,
    isLastStep,
    startTutorial,
    nextStep,
    completeTutorial,
    skipTutorial,
    notifyAction,
  };
});
