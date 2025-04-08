export interface Target {
  id: string;
  x: number;
  y: number;
  size: number;
  hit: boolean;
  score?: number;
  depth: number; // z축 위치 (0~1, 1이 가장 멀리)
  rotation: number; // 타겟의 회전 각도 (라디안)
  scale: number; // 거리에 따른 크기 스케일 (0~1)
}

export interface TargetConfig {
  size: number;
  margin: number;
  maxTargets: number;
  spawnInterval: number;
}
