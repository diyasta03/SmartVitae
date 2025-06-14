"use client";

import { useState, useEffect } from 'react';
import styles from './Navbar.module.css';
import { FiMenu, FiX } from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient'; // Pastikan path ini benar

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsOpen(false); // Tutup menu setelah logout
    router.push('/login');
  };

  const closeMenu = () => setIsOpen(false);

  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <Link href="/">
          <img src="/logo.png" alt="SmartVitae Logo" className={styles.logo} />
        </Link>
      </div>

      <nav className={`${styles.navContainer} ${isOpen ? styles.active : ''}`}>
        <div className={styles.navLinks}>
          <Link href="/about" className={styles.navLink} onClick={closeMenu}>About Us</Link>
         
                      <Link href="/dashboard" className={styles.navLink} onClick={closeMenu}>Dashboard</Link>


        </div>

        <div className={styles.authButtons}>
          {user ? (
            <>
      {/* UBAH BAGIAN INI DARI SPAN MENJADI LINK */}
      <Link href="/profile" className={styles.welcomeText} style={{textDecoration: 'none'}}>
        Halo, {user.user_metadata.full_name || user.email}
      </Link>
      <button onClick={handleLogout} className={styles.signup}>Logout</button>
    </>
          ) : (
            <>
              <Link href="/login" className={styles.login} onClick={closeMenu}>Login</Link>
              <Link href="/register" className={styles.signup} onClick={closeMenu}>Sign Up</Link>
            </>
          )}
        </div>
      </nav>

      {/* Tombol menu mobile diletakkan di sini agar tidak mengganggu flexbox */}
      <button className={styles.menuToggle} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FiX /> : <FiMenu />}
      </button>
    </header>
  );
}