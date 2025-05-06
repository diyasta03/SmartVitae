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
            Simply upload your current resume in PDF or Word format
          </p>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>2</div>
          <h3 className={styles.stepTitle}>AI & Expert Review</h3>
          <p className={styles.stepDescription}>
            Our experts will review every section of your resume
          </p>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>3</div>
          <h3 className={styles.stepTitle}>Get Results</h3>
          <p className={styles.stepDescription}>
            Receive detailed feedback within 24 hours
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;