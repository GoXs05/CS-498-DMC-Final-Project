import { CountyStats, StatewideAnalytics } from "../types";

export const CA_COUNTIES = [
  "Alameda", "Alpine", "Amador", "Butte", "Calaveras", "Colusa", "Contra Costa", "Del Norte", "El Dorado", "Fresno",
  "Glenn", "Humboldt", "Imperial", "Inyo", "Kern", "Kings", "Lake", "Lassen", "Los Angeles", "Madera",
  "Marin", "Mariposa", "Mendocino", "Merced", "Modoc", "Mono", "Monterey", "Napa", "Nevada", "Orange",
  "Placer", "Plumas", "Riverside", "Sacramento", "San Benito", "San Bernardino", "San Diego", "San Francisco", "San Joaquin", "San Luis Obispo",
  "San Mateo", "Santa Barbara", "Santa Clara", "Santa Cruz", "Shasta", "Sierra", "Siskiyou", "Solano", "Sonoma", "Stanislaus",
  "Sutter", "Tehama", "Trinity", "Tulare", "Tuolumne", "Ventura", "Yolo", "Yuba"
];

const VARIABLES = ["UV BED", "Ozone (O3)", "Carbon Monoxide (CO)", "Nitrogen Dioxide (NO2)"];

// Mock populations
const mockPopulations: Record<string, number> = {};
CA_COUNTIES.forEach(c => {
  mockPopulations[c] = Math.floor(Math.random() * 1000000) + 50000;
});

export const getCountyStats = (countyName: string): CountyStats => {
  return {
    name: countyName,
    population: mockPopulations[countyName] || 100000,
    trends: VARIABLES.map(v => ({
      variable: v,
      threeMonthValues: [
        50 + Math.random() * 20, // M-2
        55 + Math.random() * 20, // M-1
        60 + Math.random() * 20  // Now
      ]
    }))
  };
};

export const getVariableDataForAllCounties = (variable: string): Record<string, number> => {
  const data: Record<string, number> = {};
  CA_COUNTIES.forEach(county => {
    // Just a random value representing the current (M-0) data for the heatmap
    data[county] = variable === "UV BED" ? 5 + Math.random() * 15 : 
                   variable === "Ozone (O3)" ? 30 + Math.random() * 40 :
                   variable === "Carbon Monoxide (CO)" ? 0.1 + Math.random() * 0.9 :
                   5 + Math.random() * 25; // NO2
  });
  return data;
};

export const getStatewideAnalytics = (): StatewideAnalytics => {
  return {
    uvBedExtremes: {
      highest: [
        { county: "Imperial", value: 22.5 },
        { county: "Inyo", value: 21.2 },
        { county: "Riverside", value: 20.8 }
      ],
      lowest: [
        { county: "Del Norte", value: 8.4 },
        { county: "Humboldt", value: 9.1 },
        { county: "Trinity", value: 10.2 }
      ]
    },
    highestAvgOzone: [
      { county: "Kern", value: 65.5 },
      { county: "San Bernardino", value: 62.8 },
      { county: "Tulare", value: 60.2 },
      { county: "Fresno", value: 58.9 },
      { county: "Los Angeles", value: 57.7 }
    ],
    mostDrasticUvTrends: [
      { county: "Mono", rate: 4.2 },
      { county: "Inyo", rate: 3.8 },
      { county: "Alpine", rate: -2.5 },
      { county: "Lassen", rate: 2.2 },
      { county: "Modoc", rate: 1.8 },
      { county: "Plumas", rate: 1.5 }
    ],
    urbanRuralSummary: {
      urban: { avgOzone: 55.2, avgUvBed: 18.2 },
      rural: { avgOzone: 42.5, avgUvBed: 14.5 }
    },
    urbanRuralThreshold: 250000
  };
};
