import { PanelOverlay } from "../../common/PanelOverlay";

interface StartMenuProps {
  onStart: () => void;
}

export const StartMenu = ({ onStart }: StartMenuProps) => {
  return (
    <PanelOverlay>
      <h2 className="text-2xl font-bold mb-4 text-white text-center">Aim Test</h2>
      <button
        onClick={onStart}
        className="px-6 py-3 text-xl font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors w-full"
      >
        START
      </button>
    </PanelOverlay>
  );
}; 