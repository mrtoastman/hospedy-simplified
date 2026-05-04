'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.push('/app/login');
          return;
        }

        setLoading(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/app/login');
      }
    };

    checkAuth();
  }, [router]);

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
        Cargando...
      </div>
    );
  }

  return <>{children}</>;
}
