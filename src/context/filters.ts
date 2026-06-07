import { createContext, useContext } from 'react';

export const TIME_WINDOWS = ['Last 1h', 'Last 6h', 'Last 24h', 'Last 7d', 'Last 30d'] as const;
export type TimeWindow = typeof TIME_WINDOWS[number];

export interface FiltersCtx {
  timeWindow: TimeWindow;
  setTimeWindow: (v: TimeWindow) => void;
  modelVersion: string;
  setModelVersion: (v: string) => void;
}

export const FiltersContext = createContext<FiltersCtx>({
  timeWindow: 'Last 7d',
  setTimeWindow: () => {},
  modelVersion: '',
  setModelVersion: () => {},
});

export const useFilters = () => useContext(FiltersContext);
