// src/components/HowItWorks.jsx
"use client"; // Add this for client-side components

import React from 'react';
import styles from './Home.module.css'; // Using CSS Modules

const HowItWorks = () => {
  return (
    <section className={styles.stepsSection}>
      <h2 className={styles.sectionTitle}>How It Works</h2>
      <div className={styles.stepsContainer}>
        <div className={styles.step}>
          <div className={styles.stepNumber}>1</div>
          <h3 className={styles.stepTitle}>Upload Your Resume</h3>
          <p className={styles.stepDescription}>
            Simply upload your current resume in PDF Format
          </p>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>2</div>
          <h3 className={styles.stepTitle}>AI Review</h3>
          <p className={styles.stepDescription}>
            AI Analyze Your CV
          </p>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>3</div>
          <h3 className={styles.stepTitle}>Get Results</h3>
          <p className={styles.stepDescription}>
            Recevie Your CV Skor with Feedback
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;