"use client";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, Zap } from "lucide-react";
import styles from "./CTASection.module.css";

const CTASection = () => {
  const benefits = [
    "24-hour turnaround time",
    "ATS-optimized templates",
    "Career coaching included",
    "Unlimited revisions"
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
      <div className={styles.ctaBackground}></div>
      
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className={styles.ctaContent}
      >
        <div className={styles.ctaText}>
          <motion.div 
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            viewport={{ once: true }}
            className={styles.ctaBadge}
          >
            <Zap className={styles.zapIcon} />
            <span>Limited Time Offer</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className={styles.ctaTitle}
          >
            Ready to Transform Your Career?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
            className={styles.ctaSubtitle}
          >
            Join thousands of professionals who landed their dream jobs after our resume makeover
          </motion.p>

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

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
          className={styles.ctaButtons}
        >
          <motion.a
            href="/pricing"
            className={styles.primaryButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started Now
            <ArrowRight className={styles.buttonIcon} />
          </motion.a>
          
          <motion.a
            href="/demo"
            className={styles.secondaryButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            See Live Demo
          </motion.a>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default CTASection;