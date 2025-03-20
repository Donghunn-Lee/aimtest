import GameView from '../components/Game/GameView';

export default function HomePage() {
  return (
    <main className="mt-32 space-y-20">
      <div className="space-y-12">
        <h1 className="text-center text-5xl font-bold">
          FPS Aim Test | 에임 테스트
        </h1>
        <p className="mx-auto w-[800px]"></p>
      </div>
      <div className="mx-auto h-[600px] w-[800px] border border-gray-400">
        <GameView />
      </div>
    </main>
  );
}
