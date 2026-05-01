/* =========================
MAP.tsx
========================= */

import React, { useEffect, useState } from 'react';
import { MapContainer, GeoJSON, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CountyStats } from '../types';
import { Users } from 'lucide-react';

interface MapProps {
  onCountyClick: (countyName: string, latlng: [number, number], shiftKey: boolean) => void;
  selectedCounty: string | null;
  countyStats: CountyStats | null;
  onClosePopup: () => void;
  activeVariable: string;
  heatmapData: Record<string, number>;
}

const CA_CENTER: [number, number] = [37.2, -119.4];
const CA_ZOOM = 6;

const sig3 = (value: number): string => {
  if (value === 0) return "0";
  return Number(value).toPrecision(3);
};

export const Map: React.FC<MapProps> = ({
  onCountyClick,
  selectedCounty,
  countyStats,
  onClosePopup,
  activeVariable,
  heatmapData
}) => {
  const [geoData, setGeoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [popupPos, setPopupPos] = useState<[number, number] | null>(null);

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/california-counties.geojson')
      .then(res => res.json())
      .then(data => {
        setGeoData(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedCounty) setPopupPos(null);
  }, [selectedCounty]);

  const values = Object.values(heatmapData);
  const minVal = values.length ? Math.min(...values) : 0;
  const maxVal = values.length ? Math.max(...values) : 1;

  const getHeatmapColor = (value: number) => {
    const range = maxVal - minVal;
    if (range === 0) return 'rgb(34,197,94)';

    const n = (value - minVal) / range;

    let r, g;
    if (n < 0.5) {
      r = Math.floor(255 * n * 2);
      g = 255;
    } else {
      r = 255;
      g = Math.floor(255 * (1 - (n - 0.5) * 2));
    }

    return `rgb(${r},${g},0)`;
  };

  const onEachCounty = (feature: any, layer: L.Layer) => {
    const countyName = feature.properties.name;

    layer.on({
      click: (e: any) => {
        const latlng: [number, number] = [e.latlng.lat, e.latlng.lng];
        const shiftKey = e.originalEvent.shiftKey;
        onCountyClick(countyName, latlng, shiftKey);
        setPopupPos(latlng);
      }
    });
  };

  const countyStyle = (feature: any) => {
    const countyName = feature.properties.name;
    const selected = countyName === selectedCounty;
    const value = heatmapData[countyName] || 0;

    return {
      fillColor: selected ? '#3b82f6' : getHeatmapColor(value),
      weight: selected ? 3 : 1,
      color: selected ? '#2563eb' : '#cbd5e1',
      fillOpacity: selected ? 0.75 : 0.6
    };
  };

  if (loading) {
    return <div className="flex-1 flex items-center justify-center">Loading Map...</div>;
  }

  return (
    <div className="flex-1 relative">
      <MapContainer center={CA_CENTER} zoom={CA_ZOOM} className="w-full h-full">
        {geoData && (
          <GeoJSON
            data={geoData}
            style={countyStyle}
            onEachFeature={onEachCounty}
          />
        )}

        {popupPos && countyStats && (
          <Popup
            position={popupPos}
            onClose={() => {
              setPopupPos(null);
              onClosePopup();
            }}
            maxWidth={320}
          >
            <div className="min-w-[280px] p-1">
              <h3 className="text-lg font-bold">{countyStats.name}</h3>

              <div className="mt-3 p-3 bg-blue-50 rounded-lg flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-bold uppercase text-blue-700">
                    Population
                  </span>
                </div>

                <span className="font-bold">
                  {countyStats.population.toLocaleString()}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {countyStats.trends.map((trend, idx) => (
                  <div key={idx}>
                    <div className="text-xs font-semibold text-slate-600 mb-1">
                      {trend.variable}
                    </div>

                    <div className="flex gap-3">
                      {trend.threeMonthValues.map((val, i) => (
                        <div
                          key={i}
                          className="text-xs font-mono bg-slate-100 px-2 py-1 rounded"
                        >
                          {sig3(val)}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Popup>
        )}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-6 left-6 bg-white/90 p-4 rounded-xl shadow-lg z-[500] min-w-[220px]">
        <div className="text-xs font-bold uppercase text-slate-500 mb-2">
          Heatmap: {activeVariable}
        </div>

        <div className="h-2 rounded-full bg-gradient-to-r from-green-500 via-yellow-400 to-red-500 mb-2" />

        <div className="flex justify-between text-xs font-mono text-slate-600">
          <span>{sig3(minVal)}</span>
          <span>{sig3(maxVal)}</span>
        </div>
      </div>
    </div>
  );
};