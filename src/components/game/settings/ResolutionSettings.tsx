import { Button } from '@/components/common/Button';
import type { Resolution } from '@/types/image';
import { RESOLUTIONS } from '@/utils/image';

interface ResolutionSettingsProps {
  selectedResolution: Resolution;
  onResolutionChange: (resolution: Resolution) => void;
}

// 해상도 선택 UI
export const ResolutionSettings: React.FC<ResolutionSettingsProps> = ({
  selectedResolution,
  onResolutionChange,
}: ResolutionSettingsProps) => {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {RESOLUTIONS.map((resolution) => (
        <Button
          key={resolution.name}
          onClick={() => onResolutionChange(resolution)}
          variant={
            selectedResolution.name === resolution.name
              ? 'primary'
              : 'secondary'
          }
          size="sm"
          className={`h-7 text-[10px] font-bold tracking-wide ${
            selectedResolution.name === resolution.name
              ? 'opacity-100 ring-1 ring-[#00ff00]/50'
              : 'opacity-70 hover:opacity-100'
          }`}
        >
          {resolution.name}
        </Button>
      ))}
    </div>
  );
};
