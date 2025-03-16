import GameView from '../components/Game/GameView';

export default function HomePage() {
  return (
    <main className="h-[600px] w-[800px] bg-gray-200">
      <div className="mx-auto h-full w-full border border-gray-400">
        <GameView />
      </div>
    </main>
  );
}
