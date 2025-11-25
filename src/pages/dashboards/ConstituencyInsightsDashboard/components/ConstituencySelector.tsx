/**
 * ConstituencySelector Component
 * Dropdown to switch between constituencies
 */

import React, { useState, useEffect } from 'react';
import { MapPin, Search, X } from 'lucide-react';
import type { Constituency } from '../types';
import constituenciesData from '../../../../data/wb_constituencies_50.json';

interface ConstituencySelectorProps {
  value: Constituency | null;
  onChange: (constituency: Constituency) => void;
}

export default function ConstituencySelector({ value, onChange }: ConstituencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredConstituencies, setFilteredConstituencies] = useState<Constituency[]>(
    constituenciesData as Constituency[]
  );

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredConstituencies(constituenciesData as Constituency[]);
    } else {
      const filtered = (constituenciesData as Constituency[]).filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.city_cluster.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredConstituencies(filtered);
    }
  }, [searchTerm]);

  const handleSelect = (constituency: Constituency) => {
    onChange(constituency);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative">
      {/* Selected Value Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full md:w-96 px-4 py-3 bg-white border border-gray-300 rounded-lg text-left hover:border-blue-400 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-blue-600" />
          <div>
            {value ? (
              <>
                <div className="font-semibold text-gray-900">{value.name}</div>
                <div className="text-xs text-gray-600">{value.district} • {value.city_cluster}</div>
              </>
            ) : (
              <div className="text-gray-500">Select Constituency</div>
            )}
          </div>
        </div>
        <Search className="w-5 h-5 text-gray-400" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Panel */}
          <div className="absolute top-full left-0 mt-2 w-full md:w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden flex flex-col">
            {/* Search Box */}
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search constituencies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Constituency List */}
            <div className="overflow-y-auto flex-1">
              {filteredConstituencies.length > 0 ? (
                filteredConstituencies.map((constituency) => (
                  <button
                    key={constituency.id}
                    onClick={() => handleSelect(constituency)}
                    className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 ${
                      value?.id === constituency.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{constituency.name}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          {constituency.district} • {constituency.city_cluster}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            constituency.is_urban
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {constituency.is_urban ? 'Urban' : 'Semi-Urban'}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            constituency.social_media_activity === 'very_high'
                              ? 'bg-red-100 text-red-800'
                              : constituency.social_media_activity === 'high'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {constituency.social_media_activity.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <div className="text-right ml-3">
                        <div className="text-xs text-gray-500">Voters</div>
                        <div className="text-sm font-semibold text-gray-900">
                          {(constituency.total_voters / 1000).toFixed(0)}K
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No constituencies found</p>
                  <p className="text-sm mt-1">Try a different search term</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-600">
              Showing {filteredConstituencies.length} of {constituenciesData.length} constituencies
            </div>
          </div>
        </>
      )}
    </div>
  );
}
