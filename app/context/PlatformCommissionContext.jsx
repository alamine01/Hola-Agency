"use client";
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const PlatformCommissionContext = createContext({
  commission: 0,
  setCommission: () => {},
  refresh: () => {}
});

export const PlatformCommissionProvider = ({ children }) => {
  const [commission, setCommission] = useState(0);

  const refresh = async () => {
    const { data, error } = await supabase
      .from('platform_settings')
      .select('commission_percent')
      .single();
    if (!error && data) {
      setCommission(data.commission_percent);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <PlatformCommissionContext.Provider value={{ commission, setCommission, refresh }}>
      {children}
    </PlatformCommissionContext.Provider>
  );
};

export const usePlatformCommission = () => useContext(PlatformCommissionContext);
