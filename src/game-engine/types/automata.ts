export interface AutomataCard {
  id: string;
  title: string;
  locationPriorities: string[];
  troopsMustered: number;
  specialEffect?: string;
}

export interface AutomataState {
  deck: AutomataCard[];
  discard: AutomataCard[];
  revealedCard: AutomataCard | null;
  garrison: number;
  deployedTroops: number;
}
