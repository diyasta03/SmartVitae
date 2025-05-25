"use client";
import { motion } from "framer-motion";
import { FileText, Award, Users } from "lucide-react";
import styles from "./FeatureSection.module.css";

const FeatureSection = () => {
  const features = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Bantuan AI",
      desc: "Teknologi AI kami membantu membuatkan rigkasan pribadi."
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Optimasi ATS",
      desc: "CV Anda disesuaikan agar lolos sistem penyaringan otomatis (ATS) yang digunakan oleh perusahaan."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Panduan Karier",
      desc: "Dapatkan saran personal yang membantu menyelaraskan CV Anda dengan posisi yang Anda incar."
    }
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
    <section className={styles.featureContainer}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className={styles.featureHeader}
      >
        <h2 className={styles.featureTitle}>Mengapa Memilih Layanan Pembuatan CV Kami</h2>
        <p className={styles.featureSubtitle}>
          Kami tidak sekadar membuat CV – kami membantu meningkatkan peluang anda ke tahap interview.
        </p>
      </motion.div>

      <motion.div 
        className={styles.featureGrid}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className={styles.featureCard}
            whileHover={{
              y: -5,
              transition: { duration: 0.2 }
            }}
          >
            <div className={styles.featureIcon}>
              {feature.icon}
            </div>
            <h3 className={styles.featureCardTitle}>{feature.title}</h3>
            <p className={styles.featureCardDesc}>{feature.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default FeatureSection;