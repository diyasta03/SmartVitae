"use client";
import Link from "next/link";
import Image from "next/image";
import styles from "./Home.module.css"; // Changed to component-specific CSS module

const HeroSection = () => {
  return (
    <section className={styles.heroContainer}>
      <div className={styles.heroContent}>
        <span className={styles.breadcrumb}>RESUME REVIEW WE OFFER</span>
        <h1 className={styles.heroTitle}>
          Get an expert<br />Resume Review.
        </h1>
        <p className={styles.subheading}>
          Get a hyper-personalized resume review with expert guidance to improve key sections and land interviews.
        </p>
        
        <ul className={styles.featuresList}>
          <li className={styles.featureItem}>
            <span className={styles.featureIcon}>✓</span>
            <span>Personalized Feedback</span>
          </li>
          <li className={styles.featureItem}>
            <span className={styles.featureIcon}>📊</span>
            <span>Detailed Analysis</span>
          </li>
          <li className={styles.featureItem}>
            <span className={styles.featureIcon}>🤖</span>
            <span>ATS Compatibility</span>
          </li>
          <li className={styles.featureItem}>
            <span className={styles.featureIcon}>⭐</span>
            <span>And Much more...</span>
          </li>
        </ul>

        <div className={styles.buttonGroup}>
          <Link href="/cv-maker" className={styles.primaryButton}>
            IMPROVE MY RESUME →
          </Link>
          <Link href="/cv-maker" className={styles.secondaryButton}>
            CREATE RESUME →
          </Link>
        </div>
      </div>
      
      <div className={styles.heroImage}>
        <Image
          src="https://images.unsplash.com/photo-1549923746-c502d488b3ea" // Recommended: Use local images
          alt="Professional reviewing a resume"
          width={600}
          height={400}
          priority
          quality={85}
          className={styles.image}
        />
      </div>
    </section>
  );
};

export default HeroSection;