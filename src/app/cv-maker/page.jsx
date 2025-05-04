"use client";
import { useState, useEffect } from "react";
import styles from "./CvMaker.module.css";
import html2pdf from "html2pdf.js";

export default function CvMaker() {
  const [formData, setFormData] = useState({
    name: "",
    profession: "",
    address: "",
    phone: "",
    email: "",
    linkedin: "",
    github: "",
    summary: "",
    educationDegree: "",
    educationInstitution: "",
    educationDate: "",
    educationGPA: "",
    jobTitle: "",
    company: "",
    jobDate: "",
    jobDescription: "",
    skills: "",
    projectName: "",
    projectDate: "",
    projectDescription: "",
  });

  const [loadingSummary, setLoadingSummary] = useState(false);

  const downloadPDF = () => {
    const element = document.getElementById("cvPreview"); // pastikan id div preview
    if (!element) return;

    // Opsi untuk file PDF
    const opt = {
      margin: 0.4,
      filename: "cv.pdf",
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 3, logging: false },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Panggil API generateSummary Next.js
  const generateSummary = async () => {
    setLoadingSummary(true);
    try {
      const res = await fetch("/api/generateSummary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ formData }),
      });

      if (!res.ok) throw new Error("Gagal generate summary");

      const data = await res.json();
      setFormData((prev) => ({
        ...prev,
        summary: data.summary || "",
      }));
    } catch (error) {
      alert(error.message);
    } finally {
      setLoadingSummary(false);
    }
  };

  const downloadCV = () => {
    const content = `
${formData.name}
${formData.profession}
${formData.address} | ${formData.phone} | ${formData.email}

SUMMARY
${formData.summary}

EDUCATION
${formData.educationDegree}
${formData.educationInstitution}
${formData.educationDate}
GPA: ${formData.educationGPA}

WORK EXPERIENCE
${formData.jobTitle} at ${formData.company} (${formData.jobDate})
${formData.jobDescription}

SKILLS
${formData.skills}

PROJECTS
${formData.projectName} (${formData.projectDate})
${formData.projectDescription}
`;

    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "cv.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className={styles.cvContainer}>
      <div className={styles.formSection}>
        <h1>CV Maker</h1>
        <p>Isi detail Anda untuk membuat CV profesional.</p>
        <form onSubmit={(e) => e.preventDefault()}>
          {/* Personal Info */}
          <h2>Informasi Pribadi</h2>
          {[
            { label: "Full Name", id: "name", type: "text" },
            { label: "Profession", id: "profession", type: "text" },
            { label: "Address", id: "address", type: "text" },
            { label: "Phone Number", id: "phone", type: "text" },
            { label: "Email", id: "email", type: "email" },
            { label: "LinkedIn Profile", id: "linkedin", type: "text" },
            { label: "GitHub Profile", id: "github", type: "text" },
          ].map(({ label, id, type }) => (
            <div key={id} className={styles.formGroup}>
              <label htmlFor={id}>{label}</label>
              <input
                id={id}
                type={type}
                className={styles.formControl}
                value={formData[id]}
                onChange={handleChange}
                required
              />
            </div>
          ))}

          <div className={styles.formGroup}>
            <label htmlFor="summary">Professional Summary</label>
            <textarea
              id="summary"
              rows={4}
              className={styles.formControl}
              value={formData.summary}
              onChange={handleChange}
              placeholder="Deskripsikan ringkasan profesional Anda"
              required
            />
          </div>

          <button
            type="button"
            onClick={generateSummary}
            className={styles.btn}
            disabled={loadingSummary}
          >
            {loadingSummary ? "Menghasilkan ringkasan..." : "Generate Summary Otomatis"}
          </button>

          {/* Education */}
          <h2>Pendidikan</h2>
          {[
            { label: "Degree", id: "educationDegree" },
            { label: "Institution", id: "educationInstitution" },
            { label: "Date", id: "educationDate" },
            { label: "GPA/Score", id: "educationGPA" },
          ].map(({ label, id }) => (
            <div key={id} className={styles.formGroup}>
              <label htmlFor={id}>{label}</label>
              <input
                id={id}
                type="text"
                className={styles.formControl}
                value={formData[id]}
                onChange={handleChange}
                required
              />
            </div>
          ))}

          {/* Work Experience */}
          <h2>Pengalaman Kerja</h2>
          {[
            { label: "Job Title", id: "jobTitle" },
            { label: "Company", id: "company" },
            { label: "Date", id: "jobDate" },
          ].map(({ label, id }) => (
            <div key={id} className={styles.formGroup}>
              <label htmlFor={id}>{label}</label>
              <input
                id={id}
                type="text"
                className={styles.formControl}
                value={formData[id]}
                onChange={handleChange}
                required
              />
            </div>
          ))}
          <div className={styles.formGroup}>
            <label htmlFor="jobDescription">Description</label>
            <textarea
              id="jobDescription"
              className={styles.formControl}
              rows={4}
              value={formData.jobDescription}
              onChange={handleChange}
              placeholder="Deskripsikan tanggung jawab pekerjaan Anda"
              required
            />
          </div>

          {/* Skills */}
          <h2>Keterampilan</h2>
          <div className={styles.formGroup}>
            <label htmlFor="skills">List your skills (pisahkan dengan koma)</label>
            <input
              id="skills"
              type="text"
              className={styles.formControl}
              value={formData.skills}
              onChange={handleChange}
              placeholder="JavaScript, HTML, CSS, React"
              required
            />
          </div>

          {/* Projects */}
          <h2>Proyek</h2>
          {[
            { label: "Project Name", id: "projectName" },
            { label: "Date", id: "projectDate" },
          ].map(({ label, id }) => (
            <div key={id} className={styles.formGroup}>
              <label htmlFor={id}>{label}</label>
              <input
                id={id}
                type="text"
                className={styles.formControl}
                value={formData[id]}
                onChange={handleChange}
                required
              />
            </div>
          ))}
          <div className={styles.formGroup}>
            <label htmlFor="projectDescription">Description</label>
            <textarea
              id="projectDescription"
              className={styles.formControl}
              rows={4}
              value={formData.projectDescription}
              onChange={handleChange}
              placeholder="Deskripsikan proyek dan kontribusi Anda"
              required
            />
          </div>
        </form>
      </div>

      {/* Preview Section */}
      <div className={styles.previewSection}>
        <h2>Preview CV</h2>
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
                  <span className={styles.date}>
                    {formData.projectDate || "Date"}
                  </span>
                </div>
                <p>
                  {formData.projectDescription || "Project description and your contributions."}
                </p>
              </div>
            </section>
          </div>
        </div>
        <button className={styles.btn} onClick={downloadPDF}>
          Download PDF
        </button>
      </div>
    </div>
  );
}
