import React from 'react';
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
      <label className="block text-sm font-medium text-gray-300 mb-2">
        해상도 설정
      </label>
      <div className="flex flex-wrap gap-2">
        {RESOLUTIONS.map((resolution) => (
          <button
            key={resolution.name}
            onClick={() => onResolutionChange(resolution)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${selectedResolution.name === resolution.name
              ? 'bg-blue-600 text-white'
              : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
          >
            {resolution.name}
          </button>
        ))}
      </div>
    </div>
  );
}; 