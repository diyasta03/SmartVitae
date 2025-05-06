'use client';
import styles from './Footer.module.css';
import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.logo}>SmartVitae</div>
          <div className={styles.socialLinks}>
            <Link 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.socialIcon}
            >
              <i className="fab fa-facebook"></i>
            </Link>
            <Link 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.socialIcon}
            >
              <i className="fab fa-twitter"></i>
            </Link>
            <Link 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.socialIcon}
            >
              <i className="fab fa-linkedin"></i>
            </Link>
            <Link 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.socialIcon}
            >
              <i className="fab fa-instagram"></i>
            </Link>
          </div>
        </div>
        <div className={styles.copyright}>
          © {currentYear} Redist Tech. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;