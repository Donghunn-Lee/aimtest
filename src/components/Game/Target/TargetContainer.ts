interface GameArea {
  width: number;
  height: number;
}

interface ContainerBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ContainerConfig {
  mapAspectRatio: number;
  targetAreaRatio: number;
  verticalOffsetRatio: number;
  widthScaleRatio: number;
  heightScaleRatio: number;
}

/**
 * 게임 영역과 설정된 비율을 기반으로 타겟 컨테이너의 경계를 계산합니다.
 * @param gameArea 게임 영역의 크기
 * @param config 타겟 컨테이너 설정
 * @returns 계산된 컨테이너 경계
 */
export function calculateContainerBounds(
  gameArea: GameArea,
  config: ContainerConfig
): ContainerBounds {
  // 맵의 실제 크기 계산 (게임 영역에 맞게 조정)
  let mapWidth: number;
  let mapHeight: number;

  // 게임 영역의 비율과 맵 비율 비교
  const gameAspectRatio = gameArea.width / gameArea.height;

  if (gameAspectRatio > config.mapAspectRatio) {
    // 게임 영역이 맵보다 더 넓은 경우 (세로로 꽉 차게)
    mapHeight = gameArea.height;
    mapWidth = mapHeight * config.mapAspectRatio;
  } else {
    // 게임 영역이 맵보다 더 좁은 경우 (가로로 꽉 차게)
    mapWidth = gameArea.width;
    mapHeight = mapWidth / config.mapAspectRatio;
  }

  // 타겟 컨테이너의 크기 계산
  const targetAreaWidth = mapWidth * config.targetAreaRatio;
  const targetAreaHeight = targetAreaWidth / config.mapAspectRatio;

  // 타겟 컨테이너의 위치 계산 (중앙 정렬)
  const targetX = -(targetAreaWidth / 2) / config.widthScaleRatio;
  const targetY =
    -targetAreaHeight / 2 + mapHeight * config.verticalOffsetRatio;

  // 컨테이너 경계 반환
  return {
    x: targetX,
    y: targetY,
    width: targetAreaWidth / config.widthScaleRatio,
    height: targetAreaHeight / config.heightScaleRatio,
  };
}

/**
 * 기본 설정값을 반환합니다.
 */
export function getDefaultConfig(resolution: number): ContainerConfig {
  if (resolution === 16 / 9) {
    console.log('16 / 9');
    return {
      mapAspectRatio: 16 / 9,
      targetAreaRatio: 1,
      verticalOffsetRatio: 0.246,
      widthScaleRatio: 2.438,
      heightScaleRatio: 4.124,
    };
  } else if (resolution === 16 / 10) {
    console.log('16 / 10');
    return {
      mapAspectRatio: 16 / 10,
      targetAreaRatio: 1,
      verticalOffsetRatio: 0.26,
      widthScaleRatio: 2.326,
      heightScaleRatio: 4.364,
    };
  } else {
    console.log('4 / 3');
    return {
      mapAspectRatio: 4 / 3,
      targetAreaRatio: 1,
      verticalOffsetRatio: 0.3,
      widthScaleRatio: 2.33,
      heightScaleRatio: 5.26,
    };
  }
}
