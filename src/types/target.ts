export interface Target {
  id: string;
  x: number;
  y: number;
  size: number;
  hit: boolean;
  score?: number;
}

export interface TargetConfig {
  size: number;
  margin: number;
  maxTargets: number;
  spawnInterval: number;
}
