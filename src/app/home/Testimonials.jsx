// src/components/Testimonials.jsx
"use client";

import React from 'react';
import Image from 'next/image';
import styles from './Home.module.css';

const Testimonials = () => {
  return (
    <section className={styles.testimonialSection}>
      <h2 className={styles.sectionTitle}>Trusted by Professionals Worldwide</h2>
      <div className={styles.testimonialsContainer}>
        <div className={styles.testimonialCard}>
          <div className={styles.rating}>⭐⭐⭐⭐⭐</div>
          <blockquote className={styles.quote}>
            "SmartVitae helped me land 3x more interviews!"
          </blockquote>
          <div className={styles.userInfo}>
            <Image 
              src="https://randomuser.me/api/portraits/women/44.jpg" 
              alt="Sarah J." 
              width={48} 
              height={48}
              className={styles.userImage}
            />
            <span className={styles.userName}>Sarah J., Marketing Director</span>
          </div>
        </div>
        
        <div className={styles.testimonialCard}>
          <div className={styles.rating}>⭐⭐⭐⭐⭐</div>
          <blockquote className={styles.quote}>
            "The ATS analysis was a game changer for my job search."
          </blockquote>
          <div className={styles.userInfo}>
            <Image 
              src="https://randomuser.me/api/portraits/men/32.jpg" 
              alt="Michael T." 
              width={48} 
              height={48}
              className={styles.userImage}
            />
            <span className={styles.userName}>Michael T., Software Engineer</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;