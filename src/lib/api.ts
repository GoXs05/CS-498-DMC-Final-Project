import { CountyStats, StatewideAnalytics } from "../types";

const API_BASE = "http://34.55.126.122:8000/api" || "http://localhost:8000/api";

export async function fetchStatewideAnalytics(): Promise<StatewideAnalytics> {
  const res = await fetch(`${API_BASE}/statewide`);
  if (!res.ok) throw new Error("Failed to fetch statewide analytics");
  return res.json();
}

export async function fetchCountyStats(county: string): Promise<CountyStats> {
  const res = await fetch(`${API_BASE}/county/${encodeURIComponent(county)}`);
  if (!res.ok) throw new Error("Failed to fetch county stats");
  return res.json();
}

export async function fetchHeatmapData(variable: string): Promise<Record<string, number>> {
  const res = await fetch(`${API_BASE}/heatmap?variable=${encodeURIComponent(variable)}`);
  if (!res.ok) throw new Error("Failed to fetch heatmap data");
  return res.json();
}