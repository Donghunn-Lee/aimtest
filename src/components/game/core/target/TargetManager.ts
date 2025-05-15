import { Target, TargetConfig } from '@/types/target';
import {
  calculateContainerBounds,
  getDefaultConfig,
  ContainerConfig,
} from '@/utils/targetContainer';

export class TargetManager {
  private targets: Target[] = [];
  private targetConfig: TargetConfig;
  private gameArea: { width: number; height: number };
  private nextId: number = 1;
  private mapBounds: { x: number; y: number; width: number; height: number };
  private containerConfig: ContainerConfig;
  private hitSound: HTMLAudioElement;
  private missSound: HTMLAudioElement;

  constructor(
    config: TargetConfig,
    gameArea: { width: number; height: number },
    resolution: number
  ) {
    this.gameArea = gameArea;
    this.targets = [];
    this.containerConfig = getDefaultConfig(resolution);
    this.hitSound = new Audio('/sounds/hit.mp3');
    this.missSound = new Audio('/sounds/miss.mp3');
    this.hitSound.volume = 0.5;
    this.missSound.volume = 0.5;

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

  private isValidPosition(target: Target): boolean {
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

        this.hitSound.currentTime = 0;
        this.hitSound.play().catch(() => {
          // 브라우저의 자동 재생 정책으로 인한 오류 무시
        });

        return target;
      }
    }

    this.missSound.currentTime = 0;
    this.missSound.play().catch(() => {
      // 브라우저의 자동 재생 정책으로 인한 오류 무시
    });

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
