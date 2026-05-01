import React from 'react';
import { StatewideAnalytics } from '../types';
import { Thermometer, Droplets, TrendingUp, Map as MapIcon, BarChart3 } from 'lucide-react';

interface SidebarProps {
  analytics: StatewideAnalytics;
}

// 3 significant figures formatter
const sig3 = (value: number): string => {
  if (value === 0) return "0";
  return Number(value).toPrecision(3);
};

export const Sidebar: React.FC<SidebarProps> = ({ analytics }) => {
  return (
    <aside className="w-80 bg-white border-r border-slate-200 h-full overflow-y-auto flex flex-col shadow-sm z-10">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-brand-accent" />
          Statewide Analytics
        </h1>
        <p className="text-sm text-slate-500 mt-1">Aggregated California Data</p>
      </div>

      <div className="p-6 space-y-8">
        {/* UV BED Extremes */}
        <section>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Thermometer className="w-4 h-4" />
            Highest & Lowest UV BEDs Last Month
          </h2>

          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-bold text-red-400 uppercase mb-2">Highest</p>
              <div className="space-y-2">
                {analytics.uvBedExtremes.highest.map(item => (
                  <div key={item.county} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{item.county}</span>
                    <span className="font-mono text-xs font-bold text-red-500">
                      {sig3(item.value)} W/m²
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-blue-400 uppercase mb-2">Lowest</p>
              <div className="space-y-2">
                {analytics.uvBedExtremes.lowest.map(item => (
                  <div key={item.county} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{item.county}</span>
                    <span className="font-mono text-xs font-bold text-blue-500">
                      {sig3(item.value)} W/m²
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Highest Avg Ozone */}
        <section>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Droplets className="w-4 h-4" />
            Highest Avg Ozone (3mo)
          </h2>

          <div className="space-y-2">
            {analytics.highestAvgOzone.map(item => (
              <div key={item.county} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{item.county}</span>

                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{
                        width: `${Math.min(100, item.value * 10000)}%`,
                      }}
                    />
                  </div>

                  <span className="font-mono text-xs text-slate-400">
                    {sig3(item.value)} kg/m³
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Urban vs Rural */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <MapIcon className="w-4 h-4" />
              Urban vs Rural Summary
            </h2>

            <span className="text-[9px] text-slate-400 font-medium">
              Threshold:{" "}
              {analytics.urbanRuralThreshold >= 1000
                ? `${analytics.urbanRuralThreshold / 1000}k`
                : analytics.urbanRuralThreshold}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Urban</p>
              <p className="text-base font-bold text-slate-700">
                Avg Ozone: {sig3(analytics.urbanRuralSummary.urban.avgOzone)} kg/m³
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                UV BED: {sig3(analytics.urbanRuralSummary.urban.avgUvBed)} W/m²
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Rural</p>
              <p className="text-base font-bold text-slate-700">
                Avg Ozone: {sig3(analytics.urbanRuralSummary.rural.avgOzone)} kg/m³
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                UV BED: {sig3(analytics.urbanRuralSummary.rural.avgUvBed)} W/m²
              </p>
            </div>
          </div>
        </section>

        {/* Most Drastic Trends */}
        <section>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Most drastic UV BED trends
          </h2>

          <div className="space-y-2">
            {analytics.mostDrasticUvTrends.map(item => (
              <div key={item.county} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{item.county}</span>

                <span
                  className={`font-mono text-xs font-bold ${
                    item.rate > 0 ? "text-red-500" : "text-blue-500"
                  }`}
                >
                  {item.rate > 0 ? "+" : ""}
                  {sig3(item.rate)} W/m²
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
};