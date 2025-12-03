/**
 * Ready-to-Use Mapbox Interactive Map for West Bengal
 * Displays all 234 constituencies with clickable boundaries
 * 50 constituencies with data are highlighted and clickable
 */

import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import westBengalGeoJSON from '../../assets/maps/westbengal-constituencies.json';
import constituencies50Data from '../../data/wb_constituencies_50.json';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiYmttdXJhbGkiLCJhIjoiY21ocDhoNXhiMGhodDJrcW94OGptdDg0MiJ9.dq6OU3jiKKntjhIDD9sxWQ';

// Create a lookup map for the 50 constituencies with data
// Key: normalized name (lowercase, spaces removed), Value: constituency object
const constituencyLookup = new Map<string, typeof constituencies50Data[0]>();
constituencies50Data.forEach(c => {
  // Normalize name for matching: lowercase, remove spaces and special chars
  const normalizedName = c.name.toLowerCase().replace(/\s+/g, '').replace(/-/g, '');
  constituencyLookup.set(normalizedName, c);
});

// Get list of clickable constituency names for map styling
const clickableConstituencyNames = new Set(
  constituencies50Data.map(c => c.name.toUpperCase())
);

interface MapboxWestBengalProps {
  height?: string;
  onConstituencyClick?: (constituency: any) => void;
}

// Helper function to find constituency by name
const findConstituencyByName = (acName: string): typeof constituencies50Data[0] | undefined => {
  if (!acName) return undefined;
  const normalizedName = acName.toLowerCase().replace(/\s+/g, '').replace(/-/g, '');
  return constituencyLookup.get(normalizedName);
};

// Check if a constituency is clickable (has data)
const isClickableConstituency = (acName: string): boolean => {
  if (!acName) return false;
  // Try exact match first
  if (clickableConstituencyNames.has(acName.toUpperCase())) return true;
  // Try normalized match
  return findConstituencyByName(acName) !== undefined;
};

