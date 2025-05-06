"use client";
import styles from './ProfessionalTemplate.module.css';

const ProfessionalTemplate = ({ formData }) => (
  <div className={styles.container}>
    <header className={styles.header}>
      <div className={styles.nameTitle}>
        <h1>{formData.name || "ALEXANDER WONG"}</h1>
        <h2>{formData.profession || "DATA SCIENTIST"}</h2>
      </div>
      <div className={styles.contactBar}>
        <span>{formData.phone || "(555) 123-4567"}</span>
        <span>{formData.email || "alex.wong@example.com"}</span>
        <span>{formData.address || "789 Pine Road, Metropolis"}</span>
        {formData.linkedin && (
          <a href={formData.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        )}
        {formData.github && (
          <a href={formData.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
        )}
      </div>
    </header>

    <div className={styles.mainContent}>
      <section className={styles.section}>
        <h3>PROFESSIONAL PROFILE</h3>
        <p>{formData.summary || "Results-driven professional with 7+ years of experience in data analysis and machine learning. Proven track record of delivering actionable insights and building predictive models that drive business value. Adept at communicating complex technical concepts to non-technical stakeholders."}</p>
      </section>

      <div className={styles.twoColumn}>
        <div className={styles.leftColumn}>
          <section className={styles.section}>
            <h3>EDUCATION</h3>
            <div className={styles.educationItem}>
              <h4>{formData.educationDegree || "MSc in Data Science"}</h4>
              <p className={styles.institution}>{formData.educationInstitution || "Tech University"}</p>
              <p className={styles.date}>{formData.educationDate || "2015-2017"}</p>
              {formData.educationGPA && <p className={styles.gpa}>GPA: {formData.educationGPA}</p>}
            </div>
          </section>

          <section className={styles.section}>
            <h3>TECHNICAL SKILLS</h3>
            <div className={styles.skillsContainer}>
              {(formData.skills || "Python, R, SQL, TensorFlow, PyTorch, Tableau").split(',').map((skill, index) => (
                <div key={index} className={styles.skillItem}>
                  <div className={styles.skillName}>{skill.trim()}</div>
                  <div className={styles.skillBar}>
                    <div className={styles.skillLevel}></div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className={styles.rightColumn}>
          <section className={styles.section}>
            <h3>PROFESSIONAL EXPERIENCE</h3>
            <div className={styles.experienceItem}>
              <div className={styles.jobHeader}>
                <h4>{formData.jobTitle || "Senior Data Scientist"}</h4>
                <span>{formData.jobDate || "2019-Present"}</span>
              </div>
              <p className={styles.company}>{formData.company || "Analytics Solutions Ltd."}</p>
              <ul className={styles.responsibilities}>
                {(formData.jobDescription || 
                  `Developed predictive models improving forecast accuracy by 30%
                  |Led team of 5 junior data scientists
                  |Created automated reporting system saving 20 hours/week
                  |Presented findings to C-level executives`).split('|').map((item, i) => (
                  <li key={i}>{item.trim()}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className={styles.section}>
            <h3>KEY PROJECTS</h3>
            <div className={styles.projectItem}>
              <div className={styles.projectHeader}>
                <h4>{formData.projectName || "Customer Churn Prediction"}</h4>
                <span>{formData.projectDate || "2022"}</span>
              </div>
              <ul className={styles.projectDetails}>
                {(formData.projectDescription || 
                  `Built model with 92% accuracy predicting customer churn
                  |Integrated with marketing automation platform
                  |Resulted in 15% reduction in customer attrition`).split('|').map((item, i) => (
                  <li key={i}>{item.trim()}</li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
);

export default ProfessionalTemplate;