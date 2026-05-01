/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Map } from './components/Map';
import { Filters } from './components/Filters';
import { CA_COUNTIES } from './lib/mockData';
import { fetchStatewideAnalytics, fetchHeatmapData, fetchCountyStats } from './lib/api';
import { CountyStats, StatewideAnalytics } from './types';

export default function App() {
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
  const [countyStats, setCountyStats] = useState<CountyStats | null>(null);
  const [statewideAnalytics, setStatewideAnalytics] = useState<StatewideAnalytics | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVariable, setActiveVariable] = useState('UV BED');
  const [heatmapData, setHeatmapData] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchStatewideAnalytics()
      .then(setStatewideAnalytics)
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchHeatmapData(activeVariable)
      .then(setHeatmapData)
      .catch(console.error);
  }, [activeVariable]);

  useEffect(() => {
    if (selectedCounty) {
      fetchCountyStats(selectedCounty)
        .then(setCountyStats)
        .catch(console.error);
    } else {
      setCountyStats(null);
    }
  }, [selectedCounty]);

  const handleCountyClick = (countyName: string, _latlng: [number, number], shiftKey: boolean) => {
    setSelectedCounty(prev => {
      if (shiftKey && prev === countyName) {
        return null;
      }
      return countyName;
    });
  };

  const handleClosePopup = () => {
    setSelectedCounty(null);
    setCountyStats(null);
  };

  const handleVariableChange = (variable: string) => {
    setActiveVariable(variable);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') return;

    const matchedCounty = CA_COUNTIES.find(c => 
      c.toLowerCase() === query.toLowerCase()
    );

    if (matchedCounty) {
      setSelectedCounty(matchedCounty);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar for Statewide Analytics */}
      {statewideAnalytics && <Sidebar analytics={statewideAnalytics} />}

      <div className="flex-1 flex flex-col relative">
        {/* Top Filters Bar */}
        <Filters 
          onSearch={handleSearch}
          onVariableChange={handleVariableChange}
        />

        {/* Main Map View */}
        <main className="flex-1 relative flex">
          <Map 
            onCountyClick={handleCountyClick} 
            selectedCounty={selectedCounty}
            countyStats={countyStats}
            onClosePopup={handleClosePopup}
            activeVariable={activeVariable}
            heatmapData={heatmapData}
          />
        </main>

      </div>
    </div>
  );
}

