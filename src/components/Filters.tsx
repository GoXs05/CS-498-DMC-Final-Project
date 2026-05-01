
/* =========================
Filters.tsx
========================= */

import React from 'react';
import { Search, Layers } from 'lucide-react';

interface FiltersProps {
  onSearch: (query: string) => void;
  onVariableChange: (variable: string) => void;
}

export const Filters: React.FC<FiltersProps> = ({
  onSearch,
  onVariableChange
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center gap-6">
      {/* Search */}
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

        <input
          type="text"
          placeholder="Search county..."
          onChange={(e) => onSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none"
        />
      </div>

      {/* Variable selector */}
      <div className="flex items-center gap-2">
        <Layers className="w-4 h-4 text-slate-400" />

        <select
          onChange={(e) => onVariableChange(e.target.value)}
          className="text-sm font-medium bg-transparent focus:outline-none"
        >
          <option value="UV BED">UV BED</option>
          <option value="Ozone (O3)">Ozone (O3)</option>
          <option value="Carbon Monoxide (CO)">Carbon Monoxide (CO)</option>
          <option value="Nitrogen Dioxide (NO2)">Nitrogen Dioxide (NO2)</option>
        </select>
      </div>
    </header>
  );
};