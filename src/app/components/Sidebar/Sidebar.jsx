// src/app/components/Layout/Sidebar.jsx
"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FiHome,
  FiUser,
  FiFileText,
  FiSettings,
  FiLogOut,
  FiChevronLeft,
  FiMenu,
  FiList,
  FiBriefcase,
  FiArrowLeft,
  FiShield, // Icon for Admin Dashboard (new)
  FiUsers, // Icon for Admin Users (new)
} from 'react-icons/fi';
import styles from './Sidebar.module.css';
import { supabase } from '@/lib/supabaseClient'; // Pastikan path ini benar
import { useRouter } from 'next/navigation';
// Pastikan path untuk LoadingSpinner ini benar jika Anda menggunakannya di sini
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner'; // <--- PASTIKAN PATH INI BENAR

const VerticalSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [user, setUser] = useState(null); // State untuk menyimpan sesi pengguna
  const [isAdmin, setIsAdmin] = useState(false); // State untuk status admin
  const [loadingUser, setLoadingUser] = useState(true); // State loading untuk pengecekan pengguna

  useEffect(() => {
    const checkUserAndAdminStatus = async () => {
      setLoadingUser(true); // Mulai loading
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      if (session?.user) {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (error) throw error;
          setIsAdmin(profile?.role === 'admin'); // Set status admin
        } catch (err) {
          console.error("Error fetching user profile for sidebar:", err);
          setIsAdmin(false); // Default ke bukan admin jika ada error
        }
      } else {
        setIsAdmin(false); // Bukan admin jika tidak ada user
      }
      setLoadingUser(false); // Akhiri loading
    };

    checkUserAndAdminStatus(); // Panggil saat komponen dimuat

    // Dengarkan perubahan status otentikasi untuk memperbarui sidebar secara dinamis
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // Ambil profil lagi jika status otentikasi berubah (misal: login/logout)
        supabase.from('profiles').select('role').eq('id', session.user.id).single()
          .then(({ data: profile, error }) => {
            if (error) console.error("Error fetching profile on auth change:", error);
            setIsAdmin(profile?.role === 'admin');
          })
          .catch(err => console.error("Error fetching profile on auth change catch:", err));
      } else {
        setIsAdmin(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe(); // Bersihkan listener saat komponen dilepas
    };
  }, []); // Dependensi kosong agar hanya berjalan sekali saat mount

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Item navigasi umum untuk pengguna biasa
  const navItemsCommon = [
    { path: '/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { path: '/my-cvs', icon: <FiFileText />, label: 'CV Saya' },
    { path: '/history', icon: <FiList />, label: 'Riwayat' },
    { path: '/job-tracker', icon: <FiBriefcase />, label: 'Cek Lamaran Anda' },
  ];

  // Item navigasi khusus untuk admin
  const navItemsAdmin = [
    { path: '/admin', icon: <FiShield />, label: 'Admin Dashboard' },
    { path: '/admin/users', icon: <FiUsers />, label: 'Admin Users' },
    { path: '/admin/cvs', icon: <FiFileText />, label: 'Admin CVs' },
    { path: '/admin/analyses', icon: <FiList />, label: 'Admin Analyses' },
  ];

  // Item navigasi di bagian bawah (profil, home, keluar)
  const navItemsBottom = [
    { path: '/profile', icon: <FiUser />, label: 'Profil' },
    { path: '/', icon: <FiArrowLeft />, label: 'Home' },
  ];

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  // Pilih set item navigasi yang akan ditampilkan
  const currentNavItems = isAdmin ? navItemsAdmin : navItemsCommon;

  // Tampilkan spinner atau indikator loading saat status user/admin sedang ditentukan
  if (loadingUser) {
    return (
      <aside className={`${styles.sidebar} ${isExpanded ? styles.expanded : styles.collapsed}`}>
         <div className={styles.brand}>
          {isExpanded ? (
           <Link href="/">
          <img src="/sv.png" alt="SmartVitae Logo" className={styles.logo} />
        </Link>
          ) : (
             <Link href="/">
          <img src="/icon.png" alt="SmartVitae Logo" className={styles.logo} />
        </Link>
          )}
        </div>
        <div className={styles.nav}>
          <p className={styles.loadingText}>{isExpanded ? "Memuat menu..." : ""}</p>
        </div>
        <div className={styles.bottomSection}>
          <div className={styles.loadingSpinnerSmall}></div>
        </div>
      </aside>
    );
  }

  return (
    <>
      {/* Tombol Menu Mobile (Hamburger) */}
      <button
        className={styles.mobileMenuButton}
        onClick={toggleMobileMenu}
      >
        <FiMenu size={24} />
      </button>

      {/* Sidebar Utama */}
      <aside className={`${styles.sidebar} ${isExpanded ? styles.expanded : styles.collapsed} ${isMobileOpen ? styles.mobileOpen : ''}`}>
        {/* Tombol Toggle Expand/Collapse (Desktop) */}
      

        {/* Brand/Logo */}
        <div className={styles.brand}>
          {isExpanded ? (
           <Link href="/" onClick={() => setIsMobileOpen(false)}>
          <img src="/sv.png" alt="SmartVitae Logo" className={styles.logo} />
        </Link>
          ) : (
             <Link href="/" onClick={() => setIsMobileOpen(false)}>
          <img src="/icon.png" alt="SmartVitae Logo" className={styles.logo} />
        </Link>
          )}
        </div>

        {/* Navigasi Utama */}
        <nav className={styles.nav}>
          <ul className={styles.navList}>
            {currentNavItems.map((item) => (
              <li key={item.path} className={styles.navItem}>
                <Link
                  href={item.path}
                  className={`${styles.navLink} ${pathname === item.path ? styles.active : ''}`}
                  title={!isExpanded ? item.label : ''}
                  onClick={() => setIsMobileOpen(false)} // Tutup menu mobile saat klik nav item
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  {isExpanded && <span className={styles.navLabel}>{item.label}</span>}
                  {!isExpanded && (
                    <span className={styles.tooltip}>{item.label}</span>
                  )}
                </Link>
              </li>
            ))}
            {/* Item navigasi di bagian bawah (profil, home) */}
            {navItemsBottom.map((item) => (
              <li key={item.path} className={styles.navItem}>
                <Link
                  href={item.path}
                  className={`${styles.navLink} ${pathname === item.path ? styles.active : ''}`}
                  title={!isExpanded ? item.label : ''}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  {isExpanded && <span className={styles.navLabel}>{item.label}</span>}
                  {!isExpanded && (
                    <span className={styles.tooltip}>{item.label}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Tombol Logout */}
        <div className={styles.bottomSection}>
          <button
            onClick={handleLogout}
            className={styles.logoutButton}
            title={!isExpanded ? "Keluar" : ""}
          >
            <span className={styles.navIcon}><FiLogOut /></span>
            {isExpanded && <span className={styles.navLabel}>Keluar</span>}
            {!isExpanded && (
              <span className={styles.tooltip}>Keluar</span>
            )}
          </button>
        </div>
      </aside>

      {/* Overlay Mobile (muncul saat menu mobile terbuka) */}
      {isMobileOpen && (
        <div
          className={styles.mobileOverlay}
          onClick={toggleMobileMenu}
        />
      )}
    </>
  );
};

export default VerticalSidebar;