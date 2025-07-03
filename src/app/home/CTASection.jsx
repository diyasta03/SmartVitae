"use client";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, Zap } from "lucide-react"; // Icons dari Lucide React
import styles from "./CTASection.module.css"; // Pastikan path CSS benar

const CTASection = () => {
  // Manfaat disesuaikan untuk SmartVitae dan diterjemahkan
  const benefits = [
    "Analisis CV Akurat & Cepat", // Accurate & Fast CV Analysis (menggantikan 24-hour turnaround)
    "Optimasi CV Sesuai Standar ATS", // ATS-Optimized CV Optimization
    "Dibantu Teknologi AI Terkini", // Assisted by Latest AI Technology
    "Pelacakan Lamaran Kerja Terintegrasi" // Integrated Job Application Tracking
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section className={styles.ctaContainer}>
      {/* Background visual (tetap sama) */}
      <div className={styles.ctaBackground}></div>
      
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className={styles.ctaContent}
      >
        <div className={styles.ctaText}>
          {/* Badge Penawaran Terbatas */}
          <motion.div 
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            viewport={{ once: true }}
            className={styles.ctaBadge}
          >
            <Zap className={styles.zapIcon} />
            <span>Penawaran Terbatas</span> {/* Diterjemahkan */}
          </motion.div>

          {/* Judul CTA */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className={styles.ctaTitle}
          >
            Siap Mengubah Karier Anda?
          </motion.h2>

          {/* Subtitle CTA */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
            className={styles.ctaSubtitle}
          >
            Bergabunglah dengan ribuan profesional yang meraih pekerjaan impian setelah optimasi CV kami.
          </motion.p>

          {/* Daftar Manfaat */}
          <motion.ul 
            className={styles.benefitsList}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {benefits.map((benefit, index) => (
              <motion.li
                key={index}
                variants={itemVariants}
                className={styles.benefitItem}
              >
                <BadgeCheck className={styles.benefitIcon} />
                <span>{benefit}</span>
              </motion.li>
            ))}
          </motion.ul>
        </div>

        {/* Tombol CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
          className={styles.ctaButtons}
        >
          {/* Tombol Utama: Mulai Analisis CV */}
          <motion.a
            href="/dashboard" // Mengarahkan ke halaman analisis CV Anda
            className={styles.primaryButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Mulai Sekarang
            <ArrowRight className={styles.buttonIcon} />
          </motion.a>
          
          {/* Tombol Sekunder: Pelajari Lebih Lanjut/Demo */}
          <motion.a
            href="/about" // Mengarahkan ke halaman "About Us" atau halaman yang lebih relevan untuk demo/info
            className={styles.secondaryButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Tentang Kami
          </motion.a>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default CTASection;