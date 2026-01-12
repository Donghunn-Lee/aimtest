import { Target, TargetConfig } from '@/types/target';

import {
  calculateContainerBounds,
  getDefaultConfig,
  ContainerConfig,
} from '@/utils/targetContainer';

/**
 * 타겟 생성/배치/히트 판정/맵 경계 관리 책임을 가지는 도메인 매니저
 * - 컨테이너(bounds)와 해상도에 맞춰 타겟 크기/위치 계산
 * - maxTargets, margin 조건을 적용하며 랜덤 생성
 * - 원형 거리 기반 점수(1~3점)와 히트 처리
 */
export class TargetManager {
  private targets: Target[] = [];
  private targetConfig: TargetConfig;
  private gameArea: { width: number; height: number };
  private nextId: number = 1;
  private mapBounds: { x: number; y: number; width: number; height: number };
  private containerConfig: ContainerConfig;

  constructor(
    config: TargetConfig,
    gameArea: { width: number; height: number },
    resolution: number
  ) {
    this.gameArea = gameArea;
    this.targets = [];
    this.containerConfig = getDefaultConfig(resolution);

    this.mapBounds = calculateContainerBounds(
      this.gameArea,
      this.containerConfig
    );
    this.targetConfig = { ...config, size: this.mapBounds.width / 18 };
  }

  /** maxTargets를 넘지 않는 선에서, 겹치지 않는 위치의 새 타겟을 생성 (실패 시 null) */
  createTarget(): Target | null {
    if (this.targets.length >= this.targetConfig.maxTargets) {
      return null;
    }

    const loopCount = 100;
    let i = 0;

    while (i < loopCount) {
      const target = this.generateTarget();

      if (this.isValidPosition(target)) {
        this.targets.push(target);
        return target;
      }

      i++;
    }

    return null;
  }

  private generateTarget(): Target {
    const mapX =
      this.mapBounds.x +
      this.targetConfig.margin +
      Math.random() * (this.mapBounds.width - 2 * this.targetConfig.margin);
    const mapY =
      this.mapBounds.y +
      this.targetConfig.margin +
      Math.random() * (this.mapBounds.height - 2 * this.targetConfig.margin);

    const id = this.nextId++;

    return {
      id: id.toString(),
      x: mapX,
      y: mapY,
      size: this.targetConfig.size,
      hit: false,
    };
  }

  /** 기존 타겟들과의 최소 거리 제약을 만족하는지 검사 */
  private isValidPosition(target: Target): boolean {
    const minDist = target.size / 2; // 게임성 위해 50% overlap 허용

    return !this.targets.some((t) => {
      const dx = target.x - t.x;
      const dy = target.y - t.y;

      return dx * dx + dy * dy < minDist;
    });
  }

  /**
   * 주어진 좌표(x, y) 기준 원형 히트 판정 및 점수 부여
   * - 중심에 가까울수록 높은 점수(3 → 2 → 1점)
   * - 맞은 타겟은 배열에서 제거 후 반환
   */
  checkHit(x: number, y: number): Target | null {
    for (let i = this.targets.length - 1; i >= 0; i--) {
      const target = this.targets[i];
      if (target.hit) continue;

      const dx = x - target.x;
      const dy = y - target.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const radius = target.size / 2;

      if (distance <= radius) {
        let score = 0;

        if (distance <= radius / 3) {
          score = 3;
        } else if (distance <= radius / 1.5) {
          score = 2;
        } else if (distance <= radius) {
          score = 1;
        }

        target.hit = true;
        target.score = score;
        this.targets.splice(i, 1);

        return target;
      }
    }

    return null;
  }

  getTargets(): Target[] {
    return this.targets;
  }

  getTargetSize(): number {
    return this.targetConfig.size;
  }

  removeTarget(id: string): void {
    this.targets = this.targets.filter((target) => target.id !== id);
  }

  clearTargets(): void {
    if (this.targets.length > 0) {
      this.targets.forEach((target) => {
        target.hit = true;
      });

      this.targets = [];
    }
  }

  /** 게임 영역 크기 변경 시 컨테이너 bounds 재계산 */
  updateGameArea(width: number, height: number): void {
    this.gameArea = { width, height };
    this.mapBounds = calculateContainerBounds(
      this.gameArea,
      this.containerConfig
    );
  }

  getMapBounds(): { x: number; y: number; width: number; height: number } {
    return this.mapBounds;
  }
}
