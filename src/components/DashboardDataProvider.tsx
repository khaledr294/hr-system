'use client';

import { createContext, useContext, ReactNode } from 'react';

export type DashboardStats = {
  workers: number;
  clients: number;
  contracts: number;
  marketers: number;
  contractsToday: number;
  contractsMonth: number;
  statusCounts: { status: string; _count: { status: number } }[];
};

interface DashboardDataContextType {
  data: DashboardStats;
  loading: boolean;
}

const DashboardDataContext = createContext<DashboardDataContextType | undefined>(undefined);

export function DashboardDataProvider({ 
  children, 
  data 
}: { 
  children: ReactNode; 
  data: DashboardStats;
}) {
  return (
    <DashboardDataContext.Provider value={{ data, loading: false }}>
      {children}
    </DashboardDataContext.Provider>
  );
}

export function useDashboardData() {
  const context = useContext(DashboardDataContext);
  if (context === undefined) {
    throw new Error('useDashboardData must be used within DashboardDataProvider');
  }
  return context;
}
