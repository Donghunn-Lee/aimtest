import { Target, TargetConfig } from './types';

export class TargetManager {
  private targets: Target[] = [];
  private config: TargetConfig;
  private gameArea: { width: number; height: number };
  private nextId: number = 1;

  constructor(
    config: TargetConfig,
    gameArea: { width: number; height: number }
  ) {
    this.config = config;
    this.gameArea = gameArea;
  }

  createTarget(): Target | null {
    if (this.targets.length >= this.config.maxTargets) {
      return null;
    }

    const target = this.generateTarget();
    if (this.isValidPosition(target)) {
      this.targets.push(target);
      return target;
    }

    return null;
  }

  private generateTarget(): Target {
    const maxX = (this.gameArea.width - this.config.size) * 0.75;
    const maxY = (this.gameArea.height - this.config.size) * 0.5;

    // 맵 좌표계에서의 위치 (중앙이 0,0인 좌표계)
    const mapX =
      this.config.margin +
      Math.random() * (maxX - 2 * this.config.margin) -
      maxX / 2;
    const mapY =
      this.config.margin +
      Math.random() * (maxY - 2 * this.config.margin) -
      maxY / 2;

    const id = this.nextId++;

    return {
      id: id.toString(),
      x: mapX,
      y: mapY,
      size: this.config.size,
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
      return distance < target.size + existingTarget.size;
    });
  }

  checkHit(x: number, y: number): Target | null {
    for (const target of this.targets) {
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

        // 타겟을 맞췄으므로 hit 상태로 변경
        target.hit = true;
        target.score = score;

        console.log(score);

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
    this.targets = [];
  }

  updateGameArea(width: number, height: number): void {
    this.gameArea = { width, height };
  }
}
