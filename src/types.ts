export interface CountyTrend {
  variable: string;
  threeMonthValues: number[]; // [M-2, M-1, Now]
}

export interface CountyStats {
  name: string;
  population: number;
  trends: CountyTrend[];
}

export interface StatewideAnalytics {
  uvBedExtremes: {
    highest: { county: string; value: number }[];
    lowest: { county: string; value: number }[];
  };
  highestAvgOzone: { county: string; value: number }[];
  mostDrasticUvTrends: { county: string; rate: number }[];
  urbanRuralSummary: {
    urban: { avgOzone: number; avgUvBed: number };
    rural: { avgOzone: number; avgUvBed: number };
  };
  urbanRuralThreshold: number;
}
