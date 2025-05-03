import { Target, TargetConfig } from './types';
import {
  calculateContainerBounds,
  getDefaultConfig,
  ContainerConfig,
} from './TargetContainer';

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

    // 타겟 컨테이너 크기 계산
    this.mapBounds = calculateContainerBounds(
      this.gameArea,
      this.containerConfig
    );
    this.targetConfig = { ...config, size: this.mapBounds.width / 18 };
  }

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
    // 맵 직사각형 영역 내에서 랜덤 위치 생성

    console.log(this.targets);
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
      depth: 0,
      rotation: 0,
      scale: 1,
    };
  }

  private isValidPosition(target: Target): boolean {
    // 다른 타겟과의 거리 체크
    return !this.targets.some((existingTarget) => {
      const distance = Math.sqrt(
        Math.pow(target.x - existingTarget.x, 2) +
          Math.pow(target.y - existingTarget.y, 2)
      );
      return distance < target.size / 2;
    });
  }

  checkHit(x: number, y: number): Target | null {
    for (let i = 0; i < this.targets.length; i++) {
      const target = this.targets[i];
      if (target.hit) continue;

      // 타겟 중심과 클릭 위치 사이의 거리 계산
      const dx = x - target.x;
      const dy = y - target.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // 타겟의 반지름 계산
      const radius = target.size / 2;

      // 거리가 타겟 반지름 이내인 경우 명중
      if (distance <= radius) {
        // 점수 계산
        let score = 0;

        // 안쪽 원 (3점) - 전체 크기의 1/6 반지름
        if (distance <= radius / 3) {
          score = 3;
        }
        // 중간 원 (2점) - 전체 크기의 1/3 반지름
        else if (distance <= radius / 1.5) {
          score = 2;
        }
        // 바깥쪽 원 (1점) - 전체 크기의 1/2 반지름
        else if (distance <= radius) {
          score = 1;
        }

        // 타겟을 맞췄으므로 hit 상태로 변경하고 배열에서 제거
        target.hit = true;
        target.score = score;
        this.targets.splice(i, 1); // 배열에서 제거

        return target;
      }
    }

    return null;
  }

  getTargets(): Target[] {
    return this.targets;
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
