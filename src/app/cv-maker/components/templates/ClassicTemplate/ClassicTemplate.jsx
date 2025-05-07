"use client";
import styles from "./ClassicTemplate.module.css";
import { useEffect } from "react";

const ClassicTemplate = ({ formData }) => {
  // Convert skills string to array
  const skillsArray = formData.skills 
    ? formData.skills.split(',').map(skill => skill.trim()) 
    : [];

  // Optional: Auto-add page breaks for long sections
  useEffect(() => {
    const sections = document.querySelectorAll(`.${styles.section}`);
    sections.forEach(section => {
      if (section.scrollHeight > 800) { // ~1 page height in pixels
        section.classList.add(styles.longSection);
      }
    });
  }, []);

  return (
    <div id="cvPreview" className={styles.cvPreview}>
      <div className={styles.cvTemplate}>
        {/* Header Section */}
        <header className={styles.header}>
          <h1>{formData.name || "Your Name"}</h1>
          <div className={styles.contactInfo}>
            {[
              formData.address,
              formData.phone,
              formData.email,
              formData.github && (
                <a key="github" href={formData.github} target="_blank" rel="noreferrer">
                  GitHub
                </a>
              ),
              formData.linkedin && (
                <a key="linkedin" href={formData.linkedin} target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
              )
            ].filter(Boolean).join(" | ")}
          </div>
        </header>

        {/* Summary Section */}
        <section className={`${styles.section} ${styles.summary}`}>
          <h2>PROFESSIONAL SUMMARY</h2>
          <p>{formData.summary || "Professional summary goes here."}</p>
        </section>

        {/* Education Section */}
        <section className={styles.section}>
          <h2>EDUCATION</h2>
          <div className={styles.educationItem}>
            <div className={styles.degree}>
              {formData.educationDegree || "Degree"}
            </div>
            <div className={styles.institution}>
              {formData.educationInstitution || "Institution"}
            </div>
            <div className={styles.date}>
              {formData.educationDate || "Date"} | GPA: {formData.educationGPA || "N/A"}
            </div>
          </div>
        </section>

        {/* Experience Section */}
        <section className={styles.section}>
          <h2>WORK EXPERIENCE</h2>
          <div className={styles.jobItem}>
            <div className={styles.jobHeader}>
              <span className={styles.jobTitle}>
                {formData.jobTitle || "Job Title"}
              </span>
              <span className={styles.date}>{formData.jobDate || "Date"}</span>
            </div>
            <div className={styles.company}>
              {formData.company || "Company Name"}
            </div>
            <div className={styles.jobDescription}>
              {formData.jobDescription?.split('\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              )) || "Job description and responsibilities."}
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section className={styles.section}>
          <h2>SKILLS</h2>
          <div className={styles.skillsList}>
            {skillsArray.length > 0 ? (
              skillsArray.map((skill, idx) => (
                <span key={idx} className={styles.skillTag}>
                  {skill}
                </span>
              ))
            ) : (
              <span className={styles.skillTag}>Skill 1</span>
            )}
          </div>
        </section>

        {/* Projects Section */}
        <section className={styles.section}>
          <h2>PROJECTS</h2>
          <div className={styles.projectItem}>
            <div className={styles.projectHeader}>
              <span className={styles.projectName}>
                {formData.projectName || "Project Name"}
              </span>
              <span className={styles.date}>{formData.projectDate || "Date"}</span>
            </div>
            <div className={styles.projectDescription}>
              {formData.projectDescription?.split('\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              )) || "Project description and contributions."}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ClassicTemplate;