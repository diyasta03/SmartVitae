"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import styles from '../login/Auth.module.css';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!isMounted) return;
    
    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok.");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: name,
          }
        }
      });

      if (error) throw error;

      alert('Pendaftaran berhasil! Silakan login.');
      router.push('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      if (isMounted) setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setIsConfirmPasswordVisible(!isConfirmPasswordVisible);
  };

  const EyeIcon = ({ visible, onClick }) => (
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
      onClick={onClick}
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
            <h1 className={styles.title}>Buat Akun Baru</h1>
          </div>

          {error && (
            <div className={styles.errorContainer}>
              <svg className={styles.errorIcon} viewBox="0 0 24 24">
                <path fill="currentColor" d="M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z" />
              </svg>
              <p className={styles.errorText}>{error}</p>
            </div>
          )}
          
          <form onSubmit={handleRegister} className={styles.form}>
            <div className={styles.formGroup}>
              <input
                id="name"
                type="text"
                className={styles.formInput}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder=" "
                autoComplete="name"
              />
              <label htmlFor="name" className={styles.formLabel}>Nama Lengkap</label>
              <div className={styles.inputUnderline}></div>
            </div>

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
                minLength="6"
                placeholder=" "
                autoComplete="new-password"
              />
              <label htmlFor="password" className={styles.formLabel}>Password</label>
              <div className={styles.inputUnderline}></div>
              <EyeIcon 
                visible={isPasswordVisible} 
                onClick={togglePasswordVisibility} 
              />
            </div>

            <div className={styles.formGroup}>
              <input
                id="confirmPassword"
                type={isConfirmPasswordVisible ? "text" : "password"}
                className={styles.formInput}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder=" "
                autoComplete="new-password"
              />
              <label htmlFor="confirmPassword" className={styles.formLabel}>Konfirmasi Password</label>
              <div className={styles.inputUnderline}></div>
              <EyeIcon 
                visible={isConfirmPasswordVisible} 
                onClick={toggleConfirmPasswordVisibility} 
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={styles.submitButton}
              aria-label={isLoading ? 'Sedang mendaftar' : 'Daftar'}
            >
              {isLoading ? (
                <span className={styles.spinner}></span>
              ) : (
                'Daftar'
              )}
            </button>
          </form>

          <div className={styles.switchLink}>
            Sudah punya akun?{' '}
            <Link href="/login" className={styles.switchLinkText}>
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;