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

export function calculateContainerBounds(
  gameArea: GameArea,
  config: ContainerConfig
): ContainerBounds {
  let mapWidth: number;
  let mapHeight: number;

  const gameAspectRatio = gameArea.width / gameArea.height;

  if (gameAspectRatio > config.mapAspectRatio) {
    mapHeight = gameArea.height;
    mapWidth = mapHeight * config.mapAspectRatio;
  } else {
    mapWidth = gameArea.width;
    mapHeight = mapWidth / config.mapAspectRatio;
  }

  const targetAreaWidth = mapWidth * config.targetAreaRatio;
  const targetAreaHeight = targetAreaWidth / config.mapAspectRatio;

  const targetX = -(targetAreaWidth / 2) / config.widthScaleRatio;
  const targetY =
    -targetAreaHeight / 2 + mapHeight * config.verticalOffsetRatio;

  return {
    x: targetX,
    y: targetY,
    width: targetAreaWidth / config.widthScaleRatio,
    height: targetAreaHeight / config.heightScaleRatio,
  };
}

export function getDefaultConfig(resolution: number): ContainerConfig {
  if (resolution === 16 / 9) {
    return {
      mapAspectRatio: 16 / 9,
      targetAreaRatio: 1,
      verticalOffsetRatio: 0.246,
      widthScaleRatio: 2.438,
      heightScaleRatio: 4.124,
    };
  } else if (resolution === 16 / 10) {
    return {
      mapAspectRatio: 16 / 10,
      targetAreaRatio: 1,
      verticalOffsetRatio: 0.26,
      widthScaleRatio: 2.326,
      heightScaleRatio: 4.364,
    };
  } else {
    return {
      mapAspectRatio: 4 / 3,
      targetAreaRatio: 1,
      verticalOffsetRatio: 0.3,
      widthScaleRatio: 2.33,
      heightScaleRatio: 5.26,
    };
  }
}
