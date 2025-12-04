/**
 * PredictionMapLegend Component
 * Shows color legend for the prediction map
 */

import React from 'react';

interface PredictionMapLegendProps {
  className?: string;
}

export const PredictionMapLegend: React.FC<PredictionMapLegendProps> = ({
  className = '',
}) => {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-4 mt-4 p-3 bg-gray-50 rounded-lg ${className}`}>
      {/* BJP Legend */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: '#EA580C' }}
            title="Safe BJP"
          />
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: '#F97316' }}
            title="Likely BJP"
          />
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: '#FB923C' }}
            title="Leaning BJP"
          />
        </div>
        <span className="text-sm font-medium text-gray-700">BJP</span>
      </div>

      {/* TMC Legend */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: '#15803D' }}
            title="Safe TMC"
          />
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: '#22C55E' }}
            title="Likely TMC"
          />
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: '#4ADE80' }}
            title="Leaning TMC"
          />
        </div>
        <span className="text-sm font-medium text-gray-700">TMC</span>
      </div>

      {/* Swing Legend */}
      <div className="flex items-center gap-2">
        <div
          className="w-4 h-4 rounded"
          style={{ backgroundColor: '#EAB308' }}
          title="Swing/Too Close"
        />
        <span className="text-sm font-medium text-gray-700">Swing</span>
      </div>

      {/* No Data Legend */}
      <div className="flex items-center gap-2">
        <div
          className="w-4 h-4 rounded"
          style={{ backgroundColor: '#9CA3AF' }}
          title="No Data"
        />
        <span className="text-sm font-medium text-gray-700">No Data</span>
      </div>
    </div>
  );
};

PredictionMapLegend.displayName = 'PredictionMapLegend';
