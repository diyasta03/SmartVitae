"use client";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, BarChart2, Cpu, Star } from "react-feather";
import { useEffect, useState } from "react";
import Tilt from 'react-parallax-tilt';

import styles from "./HeroSection.module.css";

const HeroSection = () => {
  const images = ["/asset/cv1.png", "/asset/cv.png", "/asset/cv3.png" ];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-change image every 5s
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section className={styles.heroContainer}>
      <div className={styles.heroContent}>
        <motion.span
          className={styles.breadcrumb}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          PEMBUAT CV GRATIS
        </motion.span>

        <motion.h1
          className={styles.heroTitle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Buat dan <br />Tinjau Cv Anda
        </motion.h1>

        <motion.p
          className={styles.subheading}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >SmartVitae memanfaatkan teknologi AI dan standar ATS untuk meningkatkan peluang Anda mendapatkan pekerjaan

  </motion.p>

        <motion.ul className={styles.featuresList}>
          <motion.li
            className={styles.featureItem}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <span className={styles.featureIcon}><CheckCircle color="#4CAF50" size={20} /></span>
            <span>Standar ATS Terbaru</span>
          </motion.li>
          <motion.li
            className={styles.featureItem}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <span className={styles.featureIcon}><BarChart2 color="#2196F3" size={20} /></span>
            <span>Analisis Mendalam & Akurat</span>
          </motion.li>
          <motion.li
            className={styles.featureItem}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <span className={styles.featureIcon}><Cpu color="#FF9800" size={20} /></span>
            <span>Dibantu Teknologi AI</span>
          </motion.li>
          <motion.li
            className={styles.featureItem}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <span className={styles.featureIcon}><Star color="#FFC107" size={20} /></span>
            <span>Dan Masih Banyak Lagi...</span>
          </motion.li>
        </motion.ul>

        <motion.div
          className={styles.buttonGroup}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <Link href="/cv-analyze" className={styles.primaryButton}>
            ANALISA CV OTOMATIS →
            <motion.span
              className={styles.buttonHoverEffect}
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          </Link>
          <Link href="/cv-maker" className={styles.secondaryButton}>
            BUAT CV BARU →
            <motion.span
              className={styles.buttonHoverEffect}
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          </Link>
        </motion.div>
      </div>

      <div className={styles.heroImage}>
        <AnimatePresence mode="wait">
          <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} perspective={1000}>
         <motion.div
  key={currentImageIndex}
  initial={{ opacity: 0, rotateY: -10, scale: 0.95 }}
  animate={{
    opacity: 1,
    rotateY: 0,
    scale: 1
  }}
  exit={{ opacity: 0, rotateY: 10, scale: 0.95 }}
  transition={{ duration: 1.2, ease: "easeInOut" }}
  className={styles.imageWrapper}
>
  <Image
    src={images[currentImageIndex]}
    alt="Professional career images"
    width={397}
    height={562}
    priority
    quality={85}
    className={styles.image}
  />
</motion.div>
</Tilt>

        </AnimatePresence>
      </div>
    </section>
  );
};

export default HeroSection;
