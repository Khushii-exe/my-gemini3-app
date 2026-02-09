
export type CoreValue = 
  | 'Financial Growth' | 'Peace of Mind' | 'Adventure' | 'Intellectual Growth' 
  | 'Social Influence' | 'Physical Vitality' | 'Global Contribution' | 'Personal Autonomy'
  | 'Security' | 'Creative Expression' | 'Deep Connections' | 'Legacy'
  | 'Mental Resilience' | 'Family Stability' | 'Spiritual Alignment' | 'Professional Mastery'
  | 'Public Recognition' | 'Environmental Stewardship'
  | 'Security & Stability' | 'Adventure & Exploration' | 'Social Recognition & Influence' | 'Ethical Integrity' | 'Legacy & Long-Term Impact';

export interface UserInput {
  situation: string;
  decision: string;
  values: string[];
  goals?: string;
  fears?: string;
  constraints?: string;
}

export interface ReasoningArtifacts {
  decisionSummary: string;
  keyTensions: string[];
  nonNegotiables: string[];
  unclearAssumptions: string[];
  pressurePoints: string[];
}

export interface SimulationPath {
  id: string;
  label: string;
  prioritizes: string;
  offers: string;
  requires: string;
}

export interface Outcome {
  title: string;
  description: string;
  probability: number;
  emotionalImpact: 'Positive' | 'Negative' | 'Neutral';
  longTermEffect: string;
  impactScore: number;
  confidenceLevel: 'Low' | 'Medium' | 'High';
  confidenceReasoning: string;
}

export interface ValueAlignment {
  value: string;
  score: number;
  commentary: string;
}

export interface DecisionCrossroad {
  question: string;
  yesLabel: string;
  noLabel: string;
  ifYes: string;
  ifNo: string;
}

export interface RelationalImpact {
  sphere: 'Family' | 'Partners' | 'Community' | 'Colleagues';
  impact: string;
  sentiment: 'Growth' | 'Friction' | 'Neutral';
}

export interface TrajectoryNode {
  period: string;
  milestone: string;
  consequence: string;
  butterflyEffect: string;
}

export interface RegretAnalysis {
  probability: number;
  level: 'Low' | 'Moderate' | 'High' | 'Critical';
  redFlags: string[];
  preventativeAdvice: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface InactionScenario {
  summary: string;
  fiveYearFate: string;
  stagnationRisk: number; // 1-10
  missedOpportunities: string[];
  trajectory: TrajectoryNode[];
}

export interface SelfReflection {
  assumptionsMade: string[];
  sensitivityFactors: string[];
  uncertaintyConcentration: string;
  adaptationAdvice: string;
}

export interface SimulationResult {
  outcomes: {
    best: Outcome;
    worst: Outcome;
    mostLikely: Outcome;
  };
  paths?: SimulationPath[];
  crossPathObservations?: string[];
  alignment: ValueAlignment[];
  crossroads: DecisionCrossroad[];
  relationalImpact: RelationalImpact[];
  trajectory: TrajectoryNode[];
  regretAnalysis: RegretAnalysis;
  inactionScenario: InactionScenario;
  reflection: SelfReflection;
  reasoningArtifacts?: ReasoningArtifacts;
  verdict: {
    recommendation: string;
    primaryBenefit: string;
    mainTradeoff: string;
    overallConfidence: number;
  };
  charts: {
    probabilityDistribution: { name: string; value: number; fill: string }[];
    impactMagnitude: { category: string; score: number }[];
  };
  summary: string;
  visionBoardUrl?: string;
  sources?: GroundingSource[];
}

export interface FinalDirective {
  finalVerdict: string;
  actionPlan: string[];
  reassurance: string;
  followUpSuggestion?: {
    days: number;
    question: string;
  };
}

export interface FollowUp {
  id: string;
  simulationId: string;
  decisionLabel: string;
  scheduledDate: number;
  question: string;
  completed: boolean;
}

export interface SavedSimulation {
  id: string;
  timestamp: number;
  input: UserInput;
  result: SimulationResult;
}
