/**
 * PredictionConstituencyMap Component
 * Interactive map showing 2026 WB Assembly Election predictions for 50 constituencies
 */

import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  AC_NAME_TO_CONSTITUENCY,
  matchGeoJSONToConstituency,
  getPredictionColor,
} from '../../data/constituencyMapping';
import westBengalGeoJSON from '../../assets/maps/westbengal-constituencies.json';

// Fix for default marker icon in production
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export interface ConstituencyPrediction {
  id: string;
  name: string;
  district: string;
  predictedWinner: 'BJP' | 'TMC' | 'Swing';
  bjpWinProbability: number;
  tmcWinProbability: number;
  bjpPositive: number;
  tmcPositive: number;
  bjpNegative: number;
  tmcNegative: number;
  totalArticles: number;
  margin: number;
  status: 'Safe' | 'Likely' | 'Swing';
  confidence: number;
}

interface PredictionConstituencyMapProps {
  predictions: ConstituencyPrediction[];
  height?: string;
  className?: string;
  onConstituencyClick?: (prediction: ConstituencyPrediction | null) => void;
}

// West Bengal center coordinates
const WB_CENTER: [number, number] = [23.0, 87.5];
const WB_ZOOM = 6;

export const PredictionConstituencyMap: React.FC<PredictionConstituencyMapProps> = React.memo(({
  predictions,
  height = '500px',
  className = '',
  onConstituencyClick,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const [hoveredConstituency, setHoveredConstituency] = useState<string | null>(null);

  // Create a lookup map for predictions by constituency name
  const predictionMap = useMemo(() => {
    const map = new Map<string, ConstituencyPrediction>();
    predictions.forEach((p) => {
      map.set(p.name.toLowerCase(), p);
    });
    return map;
  }, [predictions]);

  // Filter GeoJSON to only include our 50 target constituencies
  const filteredGeoJSON = useMemo(() => {
    const features = (westBengalGeoJSON as any).features.filter((feature: any) => {
      const acName = feature.properties.AC_NAME;
      return matchGeoJSONToConstituency(acName) !== null;
    });

    return {
      type: 'FeatureCollection',
      features,
    };
  }, []);

  // Get prediction for a GeoJSON feature
  const getPredictionForFeature = useCallback(
    (acName: string): ConstituencyPrediction | null => {
      const constName = matchGeoJSONToConstituency(acName);
      if (!constName) return null;
      return predictionMap.get(constName.toLowerCase()) || null;
    },
    [predictionMap]
  );

  // Style function for GeoJSON features
  const getStyle = useCallback(
    (feature: any) => {
      const acName = feature.properties.AC_NAME;
      const prediction = getPredictionForFeature(acName);

      const fillColor = prediction
        ? getPredictionColor(prediction.predictedWinner, prediction.confidence)
        : '#9CA3AF'; // gray-400 for unknown

      const isHovered = hoveredConstituency === acName;

      return {
        fillColor,
        weight: isHovered ? 3 : 1.5,
        opacity: 1,
        color: isHovered ? '#1E40AF' : '#FFFFFF',
        dashArray: '',
        fillOpacity: isHovered ? 0.9 : 0.7,
      };
    },
    [getPredictionForFeature, hoveredConstituency]
  );

  // Create tooltip content
  const createTooltipContent = useCallback(
    (acName: string): string => {
      const constName = matchGeoJSONToConstituency(acName);
      const prediction = getPredictionForFeature(acName);

      if (!prediction) {
        return `
          <div class="font-semibold text-gray-900">${constName || acName}</div>
          <div class="text-xs text-gray-500">No prediction data</div>
        `;
      }

      const winnerColor =
        prediction.predictedWinner === 'BJP'
          ? 'text-orange-600'
          : prediction.predictedWinner === 'TMC'
          ? 'text-green-600'
          : 'text-yellow-600';

      const bjpWidth = Math.round(prediction.bjpWinProbability);
      const tmcWidth = Math.round(prediction.tmcWinProbability);

      return `
        <div style="min-width: 180px;">
          <div class="font-bold text-gray-900 text-sm">${prediction.name}</div>
          <div class="text-xs text-gray-500 mb-2">${prediction.district}</div>

          <div class="text-base font-bold ${winnerColor}">
            ${prediction.predictedWinner} ${prediction.predictedWinner === 'Swing' ? '' : 'Leading'}
          </div>

          <div style="margin-top: 8px;">
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 2px;">
              <span style="color: #EA580C;">BJP ${bjpWidth}%</span>
              <span style="color: #16A34A;">TMC ${tmcWidth}%</span>
            </div>
            <div style="height: 6px; background: #E5E7EB; border-radius: 3px; overflow: hidden; display: flex;">
              <div style="width: ${bjpWidth}%; background: #F97316;"></div>
              <div style="width: ${tmcWidth}%; background: #22C55E;"></div>
            </div>
          </div>

          <div style="margin-top: 6px; font-size: 11px; color: #6B7280;">
            Based on ${prediction.totalArticles} article${prediction.totalArticles !== 1 ? 's' : ''}
          </div>
        </div>
      `;
    },
    [getPredictionForFeature]
  );

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: true,
    }).setView(WB_CENTER, WB_ZOOM);

    // Add tile layer (light style)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 12,
      minZoom: 5,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update GeoJSON layer when predictions change
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove existing layer
    if (geoJsonLayerRef.current) {
      mapRef.current.removeLayer(geoJsonLayerRef.current);
    }

    // Add new layer
    const geoJsonLayer = L.geoJSON(filteredGeoJSON as any, {
      style: getStyle,
      onEachFeature: (feature, layer) => {
        const acName = feature.properties.AC_NAME;

        // Tooltip
        layer.bindTooltip(createTooltipContent(acName), {
          permanent: false,
          sticky: true,
          className: 'bg-white shadow-lg rounded-lg p-2 border border-gray-200',
          direction: 'auto',
        });

        // Event handlers
        layer.on({
          mouseover: (e) => {
            setHoveredConstituency(acName);
            const target = e.target;
            target.setStyle({
              weight: 3,
              color: '#1E40AF',
              fillOpacity: 0.9,
            });
            target.bringToFront();
          },
          mouseout: (e) => {
            setHoveredConstituency(null);
            geoJsonLayerRef.current?.resetStyle(e.target);
          },
          click: () => {
            const prediction = getPredictionForFeature(acName);
            if (onConstituencyClick) {
              onConstituencyClick(prediction);
            }
          },
        });
      },
    }).addTo(mapRef.current);

    geoJsonLayerRef.current = geoJsonLayer;

    // Fit bounds to show all constituencies
    const bounds = geoJsonLayer.getBounds();
    if (bounds.isValid()) {
      mapRef.current.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [filteredGeoJSON, getStyle, createTooltipContent, getPredictionForFeature, onConstituencyClick]);

  // Update styles when predictions change (without recreating layer)
  useEffect(() => {
    if (geoJsonLayerRef.current) {
      geoJsonLayerRef.current.setStyle(getStyle);
    }
  }, [predictions, getStyle]);

  return (
    <div
      ref={mapContainerRef}
      className={`w-full rounded-lg shadow-lg border border-gray-200 ${className}`}
      style={{ height }}
    />
  );
});

PredictionConstituencyMap.displayName = 'PredictionConstituencyMap';
