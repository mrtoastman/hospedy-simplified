'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from '../auth.module.css';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      setError('Error al iniciar sesión. Intenta de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.logo}>Hospedy</div>

      <form onSubmit={handleLogin} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.formGroup}>
          <label className={styles.label}>Correo electrónico</label>
          <input
            type="email"
            className={styles.input}
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Contraseña</label>
          <input
            type="password"
            className={styles.input}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? 'Cargando...' : 'Inicia sesión'}
        </button>
      </form>

      <div className={styles.link}>
        ¿No tienes cuenta?{' '}
        <Link href="/auth/registro">Regístrate aquí</Link>
      </div>
    </div>
  );
}
