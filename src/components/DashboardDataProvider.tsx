'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type DashboardStats = {
  workers: number;
  clients: number;
  contracts: number;
  marketers: number;
  contractsToday: number;
  contractsMonth: number;
  statusCounts: { status: string; _count: { status: number } }[];
};

interface DashboardDataContextType {
  data: DashboardStats | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

const DashboardDataContext = createContext<DashboardDataContextType | undefined>(undefined);

export function DashboardDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const controller = new AbortController();
      const response = await fetch('/api/dashboard', {
        signal: controller.signal,
        headers: { 'Cache-Control': 'max-age=60' }
      });

      if (!response.ok) {
        throw new Error('فشل جلب البيانات');
      }

      const json = await response.json();
      setData(json);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err);
        console.error('Error fetching dashboard data:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <DashboardDataContext.Provider value={{ data, loading, error, refetch: fetchData }}>
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
