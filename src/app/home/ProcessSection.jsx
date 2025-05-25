"use client";
import { motion } from "framer-motion";
import { Upload, ClipboardCheck, MailCheck } from "lucide-react";
import styles from "./ProcessSection.module.css";

const ProcessSection = () => {
  const steps = [
    {
      icon: <Upload className="w-5 h-5" />,
      title: "Upload CV Anda",
      desc: "Upload Mudah dengan sekali sentuh.",
      color: "#6366f1"
    },
    {
      icon: <ClipboardCheck className="w-5 h-5" />,
      title: "Masukan Job Deskrpisi",
      desc: "AI Kami Mengalisa CV & Job Deskripsi yang Anda masukan Secara Detail.",
      color: "#10b981"
    },
    {
      icon: <MailCheck className="w-5 h-5" />,
      title: "Dapatkan Tinjauan",
      desc: "Dapatkan Saran & Rekomendasi untuk CV Anda Secara Detail.",
      color: "#f59e0b"
    }
  ];

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
      transition: {
        duration: 0.6,
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <section className={styles.processContainer}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className={styles.processHeader}
      >
        <h2 className={styles.processTitle}>Bagiamana ini bekerja</h2>
        <p className={styles.processSubtitle}>
          Dapatkan review CV Anda hanya dalam 3 langkah mudah
        </p>
      </motion.div>

      <div className={styles.processContent}>
        <motion.div 
          className={styles.processSteps}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className={styles.stepCard}
              style={{ "--accent-color": step.color }}
            >
              <div className={styles.stepNumber}>{index + 1}</div>
              <div className={styles.stepIconContainer}>
                <div className={styles.stepIcon}>
                  {step.icon}
                </div>
              </div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.desc}</p>
              {index < steps.length - 1 && (
                <div className={styles.stepConnector}></div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ProcessSection;