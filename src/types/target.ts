/**
 * 개별 타겟 객체 정보
 */
export interface Target {
  id: string;
  x: number; // Canvas X 좌표 (px)
  y: number; // Canvas Y 좌표 (px)
  size: number; // 지름 (px)
  hit: boolean; // 피격 여부 (true일 경우 삭제/애니메이션 대기)
  score?: number; // 획득 점수 (피격 시 할당됨)
}

/**
 * 타겟 생성 및 관리 설정
 */
export interface TargetConfig {
  size: number; // 타겟 기본 크기 (px)
  margin: number; // 화면 가장자리 안전 여백 (px)
  maxTargets: number; // 화면 내 최대 유지 가능한 타겟 수
  spawnInterval: number; // 생성 주기 (ms)
}
