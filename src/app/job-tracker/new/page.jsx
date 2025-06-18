"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import styles from '../JobForm.module.css';
import Layout from '../../components/Layout/Layout';

const NewJobApplication = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    company_name: '',
    job_title: '',
    job_description: '',
    applied_date: new Date().toISOString().split('T')[0],
    status: 'Applied',
    notes: '',
    company_website: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase
        .from('job_applications')
        .insert([{
          ...formData,
          user_id: session.user.id
        }]);

      if (error) throw error;

      router.push('/job-tracker');
    } catch (err) {
      setError(err.message || 'Failed to save application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
<h1>Tambah Lamaran Kerja Baru</h1>

<p>Lacak lamaran kerja baru Anda</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.formGroup}>
            <label htmlFor="company_name">Nama Perusahaan *</label>
            <input
              type="text"
              id="company_name"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="job_title">Posisi Pekerjaan *</label>
            <input
              type="text"
              id="job_title"
              name="job_title"
              value={formData.job_title}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="company_website">Link Lamaran</label>
            <input
              type="url"
              id="company_website"
              name="company_website"
              value={formData.company_website}
              onChange={handleChange}
              placeholder="https://example.com"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="applied_date">Tanggal Lamaran *</label>
            <input
              type="date"
              id="applied_date"
              name="applied_date"
              value={formData.applied_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="status">Status *</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="Applied">Applied</option>
              <option value="Interview">Interview</option>
              <option value="Offered">Offered</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="job_description">Deskripsi Pekerjaan</label>
            <textarea
              id="job_description"
              name="job_description"
              value={formData.job_description}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="notes">Catatan</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className={styles.buttonGroup}>
            <button
              type="button"
              onClick={() => router.push('/job-tracker')}
              className={styles.cancelButton}
            >
             Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? 'Saving...' : 'Simpan Lamaran'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default NewJobApplication;