"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
// Asumsi Anda menggunakan CSS dari login, jika beda, sesuaikan path-nya
import styles from '../login/Auth.module.css'; 

const RegisterPage = () => {
  // 1. TAMBAHKAN STATE BARU UNTUK NAMA
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok.");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      // 3. UPDATE FUNGSI SIGNUP UNTUK MENGIRIM NAMA
      const { error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: name, // Data tambahan disimpan di sini
          }
        }
      });

      if (error) {
        throw error;
      }

      alert('Pendaftaran berhasil! Silakan login.');
      router.push('/login');

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <div className={styles.gradientBg}></div>
        <div className={styles.formCard}>
          <h1 className={styles.title}>Buat Akun Baru</h1>
          
          {error && <p className={styles.error}>{error}</p>}
          
          <form onSubmit={handleRegister}>
            {/* 2. TAMBAHKAN INPUT FIELD BARU UNTUK NAMA */}
            <div className={styles.formGroup}>
              <input
                id="name"
                type="text"
                className={styles.formInput}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Nama Lengkap"
              />
              <label htmlFor="name" className={styles.formLabel}>Nama Lengkap</label>
            </div>

            <div className={styles.formGroup}>
              <input
                id="email"
                type="email"
                className={styles.formInput}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Email"
              />
              <label htmlFor="email" className={styles.formLabel}>Alamat Email</label>
            </div>

            <div className={styles.formGroup}>
              <input
                id="password"
                type="password"
                className={styles.formInput}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="6"
                placeholder="Password"
              />
              <label htmlFor="password" className={styles.formLabel}>Password</label>
            </div>

            <div className={styles.formGroup}>
              <input
                id="confirmPassword"
                type="password"
                className={styles.formInput}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Konfirmasi Password"
              />
              <label htmlFor="confirmPassword" className={styles.formLabel}>Konfirmasi Password</label>
            </div>

            <button type="submit" disabled={isLoading} className={styles.submitButton}>
              {isLoading ? 'Mendaftar...' : 'Daftar'}
            </button>
          </form>

          <div className={styles.switchLink}>
            Sudah punya akun?{' '}
            <Link href="/login">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;