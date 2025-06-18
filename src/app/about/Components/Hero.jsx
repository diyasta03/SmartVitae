import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import styles from './Hero.module.css';
import TrueFocus from './TrueFocus';

const Hero = () => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const stats = [
  { value: "5+", label: "Tahun Pengalaman" },
  { value: "50+", label: "Proyek Diselesaikan" },
  { value: "50+", label: "Klien" },
  { value: "100%", label: "Dedikasi" }
];


  return (
    <motion.section 
      ref={ref}
      className={styles.heroContainer}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={containerVariants}
    >
      <div className={styles.heroBackground}>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroPattern}></div>
      </div>

      <div className={styles.heroContent}>
        <div className={styles.heroGrid}>
          {/* Left Column - Content */}
          <motion.div 
            className={styles.heroText}
            variants={itemVariants}
          >
          <TrueFocus 
sentence="ABOUT US  "
manualMode={false}
blurAmount={5}
borderColor="red"
animationDuration={2}
pauseBetweenAnimations={1}

/>
            
         <motion.h1 className={styles.heroTitle} variants={itemVariants}>
  Smart Tools for <span>Career Growth</span>
</motion.h1>

<motion.p className={styles.heroDescription} variants={itemVariants}>
  Dari pembuatan CV hingga pelacakan lamaran, kami bantu Anda menonjol di pasar kerja digital yang kompetitif.
</motion.p>

            
            <motion.div variants={itemVariants}>
              
            </motion.div>
          </motion.div>

          {/* Right Column - Stats */}
          <motion.div 
            className={styles.heroStats}
            variants={containerVariants}
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                className={styles.statCard}
                variants={itemVariants}
                whileHover={{ y: -5 }}
              >
                <h3 className={styles.statValue}>{stat.value}</h3>
                <p className={styles.statLabel}>{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scrolling Indicator */}
        <motion.div 
          className={styles.scrollIndicator}
          animate={{ y: [0, 15, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <svg className={styles.scrollIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default Hero;