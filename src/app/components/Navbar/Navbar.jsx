"use client";

import React, { useState, useEffect } from 'react';
import styles from './Navbar.module.css';
import { FiMenu, FiX, FiChevronDown, FiChevronUp, FiUser } from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFeaturesDropdownOpen, setIsFeaturesDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkUserAndAdminStatus = async () => {
      const { data: { session } = {} } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', currentUser.id)
            .single();

          if (error) throw error;
          setIsAdmin(profile?.role === 'admin');
        } catch (err) {
          console.error("Error fetching user profile:", err);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    checkUserAndAdminStatus();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        supabase.from('profiles').select('role').eq('id', currentUser.id).single()
          .then(({ data: profile, error }) => {
            if (error) console.error("Error fetching profile:", error);
            setIsAdmin(profile?.role === 'admin');
          })
          .catch(err => console.error("Error fetching profile:", err));
      } else {
        setIsAdmin(false);
      }
    });

    return () => authListener?.subscription?.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    closeAllMenus();
    router.push('/login');
  };

  const closeAllMenus = () => {
    setIsOpen(false);
    setIsFeaturesDropdownOpen(false);
    setIsUserDropdownOpen(false);
  };

  const toggleFeaturesDropdown = () => {
    setIsFeaturesDropdownOpen(prev => !prev);
    setIsUserDropdownOpen(false);
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(prev => !prev);
    setIsFeaturesDropdownOpen(false);
  };

  const navItemsAdmin = [
    { path: '/about', label: 'About' },
    { path: '/admin', label: 'Admin Dashboard' },
  ];

  const navItemsUser = [
    { path: '/about', label: 'About' },
    { path: '/dashboard', label: 'Dashboard' },
  ];

  const featuresDropdownItems = [
    { path: '/cv-analyze', label: 'Analisis CV' },
    { path: '/cv-maker', label: 'Buat CV' },
    { path: '/job-tracker', label: 'Job Tracker' },
  ];

  const userDropdownItems = [
    { path: '/profile', label: 'Profile' },
    { path: '/settings', label: 'Settings' },
  ];

  const getUserName = () => {
    if (!user) return '';
    return user.user_metadata?.full_name || user.email?.split('@')[0] || 'Account';
  };

  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <Link href="/" onClick={closeAllMenus}>
          <img src="/sv.png" alt="Logo" className={styles.logo} />
        </Link>
      </div>

      <nav className={`${styles.navContainer} ${isOpen ? styles.active : ''}`}>
        <button className={styles.closeMenuButton} onClick={closeAllMenus}>
          <FiX />
        </button>

        <div className={styles.navLinks}>
          {user ? (
            isAdmin ? (
              navItemsAdmin.map(item => (
                <Link href={item.path} key={item.path} className={styles.navLink} onClick={closeAllMenus}>
                  {item.label}
                </Link>
              ))
            ) : (
              <>
                {navItemsUser.map(item => (
                  <Link href={item.path} key={item.path} className={styles.navLink} onClick={closeAllMenus}>
                    {item.label}
                  </Link>
                ))}
                <div className={styles.dropdownContainer}>
                  <button
                    className={styles.dropdownToggle}
                    onClick={toggleFeaturesDropdown}
                  >
                    Fitur {isFeaturesDropdownOpen ? <FiChevronUp /> : <FiChevronDown />}
                  </button>
                  {isFeaturesDropdownOpen && (
                    <div className={styles.dropdownMenu}>
                      {featuresDropdownItems.map(item => (
                        <Link href={item.path} key={item.path} className={styles.dropdownItem} onClick={closeAllMenus}>
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )
          ) : (
            <Link href="/about" className={styles.navLink} onClick={closeAllMenus}>About</Link>
          )}
        </div>

        <div className={styles.authButtons}>
          {user ? (
            <div className={styles.userDropdownContainer}>
              <button
                className={styles.userButton}
                onClick={toggleUserDropdown}
              >
                <FiUser className={styles.userIcon} />
                <span className={styles.userName}>{getUserName()}</span>
                {isUserDropdownOpen ? <FiChevronUp /> : <FiChevronDown />}
              </button>
              {isUserDropdownOpen && (
                <div className={styles.userDropdownMenu}>
                  {userDropdownItems.map(item => (
                    <Link href={item.path} key={item.path} className={styles.dropdownItem} onClick={closeAllMenus}>
                      {item.label}
                    </Link>
                  ))}
                  <button onClick={handleLogout} className={styles.logoutButton}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className={styles.loginButton} onClick={closeAllMenus}>Login</Link>
              <Link href="/register" className={styles.signupButton} onClick={closeAllMenus}>Sign Up</Link>
            </>
          )}
        </div>
      </nav>

      {isOpen && <div className={styles.backdrop} onClick={closeAllMenus}></div>}

      <button className={styles.menuToggle} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FiX /> : <FiMenu />}
      </button>
    </header>
  );
}