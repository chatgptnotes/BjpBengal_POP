/**
 * TimeSlider Component
 * Horizontal time range selector with preset ranges
 */

import React, { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import type { TimeWindow } from '../types';

interface TimeSliderProps {
  value: TimeWindow;
  onChange: (timeWindow: TimeWindow) => void;
}

export default function TimeSlider({ value, onChange }: TimeSliderProps) {
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  const presets: Array<{ label: string; preset: TimeWindow['preset']; days?: number; years?: number }> = [
    { label: 'Live / Today', preset: 'live', days: 1 },
    { label: 'Last 7 Days', preset: '7d', days: 7 },
    { label: 'Last 30 Days', preset: '30d', days: 30 },
    { label: 'Last 90 Days', preset: '90d', days: 90 },
    { label: 'Last Election (2021)', preset: 'last_election', years: 4 },
    { label: 'Previous Election (2016)', preset: 'previous_election', years: 8 },
  ];

  const handlePresetClick = (preset: typeof presets[0]) => {
    const to = new Date();
    const from = new Date();

    if (preset.days) {
      from.setDate(to.getDate() - preset.days);
    } else if (preset.years) {
      from.setFullYear(to.getFullYear() - preset.years);
    }

    onChange({
      label: preset.label,
      from,
      to,
      preset: preset.preset
    });
  };

  const formatDateRange = (timeWindow: TimeWindow) => {
    const fromStr = timeWindow.from.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    const toStr = timeWindow.to.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    return `${fromStr} to ${toStr}`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Time Range
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Showing data from {formatDateRange(value)}
          </p>
        </div>
        <button
          onClick={() => setShowCustomPicker(!showCustomPicker)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
        >
          Custom Range
          <ChevronDown className={`w-4 h-4 transition-transform ${showCustomPicker ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Preset Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {presets.map((preset) => (
          <button
            key={preset.preset}
            onClick={() => handlePresetClick(preset)}
            className={`px-4 py-3 text-sm font-medium rounded-lg border transition-all ${
              value.preset === preset.preset
                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Custom Date Picker (Placeholder) */}
      {showCustomPicker && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                value={value.from.toISOString().split('T')[0]}
                onChange={(e) => {
                  const newFrom = new Date(e.target.value);
                  onChange({ ...value, from: newFrom, preset: 'custom' });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                value={value.to.toISOString().split('T')[0]}
                onChange={(e) => {
                  const newTo = new Date(e.target.value);
                  onChange({ ...value, to: newTo, preset: 'custom' });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
