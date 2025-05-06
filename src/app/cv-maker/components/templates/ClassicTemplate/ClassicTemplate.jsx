"use client";
import styles from "./ClassicTemplate.module.css";

const CvPreview = ({ formData }) => {
  return (
    <div id="cvPreview" className={styles.cvPreview}>
      <div className={styles.cvTemplate}>
        <h1>{formData.name || "Your Name"}</h1>
        <div className={styles.contactInfo}>
          {formData.address || "Address"} | {formData.phone || "Phone"} |{" "}
          {formData.email || "Email"} |{" "}
          {formData.github ? (
            <a href={formData.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
          ) : (
            "GitHub"
          )}{" "}
          |{" "}
          {formData.linkedin ? (
            <a href={formData.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          ) : (
            "LinkedIn"
          )}
        </div>

        <section className={styles.section}>
          <h2>SUMMARY</h2>
          <p>{formData.summary || "Professional summary goes here."}</p>
        </section>

        <section className={styles.section}>
          <h2>EDUCATION</h2>
          <div className={styles.educationItem}>
            <div className={styles.degree}>
              {formData.educationDegree || "Degree"}
            </div>
            <div>{formData.educationInstitution || "Institution"}</div>
            <div className={styles.date}>
              {formData.educationDate || "Date"}
            </div>
            <div>GPA: {formData.educationGPA || "GPA/Score"}</div>
          </div>
        </section>

        <section className={styles.section}>
          <h2>WORK EXPERIENCE</h2>
          <div className={styles.jobItem}>
            <div>
              <span className={styles.jobTitle}>
                {formData.jobTitle || "Job Title"}
              </span>
              <span className={styles.date}>{formData.jobDate || "Date"}</span>
            </div>
            <div>{formData.company || "Company"}</div>
            <p>
              {formData.jobDescription || "Job description and responsibilities."}
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h2>SKILLS</h2>
          <div className={styles.skillsList}>
            {(formData.skills || "Skill 1, Skill 2")
              .split(",")
              .map((skill, idx) => (
                <span key={idx} className={styles.skillTag}>
                  {skill.trim()}
                </span>
              ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2>PROJECTS</h2>
          <div className={styles.projectItem}>
            <div>
              <span className={styles.jobTitle}>
                {formData.projectName || "Project Name"}
              </span>
              <span className={styles.date}>{formData.projectDate || "Date"}</span>
            </div>
            <p>
              {formData.projectDescription || "Project description and contributions."}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CvPreview;
