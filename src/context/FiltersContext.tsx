import { useState } from 'react';
import type { ReactNode } from 'react';
import { FiltersContext, type TimeWindow } from './filters';

export function FiltersProvider({ children }: { children: ReactNode }) {
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('Last 7d');
  const [modelVersion, setModelVersion] = useState('');

  return (
    <FiltersContext.Provider value={{ timeWindow, setTimeWindow, modelVersion, setModelVersion }}>
      {children}
    </FiltersContext.Provider>
  );
}
