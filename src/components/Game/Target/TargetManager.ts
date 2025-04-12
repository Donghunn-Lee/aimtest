import { Target, TargetConfig } from './types';

export class TargetManager {
  private targets: Target[] = [];
  private config: TargetConfig;
  private gameArea: { width: number; height: number };
  private nextId: number = 1;
  private mapBounds: { x: number; y: number; width: number; height: number };

  constructor(
    config: TargetConfig,
    gameArea: { width: number; height: number }
  ) {
    this.config = config;
    this.gameArea = gameArea;
    this.targets = [];

    // 맵에 그려진 직사각형 영역 정의
    this.mapBounds = {
      x: -this.gameArea.width / 2, // 직사각형의 왼쪽 경계
      y: -this.gameArea.height / 2, // 직사각형의 위쪽 경계
      width: this.gameArea.width, // 직사각형의 너비
      height: this.gameArea.height, // 직사각형의 높이
    };
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
    // 맵 직사각형 영역 내에서 랜덤 위치 생성
    const mapX =
      this.mapBounds.x +
      this.config.margin +
      Math.random() * (this.mapBounds.width - 2 * this.config.margin);
    const mapY =
      this.mapBounds.y +
      this.config.margin +
      Math.random() * (this.mapBounds.height - 2 * this.config.margin);

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
    // 맵 직사각형 영역 내에 있는지 확인
    if (
      target.x < this.mapBounds.x + this.config.margin ||
      target.x > this.mapBounds.x + this.mapBounds.width - this.config.margin ||
      target.y < this.mapBounds.y + this.config.margin ||
      target.y > this.mapBounds.y + this.mapBounds.height - this.config.margin
    ) {
      return false;
    }

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

    // 맵 이미지의 비율 계산 (예: 16:9)
    const mapAspectRatio = 16 / 9;

    // 맵의 실제 크기 계산 (게임 영역에 맞게 조정)
    let mapWidth, mapHeight;

    // 게임 영역의 비율과 맵 비율 비교
    const gameAspectRatio = this.gameArea.width / this.gameArea.height;

    if (gameAspectRatio > mapAspectRatio) {
      // 게임 영역이 맵보다 더 넓은 경우 (세로로 꽉 차게)
      mapHeight = this.gameArea.height;
      mapWidth = mapHeight * mapAspectRatio;
    } else {
      // 게임 영역이 맵보다 더 좁은 경우 (가로로 꽉 차게)
      mapWidth = this.gameArea.width;
      mapHeight = mapWidth / mapAspectRatio;
    }

    // 타겟 컨테이너의 크기 계산 (맵 이미지의 80%)
    const targetAreaRatio = 1;
    const targetAreaWidth = mapWidth * targetAreaRatio;
    const targetAreaHeight = targetAreaWidth / mapAspectRatio;

    // 맵의 사각형이 중앙보다 위로 이동한 비율 계산 (예: 10%)
    const verticalOffsetRatio = 0.246;
    const widthScaleRatio = 2.44; // 너비 조절 비율
    const heightScaleRatio = 4.14; // 높이 조절 비율

    // 타겟 컨테이너의 위치 계산 (중앙 정렬)
    const targetX = -(targetAreaWidth / 2) / widthScaleRatio; // 너비 조절 비율을 적용하여 중앙 정렬
    const targetY = -targetAreaHeight / 2 + mapHeight * verticalOffsetRatio;

    // 맵 경계 업데이트
    this.mapBounds = {
      x: targetX,
      y: targetY,
      width: targetAreaWidth / widthScaleRatio, // 너비 조절 비율 적용
      height: targetAreaHeight / heightScaleRatio, // 높이 조절 비율 적용
    };
  }

  getMapBounds(): { x: number; y: number; width: number; height: number } {
    return this.mapBounds;
  }
}
