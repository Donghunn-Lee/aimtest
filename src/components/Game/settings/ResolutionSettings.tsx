import React from 'react';
import Button from '../../common/Button';
import { Resolution, RESOLUTIONS } from '../types/resolution';

interface ResolutionSettingsProps {
  selectedResolution: Resolution;
  onResolutionChange: (resolution: Resolution) => void;
}

export const ResolutionSettings: React.FC<ResolutionSettingsProps> = ({
  selectedResolution,
  onResolutionChange,
}) => {
  return (
    <div className="mb-4">
      <label className="mb-2 block text-sm font-medium text-gray-300 md:text-base lg:text-lg">
        해상도 설정
      </label>
      <div className="flex flex-wrap gap-2">
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
            className={
              selectedResolution.name === resolution.name
                ? 'opacity-100'
                : 'opacity-80 hover:opacity-100'
            }
          >
            {resolution.name}
          </Button>
        ))}
      </div>
    </div>
  );
};
