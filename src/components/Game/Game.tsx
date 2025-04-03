import { GameWorld } from './GameWorld';
import { Crosshair } from './Crosshair';

export const Game = () => {
  return (
    <div className="relative h-full w-full">
      <GameWorld />
      <Crosshair />
    </div>
  );
};
