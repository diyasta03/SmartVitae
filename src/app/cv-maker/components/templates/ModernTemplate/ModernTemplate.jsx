"use client";
import styles from './ModernTemplate.module.css';

const ModernTemplate = ({ formData }) => (
  <div className={styles.container}>
    <header className={styles.header}>
      <h1>{formData.name || "JOHN DOE"}</h1>
      <h2>{formData.profession || "SOFTWARE ENGINEER"}</h2>
    </header>

    <div className={styles.contactInfo}>
      <span>{formData.address || "123 Main Street, City, Country"}</span>
      <span>{formData.phone || "(123) 456-7890"}</span>
      <span>{formData.email || "john.doe@example.com"}</span>
    </div>

    <section className={styles.section}>
      <h3>PROFESSIONAL SUMMARY</h3>
      <p>{formData.summary || "Experienced professional with 5+ years in the industry. Skilled in multiple technologies and passionate about creating efficient solutions. Strong team player with excellent communication skills."}</p>
    </section>

    <section className={styles.section}>
      <h3>EDUCATION</h3>
      <div className={styles.educationItem}>
        <h4>{formData.educationDegree || "Bachelor of Computer Science"}</h4>
        <p>{formData.educationInstitution || "University of Technology"}</p>
        <p>{formData.educationDate || "2015-2019"} {formData.educationGPA || "• GPA: 3.8/4.0"}</p>
      </div>
    </section>

    <section className={styles.section}>
      <h3>EXPERIENCE</h3>
      <div className={styles.experienceItem}>
        <div className={styles.jobHeader}>
          <h4>{formData.jobTitle || "Senior Developer"}</h4>
          <span>{formData.jobDate || "2020-Present"}</span>
        </div>
        <p className={styles.company}>{formData.company || "Tech Solutions Inc."}</p>
        <p className={styles.description}>
          {formData.jobDescription || 
          `• Lead development team in creating innovative solutions
• Designed and implemented scalable architecture
• Mentored junior developers
• Improved system performance by 40%`}
        </p>
      </div>
    </section>

    <section className={styles.section}>
      <h3>SKILLS</h3>
      <div className={styles.skillsGrid}>
        {(formData.skills || "JavaScript, React, Node.js, Python, SQL, Git").split(',').map((skill, index) => (
          <span key={index} className={styles.skillTag}>{skill.trim()}</span>
        ))}
      </div>
    </section>
  </div>
);

export default ModernTemplate;