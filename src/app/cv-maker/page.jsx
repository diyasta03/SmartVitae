"use client";
import { useState, useEffect } from "react";
import styles from "./CvMaker.module.css";
import dynamic from "next/dynamic";

// Memuat html2pdf.js secara dinamis
const html2pdf = dynamic(() => import("html2pdf.js"), { ssr: false });

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

    const opt = {
      margin: 0.4,
      filename: "cv.pdf",
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
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

  return (
    <div className={styles.cvContainer}>
      <div className={styles.formSection}>
        <h1>CV Maker</h1>
        <p>Isi detail Anda untuk membuat CV profesional.</p>
        <form onSubmit={(e) => e.preventDefault()}>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={handleChange}
          />

          <label htmlFor="profession">Profession:</label>
          <input
            type="text"
            id="profession"
            value={formData.profession}
            onChange={handleChange}
          />

          <label htmlFor="address">Address:</label>
          <input
            type="text"
            id="address"
            value={formData.address}
            onChange={handleChange}
          />

          <label htmlFor="phone">Phone:</label>
          <input
            type="text"
            id="phone"
            value={formData.phone}
            onChange={handleChange}
          />

          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
          />

          <label htmlFor="linkedin">LinkedIn:</label>
          <input
            type="text"
            id="linkedin"
            value={formData.linkedin}
            onChange={handleChange}
          />

          <label htmlFor="github">GitHub:</label>
          <input
            type="text"
            id="github"
            value={formData.github}
            onChange={handleChange}
          />

          <label htmlFor="summary">Summary:</label>
          <textarea
            id="summary"
            value={formData.summary}
            onChange={handleChange}
          />

          <label htmlFor="educationDegree">Degree:</label>
          <input
            type="text"
            id="educationDegree"
            value={formData.educationDegree}
            onChange={handleChange}
          />

          <label htmlFor="educationInstitution">Institution:</label>
          <input
            type="text"
            id="educationInstitution"
            value={formData.educationInstitution}
            onChange={handleChange}
          />

          <label htmlFor="educationDate">Date:</label>
          <input
            type="text"
            id="educationDate"
            value={formData.educationDate}
            onChange={handleChange}
          />

          <label htmlFor="educationGPA">GPA:</label>
          <input
            type="text"
            id="educationGPA"
            value={formData.educationGPA}
            onChange={handleChange}
          />

          <label htmlFor="jobTitle">Job Title:</label>
          <input
            type="text"
            id="jobTitle"
            value={formData.jobTitle}
            onChange={handleChange}
          />

          <label htmlFor="company">Company:</label>
          <input
            type="text"
            id="company"
            value={formData.company}
            onChange={handleChange}
          />

          <label htmlFor="jobDate">Job Date:</label>
          <input
            type="text"
            id="jobDate"
            value={formData.jobDate}
            onChange={handleChange}
          />

          <label htmlFor="jobDescription">Job Description:</label>
          <textarea
            id="jobDescription"
            value={formData.jobDescription}
            onChange={handleChange}
          />

          <label htmlFor="skills">Skills:</label>
          <input
            type="text"
            id="skills"
            value={formData.skills}
            onChange={handleChange}
          />

          <label htmlFor="projectName">Project Name:</label>
          <input
            type="text"
            id="projectName"
            value={formData.projectName}
            onChange={handleChange}
          />

          <label htmlFor="projectDate">Project Date:</label>
          <input
            type="text"
            id="projectDate"
            value={formData.projectDate}
            onChange={handleChange}
          />

          <label htmlFor="projectDescription">Project Description:</label>
          <textarea
            id="projectDescription"
            value={formData.projectDescription}
            onChange={handleChange}
          />

          <button
            type="button"
            onClick={generateSummary}
            disabled={loadingSummary}
          >
            {loadingSummary ? "Generating..." : "Generate Summary"}
          </button>
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
        <button className="btn" onClick={downloadPDF}>
          Download PDF
        </button>
      </div>
    </div>
  );
}
