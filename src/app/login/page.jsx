"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import styles from './Auth.module.css'; // Menggunakan file CSS yang sama

const LoginPage = () => {
  const [email, setEmail] =useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginWithGoogle = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.223,0-9.641-3.657-11.303-8H6.306C9.656,39.663,16.318,44,24,44z" />
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C41.38,35.14,44,30.02,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
  );

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <div className={styles.gradientBg}></div>
        <div className={styles.formCard}>
          <h1 className={styles.title}>Login Akun</h1>

          {error && <p className={styles.error}>{error}</p>}

          <button onClick={handleLoginWithGoogle} disabled={isLoading} className={styles.googleButton}>
            <GoogleIcon />
            {isLoading ? 'Mengalihkan...' : 'Lanjutkan dengan Google'}
          </button>

          <div className={styles.divider}>atau lanjutkan dengan email</div>
          
          <form onSubmit={handleLogin}>
            <div className={styles.formGroup}>
              <input id="email" type="email" className={styles.formInput} value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Email"/>
              <label htmlFor="email" className={styles.formLabel}>Alamat Email</label>
            </div>
            <div className={styles.formGroup}>
              <input id="password" type="password" className={styles.formInput} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Password" />
              <label htmlFor="password" className={styles.formLabel}>Password</label>
            </div>
            <button type="submit" disabled={isLoading} className={styles.submitButton}>
              {isLoading ? 'Masuk...' : 'Login'}
            </button>
          </form>

          <div className={styles.switchLink}>
            Belum punya akun?{' '}
            <Link href="/register">Daftar</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;