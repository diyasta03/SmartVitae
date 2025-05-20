"use client";
import { useState } from 'react';
import styles from './Navbar.module.css';
import { FiMenu, FiX } from 'react-icons/fi';
import Link from 'next/link';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header className={styles.header}>
      <div className={styles.logo}>SmartVitae</div>

      <div className={styles.hamburger} onClick={toggleMenu}>
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </div>

      <nav className={`${styles.navContainer} ${isOpen ? styles.active : ''}`}>
        <div className={styles.navLinks}>
   
        </div>
        <div className={styles.authButtons}>
          <Link href="/login" className={styles.login}>Login</Link>
          <Link href="/signup" className={styles.signup}>Sign Up</Link>
        </div>
      </nav>
    </header>
  );
}
