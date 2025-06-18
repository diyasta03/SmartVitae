"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FiHome, 
  FiFileText, 
  FiUser, 
  FiSettings, 
  FiLogOut,
  FiAward,
  FiBriefcase
} from 'react-icons/fi';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import styles from './VerticalSidebar.module.css';
const Sidebar = ({ activePage, onClose }) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error.message);
    } else {
      router.push('/login');
    }
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h2 className={styles.logo}>CV Builder</h2>
      </div>
      
      <nav className={styles.nav}>
        <ul className={styles.navList}>
          <li className={styles.navItem}>
            <Link 
              href="/dashboard" 
              className={`${styles.navLink} ${activePage === 'dashboard' ? styles.active : ''}`}
              onClick={onClose}
            >
              <FiHome className={styles.navIcon} />
              <span>Dashboard</span>
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link 
              href="/my-cvs" 
              className={`${styles.navLink} ${activePage === 'my-cvs' ? styles.active : ''}`}
              onClick={onClose}
            >
              <FiFileText className={styles.navIcon} />
              <span>CV Saya</span>
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link 
              href="/templates" 
              className={`${styles.navLink} ${activePage === 'templates' ? styles.active : ''}`}
              onClick={onClose}
            >
              <FiAward className={styles.navIcon} />
              <span>Template CV</span>
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link 
              href="/jobs" 
              className={`${styles.navLink} ${activePage === 'jobs' ? styles.active : ''}`}
              onClick={onClose}
            >
              <FiBriefcase className={styles.navIcon} />
              <span>Lowongan Kerja</span>
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link 
              href="/profile" 
              className={`${styles.navLink} ${activePage === 'profile' ? styles.active : ''}`}
              onClick={onClose}
            >
              <FiUser className={styles.navIcon} />
              <span>Profil Saya</span>
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link 
              href="/settings" 
              className={`${styles.navLink} ${activePage === 'settings' ? styles.active : ''}`}
              onClick={onClose}
            >
              <FiSettings className={styles.navIcon} />
              <span>Pengaturan</span>
            </Link>
          </li>
        </ul>
      </nav>
      
      <div className={styles.sidebarFooter}>
        <button onClick={handleLogout} className={styles.logoutButton}>
          <FiLogOut className={styles.navIcon} />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;