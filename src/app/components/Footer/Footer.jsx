'use client';
import styles from './Footer.module.css';
import Link from 'next/link';
// Import icons from react-icons
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.contentWrapper}> {/* Added a wrapper for better structure */}
          <div className={styles.brandInfo}>
            <Link href="/" className={styles.logoLink}>
              <img src="/logo.png" alt="SmartVitae Logo" className={styles.logoImage} />
          
            </Link>
            <p className={styles.tagline}>Optimalkan CV Anda dengan AI.</p> {/* Optional tagline */}
          </div>

          <div className={styles.linksGroup}>
            <h4 className={styles.linksHeading}>Produk</h4>
            <ul className={styles.linksList}>
              <li><Link href="/cv-analyze" className={styles.linkItem}>CV Optimizer</Link></li>
              <li><Link href="/create-cv" className={styles.linkItem}>Buat CV</Link></li>
              <li><Link href="/history" className={styles.linkItem}>Riwayat Analisis</Link></li>
            </ul>
          </div>

          <div className={styles.linksGroup}>
            <h4 className={styles.linksHeading}>Perusahaan</h4>
            <ul className={styles.linksList}>
              <li><Link href="/about" className={styles.linkItem}>Tentang Kami</Link></li>
              <li><Link href="/contact" className={styles.linkItem}>Kontak</Link></li>
              <li><Link href="/privacy" className={styles.linkItem}>Kebijakan Privasi</Link></li>
              <li><Link href="/terms" className={styles.linkItem}>Syarat & Ketentuan</Link></li>
            </ul>
          </div>

          <div className={styles.socialSection}>
            <h4 className={styles.linksHeading}>Ikuti Kami</h4>
            <div className={styles.socialLinks}>
              <Link
                href="https://facebook.com/yourpage" // Ganti dengan URL Anda
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialIcon}
                aria-label="Facebook"
              >
                <FaFacebookF />
              </Link>
              <Link
                href="https://twitter.com/yourhandle" // Ganti dengan URL Anda
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialIcon}
                aria-label="Twitter"
              >
                <FaTwitter />
              </Link>
              <Link
                href="https://linkedin.com/company/yourcompany" // Ganti dengan URL Anda
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialIcon}
                aria-label="LinkedIn"
              >
                <FaLinkedinIn />
              </Link>
              <Link
                href="https://instagram.com/yourhandle" // Ganti dengan URL Anda
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialIcon}
                aria-label="Instagram"
              >
                <FaInstagram />
              </Link>
            </div>
            {/* Optional: Newsletter subscription */}
            {/* <div className={styles.newsletter}>
              <h4 className={styles.linksHeading}>Newsletter</h4>
              <p>Dapatkan update terbaru dari kami.</p>
              <form className={styles.newsletterForm}>
                <input type="email" placeholder="Email Anda" className={styles.newsletterInput} />
                <button type="submit" className={styles.newsletterButton}>Daftar</button>
              </form>
            </div> */}
          </div>
        </div>

        <div className={styles.bottomBar}>
          <div className={styles.copyright}>
            © {currentYear} Redist Tech. All rights reserved.
          </div>
          <div className={styles.policyLinks}>
            {/* Jika Anda punya link kebijakan lain */}
            {/* <Link href="/policy1" className={styles.policyLinkItem}>Policy 1</Link>
            <Link href="/policy2" className={styles.policyLinkItem}>Policy 2</Link> */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;