"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FiHome, 
  FiFileText, 
  FiUser, 
  FiSettings,
  FiLogOut,
  FiRewind
} from 'react-icons/fi';
import { supabase } from '../../../lib/supabaseClient';
import styles from './DashboardSidebar.module.css';

export default function DashboardSidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const navItems = [
    { href: '/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { href: '/my-cvs', icon: <FiFileText />, label: 'My CVs' },
    { href: '/history', icon: <FiRewind />, label: 'Riwayat Analis' },

    { href: '/profile', icon: <FiUser />, label: 'Profile' },
    { href: '/settings', icon: <FiSettings />, label: 'Settings' },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h2 className={styles.logo}>CV<span>Pro</span></h2>
      </div>
      
      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {navItems.map((item) => (
            <li key={item.href}>
              <Link 
                href={item.href}
                className={`${styles.navLink} ${pathname === item.href ? styles.active : ''}`}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className={styles.sidebarFooter}>
        <button onClick={handleLogout} className={styles.logoutButton}>
          <FiLogOut className={styles.logoutIcon} />
          Logout
        </button>
      </div>
    </aside>
  );
}