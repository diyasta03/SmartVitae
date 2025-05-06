import { useState } from "react";

export function useCvForm(initialState) {
  const [formData, setFormData] = useState(initialState);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const generateSummary = async () => {
    setLoadingSummary(true);
    try {
      const res = await fetch("/api/generateSummary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData }),
      });
      if (!res.ok) throw new Error("Gagal membuat summary");

      const data = await res.json();
      setFormData((prev) => ({
        ...prev,
        summary: data.summary || "",
      }));
    } catch (err) {
      alert(err.message);
    } finally {
      setLoadingSummary(false);
    }
  };

  return { formData, setFormData, handleChange, generateSummary, loadingSummary };
}
