"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '../../../../lib/supabaseClient';
import styles from '../../JobForm.module.css';
import Layout from '../../../components/Layout/Layout';

const EditJobApplication = () => {
  const router = useRouter();
  const params = useParams();
  const [formData, setFormData] = useState({
    company_name: '',
    job_title: '',
    job_description: '',
    applied_date: '',
    status: 'Applied',
    notes: '',
    company_website: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const { data, error } = await supabase
          .from('job_applications')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Application not found');

        setFormData({
          company_name: data.company_name,
          job_title: data.job_title,
          job_description: data.job_description || '',
          applied_date: data.applied_date.split('T')[0],
          status: data.status,
          notes: data.notes || '',
          company_website: data.company_website || ''
        });
      } catch (err) {
        setError(err.message || 'Failed to load application');
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [params.id]);

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
      const { error } = await supabase
        .from('job_applications')
        .update(formData)
        .eq('id', params.id);

      if (error) throw error;

      router.push('/job-tracker');
    } catch (err) {
      setError(err.message || 'Failed to update application');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading application data...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Edit Lamaran</h1>
<p>Perbarui informasi lamaran kerjamu</p>

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
            <label htmlFor="job_title">Posisi Pekerajaan *</label>
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
            <label htmlFor="job_description">Deskrpisi Pekerjaan</label>
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
              {loading ? 'Updating...' : 'Perbarui Lamaran'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditJobApplication;