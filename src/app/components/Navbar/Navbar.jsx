"use client";
import Link from "next/link";
import styles from "./Navbar.module.css";

export default function Navbar() {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>SmartVitae - By Redist Tech</div>
      <nav>
        <div className={styles.navLinks}>
          <Link href="#">Coming Soon</Link>
          <Link href="#">Coming Soon</Link>
          <Link href="#">Coming Soon</Link>
          <Link href="#">Coming Soon</Link>
          <Link href="#">Coming Soon</Link>
        </div>
      </nav>
      <div className={styles.authButtons}>
        <Link href="/login" className={styles.login}>
          LOG IN
        </Link>
        <Link href="/signup" className={styles.signup}>
          SIGN UP
        </Link>
      </div>
    </header>
  );
}