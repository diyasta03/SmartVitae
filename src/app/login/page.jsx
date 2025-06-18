"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import styles from './Auth.module.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!isMounted) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push('/');
    } catch (err) {
      setError(err.message);
    } finally {
      if (isMounted) setIsLoading(false);
    }
  };

  const handleLoginWithGoogle = async () => {
    if (!isMounted) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: location.origin
        }
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message);
      if (isMounted) setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.223,0-9.641-3.657-11.303-8H6.306C9.656,39.663,16.318,44,24,44z" />
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C41.38,35.14,44,30.02,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
  );

  const EyeIcon = ({ visible }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={styles.eyeIcon}
      onClick={togglePasswordVisibility}
    >
      {visible ? (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        </>
      ) : (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </>
      )}
    </svg>
  );

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <div className={styles.gradientBg}></div>
        <div className={styles.formCard}>
          <div className={styles.logoContainer}>
            <div className={styles.logo}> <img src="sv.png" className={styles.logo} /></div>
            <h1 className={styles.title}>Login Akun</h1>
          </div>

          {error && (
            <div className={styles.errorContainer}>
              <svg className={styles.errorIcon} viewBox="0 0 24 24">
                <path fill="currentColor" d="M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z" />
              </svg>
              <p className={styles.errorText}>{error}</p>
            </div>
          )}

          <button
            onClick={handleLoginWithGoogle}
            disabled={isLoading}
            className={styles.googleButton}
            aria-label="Login with Google"
          >
            <GoogleIcon />
            {isLoading ? 'Mengalihkan...' : 'Lanjutkan dengan Google'}
          </button>

          <div className={styles.divider}>
            <span className={styles.dividerLine}></span>
            <span className={styles.dividerText}>atau lanjutkan dengan email</span>
            <span className={styles.dividerLine}></span>
          </div>
          
          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.formGroup}>
              <input
                id="email"
                type="email"
                className={styles.formInput}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder=" "
                autoComplete="email"
              />
              <label htmlFor="email" className={styles.formLabel}>Alamat Email</label>
              <div className={styles.inputUnderline}></div>
            </div>
            <div className={styles.formGroup}>
              <input
                id="password"
                type={isPasswordVisible ? "text" : "password"}
                className={styles.formInput}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder=" "
                autoComplete="current-password"
              />
              <label htmlFor="password" className={styles.formLabel}>Password</label>
              <div className={styles.inputUnderline}></div>
              <EyeIcon visible={isPasswordVisible} />
            </div>
            <div className={styles.forgotPassword}>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={styles.submitButton}
              aria-label={isLoading ? 'Sedang login' : 'Login'}
            >
              {isLoading ? (
                <span className={styles.spinner}></span>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <div className={styles.switchLink}>
            Belum punya akun?{' '}
            <Link href="/register" className={styles.switchLinkText}>
              Daftar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;