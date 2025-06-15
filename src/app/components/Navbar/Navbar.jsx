"use client";

import { useState, useEffect } from 'react';
import styles from './Navbar.module.css';
import { FiMenu, FiX } from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null); // null if not logged in, user object if logged in
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      // Destructure data with a default empty object to avoid errors if data is undefined
      const { data: { session } = {} } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    getSession();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    // Cleanup the subscription
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []); // Empty dependency array means this runs once on mount

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsOpen(false); // Close menu after logout
    router.push('/login'); // Redirect to login page after logout
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

          {/* Kondisi untuk menampilkan Dashboard */}
          {user && ( // Hanya render link ini jika 'user' tidak null (artinya sudah login)
            <Link href="/dashboard" className={styles.navLink} onClick={closeMenu}>Dashboard</Link>
          )}
        </div>

        <div className={styles.authButtons}>
          {user ? (
            <>
              <Link href="/profile" className={styles.welcomeText} onClick={closeMenu}>
                Halo, {user.user_metadata?.full_name || user.email}
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

      <button className={styles.menuToggle} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FiX /> : <FiMenu />}
      </button>
    </header>
  );
}