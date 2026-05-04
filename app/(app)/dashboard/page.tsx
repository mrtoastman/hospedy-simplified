'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import DashboardContent from '@/components/dashboard';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    loadUser();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          fontSize: '16px',
          color: '#666',
        }}
      >
        Cargando dashboard...
      </div>
    );
  }

  return <DashboardContent user={user} />;
}
