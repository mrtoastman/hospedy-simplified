'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import styles from '../auth.module.css';
import Link from 'next/link';

export default function RegistroPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    // Validate inputs
    if (!fullName || !email || !password || !confirmPassword) {
      setError('Por favor completa todos los campos');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      // Sign up with Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Insert user into public.users table
        const { error: insertError } = await supabase.from('users').insert({
          id: data.user.id,
          email: data.user.email,
          full_name: fullName,
          created_at: new Date().toISOString(),
        });

        if (insertError && !insertError.message.includes('duplicate')) {
          setError('Error al crear el perfil. Por favor intenta de nuevo.');
          setLoading(false);
          return;
        }
      }

      setSuccess(true);
      setFullName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError('Error al registrarse. Intenta de nuevo.');
      setLoading(false);
    }

    setLoading(false);
  };

  return (
    <div className={styles.card}>
      <div className={styles.logo}>Hospedy</div>

      <form onSubmit={handleRegister} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}
        {success && (
          <div className={styles.success}>
            Registrado exitosamente. Revisa tu correo para verificar tu cuenta.
          </div>
        )}

        <div className={styles.formGroup}>
          <label className={styles.label}>Nombre completo</label>
          <input
            type="text"
            className={styles.input}
            placeholder="Tu nombre"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            disabled={loading || success}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Correo electrónico</label>
          <input
            type="email"
            className={styles.input}
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading || success}
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
            disabled={loading || success}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Confirmar contraseña</label>
          <input
            type="password"
            className={styles.input}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading || success}
          />
        </div>

        <button
          type="submit"
          className={styles.button}
          disabled={loading || success}
        >
          {loading ? 'Cargando...' : 'Registrate'}
        </button>
      </form>

      <div className={styles.link}>
        ¿Ya tienes cuenta? <Link href="/auth/login">Inicia sesión aquí</Link>
      </div>
    </div>
  );
}
