"use client";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import styles from "./TestimonialSection.module.css";
import Image from 'next/image';

const TestimonialSection = () => {
  const testimonials = [
    {
      quote: "Setelah menggunakan layanan ini, saya menerima 3 panggilan interview dalam satu minggu! Umpan balik yang diberikan sangat rinci dan langsung bisa diterapkan.",
      name: "Sarah Johnson",
      role: "Marketing Director",
      rating: 5,
      avatar: "/avatars/david-wilson.jpg"
    },
    {
      quote: "Optimasi ATS benar-benar membuat perbedaan besar. Saya mulai mendapatkan respons dari perusahaan impian saya.",
      name: "Michael Chen",
      role: "Senior Developer",
      rating: 5,
      avatar: "/avatars/david-wilson.jpg"
    },
    {
      quote: "Sangat layak! CV saya berubah dari yang biasa saja menjadi luar biasa. Saran perbaikan yang diberikan juga sangat bermanfaat.",
      name: "David Wilson",
      role: "Product Manager",
      rating: 4,
      avatar: "/avatars/david-wilson.jpg"
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
        duration: 0.6
      }
    }
  };

  return (
    <section className={styles.testimonialContainer}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className={styles.testimonialHeader}
      >
        <h2 className={styles.testimonialTitle}>Testimoni</h2>
        <p className={styles.testimonialSubtitle}>
          Simak cerita para profesional yang berhasil mengubah karier mereka
        </p>
      </motion.div>

      <motion.div 
        className={styles.testimonialGrid}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className={styles.testimonialCard}
            whileHover={{ y: -5 }}
          >
            <Quote className={styles.quoteIcon} />
            <div className={styles.rating}>
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={i < testimonial.rating ? styles.starFilled : styles.starEmpty} 
                  fill={i < testimonial.rating ? "currentColor" : "none"}
                />
              ))}
            </div>
            <blockquote className={styles.quoteText}>
              {testimonial.quote}
            </blockquote>
            <div className={styles.author}>
              <div className={styles.avatar}>
                <Image 
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  width={48}
                  height={48}
                  className={styles.avatarImage}
                />
              </div>
              <div>
                <p className={styles.authorName}>{testimonial.name}</p>
                <p className={styles.authorRole}>{testimonial.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default TestimonialSection;