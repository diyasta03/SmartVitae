import React from 'react';
import styles from './ModernTemplate.module.css';

// Komponen helper untuk ikon agar lebih rapi
const ContactInfo = ({ icon, text }) => (
  text ? <div className={styles.contactItem}><i className={`fas ${icon}`}></i><span>{text}</span></div> : null
);

const ModernTemplate = ({ formData }) => {
  const { personalInfo, summary, experiences, educations, projects, skills } = formData;

  return (
    <div className={styles.cvContainer}>
      {/* Kolom Kiri (Sidebar) */}
      <aside className={styles.sidebar}>
        <div className={styles.header}>
          <h1 className={styles.name}>{personalInfo.name || "Nama Anda"}</h1>
          <h2 className={styles.profession}>{personalInfo.profession || "Profesi Anda"}</h2>
        </div>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Kontak</h3>
          <ContactInfo icon="fa-phone" text={personalInfo.phone} />
          <ContactInfo icon="fa-envelope" text={personalInfo.email} />
          <ContactInfo icon="fa-map-marker-alt" text={personalInfo.address} />
          <ContactInfo icon="fa-linkedin" text={personalInfo.linkedin} />
          <ContactInfo icon="fa-github" text={personalInfo.github} />
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Keahlian</h3>
          <div className={styles.skillsContainer}>
            {skills && skills.split(',').map((skill, index) => (
              skill.trim() && <span key={index} className={styles.skillPill}>{skill.trim()}</span>
            ))}
          </div>
        </section>
      </aside>

      {/* Kolom Kanan (Konten Utama) */}
      <main className={styles.mainContent}>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Ringkasan</h3>
          <p className={styles.summary}>{summary || "Ringkasan profesional tentang diri Anda..."}</p>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Pengalaman Kerja</h3>
          {experiences.map(exp => (
            <div key={exp.id} className={styles.entry}>
              <div className={styles.entryHeader}>
                <h4 className={styles.entryTitle}>{exp.jobTitle || "Posisi"}</h4>
                <p className={styles.entryDate}>{exp.date || "Tahun"}</p>
              </div>
              <h5 className={styles.entrySubtitle}>{exp.company || "Perusahaan"}</h5>
              <p className={styles.entryDescription}>{exp.description || "Deskripsi pekerjaan..."}</p>
            </div>
          ))}
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Pendidikan</h3>
          {educations.map(edu => (
            <div key={edu.id} className={styles.entry}>
              <div className={styles.entryHeader}>
                <h4 className={styles.entryTitle}>{edu.degree || "Gelar"}</h4>
                <p className={styles.entryDate}>{edu.date || "Tahun"}</p>
              </div>
              <h5 className={styles.entrySubtitle}>{edu.institution || "Institusi"}</h5>
              {edu.gpa && <p className={styles.entryDescription}>IPK: {edu.gpa}</p>}
            </div>
          ))}
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Proyek</h3>
          {projects.map(proj => (
            <div key={proj.id} className={styles.entry}>
              <div className={styles.entryHeader}>
                <h4 className={styles.entryTitle}>{proj.name || "Nama Proyek"}</h4>
                <p className={styles.entryDate}>{proj.date || "Tahun"}</p>
              </div>
              <p className={styles.entryDescription}>{proj.description || "Deskripsi proyek..."}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default ModernTemplate;