export const MapboxWestBengal: React.FC<MapboxWestBengalProps> = React.memo(({
  height = '700px',
  onConstituencyClick
}) => {
  const navigate = useNavigate();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedConstituency, setSelectedConstituency] = useState<any>(null);
  const [showToast, setShowToast] = useState<string | null>(null);

  // Use ref to store callback to avoid map re-initialization
  const onConstituencyClickRef = useRef(onConstituencyClick);

  // Update ref when callback changes (without re-initializing map)
  useEffect(() => {
    onConstituencyClickRef.current = onConstituencyClick;
  }, [onConstituencyClick]);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize Mapbox
    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12', // Clean street map style
      center: [88.3639, 22.5726], // Kolkata, West Bengal center coordinates
      zoom: 6.5,
      attributionControl: true
    });

    map.current.on('load', () => {
      if (!map.current) return;

      // Add constituency boundaries as a source with feature IDs
      // Add 'isClickable' property to each feature based on whether it has data
      const geoJSONWithClickable = {
        ...westBengalGeoJSON,
        features: (westBengalGeoJSON as any).features.map((feature: any, index: number) => ({
          ...feature,
          id: index,
          properties: {
            ...feature.properties,
            isClickable: isClickableConstituency(feature.properties?.AC_NAME || '')
          }
        }))
      };

      map.current.addSource('constituencies', {
        type: 'geojson',
        data: geoJSONWithClickable as any
      });

      // Add constituency fill layer for NON-CLICKABLE (greyed out)
      map.current.addLayer({
        id: 'constituency-fills-inactive',
        type: 'fill',
        source: 'constituencies',
        filter: ['==', ['get', 'isClickable'], false],
        paint: {
          'fill-color': '#9E9E9E', // Grey for inactive
          'fill-opacity': 0.3
        }
      });

      // Add constituency fill layer for CLICKABLE (highlighted)
      map.current.addLayer({
        id: 'constituency-fills',
        type: 'fill',
        source: 'constituencies',
        filter: ['==', ['get', 'isClickable'], true],
        paint: {
          'fill-color': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            '#FF5722', // Orange on hover
            '#FF9800'  // Saffron/Orange default - BJP color
          ],
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            0.8,
            0.6
          ]
        }
      });

      // Add constituency outline layer for non-clickable (light border)
      map.current.addLayer({
        id: 'constituency-borders-inactive',
        type: 'line',
        source: 'constituencies',
        filter: ['==', ['get', 'isClickable'], false],
        paint: {
          'line-color': '#BDBDBD',
          'line-width': 0.5
        }
      });

      // Add constituency outline layer for CLICKABLE (prominent border)
      map.current.addLayer({
        id: 'constituency-borders',
        type: 'line',
        source: 'constituencies',
        filter: ['==', ['get', 'isClickable'], true],
        paint: {
          'line-color': '#E65100', // Dark orange border
          'line-width': 2
        }
      });

      // Add constituency labels
      map.current.addLayer({
        id: 'constituency-labels',
        type: 'symbol',
        source: 'constituencies',
        layout: {
          'text-field': ['get', 'AC_NAME'],
          'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
          'text-size': 10,
          'text-anchor': 'center'
        },
        paint: {
          'text-color': '#000',
          'text-halo-color': '#fff',
          'text-halo-width': 2
        },
        minzoom: 8 // Only show labels when zoomed in
      });

      // Create popup
      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
      });

      let hoveredStateId: string | number | null = null;

      // Mouse enter event for CLICKABLE constituencies
      map.current.on('mouseenter', 'constituency-fills', (e) => {
        if (!map.current || !e.features || e.features.length === 0) return;

        map.current.getCanvas().style.cursor = 'pointer';

        if (hoveredStateId !== null) {
          map.current.setFeatureState(
            { source: 'constituencies', id: hoveredStateId },
            { hover: false }
          );
        }

        hoveredStateId = e.features[0].id as string | number;

        if (hoveredStateId !== undefined) {
          map.current.setFeatureState(
            { source: 'constituencies', id: hoveredStateId },
            { hover: true }
          );
        }

        const properties = e.features[0].properties;
        const coordinates = e.lngLat;

        // Show popup on hover - CLICKABLE
        const html = `
          <div style="padding: 10px; min-width: 220px; border-left: 4px solid #FF9800;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold; color: #E65100;">
              ${properties?.AC_NAME || 'Unknown'}
            </h3>
            <div style="font-size: 12px; color: #666;">
              <p style="margin: 4px 0;"><strong>District:</strong> ${properties?.DIST_NAME || 'N/A'}</p>
              <p style="margin: 4px 0;"><strong>AC No:</strong> ${properties?.AC_NO || 'N/A'}</p>
            </div>
            <div style="margin-top: 10px; padding: 6px 10px; background: #FFF3E0; border-radius: 4px; font-size: 12px; color: #E65100; font-weight: 500;">
              Click to view insights
            </div>
          </div>
        `;

        popup.setLngLat(coordinates).setHTML(html).addTo(map.current);
      });

      // Mouse enter event for NON-CLICKABLE constituencies
      map.current.on('mouseenter', 'constituency-fills-inactive', (e) => {
        if (!map.current || !e.features || e.features.length === 0) return;

        map.current.getCanvas().style.cursor = 'default';

        const properties = e.features[0].properties;
        const coordinates = e.lngLat;

        // Show popup on hover - NON-CLICKABLE
        const html = `
          <div style="padding: 10px; min-width: 200px; border-left: 4px solid #9E9E9E;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold; color: #616161;">
              ${properties?.AC_NAME || 'Unknown'}
            </h3>
            <div style="font-size: 12px; color: #666;">
              <p style="margin: 4px 0;"><strong>District:</strong> ${properties?.DIST_NAME || 'N/A'}</p>
              <p style="margin: 4px 0;"><strong>AC No:</strong> ${properties?.AC_NO || 'N/A'}</p>
            </div>
            <div style="margin-top: 10px; padding: 6px 10px; background: #F5F5F5; border-radius: 4px; font-size: 11px; color: #9E9E9E;">
              Data coming soon
            </div>
          </div>
        `;

        popup.setLngLat(coordinates).setHTML(html).addTo(map.current);
      });

      // Mouse leave event
      map.current.on('mouseleave', 'constituency-fills', () => {
        if (!map.current) return;

        map.current.getCanvas().style.cursor = '';

        if (hoveredStateId !== null) {
          map.current.setFeatureState(
            { source: 'constituencies', id: hoveredStateId },
            { hover: false }
          );
        }
        hoveredStateId = null;

        popup.remove();
      });

      // Mouse leave event for inactive
      map.current.on('mouseleave', 'constituency-fills-inactive', () => {
        if (!map.current) return;
        map.current.getCanvas().style.cursor = '';
        popup.remove();
      });

      // Click event for CLICKABLE constituencies - Navigate to insights
      map.current.on('click', 'constituency-fills', (e) => {
        if (!e.features || e.features.length === 0) return;

        const feature = e.features[0];
        const acName = feature.properties?.AC_NAME;

        // Find the constituency in our 50 data
        const constituencyData = findConstituencyByName(acName);

        if (constituencyData) {
          // Navigate to insights page with constituency ID
          navigate(`/dashboard/constituency-insights?id=${constituencyData.id}`);
        }

        setSelectedConstituency(feature.properties);

        // Use ref to call callback without triggering re-initialization
        if (onConstituencyClickRef.current) {
          onConstituencyClickRef.current(feature.properties);
        }

        // Zoom to clicked constituency
        if (map.current && feature.properties) {
          map.current.flyTo({
            center: e.lngLat,
            zoom: 10,
            duration: 1000
          });
        }
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add fullscreen control
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

      // Add scale control
      map.current.addControl(
        new mapboxgl.ScaleControl({ maxWidth: 100, unit: 'metric' }),
        'bottom-left'
      );
    });

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []); // Empty dependency array - map initializes only once

  return (
    <div className="relative">
      <div
        ref={mapContainer}
        style={{ height }}
        className="w-full rounded-lg border-2 border-gray-300 shadow-lg"
      />

      {selectedConstituency && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-sm z-10">
          <button
            onClick={() => setSelectedConstituency(null)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {selectedConstituency.AC_NAME}
          </h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p><strong>District:</strong> {selectedConstituency.DIST_NAME}</p>
            <p><strong>AC Number:</strong> {selectedConstituency.AC_NO}</p>
            <p><strong>State Code:</strong> {selectedConstituency.ST_CODE}</p>
          </div>
        </div>
      )}

      <div className="mt-2 text-xs text-gray-500 text-center">
        Constituency data from DataMeet
      </div>
    </div>
  );
});
