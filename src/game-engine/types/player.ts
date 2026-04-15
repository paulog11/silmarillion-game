import { FactionId, InfluenceTrackId, ResourceId } from './primitives';

export interface DeckState {
  drawPile: string[];
  hand: string[];
  discardPile: string[];
  inPlay: string[];
}

export interface PlayerState {
  id: string;
  isAutomata: boolean;
  faction: FactionId;
  resources: Record<ResourceId, number>;
  influence: Record<InfluenceTrackId, number>;
  victoryPoints: number;
  agentsAvailable: number;
  agentsTotal: number;
  garrison: number;
  deployedTroops: number;
  deck: DeckState;
}
